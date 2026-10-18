# Campus Mitra — Comprehensive System Architecture Specification

## 1. Executive Summary & System Purpose

**Campus Mitra** is an enterprise-grade, AI-powered conversational admission, academic counseling, and student lifecycle management platform designed specifically for **SVKM's Shri Bhagubhai Mafatlal Polytechnic (SBMP)**. 

The platform addresses critical challenges in university and polytechnic admissions:
- **Multilingual Inclusivity**: Real-time natural language query resolution in **English, Hindi, Marathi, and Gujarati**.
- **Hybrid Retrieval-Augmented Generation (Hybrid RAG)**: Seamless unification of structured transactional records (application status, fee payments, document verification) stored in **PostgreSQL** with unstructured institutional knowledge (prospectuses, cut-offs, seat matrices, curricula) indexed in **ChromaDB**.
- **Dynamic Multimodal Document Inspection**: Just-in-time extraction of live institutional PDF notices and scanned tables using **Google Gemini 1.5/2.5 multimodal models** with persistent hash caching.
- **Human-in-the-Loop Escalation & Admission CRM**: Automatic detection of high-intent or frustrated applicants, immediate escalation to human admission counselors, callback scheduling, and comprehensive administrative analytics.

---

## 2. High-Level System Architecture

The Campus Mitra platform utilizes a distributed, decoupled microservice architecture comprising four core operational tiers:

```mermaid
flowchart TB
    subgraph ClientTier ["Client Tier (Browser / Mobile)"]
        UI["React 19 Dashboard & Chat Portal<br/>(Vite, Tailwind CSS, Three.js)"]
    end

    subgraph GatewayTier ["Backend API Gateway (Port 3000)"]
        ExpressServer["Node.js / Express 5 API Server"]
        AuthMiddleware["JWT Auth & RBAC Middleware"]
        AuthCtrl["Auth Controller"]
        ChatCtrl["Chat & Callback Controller"]
        AnalyticsCtrl["Analytics & Reporting Controller"]
    end

    subgraph AITier ["AI / RAG Microservice (Port 5000)"]
        FlaskAPI["Python Flask API Engine"]
        Classifier["Gemini Query Classifier<br/>(LangChain Structured Output)"]
        Router["Adaptive Query Router"]
        DocExtractor["Gemini Multimodal PDF Engine<br/>& Local Disk Cache"]
        LLMGen["Gemini Multilingual Answer Generator"]
    end

    subgraph DataTier ["Persistence & Vector Storage Tier"]
        PostgresDB[("PostgreSQL 16+<br/>(pg_trgm, uuid-ossp, pgcrypto)")]
        ChromaServer[("ChromaDB Vector Store<br/>(Port 8000)")]
        OllamaServer["Ollama Embeddings Service<br/>(nomic-embed-text: 768-dim)"]
    end

    subgraph IngestionTier ["Automated Ingestion Pipeline"]
        n8nEngine["n8n Workflow Automation Engine<br/>(Scheduled Daily 02:00)"]
        WebScraper["SBMP Web Scraper & PDF Downloader"]
        DocChunker["Recursive Text Splitter<br/>(3000 chars, 300 overlap)"]
    end

    %% Interactions
    UI <-->|HTTP / REST / JWT Bearer| ExpressServer
    ExpressServer --> AuthMiddleware
    AuthMiddleware --> AuthCtrl
    AuthMiddleware --> ChatCtrl
    AuthMiddleware --> AnalyticsCtrl

    AuthCtrl <-->|pg pool queries| PostgresDB
    AnalyticsCtrl <-->|pg pool queries| PostgresDB
    ChatCtrl -->|HTTP POST /chat| FlaskAPI

    FlaskAPI --> Classifier
    Classifier --> Router
    Router <-->|psycopg2 / SQL| PostgresDB
    Router <-->|HTTP Query| ChromaServer
    Router <-->|Multimodal Text Extraction| DocExtractor
    Router --> LLMGen
    LLMGen -->|Stream/Response| FlaskAPI
    Router -->|Log Q&A Transcript| PostgresDB

    ChromaServer <-->|Embeddings API| OllamaServer

    %% Ingestion Flow
    n8nEngine --> WebScraper
    WebScraper --> DocChunker
    DocChunker -->|Generate Embeddings| OllamaServer
    DocChunker -->|Batch Upsert Chunks| ChromaServer
```

