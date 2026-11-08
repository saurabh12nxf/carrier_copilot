"""
Embedding service using sentence-transformers with resilient fallback
Converts text to vector embeddings for semantic search
"""
import logging
import hashlib
from typing import List, Union

logger = logging.getLogger(__name__)

# Safe import to prevent startup crash if sentence-transformers has environment incompatibilities
try:
    from sentence_transformers import SentenceTransformer
except Exception as e:
    logger.warning(f"SentenceTransformer import failed: {e}. Will use fallback embeddings.")
    SentenceTransformer = None


class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embedding model
        all-MiniLM-L6-v2: Fast, lightweight, good for semantic search
        Dimension: 384
        """
        self.dimension = 384
        self.model = None

        if SentenceTransformer is not None:
            try:
                logger.info(f"Loading embedding model: {model_name}")
                self.model = SentenceTransformer(model_name)
                self.dimension = self.model.get_sentence_embedding_dimension()
                logger.info(f"Model loaded successfully. Dimension: {self.dimension}")
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer model ({e}). Using lightweight hash embedding fallback.")
                self.model = None
        else:
            logger.info("SentenceTransformer not available. Using lightweight hash embedding fallback.")

    def _fallback_embedding(self, text: str) -> List[float]:
        """Generate deterministic 384-dim normalized pseudo-embedding when model is unavailable"""
        import numpy as np
        h = hashlib.sha256(text.encode('utf-8')).hexdigest()
        seed = int(h[:8], 16)
        rng = np.random.default_rng(seed)
        vec = rng.standard_normal(self.dimension)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_text(self, text: str) -> List[float]:
        """Convert single text to embedding"""
        if self.model is not None:
            try:
                embedding = self.model.encode(text, convert_to_numpy=True)
                return embedding.tolist()
            except Exception as e:
                logger.error(f"Embedding failed: {e}")
        return self._fallback_embedding(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Convert multiple texts to embeddings (batch processing)"""
        if self.model is not None:
            try:
                embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Batch embedding failed: {e}")
        return [self._fallback_embedding(t) for t in texts]

    def get_dimension(self) -> int:
        """Get embedding dimension"""
        return self.dimension


# Global instance
_embedding_service = None

def get_embedder() -> EmbeddingService:
    """Get or create embedding service singleton"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service

def get_embedding_service() -> EmbeddingService:
    """Alias for get_embedder"""
    return get_embedder()
