# Book Wise - Python service

Speech recognition and test generation service.

- reading speed over WebSocket: Vosk with a grammar built from the reference text, recognized words are aligned with the text live
- substitution check (Vosk + Moonshine) after the session ends
- stress check (Montreal Forced Aligner + classifier), runs in the background
- comprehension questions and book tests via Gemini (requests come from RabbitMQ)

Stack: Python 3.11+, FastAPI, Vosk, PyTorch, scikit-learn, aio-pika, MinIO.

## Run

Needs Docker, running MinIO and Java backend, and a Gemini key.

```bash
docker compose up -d                          # RabbitMQ
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install --no-deps -r requirements-stress.txt
./scripts/download_vosk_model.sh              # lgraph model, ~325 MB
python main.py                                # http://localhost:8001
```

Optional: `requirements-hybrid.txt` (substitution check, needs torch) and MFA via conda for the stress check. Without them the service still works, these checks are just skipped.

`.env` (other variables have defaults in `core/config.py`):

```
SUPABASE_URL=https://<project>.supabase.co
JAVA_BASE_URL=http://localhost:8080
JAVA_INTERNAL_API_KEY=<same as INTERNAL_API_KEY in java>
GEMINI_API_KEY=<key>
MINIO_ENDPOINT=localhost:9002
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=books
VOSK_MODEL_PATH=vosk_models/vosk-model-uk-v3-lgraph
MFA_BIN_DIR=<bin dir of the conda env with mfa>
```

## Endpoints

- `GET /api/status`
- `WS /ws/reading-speed?token=...&participant_id=...` - client sends 16 kHz mono PCM, gets word statuses back; `stop` ends the session
- `POST /internal/book-paragraphs` - used by Java

## Structure

- `api/routes/` - routes
- `services/` - recognition, alignment, stress, tests, Java/MinIO/RabbitMQ clients
- `resources/` - reference texts, stress model
- `scripts/` - model download and checks on recordings