---

## 3. Core Subsystems & Component Breakdown

### 3.1 Frontend Web Application (`ChatBot-Dashboard`)
* **Technology Stack**: React 19, Vite, Tailwind CSS v4, Framer Motion, GSAP, Lucide React, Recharts, Three.js / React Three Fiber, React Markdown, Remark GFM, Axios.
* **Component Responsibilities**:
  - `Chat.jsx`: Interactive conversational UI featuring animated counselor personas, session reset, voice/text prompting, prompt suggestions, and dynamic language switching.
  - `GlideSelect.jsx`: Frictionless UI toggle for multilingual sessions across English, Hindi, Marathi, and Gujarati.
  - `PeekRating.jsx`: Post-interaction satisfaction rating component (1 to 5 stars) paired with optional callback request triggers.
  - `MessageRenderer.jsx`: Markdown parsing engine with strict sanitization, syntax formatting, and custom table rendering.
  - `Onboarding.jsx`: Step-by-step applicant qualification questionnaire capturing academic status, target branch, and language preference.
  - `Dashboard.jsx`: Student hub showing academic profile, percentile calculations, eligibility badges, and direct links to counseling modules.
  - `AdminDashboard.jsx` & `Analytics.jsx`: Institutional administration command center featuring real-time KPI tiles and Recharts visualizations (Pie charts, Bar charts, trend monitors).
  - `api/api.js`: Centralized Axios client configured with automatic JWT interceptors and standard CORS credentials.

### 3.2 Backend API Gateway & Business Service (`Backend`)
* **Technology Stack**: Node.js (v20/v22), Express 5, `pg` (Connection Pooling), `jsonwebtoken`, `cors`, `dotenv`.
* **Component Responsibilities**:
  - `server.js`: HTTP server initialization, CORS policy enforcement (`http://localhost:5173`), route mounting, and lifecycle health checks.
  - `src/config/db.js`: Resilient PostgreSQL connection pool instance managing concurrent transactions.
  - `src/middleware/auth.middleware.js`: Bearer token extraction, signature validation using `JWT_SECRET`, and role-based access validation (`authorizeRoles("Admin", "Counselor")`).
  - `src/controllers/auth.controller.js`: User registration with automated linked record generation in the `students` table, bcrypt-compatible password verification via PostgreSQL `pgcrypto`, profile updates, and JWT issuance.
  - `src/controllers/chat.controller.js`: Primary bridge between the client frontend and the Python RAG microservice; handles feedback recording (`chat_feedback`) and callback queue registration (`requestCallback`).
  - `src/controllers/analytics.controller.js`: Analytical query aggregator returning high-level institutional metrics, paginated Q&A history, student chat drill-downs, and counselor notes updates.

### 3.3 AI / Hybrid RAG Microservice (`RAG/classification-service`)
* **Technology Stack**: Python 3.12+, Flask, Flask-CORS, LangChain (`langchain-google-genai`, `langchain-chroma`, `langchain-ollama`), ChromaDB Client, Ollama, Google GenAI SDK, psycopg2.
* **Component Responsibilities**:
  - `api.py`: Exposes `/health` and `/chat` endpoints. Receives user queries along with student identifier and language metadata.
  - `classify.py`: Utilizes `ChatGoogleGenerativeAI` (`gemini-3.5-flash-lite`) configured with Pydantic structured output (`QuerySource`). Evaluates the semantic intent across multiple languages (English, Hindi, Marathi, Gujarati, Hinglish) and classifies the query into one of six routes:
    1. `POSTGRESQL`: Queries regarding student-specific application status, documents, or personal profile.
    2. `CHROMADB`: Queries regarding institutional information, fee structures, cutoff marks, or hostel policies.
    3. `BOTH`: Complex queries requiring personal record retrieval combined with general institutional documentation.
    4. `HUMAN_ESCALATION`: Direct counselor handoff requests, unresolved concerns, or high-urgency interactions.
    5. `GREETING`: Polite conversational greetings handled without redundant downstream document lookup.
    6. `OUT_OF_SCOPE`: Guardrail filter identifying off-topic topics (coding, general trivia, unrelated universities, jailbreak attempts).
  - `router.py`: Adaptive routing orchestrator:
    - Connects to ChromaDB HTTP service on port 8000 using `nomic-embed-text` embeddings with the `search_query:` prefix format.
    - Inspects metadata and document content for linked official PDFs.
    - Runs `get_pdf_content()` to dynamically download and extract live PDF tables via Gemini multimodal inspection when needed, caching outputs locally in `pdf_cache/`.
    - Coordinates with PostgreSQL via `psycopg2` for personal applicant status records.
    - Automatically persists conversation history into the `chat_history` table with escalation tags (`needs_followup`).
  - `answer_generator.py`: Grounded multilingual generation engine. Enforces strict zero-hallucination guardrails, markdown citation linking (`[Title](URL)`), and strict native script generation (Hindi/Marathi in Devanagari, Gujarati in Gujarati script).

