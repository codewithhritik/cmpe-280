# String Operations FastAPI

A FastAPI application that provides various string operations and utility endpoints, with both REST API and web interface.

## Project Structure

```
string-hb-fast-api/
├── main.py
├── requirements.txt
├── static/
└── templates/
    └── index.html
```

## Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
uvicorn main:app --reload
```

The application will be available at:

-   Web Interface: `http://localhost:8000`
-   API Documentation: `http://localhost:8000/docs`

## Web Interface

Visit `http://localhost:8000` to access the web interface where you can:

-   Check API version
-   Send heartbeat messages
-   Convert text to uppercase
-   Convert text to lowercase

## API Endpoints

### 1. Version API

-   **Endpoint:** GET `/version`
-   **Input:** None
-   **Output:** Current API version (1.0.0)

### 2. Heartbeat API

-   **Endpoint:** POST `/heartbeat`
-   **Input:** JSON with "text" field
-   **Output:** Input string with timestamp

### 3. ToUpper API

-   **Endpoint:** POST `/to-upper`
-   **Input:** JSON with "text" field
-   **Output:** Uppercase version of input string

### 4. ToLower API

-   **Endpoint:** POST `/to-lower`
-   **Input:** JSON with "text" field
-   **Output:** Lowercase version of input string

![image](https://github.com/user-attachments/assets/363d4a9c-21d9-475c-9c11-446c3e9f30b3)


## API Usage Examples

Using curl:

```bash
# Get Version
curl http://localhost:8000/version

# Heartbeat
curl -X POST http://localhost:8000/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'

# To Upper
curl -X POST http://localhost:8000/to-upper \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'

# To Lower
curl -X POST http://localhost:8000/to-lower \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'
```

## Development

The application uses:

-   FastAPI for the backend API
-   Jinja2 for HTML templating
-   Basic HTML/CSS/JavaScript for the frontend
-   Uvicorn as the ASGI server

To modify the web interface, edit the `templates/index.html` file.
