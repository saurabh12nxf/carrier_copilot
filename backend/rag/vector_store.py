"""
ChromaDB vector store for job descriptions and role requirements
Handles storage and retrieval of job data with in-memory resilient fallback
"""
import logging
import os
import hashlib
from typing import List, Dict, Optional

# NumPy 2.x backward compatibility shim for older chromadb versions
try:
    import numpy as np
    if not hasattr(np, 'float_'):
        np.float_ = np.float64
    if not hasattr(np, 'int_'):
        np.int_ = int
    if not hasattr(np, 'uint_'):
        np.uint_ = np.uint
except Exception:
    pass

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client with resilient lazy loading"""
        self.persist_directory = persist_directory
        self.client = None
        self.collection = None
        self.memory_store = []  # Fallback in-memory list
        self._initialized = False

    def _ensure_client(self):
        """Lazy load ChromaDB on first use so startup is instantaneous"""
        if self._initialized:
            return
        self._initialized = True
        try:
            import chromadb
            from chromadb.config import Settings
            os.makedirs(self.persist_directory, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            self.collection = self.client.get_or_create_collection(
                name="job_roles",
                metadata={"description": "Job descriptions and role requirements"}
            )
            logger.info(f"ChromaDB initialized. Collection size: {self.collection.count()}")
        except Exception as e:
            logger.warning(f"ChromaDB initialization deferred or failed ({e}). Using in-memory fallback store.")
            self.client = None
            self.collection = None

    def add_document(self, text: str, metadata: Dict):
        """Add a single document to vector store"""
        self._ensure_client()
        doc_id = hashlib.md5(text.encode('utf-8')).hexdigest()
        if self.collection is not None:
            try:
                self.collection.add(
                    ids=[doc_id],
                    documents=[text],
                    metadatas=[metadata]
                )
                logger.info(f"Added document: {metadata.get('role', 'unknown')}")
                return
            except Exception as e:
                logger.error(f"Failed to add document to ChromaDB: {e}")

        # Fallback in-memory storage
        self.memory_store.append({
            "id": doc_id,
            "document": text,
            "metadata": metadata,
            "embedding": None
        })

    def add_job_role(self, role_id: str, role_name: str, description: str, 
                     skills: List[str], tools: List[str], level: str,
                     embedding: List[float]):
        """Add a job role to vector store"""
        self._ensure_client()
        metadata = {
            "role_name": role_name,
            "skills": ",".join(skills),
            "tools": ",".join(tools),
            "level": level,
            "skill_count": len(skills)
        }
        if self.collection is not None:
            try:
                self.collection.add(
                    ids=[role_id],
                    embeddings=[embedding],
                    documents=[description],
                    metadatas=[metadata]
                )
                logger.info(f"Added role: {role_name}")
                return
            except Exception as e:
                logger.error(f"Failed to add role {role_name} to ChromaDB: {e}")

        self.memory_store.append({
            "id": role_id,
            "role_name": role_name,
            "description": description,
            "skills": skills,
            "tools": tools,
            "level": level,
            "embedding": embedding,
            "metadata": metadata
        })

    def add_batch(self, roles: List[Dict]):
        """Add multiple roles at once"""
        self._ensure_client()
        if self.collection is not None:
            try:
                ids = [r["id"] for r in roles]
                embeddings = [r["embedding"] for r in roles]
                documents = [r["description"] for r in roles]
                metadatas = [r["metadata"] for r in roles]
                self.collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    documents=documents,
                    metadatas=metadatas
                )
                logger.info(f"Added {len(roles)} roles in batch")
                return
            except Exception as e:
                logger.error(f"Batch add to ChromaDB failed: {e}")

        for r in roles:
            self.memory_store.append(r)

    def search(self, query_embedding: List[float], top_k: int = 3) -> List[Dict]:
        """Search for similar job roles"""
        self._ensure_client()
        if self.collection is not None:
            try:
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k,
                    include=["documents", "metadatas", "distances"]
                )
                formatted_results = []
                if results.get("ids") and len(results["ids"]) > 0 and len(results["ids"][0]) > 0:
                    for i in range(len(results["ids"][0])):
                        metadata = results["metadatas"][0][i]
                        formatted_results.append({
                            "id": results["ids"][0][i],
                            "role_name": metadata.get("role_name", metadata.get("role", "Unknown Role")),
                            "description": results["documents"][0][i],
                            "skills": metadata.get("skills", "").split(",") if metadata.get("skills") else [],
                            "tools": metadata.get("tools", "").split(",") if metadata.get("tools") else [],
                            "level": metadata.get("level", "mid"),
                            "similarity": 1 - results["distances"][0][i] if results.get("distances") else 0.85
                        })
                return formatted_results
            except Exception as e:
                logger.error(f"ChromaDB search failed: {e}")

        # Fallback memory search: calculate cosine similarity if embeddings exist
        import numpy as np
        query_vec = np.array(query_embedding)
        norm_q = np.linalg.norm(query_vec)
        scored = []
        for item in self.memory_store:
            sim = 0.75
            if item.get("embedding") is not None and norm_q > 0:
                item_vec = np.array(item["embedding"])
                norm_item = np.linalg.norm(item_vec)
                if norm_item > 0:
                    sim = float(np.dot(query_vec, item_vec) / (norm_q * norm_item))
            metadata = item.get("metadata", {})
            scored.append({
                "id": item.get("id", "fallback_id"),
                "role_name": item.get("role_name") or metadata.get("role_name", "Developer"),
                "description": item.get("description", ""),
                "skills": item.get("skills") or (metadata.get("skills", "").split(",") if metadata.get("skills") else []),
                "tools": item.get("tools") or (metadata.get("tools", "").split(",") if metadata.get("tools") else []),
                "level": item.get("level") or metadata.get("level", "mid"),
                "similarity": sim
            })

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    def get_collection_size(self) -> int:
        """Get number of documents in collection"""
        self._ensure_client()
        if self.collection is not None:
            try:
                return self.collection.count()
            except Exception:
                pass
        return len(self.memory_store)

    def reset(self):
        """Clear all data (use with caution)"""
        self._ensure_client()
        if self.client is not None:
            try:
                self.client.reset()
            except Exception:
                pass
        self.memory_store.clear()
        logger.warning("Vector store reset!")


# Global instance
_vector_store = None

def get_vector_store() -> VectorStore:
    """Get or create vector store singleton"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