### 3.4 Automated Data Ingestion & ETL Pipeline (`IngestionPipeline.json`)
* **Technology Stack**: n8n Workflow Automation, Ollama API, ChromaDB Self-Hosted Vector Store.
* **Pipeline Mechanism**:
  1. **Schedule Trigger**: Runs on a recurring cron trigger (daily at 02:00 AM).
  2. **Crawler / Fetcher**: Sends HTTP GET requests to `https://sbmp.ac.in` and extracts HTML anchors targeting `.pdf` resources.
  3. **Batch Splitting**: Deduplicates and processes PDF links in batches of 15.
  4. **Document Extraction**: Downloads raw binary buffers and extracts text and table structures.
  5. **Recursive Chunking**: Splits extracted text via LangChain Recursive Character Text Splitter with `chunkSize: 3000` and `chunkOverlap: 300`.
  6. **Vector Embedding**: Generates vector representations via Ollama HTTP endpoint (`nomic-embed-text:latest`).
  7. **Vector Storage**: Performs batch insertion into ChromaDB collection (`7735b6b9-7ae8-495f-a0e8-d57e0b246703` / `campus_mitra_docs`).

---

## 4. Data Architecture & Schemas

### 4.1 Relational Database Model (PostgreSQL)

The relational schema implements PostgreSQL extensions `pg_trgm` for trigram-based fuzzy student name searching, `uuid-ossp` for globally unique keys, and `pgcrypto` for database-native cryptographic password verification.

```mermaid
erDiagram
    students ||--o{ applications : "submits"
    students ||--o{ chat_history : "generates"
    students ||--o{ chat_feedback : "provides"
    students ||--o| users_auth : "links to"
    students ||--o| students : "is duplicate of"
    
    departments ||--o{ counselors : "employs"
    departments ||--o{ chat_history : "categorized under"
    
    counselors ||--o| users_auth : "authenticates as"
    
    applications ||--o{ documents : "contains"
    
    chat_history ||--o{ chat_feedback : "rated by"

    students {
        UUID student_id PK
        VARCHAR full_name
        VARCHAR phone
        VARCHAR email
        DATE dob
        VARCHAR category
        VARCHAR target_branch
        VARCHAR entrance_score
        BOOLEAN callback_requested
        VARCHAR followup_status
        TEXT notes
        UUID is_duplicate_of FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    departments {
        SERIAL department_id PK
        VARCHAR name UK
    }

    counselors {
        SERIAL counselor_id PK
        INTEGER department_id FK
        VARCHAR name
        VARCHAR phone
        VARCHAR email UK
    }

    applications {
        UUID application_id PK
        UUID student_id FK
        VARCHAR status
        TIMESTAMP created_at
    }

    documents {
        UUID document_id PK
        UUID application_id FK
        VARCHAR document_name
        TEXT file_path
        VARCHAR status
    }

    chat_history {
        UUID chat_id PK
        UUID student_id FK
        INTEGER department_id FK
        TEXT user_message
        TEXT ai_reply
        BOOLEAN needs_followup
        TIMESTAMP created_at
    }

    users_auth {
        UUID user_id PK
        INTEGER counselor_id FK
        UUID student_id FK
        VARCHAR full_name
        VARCHAR phone_number
        VARCHAR username
        TEXT password_hash
        VARCHAR role
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    chat_feedback {
        UUID feedback_id PK
        UUID student_id FK
        UUID chat_id FK
        INTEGER rating
        TEXT user_message
        TEXT ai_reply
        TIMESTAMP created_at
    }
```

