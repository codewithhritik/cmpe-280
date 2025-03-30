# ingest_data.py

import os
import pdfplumber
import pandas as pd
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

# Use langchain_community imports to avoid deprecation warnings
from langchain_community.embeddings import GooglePalmEmbeddings
from langchain_community.vectorstores import Chroma

# Example Google PaLM embedding model name (adjust as needed)
EMBEDDINGS_MODEL_NAME = "gemini-2.0-flash"

UN_VECTORSTORE_DIR = "un_food_index"
CLINICAL_VECTORSTORE_DIR = "clinical_index"

def ingest_un_food_data(pdf_path: str, db_dir: str):
    print(f"Ingesting UN Food PDF data from: {pdf_path}")
    
    # Read the PDF with pdfplumber
    with pdfplumber.open(pdf_path) as pdf:
        text_pages = []
        for page_num, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                text_pages.append((page_num, text))

    # Convert extracted text to Documents
    docs = []
    for page_num, page_text in text_pages:
        docs.append(
            Document(
                page_content=page_text,
                metadata={"source": "un_food_security", "page": page_num}
            )
        )
    
    # Split text into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    split_docs = text_splitter.split_documents(docs)

    # Directly pass your API key (not recommended for production)
    embeddings = GooglePalmEmbeddings(
        google_api_key="AIzaSyCVmkBybIC125gpgF8gh35BhTUHnYCYbFU", 
        model_name=EMBEDDINGS_MODEL_NAME
    )

    # Create a Chroma vectorstore and persist it
    vectorstore = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=db_dir
    )
    vectorstore.persist()
    print(f"UN Food Security vectorstore created at: {db_dir}")


def ingest_clinical_data_from_pdf(pdf_path: str, db_dir: str):
    """
    Ingests tabular clinical data from a PDF that stores data in CSV-like tables.
    """
    print(f"Ingesting Clinical PDF data from: {pdf_path}")

    # Extract table data from the PDF
    all_rows = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                all_rows.extend(table)

    # Check if any table data was found
    if not all_rows:
        print("No tabular data found in the PDF.")
        return

    # Assume first row is the header
    headers = all_rows[0]
    data_rows = all_rows[1:]

    # Create a DataFrame from the extracted table rows
    df = pd.DataFrame(data_rows, columns=headers)

    # Convert each row to a Document
    docs = []
    for idx, row in df.iterrows():
        row_text = (
            f"NCT Number: {row.get('NCT Number','')}\n"
            f"Study Title: {row.get('Study Title','')}\n"
            f"Study URL: {row.get('Study URL','')}\n"
            f"Study Status: {row.get('Study Status','')}\n"
            f"Conditions: {row.get('Conditions','')}\n"
            f"Interventions: {row.get('Interventions','')}\n"
            f"Sponsor: {row.get('Sponsor','')}\n"
            f"Collaborators: {row.get('Collaborators','')}\n"
            f"Phases: {row.get('Phases','')}\n"
            f"Enrollment: {row.get('Enrollment','')}\n"
            f"Study Type: {row.get('Study Type','')}\n"
        )
        docs.append(
            Document(
                page_content=row_text,
                metadata={"source": "clinical_studies", "row_index": idx}
            )
        )

    # Split rows into chunks if needed
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100
    )
    split_docs = text_splitter.split_documents(docs)

    # Directly pass your API key (not recommended for production)
    embeddings = GooglePalmEmbeddings(
        google_api_key="YOUR_GOOGLE_PALM_API_KEY_HERE", 
        model_name=EMBEDDINGS_MODEL_NAME
    )

    # Create a Chroma vectorstore and persist it
    vectorstore = Chroma.from_documents(
        documents=split_docs,
        embedding=embeddings,
        persist_directory=db_dir
    )
    vectorstore.persist()
    print(f"Clinical vectorstore created at: {db_dir}")


if __name__ == "__main__":
    # Provide file paths
    un_pdf_path = os.path.join("data", "un_food_security.pdf")
    clinical_pdf_path = os.path.join("data", "clinical_studies.pdf")

    # Ingest and create vectorstores
    ingest_un_food_data(un_pdf_path, UN_VECTORSTORE_DIR)
    ingest_clinical_data_from_pdf(clinical_pdf_path, CLINICAL_VECTORSTORE_DIR)