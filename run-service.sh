#!/usr/bin/env bash

# Resolve repository root dynamically
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if running under Kitty or standard desktop terminal
if command -v kitty &>/dev/null && [ "$TERM" = "xterm-kitty" ]; then
    TERMINAL_BIN="kitty"
elif command -v gnome-terminal &>/dev/null; then
    TERMINAL_BIN="gnome-terminal"
else
    TERMINAL_BIN="x-terminal-emulator"
fi

echo "Launching services using: $TERMINAL_BIN"

if [ "$TERMINAL_BIN" = "kitty" ]; then
    # Launch separate Kitty OS windows
    kitty --title "Backend" bash -c "cd '$ROOT_DIR/Backend' && node server.js; exec bash" &
    kitty --title "Dashboard" bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && npm run dev; exec bash" &
    kitty --title "ChromaDB" bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && chroma run --path '$ROOT_DIR/RAG/chroma_data' --port 8000; exec bash" &
    kitty --title "Classification Service" bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && cd classification-service && python api.py; exec bash" &
    kitty --title "Sarvam Voice Service" bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && '$ROOT_DIR/.venv/bin/python' sarvam_voice_server.py; exec bash" &

elif [ "$TERMINAL_BIN" = "gnome-terminal" ]; then
    # Launch separate GNOME Terminal windows
    gnome-terminal --title="Backend" -- bash -c "cd '$ROOT_DIR/Backend' && node server.js; exec bash"
    gnome-terminal --title="Dashboard" -- bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && npm run dev; exec bash"
    gnome-terminal --title="ChromaDB" -- bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && chroma run --path '$ROOT_DIR/RAG/chroma_data' --port 8000; exec bash"
    gnome-terminal --title="Classification Service" -- bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && cd classification-service && python api.py; exec bash"
    gnome-terminal --title="Sarvam Voice Service" -- bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && '$ROOT_DIR/.venv/bin/python' sarvam_voice_server.py; exec bash"

else
    # Fallback for generic x-terminal-emulator
    x-terminal-emulator -T "Backend" -e bash -c "cd '$ROOT_DIR/Backend' && node server.js; exec bash" &
    x-terminal-emulator -T "Dashboard" -e bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && npm run dev; exec bash" &
    x-terminal-emulator -T "ChromaDB" -e bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && chroma run --path '$ROOT_DIR/RAG/chroma_data' --port 8000; exec bash" &
    x-terminal-emulator -T "Classification Service" -e bash -c "cd '$ROOT_DIR/RAG' && source .venv/bin/activate && pip install -r ./requirements.txt && cd classification-service && python api.py; exec bash" &
    x-terminal-emulator -T "Sarvam Voice Service" -e bash -c "cd '$ROOT_DIR/ChatBot-Dashboard' && '$ROOT_DIR/.venv/bin/python' sarvam_voice_server.py; exec bash" &
fi