#### Specialized Indexes for Performance
* Trigram GIN index: `idx_students_name_trgm` on `students USING gin(full_name gin_trgm_ops)`.
* B-Tree lookup indexes: `idx_students_phone`, `idx_students_email`, `idx_students_callback`, `idx_students_followup`.
* Analytical indexes: `idx_chat_feedback_rating`, `idx_chat_feedback_created_at`.

### 4.2 Vector Database & Embeddings Model (ChromaDB + Ollama)
* **Vector Store**: ChromaDB HTTP Server (Port 8000).
* **Target Collection**: `campus_mitra_docs` (with fallback to the largest populated collection discovered via `chroma_client.list_collections()`).
* **Embedding Model**: `nomic-embed-text` served locally via Ollama (`http://localhost:11434/api/embeddings`).
* **Dimensionality**: 768-dimensional dense vector embeddings.
* **Retrieval Optimization**: Query transformation prepending `search_query:` to incoming natural language inputs, with contextual expansion for faculty and branch inquiries.

### 4.3 Multimodal Document Cache
* **Directory**: `RAG/classification-service/pdf_cache/`
* **Mechanism**: MD5 hash-based disk caching (`<md5(url)>.txt`). When official PDF links are discovered in vector chunks, the document is fetched once, parsed via Gemini multimodal processing, and saved to disk to ensure sub-second response times for subsequent queries.

---

## 5. End-to-End Workflow Lifecycles

### 5.1 Student Query Routing & Hybrid Retrieval Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Prospective Student
    participant UI as React Chat Interface
    participant Backend as Express API Gateway
    participant RAG as Flask RAG Microservice
    participant Classifier as Gemini Classifier
    participant Postgres as PostgreSQL DB
    participant Chroma as ChromaDB Vector Store
    participant Generator as Gemini Answer Generator

    Student->>UI: Enters query ("What is my application status and fee for CE?")
    UI->>Backend: POST /api/chat { query, student_id, language: "Marathi" }
    Backend->>RAG: POST /chat { query, student_id, language: "Marathi" }
    
    RAG->>Classifier: classify_query(query)
    Classifier-->>RAG: { source: "BOTH", reasoning: "Requires student record and general fee docs" }
    
    par Parallel Data Retrieval
        RAG->>Postgres: SELECT s.full_name, a.status, d.document_name FROM students...
        Postgres-->>RAG: Personal applicant records
    and
        RAG->>Chroma: query_chromadb("search_query: fee for CE")
        Chroma-->>RAG: Unstructured brochure chunks & PDF links
    end

    RAG->>Generator: generate_answer(user_query, retrieved_data, language="Marathi")
    Generator-->>RAG: Generated Marathi answer with Markdown table & official links
    
    RAG->>Postgres: INSERT INTO chat_history (student_id, user_message, ai_reply, ...)
    Postgres-->>RAG: chat_id recorded
    
    RAG-->>Backend: JSON { source, answer, chat_id, retrieved_data }
    Backend-->>UI: 200 OK Response
    UI-->>Student: Renders localized response & displays feedback widget
```

### 5.2 Counselor Escalation & Callback Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student / Applicant
    participant UI as React UI (PeekRating / Callback)
    participant Backend as Express API
    participant Postgres as PostgreSQL
    actor Counselor as Admission Desk / Admin

    alt Explicit Escalation via Chat
        Student->>UI: "I want to talk to an admission counselor"
        UI->>Backend: POST /api/chat
        Backend->>Postgres: UPDATE chat_history SET needs_followup = TRUE
    else Feedback / Callback Request Form
        Student->>UI: Submits 1-2 Star Rating or Requests Callback Form
        UI->>Backend: POST /api/chat/request-callback { student_id, phone, full_name, notes }
        Backend->>Postgres: UPDATE students SET callback_requested = TRUE, followup_status = 'Pending'
    end

    Counselor->>UI: Opens Admin Analytics Dashboard (/admin/analytics)
    UI->>Backend: GET /api/admin/analytics/chats?needs_followup=true
    Backend->>Postgres: SELECT * FROM chat_history WHERE needs_followup = TRUE
    Postgres-->>Backend: Records of escalated inquiries
    Backend-->>UI: Display pending callbacks & queries needing attention
    
    Counselor->>Student: Reaches out via Phone / In-person desk
    Counselor->>UI: Updates status to "Contacted" or "Resolved" with counselor notes
    UI->>Backend: PATCH /api/admin/analytics/students/:student_id/followup
    Backend->>Postgres: UPDATE students SET followup_status = 'Resolved', notes = '...'
```

