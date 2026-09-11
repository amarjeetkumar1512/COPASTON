# COPASTON

## AI-Powered Product Lifecycle Safety and O&M Platform

COPASTON is an AI-powered platform designed to manage product lifecycle information, safety incidents, maintenance operations, and technical knowledge using specialized AI agents.

## Key Features

- Product Lifecycle Management
- Safety Incident Analysis
- Maintenance/O&M Management
- RAG-based Technical Knowledge Assistant
- AI-powered Orchestration
- Response and Decision Evaluation
- PostgreSQL database integration
- ChromaDB knowledge base
- Ollama local LLM
- FastAPI backend
- React frontend

## AI Agents

### 1. Orchestrator Agent
Understands the user's request and routes it to the appropriate specialist agent.

### 2. Product Lifecycle Agent
Handles product information, product records, status, and lifecycle analysis.

### 3. Safety Agent
Handles safety incidents, severity analysis, risk assessment, and recommendations.

### 4. Maintenance/O&M Agent
Handles maintenance records, due dates, maintenance status, and recommendations.

### 5. RAG Knowledge Agent
Retrieves relevant information from the technical knowledge base and provides grounded answers.

### 6. Evaluation Agent
Evaluates agent decisions and responses using predefined test cases and expected keywords.

## Technology Stack

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- ChromaDB
- Sentence Transformers
- Ollama
- Qwen 2.5 0.5B
- React
- Vite

## Project Structure


COPASTON/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── models/
│   │   └── routes/
│   ├── knowledge_base/
│   ├── main.py
│   ├── rag_qa.py
│   ├── rag_loader.py
│   ├── rag_search.py
│   └── test_evaluation.py
│
├── frontend/
│   └── src/
│
└── README.md
