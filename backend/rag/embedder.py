"""
Embedding service using sentence-transformers with resilient fallback
Converts text to vector embeddings for semantic search
"""
import logging
import hashlib
from typing import List, Union

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embedding model with lazy loading so server startup is instantaneous.
        """
        self.model_name = model_name
        self.dimension = 384
        self.model = None
        self._model_loaded = False

    def _ensure_model(self):
        """Lazy load SentenceTransformer only when actually needed for an inference call"""
        if self._model_loaded:
            return
        self._model_loaded = True
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
            logger.info(f"Model loaded successfully. Dimension: {self.dimension}")
        except Exception as e:
            logger.warning(f"SentenceTransformer not available or failed to load ({e}). Using lightweight hash fallback.")
            self.model = None

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
        self._ensure_model()
        if self.model is not None:
            try:
                embedding = self.model.encode(text, convert_to_numpy=True)
                return embedding.tolist()
            except Exception as e:
                logger.error(f"Embedding failed: {e}")
        return self._fallback_embedding(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Convert multiple texts to embeddings (batch processing)"""
        self._ensure_model()
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