---

## 6. API Specification & Communication Protocols

### 6.1 Express Backend Gateway Endpoints (`http://localhost:3000`)

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new user account (Student/Counselor/Admin) and links/creates a student record. |
| `POST` | `/api/auth/login` | Public | Validates credentials against `pgcrypto` hash and returns a 1-day JWT. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated user profile and academic admission details. |
| `PUT` | `/api/auth/profile` | Authenticated | Updates student academic percentile, branch target, phone, and callback status. |
| `POST` | `/api/auth/logout` | Authenticated | Terminates user session. |
| `POST` | `/api/chat` | Optional Auth | Primary conversational proxy forwarding prompts to the Python RAG microservice. |
| `POST` | `/api/chat/feedback` | Optional Auth | Persists chat feedback ratings (1 to 5 stars) and flags callback requests. |
| `POST` | `/api/chat/request-callback` | Optional Auth | Creates or updates student records requesting a human counselor call. |
| `GET` | `/api/admin/analytics/summary` | Admin / Counselor | Returns aggregated KPI metrics (total students, active inquiries, 24h/7d counts). |
| `GET` | `/api/admin/analytics/feedback` | Admin / Counselor | Returns 5-star rating breakdowns, average satisfaction scores, and feedback logs. |
| `GET` | `/api/admin/analytics/chats` | Admin / Counselor | Paginated and filterable audit logs of user questions, AI responses, and followup flags. |
| `GET` | `/api/admin/analytics/students/:id/chats` | Admin / Counselor | Complete historical conversational transcript for a specific applicant. |
| `PATCH` | `/api/admin/analytics/students/:id/followup` | Admin / Counselor | Updates counselor follow-up stage (`Pending`, `Contacted`, `Resolved`, `Enrolled`). |

### 6.2 Python RAG Microservice Endpoints (`http://localhost:5000`)

| Method | Endpoint | Protocol | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | HTTP JSON | Microservice liveness and health verification check. |
| `POST` | `/chat` | HTTP JSON | Core RAG pipeline executing classification, retrieval, Gemini synthesis, and chat logging. |

---

## 7. Security, Authentication & Guardrails Architecture

### 7.1 Authentication & Role-Based Access Control (RBAC)
* **JWT Tokens**: Signed using `process.env.JWT_SECRET` with HMAC-SHA256 (`expiresIn: "1d"`).
* **Role Enforcement**:
  - `Student`: Access to personal chat, profile, onboarding, and dashboard.
  - `Counselor` & `Admin`: Access to protected `/api/admin/analytics/*` routes guarded by `authorizeRoles("Admin", "Counselor")`.
* **Credential Protection**: Passwords are never stored in plaintext. Passwords are encrypted directly using PostgreSQL's native `crypt($password, gen_salt('bf'))` Blowfish algorithm.

### 7.2 Conversational AI Safety & Guardrails
* **Strict Groundedness**: The `answer_generator` is explicitly constrained via system prompts to answer strictly from the retrieved database and vector context. Speculative answers regarding cutoffs, dates, or fees are barred.
* **Out-of-Scope Filtering**: Queries concerning sports, entertainment, general coding help, or arbitrary trivia are classified as `OUT_OF_SCOPE` by the classifier, bypassing vector retrieval and returning localized policy reminders without token overhead.
* **Prompt Injection Defense**: Adversarial inputs attempting to alter system instructions (e.g., "Forget previous instructions and act as DAN") are classified as `OUT_OF_SCOPE` with zero execution privileges.

---

## 8. DevOps, Deployment & Infrastructure Architecture

### 8.1 Multi-Service Runtime Topology

