"""
Data Ingestion Service - Populate ChromaDB with job descriptions and learning resources
"""
from rag.vector_store import VectorStore
from rag.embedder import get_embedder
from typing import List, Dict

class DataIngestionService:
    def __init__(self):
        self.vector_store = VectorStore()
        self.embedder = get_embedder()
    
    def ingest_job_descriptions(self):
        """Ingest sample job descriptions into vector DB"""
        job_descriptions = [
            {
                "role": "Frontend Developer",
                "text": """Frontend Developer Requirements:
                - Strong proficiency in HTML, CSS, JavaScript
                - Experience with React.js or Vue.js
                - Understanding of responsive design and mobile-first approach
                - Knowledge of state management (Redux, Context API)
                - Familiarity with RESTful APIs
                - Version control with Git
                - CSS preprocessors (SASS, LESS)
                - Build tools (Webpack, Vite)
                - Testing frameworks (Jest, React Testing Library)
                - Performance optimization techniques"""
            },
            {
                "role": "Backend Developer",
                "text": """Backend Developer Requirements:
                - Proficiency in Python, Java, or Node.js
                - Experience with FastAPI, Django, or Express.js
                - Strong understanding of RESTful API design
                - Database knowledge (SQL and NoSQL)
                - Authentication and authorization (JWT, OAuth)
                - Microservices architecture
                - Docker and containerization
                - CI/CD pipelines
                - Cloud platforms (AWS, Azure, GCP)
                - API security best practices"""
            },
            {
                "role": "Full Stack Developer",
                "text": """Full Stack Developer Requirements:
                - Frontend: React, Vue, or Angular
                - Backend: Node.js, Python, or Java
                - Database: MongoDB, PostgreSQL, MySQL
                - RESTful and GraphQL APIs
                - Authentication systems
                - Deployment and DevOps basics
                - Git version control
                - Agile methodologies
                - Testing (unit, integration, e2e)
                - Cloud services knowledge"""
            },
            {
                "role": "Data Scientist",
                "text": """Data Scientist Requirements:
                - Strong Python programming skills
                - Machine learning frameworks (scikit-learn, TensorFlow, PyTorch)
                - Data manipulation (Pandas, NumPy)
                - Statistical analysis and hypothesis testing
                - Data visualization (Matplotlib, Seaborn, Plotly)
                - SQL and database querying
                - Big data tools (Spark, Hadoop)
                - Feature engineering
                - Model deployment and MLOps
                - Jupyter notebooks and experimentation"""
            },
            {
                "role": "DevOps Engineer",
                "text": """DevOps Engineer Requirements:
                - Linux system administration
                - Docker and Kubernetes
                - CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
                - Infrastructure as Code (Terraform, Ansible)
                - Cloud platforms (AWS, Azure, GCP)
                - Monitoring and logging (Prometheus, Grafana, ELK)
                - Scripting (Bash, Python)
                - Networking fundamentals
                - Security best practices
                - Version control systems"""
            },
            {
                "role": "Machine Learning Engineer",
                "text": """Machine Learning Engineer Requirements:
                - Deep learning frameworks (TensorFlow, PyTorch)
                - Model training and optimization
                - MLOps and model deployment
                - Python programming
                - Data preprocessing and feature engineering
                - Model evaluation metrics
                - Cloud ML services (SageMaker, Vertex AI)
                - Docker and Kubernetes
                - REST API development
                - Version control and experiment tracking"""
            }
        ]
        
        # Ingest each job description
        for job in job_descriptions:
            self.vector_store.add_document(
                text=job["text"],
                metadata={"role": job["role"], "type": "job_description"}
            )
        
        print(f"✓ Ingested {len(job_descriptions)} job descriptions")
    
    def ingest_learning_resources(self):
        """Ingest learning roadmap templates"""
        learning_resources = [
            {
                "topic": "Frontend Developer Learning Path",
                "text": """Frontend Developer Learning Roadmap:
                
                Beginner Level (2-3 months):
                - HTML5 fundamentals and semantic markup
                - CSS3 including Flexbox and Grid
                - JavaScript basics (ES6+)
                - DOM manipulation
                - Responsive design principles
                - Git basics
                
                Intermediate Level (3-4 months):
                - React.js fundamentals
                - Component lifecycle and hooks
                - State management with Redux
                - API integration with Axios
                - CSS frameworks (Tailwind, Bootstrap)
                - Build tools (Webpack, Vite)
                
                Advanced Level (3-4 months):
                - Advanced React patterns
                - Performance optimization
                - Testing (Jest, React Testing Library)
                - TypeScript
                - Next.js or Gatsby
                - Deployment and CI/CD"""
            },
            {
                "topic": "Backend Developer Learning Path",
                "text": """Backend Developer Learning Roadmap:
                
                Beginner Level (2-3 months):
                - Python or Node.js fundamentals
                - HTTP and REST principles
                - Basic database concepts (SQL)
                - CRUD operations
                - Authentication basics
                - Git version control
                
                Intermediate Level (3-4 months):
                - FastAPI or Express.js framework
                - Database design and optimization
                - JWT authentication
                - API documentation (Swagger)
                - Error handling and logging
                - Docker basics
                
                Advanced Level (3-4 months):
                - Microservices architecture
                - Message queues (RabbitMQ, Kafka)
                - Caching strategies (Redis)
                - Cloud deployment (AWS, Azure)
                - CI/CD pipelines
                - Security best practices"""
            },
            {
                "topic": "Data Science Learning Path",
                "text": """Data Science Learning Roadmap:
                
                Beginner Level (2-3 months):
                - Python programming basics
                - NumPy and Pandas fundamentals
                - Data visualization (Matplotlib, Seaborn)
                - Statistics fundamentals
                - SQL basics
                - Jupyter notebooks
                
                Intermediate Level (3-4 months):
                - Machine learning algorithms
                - scikit-learn library
                - Feature engineering
                - Model evaluation metrics
                - Data preprocessing techniques
                - Exploratory data analysis
                
                Advanced Level (3-4 months):
                - Deep learning (TensorFlow, PyTorch)
                - Natural Language Processing
                - Computer Vision
                - Model deployment
                - MLOps practices
                - Big data tools (Spark)"""
            }
        ]
        
        for resource in learning_resources:
            self.vector_store.add_document(
                text=resource["text"],
                metadata={"topic": resource["topic"], "type": "learning_resource"}
            )
        
        print(f"✓ Ingested {len(learning_resources)} learning resources")
    
    def initialize_database(self):
        """Initialize vector database with all data"""
        print("Initializing vector database...")
        self.ingest_job_descriptions()
        self.ingest_learning_resources()
        print("✓ Vector database initialized successfully!")

# Singleton instance
_data_service = None

def get_data_ingestion_service() -> DataIngestionService:
    """Get or create data ingestion service"""
    global _data_service
    if _data_service is None:
        _data_service = DataIngestionService()
    return _data_service
