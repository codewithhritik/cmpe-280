from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from pydantic import BaseModel

app = FastAPI()

# Mount templates and static files
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

class StringInput(BaseModel):
    text: str

@app.get("/version")
async def get_version():
    """Return the API version"""
    return {"version": "1.0.0"}

@app.post("/heartbeat")
async def heartbeat(input: StringInput):
    """Return the input string with current timestamp"""
    current_time = datetime.now().isoformat()
    return {
        "message": input.text,
        "timestamp": current_time,
        "together": input.text + str(current_time)
    }

@app.post("/to-upper")
async def to_upper(input: StringInput):
    """Convert input string to uppercase"""
    return {"result": input.text.upper()}

@app.post("/to-lower")
async def to_lower(input: StringInput):
    """Convert input string to lowercase"""
    return {"result": input.text.lower()}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the frontend page"""
    return templates.TemplateResponse("index.html", {"request": request}) 