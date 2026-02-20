from sentence_transformers import SentenceTransformer
import numpy as np

class semantic_engine:
    MODEL_NAME = "sentence-transformers/all-mpnet-base-v2"
    _model = None

    @classmethod
    def _load_model(cls):
        if cls._model is None:
            cls._model = SentenceTransformer(cls.MODEL_NAME)

    @classmethod
    def encode(cls,texts:list[str])->np.ndarray:
        if not texts:
            raise ValueError("Input list cannot be empty.")
        
        cls._load_model()

        return cls._model.encode(texts, convert_to_numpy=True,
                                 normalize_embeddings=True)
    
    @staticmethod
    def _cosine_matrix(a:np.ndarray,b:np.ndarray)->np.ndarray:
        return np.dot(a,b.T)
    
    @classmethod
    def compute_semantic_score(cls,resume_chunks:list[str],job_requirements:list[str])->float:
        if not resume_chunks or not job_requirements:
            return 0.0
        
        resume_embeddings=cls.encode(resume_chunks)
        jd_embeddings=cls.encode(job_requirements)

        similarity_matrix=cls._cosine_matrix(jd_embeddings,resume_embeddings)

        max_similarities=np.max(similarity_matrix,axis=1)

        normalized=(max_similarities+1)/2

        semantic_score = float(np.mean(normalized)) * 100

        return round(semantic_score, 2)