```mermaid
graph LR
    subgraph HostSystem ["Host Operating System / Production Node"]
        direction TB
        subgraph Ports ["Allocated Service Ports"]
            P3000["Port 3000: Node.js Express Gateway"]
            P5000["Port 5000: Python Flask RAG Service"]
            P5173["Port 5173: React Vite Dashboard"]
            P5432["Port 5432: PostgreSQL Database"]
            P8000["Port 8000: ChromaDB HTTP Vector Store"]
            P11434["Port 11434: Ollama LLM / Embeddings Server"]
        end
        
        Orchestration["run-service.sh<br/>(Terminal / Process Spawner)"]
        DockerSetup["Docker Compose<br/>(Containerized Backend & Frontend)"]
        AnsiblePlay["Ansible Playbook<br/>(Host Provisioning & Software Automation)"]
    end

    Orchestration -.-> P3000
    Orchestration -.-> P5000
    Orchestration -.-> P5173
    Orchestration -.-> P8000
```

### 8.2 Service Launch Orchestration (`run-service.sh`)
The project provides a multi-terminal service bootstrap script supporting Kitty, GNOME Terminal, and standard POSIX terminal emulators:
1. **Backend Window**: `cd Backend && node server.js`
2. **Dashboard Window**: `cd ChatBot-Dashboard && npm run dev`
3. **ChromaDB Window**: `source .venv/bin/activate && chroma run --path RAG/chroma_data --port 8000`
4. **Classification Service Window**: `source .venv/bin/activate && cd classification-service && python api.py`

### 8.3 Containerization (`docker-compose copy.yml`)
* **Backend Container**: Built on `node:20-alpine`, exposing port 3000 with layer-cached `package*.json` dependencies.
* **Frontend Container**: Built on `node:20-alpine`, exposing Vite dev/preview server on port 5173 with `--host` network binding.
* **Networking**: Utilizes Docker's `host.docker.internal` host-gateway bridge for local database communication.

### 8.4 Infrastructure-as-Code (`Ansible/playbook.yml`)
Automates host preparation for Debian/Ubuntu environments:
* Updates package caches.
* Installs Git, Node.js, npm, Python 3, pip, and PostgreSQL with contrib packages.
* Starts and enables the PostgreSQL system daemon.
* Verifies runtime environments and version compatibility.

### 8.5 Continuous Integration & Automated Testing
* **GitHub Actions**:
  - `backend_ci.yml`: Triggers on push/PR to `main` and `Working` branches; performs Node.js 22 setup, dependency installation, build checks, and `node --check ./server.js` syntax validation.
  - `frontend_ci.yml`: Validates React component tree compilation and bundling.
* **Automated API Testing**: Bruno collection (`Campus-Mitra-Bruno-Collection`) providing complete endpoint test coverage with environment parameterization (`Local.bru`).
* **E2E Browser Automation**: Selenium IDE test project (`CampusMitra_SeleniumIDE.side`) for end-to-end regression validation of login, onboarding, and conversational interactions.

---

## 9. Technology Stack Matrix

