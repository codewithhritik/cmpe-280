# agents/clinical_agent.py

import os
from langchain.chat_models import ChatGooglePalm
from langchain.chains import RetrievalQA
from langchain.prompts.prompt import PromptTemplate
from langchain.vectorstores import Chroma

CLINICAL_PROMPT_TEMPLATE = """
You are an expert in clinical studies. 
You have access to structured study documents. 
User's question: {question}

Given the data:
{context}

Provide a clear, concise answer, referencing relevant studies if possible.
If the data does not have the info, say "I do not have that information."
"""

class ClinicalAgent:
    def __init__(self, persist_directory: str):
        """Initialize a Clinical Agent with a Chroma vectorstore."""
        self.persist_directory = persist_directory
        
        # Load vectorstore and retriever
        self.vectorstore = Chroma(persist_directory=self.persist_directory)
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 3})

        # Use Google PaLM (or Gemini once available) instead of OpenAI
        self.llm = ChatGooglePalm(
            google_api_key=os.getenv("AIzaSyCVmkBybIC125gpgF8gh35BhTUHnYCYbFU"),
            temperature=0.0
        )

        self.prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=CLINICAL_PROMPT_TEMPLATE
        )

        # Build the RetrievalQA chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.retriever,
        )

    def run(self, query: str) -> str:
        """
        Use the RetrievalQA chain to answer the clinical query.
        """
        result = self.qa_chain.run(query)
        return result