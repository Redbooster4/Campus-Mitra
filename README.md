cd Backend
node server.js

cd ChatBot-Dashboard
npm run dev

cd RAG
source .venv/bin/activate
pip install -r ./requirements.txt

cd classification-service
python api.py

chroma run --path /home/ronit/Projects/Campus-Mitra/RAG/chroma_data --port 8000