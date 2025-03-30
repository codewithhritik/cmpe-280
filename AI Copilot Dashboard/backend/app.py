from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional, Union
from rag_setup import rag_manager

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    response: Union[str, Dict[str, Any]]
    type: str  # 'text' or 'chart'

@app.get("/")
async def read_root():
    return {"status": "ok", "message": "AI Copilot API is running"}

@app.post("/api/chat")
async def process_query(request: QueryRequest):
    query = request.query
    
    try:
        # Process the query through our RAG system
        response = await rag_manager.process_query(query)
        
        # Determine response type
        if isinstance(response, dict):
            if "error" in response:
                return QueryResponse(response=response["error"], type="text")
            return QueryResponse(response=response, type="chart")
        else:
            return QueryResponse(response=response, type="text")
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 