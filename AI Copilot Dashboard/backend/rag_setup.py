from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores.chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import AIMessage, HumanMessage
from typing import List, Dict, Any, Optional, Sequence, Union
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RAGManager:
    def __init__(self):
        # Initialize Azure OpenAI clients
        self.embeddings = AzureOpenAIEmbeddings(
            azure_endpoint="https://models.inference.ai.azure.com",
            azure_deployment="text-embedding-3-large",
            openai_api_version="2024-02-15-preview",
            openai_api_key=os.getenv("GITHUB_TOKEN"),
            chunk_size=16,
            model="text-embedding-3-large"
        )
        
        self.llm = AzureChatOpenAI(
            azure_endpoint="https://models.inference.ai.azure.com",
            azure_deployment="gpt-4o",
            openai_api_version="2024-02-15-preview",
            openai_api_key=os.getenv("GITHUB_TOKEN"),
            temperature=1,
            max_tokens=4096,
            top_p=1,
            model="gpt-4o"  # Explicitly set the model name
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )
        
        # Initialize or load the vector store
        self.vector_store = self._initialize_vector_store()
        
        # Create the RAG chains
        self.pdf_chain = self._create_pdf_chain()
        self.general_chain = self._create_general_chain()
        self.chart_chain = self._create_chart_chain()
        
        # Initialize chat history
        self.chat_history: List[HumanMessage | AIMessage] = []
    
    def _initialize_vector_store(self) -> Chroma:
        """Initialize or load the Chroma vector store"""
        # Check if vector store already exists
        if os.path.exists("./chroma_db"):
            return Chroma(
                persist_directory="./chroma_db",
                embedding_function=self.embeddings
            )
        
        try:
            # Load and process documents
            clinical_loader = PyPDFLoader("data/clinical_studies.pdf")
            food_loader = PyPDFLoader("data/food_security.pdf")
            
            clinical_docs = clinical_loader.load()
            food_docs = food_loader.load()
            
            # Split documents
            clinical_splits = self.text_splitter.split_documents(clinical_docs)
            food_splits = self.text_splitter.split_documents(food_docs)
            
            # Combine all splits
            all_splits = clinical_splits + food_splits
            
            # Create and persist the vector store
            vector_store = Chroma.from_documents(
                documents=all_splits,
                embedding=self.embeddings,
                persist_directory="./chroma_db"
            )
            vector_store.persist()
            return vector_store
            
        except Exception as e:
            print(f"Error initializing vector store: {str(e)}")
            # Return empty vector store if files not found
            return Chroma(
                persist_directory="./chroma_db",
                embedding_function=self.embeddings
            )
    
    def _create_pdf_chain(self):
        """Create chain for PDF-based queries"""
        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )
        
        template = """You are an AI assistant for answering questions about clinical studies and food security.
        Use ONLY the following pieces of retrieved context to answer the question.
        If you don't know the answer from the context, say "I don't have enough information in the provided documents to answer this question."
        Use three sentences maximum and keep the answer concise.
        
        Context: {context}
        Question: {question}
        
        Helpful Answer:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            {
                "context": retriever | self._format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def _create_general_chain(self):
        """Create chain for general queries"""
        template = """You are a helpful AI assistant.
        Answer the following question based on your general knowledge.
        Keep the answer concise and informative.
        
        Question: {question}
        
        Helpful Answer:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            {"question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def _create_chart_chain(self):
        """Create chain for chart generation"""
        template = """You are a data visualization expert.
        Generate a JSON response that can be used to create a chart based on the query.
        The response should be in the following format:
        {{
            "title": "Chart Title",
            "type": "bar|line|pie",
            "data": [
                {{"name": "Label1", "value": number}},
                {{"name": "Label2", "value": number}},
                ...
            ]
        }}
        
        Generate realistic data that makes sense for the query.
        Include 5-10 data points.
        
        Query: {question}
        
        JSON Response:"""
        
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = (
            {"question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        
        return chain
    
    def _format_docs(self, docs):
        """Format documents into a string"""
        return "\n\n".join(doc.page_content for doc in docs)
    
    def _is_chart_query(self, query: str) -> bool:
        """Check if the query is asking for a chart"""
        chart_keywords = [
            "chart", "graph", "plot", "visualize", "visualization",
            "trend", "distribution", "compare", "comparison", "json"
        ]
        return any(keyword in query.lower() for keyword in chart_keywords)
    
    def _is_pdf_query(self, query: str) -> bool:
        """Check if the query is likely about the PDF content"""
        # First, try to find relevant documents
        docs = self.vector_store.similarity_search(query, k=2)
        if not docs:
            return False
            
        # Check relevance score (if available)
        if hasattr(docs[0], 'similarity') and docs[0].similarity < 0.7:
            return False
            
        # Check for PDF-specific keywords
        pdf_keywords = [
            "clinical", "study", "studies", "food", "security",
            "research", "paper", "document", "pdf"
        ]
        return any(keyword in query.lower() for keyword in pdf_keywords)
    
    async def process_query(self, query: str) -> Union[str, Dict[str, Any]]:
        """Process a query through the appropriate pipeline"""
        try:
            # Determine query type and use appropriate chain
            if self._is_chart_query(query):
                response = self.chart_chain.invoke(query)
                try:
                    # Try to parse as JSON
                    if isinstance(response, str):
                        if "```json" in response:
                            response = response.split("```json")[1].split("```")[0]
                        elif "```" in response:
                            response = response.split("```")[1].split("```")[0]
                    return json.loads(response)
                except:
                    return {"error": "Failed to generate valid chart data"}
                    
            elif self._is_pdf_query(query):
                response = self.pdf_chain.invoke(query)
            else:
                response = self.general_chain.invoke(query)
            
            # Update chat history
            self.chat_history.extend([
                HumanMessage(content=query),
                AIMessage(content=response)
            ])
            
            return response
            
        except Exception as e:
            print(f"Error processing query: {str(e)}")
            return "I apologize, but I encountered an error processing your query. Please try again."

# Initialize the RAG manager
rag_manager = RAGManager() 