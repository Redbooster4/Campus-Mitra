
#!/usr/bin/env bash

set -uo pipefail

# Resolve repository root dynamically
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# Check required commands
for cmd in konsole node npm python; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "ERROR: Required command '$cmd' is not installed or not in PATH."
        exit 1
    fi
done

# Check required project files and directories
REQUIRED_PATHS=(
    "$ROOT_DIR/Backend/server.js"
    "$ROOT_DIR/ChatBot-Dashboard/package.json"
    "$ROOT_DIR/RAG/.venv/bin/activate"
    "$ROOT_DIR/RAG/classification-service/api.py"
)

for path in "${REQUIRED_PATHS[@]}"; do
    if [[ ! -e "$path" ]]; then
        echo "ERROR: Required path not found: $path"
        exit 1
    fi
done

# Verify the ChromaDB executable in the virtual environment
if [[ ! -x "$ROOT_DIR/RAG/.venv/bin/chroma" ]]; then
    echo "ERROR: ChromaDB executable not found in RAG/.venv/bin."
    echo "Check the RAG virtual environment and dependencies."
    exit 1
fi

echo "Launching Campus-Mitra services using Konsole..."
echo "Project root: $ROOT_DIR"

# Launch each service in its own Konsole process/window
launch_service() {
    local title="$1"
    local working_dir="$2"
    local service_command="$3"

    echo "Starting launch request: $title"

    konsole --separate \
        --workdir "$working_dir" \
        -e bash -c "
            printf '\\n=== $title ===\\n'
            $service_command
            status=\$?
            printf '\\n$title exited with status %s\\n' \"\$status\"
            exec bash
        " &

    sleep 0.5
}

# 1. Backend API
launch_service \
    "Backend" \
    "$ROOT_DIR/Backend" \
    "node server.js"

# 2. Frontend dashboard
launch_service \
    "Dashboard" \
    "$ROOT_DIR/ChatBot-Dashboard" \
    "npm run dev"

# 3. ChromaDB vector database
launch_service \
    "ChromaDB" \
    "$ROOT_DIR/RAG" \
    "./.venv/bin/chroma run --path '$ROOT_DIR/RAG/chroma_data' --port 8000"

# 4. Classification API
launch_service \
    "Classification Service" \
    "$ROOT_DIR/RAG/classification-service" \
    "../.venv/bin/python api.py"

echo
echo "Launch requests issued for all four services."
echo "Check each Konsole window for startup errors."