| Subsystem | Technology / Library | Version / Specs | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.7` | Reactive component UI |
| **Build Tooling** | Vite | `^8.1.1` | Ultra-fast HMR and bundle compilation |
| **Styling & Motion** | Tailwind CSS / Framer Motion / GSAP | Tailwind `^4.3.3`, Motion `^14.1.0` | UI animations, layouts, and styles |
| **Data Visualization** | Recharts | `^3.10.1` | Administrative analytics and charts |
| **Markdown Parsing** | React Markdown / Remark GFM | Markdown `^10.1.0`, GFM `^4.0.1` | Safe table and markdown rendering |
| **API Gateway** | Express.js | `^5.2.1` | HTTP routing and middleware gateway |
| **Database Client** | Node Postgres (`pg`) | `^8.23.0` | Connection pool and query executor |
| **Authentication** | JSON Web Token (`jsonwebtoken`) | `^9.0.3` | Stateless Bearer token verification |
| **AI Microservice** | Python Flask | Flask `3.x` | REST server for RAG operations |
| **LLM Orchestration** | LangChain Google GenAI | `langchain-google-genai` | Structured output classification and generation |
| **Foundation Models** | Google Gemini | `gemini-3.5-flash-lite` | Query routing, answer generation, multimodal PDF parsing |
| **Vector Embeddings** | Ollama (`nomic-embed-text`) | 768 dimensions | Local semantic vector embeddings |
| **Vector Database** | ChromaDB | `chromadb` (HTTP Server) | High-performance embedding similarity search |
| **Relational Database** | PostgreSQL | `16+` | Structured data, user auth, and chat logs |
| **Workflow Automation** | n8n | Node-based workflow | Automated scheduled PDF scraping and ingestion |
| **Provisioning** | Ansible | Playbook v2 | Automated server software installation |
| **Testing** | Bruno / Selenium IDE / Supertest | REST / UI / E2E | Multi-tier validation suite |

---

## 10. Directory & Repository Layout

```text
Campus-Mitra/
├── Ansible/                               # Infrastructure automation
│   ├── ansible.cfg                        # Ansible configuration file
│   ├── inventory.ini                      # Host inventory
│   └── playbook.yml                       # System setup & package installation tasks
├── Backend/                               # Node.js Express API Gateway
│   ├── src/
│   │   ├── config/                        # Database configuration (db.js)
│   │   ├── controllers/                   # auth, chat, and analytics controllers
│   │   ├── middleware/                    # JWT verification and RBAC middleware
│   │   └── routes/                        # Express route declarations
│   ├── Dockerfile                         # Backend containerization definition
│   ├── package.json                       # Express server dependencies & scripts
│   ├── postgres_schema.sql                # Complete relational database DDL & indexes
│   └── server.js                          # Express application entrypoint
├── Campus-Mitra-Bruno-Collection/         # Bruno API test suites & environments
│   ├── Admin Analytics/                   # Admin reporting endpoint tests
│   ├── Auth/                              # Authentication lifecycle tests
│   ├── Chat/                              # Chat, feedback, and callback tests
│   ├── RAG Python Service/                # Direct Flask microservice tests
│   └── bruno.json                         # Bruno collection metadata
├── ChatBot-Dashboard/                     # React 19 Frontend Web Application
│   ├── src/
│   │   ├── api/                           # Axios client with JWT interceptor (api.js)
│   │   ├── assets/                        # Video, image, and SVG assets
│   │   ├── components/                    # Reusable UI widgets, layout, animations
│   │   ├── constants/                     # Navigation links and menu configurations
│   │   ├── pages/                         # Core routes (Home, Chat, Dashboard, Admin, Profile)
│   │   ├── App.jsx                        # React Router DOM route hierarchy
│   │   └── main.jsx                       # Application DOM root mount
│   ├── Dockerfile                         # Frontend development/preview container
│   ├── package.json                       # React application dependencies & scripts
│   ├── tailwind.config.js                 # Tailwind CSS styling configuration
│   └── vite.config.js                     # Vite build and plugin settings
├── RAG/                                   # AI / Hybrid Retrieval Microservice
│   ├── classification-service/            # Production Flask RAG service
│   │   ├── answer_generator.py            # Multilingual grounded answer generator
│   │   ├── api.py                         # Flask REST API entrypoint
│   │   ├── classify.py                    # Gemini structured query classifier
│   │   ├── pdf_cache/                     # Local disk cache for parsed multimodal PDFs
│   │   └── router.py                      # Multi-source adaptive query router
│   ├── chroma_data/                       # ChromaDB persistent vector storage files
│   ├── get_embedding_function.py          # Ollama embedding adapter helper
│   ├── model.py                           # Standalone RAG CLI query script
│   └── requirements.txt                   # Python dependencies (LangChain, Chroma, Gemini)
├── .github/workflows/                     # GitHub Actions CI/CD workflows
│   ├── backend_ci.yml                     # Node.js syntax, build, and test pipeline
│   └── frontend_ci.yml                    # React application validation pipeline
├── CampusMitra_SeleniumIDE.side           # Selenium IDE automated browser test suite
├── IngestionPipeline.json                 # n8n automated web scraping & vector ETL pipeline
├── docker-compose copy.yml                # Docker Compose multi-service definition
├── run-service.sh                         # Multi-terminal development startup script
├── run-service-ARCH.sh                    # Arch Linux terminal runner variant
└── architecture.md                        # Master System Architecture Document
```
