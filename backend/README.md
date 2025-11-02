# Backend

## Setup

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
./env/scripts/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload