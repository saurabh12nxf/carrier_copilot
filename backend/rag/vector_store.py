"""
ChromaDB vector store for job descriptions and role requirements
Handles storage and retrieval of job data
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize ChromaDB client"""
        try:
            self.persist_directory = persist_directory
            os.makedirs(persist_directory, exist_ok=True)
            
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Create or get collection
            self.collection = self.client.get_or_create_collection(
                name="job_roles",
                metadata={"description": "Job descriptions and role requirements"}
            )
            
            logger.info(f"ChromaDB initialized. Collection size: {self.collection.count()}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise
    
    def add_document(self, text: str, metadata: Dict):
        """Add a single document to vector store"""
        try:
            # Generate a unique ID
            import hashlib
            doc_id = hashlib.md5(text.encode()).hexdigest()
            
            # This will be embedded by ChromaDB automatically
            self.collection.add(
                ids=[doc_id],
                documents=[text],
                metadatas=[metadata]
            )
            logger.info(f"Added document: {metadata.get('role', 'unknown')}")
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
    
    def add_job_role(self, role_id: str, role_name: str, description: str, 
                     skills: List[str], tools: List[str], level: str,
                     embedding: List[float]):
        """Add a job role to vector store"""
        try:
            metadata = {
                "role_name": role_name,
                "skills": ",".join(skills),
                "tools": ",".join(tools),
                "level": level,
                "skill_count": len(skills)
            }
            
            self.collection.add(
                ids=[role_id],
                embeddings=[embedding],
                documents=[description],
                metadatas=[metadata]
            )
            logger.info(f"Added role: {role_name}")
        except Exception as e:
            logger.error(f"Failed to add role {role_name}: {e}")
    
    def add_batch(self, roles: List[Dict]):
        """Add multiple roles at once"""
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
        except Exception as e:
            logger.error(f"Batch add failed: {e}")
    
    def search(self, query_embedding: List[float], top_k: int = 3) -> List[Dict]:
        """Search for similar job roles"""
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            if results["ids"] and len(results["ids"][0]) > 0:
                for i in range(len(results["ids"][0])):
                    metadata = results["metadatas"][0][i]
                    formatted_results.append({
                        "id": results["ids"][0][i],
                        "role_name": metadata.get("role_name", metadata.get("role", "Unknown Role")),
                        "description": results["documents"][0][i],
                        "skills": metadata.get("skills", "").split(",") if metadata.get("skills") else [],
                        "tools": metadata.get("tools", "").split(",") if metadata.get("tools") else [],
                        "level": metadata.get("level", "mid"),
                        "similarity": 1 - results["distances"][0][i]  # Convert distance to similarity
                    })
            
            return formatted_results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def get_collection_size(self) -> int:
        """Get number of documents in collection"""
        return self.collection.count()
    
    def reset(self):
        """Clear all data (use with caution)"""
        self.client.reset()
        logger.warning("Vector store reset!")

# Global instance
_vector_store = None

def get_vector_store() -> VectorStore:
    """Get or create vector store singleton"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
