"""
Retriever service - combines embedder and vector store
Handles semantic search for job roles
"""
from typing import List, Dict
from .embedder import get_embedding_service
from .vector_store import get_vector_store
import logging

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self):
        self.embedder = get_embedding_service()
        self.vector_store = get_vector_store()
    
    def retrieve_relevant_roles(self, query: str, top_k: int = 3) -> List[Dict]:
        """
        Retrieve most relevant job roles for a query
        
        Args:
            query: User's target role or description
            top_k: Number of results to return
        
        Returns:
            List of relevant job roles with metadata
        """
        try:
            # Convert query to embedding
            query_embedding = self.embedder.embed_text(query)
            
            # Search vector store
            results = self.vector_store.search(query_embedding, top_k=top_k)
            
            logger.info(f"Retrieved {len(results)} roles for query: {query}")
            return results
        except Exception as e:
            logger.error(f"Retrieval failed: {e}")
            return []
    
    def get_role_context(self, query: str, top_k: int = 3) -> str:
        """
        Get formatted context for LLM prompt
        
        Returns:
            Formatted string with job role information
        """
        results = self.retrieve_relevant_roles(query, top_k)
        
        if not results:
            return "No relevant job data found."
        
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(f"""
Role {i}: {result['role_name']}
Level: {result['level']}
Required Skills: {', '.join(result['skills'])}
Tools: {', '.join(result['tools'])}
Description: {result['description']}
Similarity Score: {result['similarity']:.2f}
""")
        
        return "\n".join(context_parts)

# Global instance
_retriever = None

def get_retriever() -> Retriever:
    """Get or create retriever singleton"""
    global _retriever
    if _retriever is None:
        _retriever = Retriever()
    return _retriever
