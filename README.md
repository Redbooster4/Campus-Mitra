cd Backend
node server.js

cd ChatBot-Dashboard
npm run dev

cd RAG
source .venv/bin/activate
pip install -r ./requirements.txt
chroma run --path /home/ronit/Projects/Campus-Mitra/RAG/chroma_data --port 8000

cd RAG
source .venv/bin/activate
pip install -r ./requirements.txt
cd classification-service
python api.py


./run-service.sh
To run all the above commands


Backend/.env FORMAT
PORT=3000

OPENAI_API_KEY=your_API_key
OPENAI_TRANSCRIPTION_MODEL=whisper-1

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sbmp-final-year-project
DB_USER=postgres
DB_PASSWORD=

JWT_SECRET=