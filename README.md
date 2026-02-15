<div align="center">

# ResolveAI

### AI-Powered Grievance Redressal System

*Transforming complaint management through intelligent automation and human-aligned decision support*

[Demo Video](#demo-video) • [Documentation](#documentation) • [Quick Start](#quick-start) • [Features](#features)

---

</div>

## Demo Video

> **Coming Soon!** Watch ResolveAI in action

**[View Demo on YouTube](https://youtube.com/placeholder)**

*Full system demonstration and walkthrough*

---

## Documentation

**[Download Complete Project Report](https://drive.google.com/file/d/12sMgsOqGXHHN5mhdgVVdwsH8wr0pjLnD/view?usp=sharing)**

*Comprehensive technical documentation including mathematical proofs, system architecture, and feature explanations*

---

## Required Downloads

**[Download AI Model Weights](https://drive.google.com/file/d/1otbd6p3k0UJJv8_dsyrDY7dapAp_-Hid/view?usp=sharing)** (Required for AI Service)

> Place the downloaded model files in a folder named `local_model` in the root directory before starting the AI service.

---

## What is ResolveAI?

ResolveAI is a **next-generation grievance redressal system** that combines artificial intelligence with human oversight to create a fair, transparent, and efficient complaint resolution process. Unlike traditional systems that rely on manual triage and static rules, ResolveAI brings intelligence to every step of the complaint lifecycle.

<details>
<summary><b>The Problem We Solve</b></summary>

Traditional grievance systems suffer from:
- **Slow Manual Triage**: Human reviewers create bottlenecks
- **Inconsistent Categorization**: Depends on individual judgment
- **Poor Prioritization**: Critical issues get buried in queues
- **No Learning**: Systems never improve from past cases
- **Lack of Transparency**: Users don't know what to expect

</details>

---

## Features

### Intelligent AI Classification

<details>
<summary><b>Confidence-Aware Routing with Human-in-the-Loop</b></summary>



- AI generates predictions **with confidence scores**
- High confidence leads to automatic routing
- Low confidence triggers human review
- Prevents silent AI errors and builds trust

**How it works:**
```
Confidence >= 85%  → Auto-route to department
Confidence 50-85%  → Triage officer review
Confidence < 50%   → Manual review queue
```

</details>

<details>
<summary><b>Feedback-Driven Continuous Learning</b></summary>



- Authorities can confirm or correct AI predictions
- System learns from institutional expertise
- Adapts to unique terminology and context
- Self-improving over time

**Learning Cycle:**
1. AI makes prediction
2. Authority confirms or corrects
3. Feedback stored as structured data
4. Model refinement in controlled cycles
5. Improved accuracy over time

</details>

---

### Smart Prioritization

<details>
<summary><b>Dynamic SLA Estimation</b></summary>



Calculates realistic resolution times based on:
- Complaint severity
- Historical patterns
- Current department workload

**Formula:**
```
SLA_dynamic = (SLA_base / (1 + SeverityScore)) + (γ × N_queue)
```

**Example:**
- Critical complaint (severity=10)
- Base SLA = 24 hours
- Department queue = 8 pending cases
- Result: ~6.2 hours estimated resolution

</details>

<details>
<summary><b>Community Signal-Driven Urgency</b></summary>



- Users can like and comment on public complaints
- Rapid engagement auto-escalates severity
- Systemic issues surface faster
- Safeguards prevent gaming the system

**Escalation Formula:**
```
E = (Likes / (Time + 1)^α) × User_Weight

If E > threshold → Auto-escalate to Critical
```

**Safeguards:**
- Engagement only influences within limits
- Suspicious patterns trigger reviews
- Balanced user role weights
- Cannot override genuine critical issues

</details>

---

### Role-Based Portals

| Role | Features |
|------|----------|
| **Complainants** | Submit complaints, track status, engage with community |
| **Authorities** | Review cases, provide feedback, manage assignments |
| **Admins** | AI-assisted insights, review queue, system oversight |

---

### Administrative Intelligence

<details>
<summary><b>AI-Assisted Admin Chat Interface</b></summary>



Ask questions in plain language:
- "Which department is currently overloaded?"
- "How many high-risk complaints exist right now?"
- "What are the most common complaint types this month?"
- "Show me unresolved complaints older than 7 days"

**Capabilities:**
- Trend analysis and pattern recognition
- Workload monitoring across departments
- Rapid filtering and search
- Predictive insights for bottleneck prevention

</details>

<details>
<summary><b>Review Queue for Uncertain AI Decisions</b></summary>



All low-confidence predictions grouped for review:
- Inspect original complaint text
- View AI prediction with confidence score
- See suggested alternative categories
- Approve or correct decisions
- Complete audit trail

**Benefits:**
- Prevents AI misuse
- Increases accountability
- Builds trust through transparency
- Educational insights into AI performance

</details>

---

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL (or Supabase)

---

### Installation

<details>
<summary><b>Step 1: Clone the Repository</b></summary>

```bash
git clone <repository-url>
cd ResolveAI
```

</details>

<details>
<summary><b>Step 2: AI Service Setup</b></summary>

**Install Python Dependencies**

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

**Model Weights Setup**

The AI model weights should already be downloaded (see Required Downloads section above).

Place the model files in this structure:
```
ResolveAI/
├── local_model/          ← Place model files here
│   ├── config.json
│   ├── pytorch_model.bin
│   └── ...
├── api.py
└── ...
```

**Start the AI API Server**

```bash
uvicorn api:app --reload
```

API will be available at `http://localhost:8000`

</details>

<details>
<summary><b>Step 3: Backend Setup (Node.js)</b></summary>

```bash
cd webapp/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start server
npm run dev
```

Backend will be available at `http://localhost:3000`

</details>

<details>
<summary><b>Step 4: Frontend Setup (React)</b></summary>

```bash
cd webapp/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at `http://localhost:5173`

</details>

---

## Project Architecture

```
ResolveAI/
│
├── api.py                        # Main AI API entry point (FastAPI)
├── local_model/                  # Fine-tuned classification model files
├── requirements.txt              # Python dependencies
├── Project_Documentation.tex     # Complete Project Documentation (LaTeX)
├── README.md                     # Setup instructions
│
└── webapp/
    ├── backend/                  # Node.js + Express Backend
    │   ├── src/
    │   │   ├── server.js         # API Gateway & Orchestrator
    │   │   ├── routes/           # Route handlers
    │   │   ├── services/         # Business logic (AI integration)
    │   │   └── config/           # Database config
    │   ├── .env                  # Environment variables
    │   └── package.json
    │
    └── frontend/                 # React + Vite Frontend
        ├── src/
        │   ├── components/       # UI Components
        │   ├── pages/            # Page Views
        │   ├── App.jsx           # Main App Component
        │   └── main.jsx          # Entry point
        ├── .env                  # Frontend config
        ├── package.json
        └── vite.config.js
```

---

## How It Works

### The Intelligence Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Submits Complaint                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AI Analysis   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌──────────────────┐      ┌──────────────────────┐
    │ High Confidence  │      │  Low Confidence      │
    │ Auto-Route       │      │  Human Review Queue  │
    └────────┬─────────┘      └──────────┬───────────┘
             │                            │
             └──────────┬─────────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Dynamic SLA Calculation │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  Authority Assignment  │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │ Resolution & Feedback  │
            └───────────┬────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  Continuous Learning   │
            └────────────────────────┘
                        │
                        │ (Improves AI)
                        └──────────────────┐
                                          │
                        ┌─────────────────▼─────┐
                        │  Enhanced Future      │
                        │  Classifications      │
                        └───────────────────────┘
```

---

## Mathematical Foundations

<details>
<summary><b>Dynamic SLA Formula</b></summary>



```
SLA_dynamic = (SLA_base / (1 + SeverityScore)) + (γ × N_queue)
```

**Where:**
- `SLA_base`: Standard baseline time (e.g., 24 hours for Critical)
- `SeverityScore`: 1 (Normal), 3 (High), 10 (Critical)
- `N_queue`: Number of pending complaints in department
- `γ`: Time delay factor per queued item (e.g., 0.5 hours)

**Purpose:** Balances urgency with realistic capacity constraints

</details>

<details>
<summary><b>Community Escalation Score</b></summary>



```
E = (L / (T + 1)^α) × W_user
```

**Where:**
- `L`: Number of likes/upvotes
- `T`: Time since submission (hours)
- `α`: Decay factor (prioritizes recent engagement)
- `W_user`: User role weight (Student=1, Faculty=2, Staff=1.5)

**Purpose:** Amplifies widespread issues while preventing old complaints from dominating

</details>

<details>
<summary><b>Confidence-Based Routing</b></summary>



```
Route =
  If C >= 0.85  → Predicted Department (auto)
  If 0.50 ≤ C < 0.85  → Triage Officer
  If C < 0.50  → Manual Review Queue
```

**Where:**
- `C`: Model confidence score (0 to 1)

**Purpose:** Ensures automation only where AI is reliable

</details>

---

## Key Innovations

| Feature | Traditional Systems | ResolveAI |
|---------|-------------------|-----------|
| **Classification** | Manual or Rule-based | AI with confidence scoring |
| **Prioritization** | FIFO or static rules | Multi-signal urgency + community input |
| **SLA** | Fixed deadlines | Dynamic workload-aware estimation |
| **Learning** | Static | Continuous improvement from feedback |
| **Transparency** | Black box | Explainable AI decisions |
| **Error Handling** | Silent failures | Confidence-aware human review |

---

## Team

<div align="center">

### Team Kaju Katli

**Nishant Kaushik** | **Ayush Raj**

</div>

---

## Tech Stack

**Backend:**
- Python 3.9+ with FastAPI
- Node.js 16+ with Express
- PostgreSQL / Supabase

**Frontend:**
- React 18+ with Vite
- Framer Motion for animations
- Recharts for visualizations

**AI/ML:**
- PyTorch
- Hugging Face Transformers
- Fine-tuned NLP models

---

## Use Cases

### Educational Institutions
Student grievances, facility issues, academic concerns

### Healthcare
Patient feedback, service complaints, facility management

### Government
Citizen complaints, public services, infrastructure issues

### Corporate
Employee grievances, HR issues, workplace concerns

### Municipal
Community issues, infrastructure problems, public services

---

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

Having issues? Check out our [documentation](https://drive.google.com/file/d/12sMgsOqGXHHN5mhdgVVdwsH8wr0pjLnD/view?usp=sharing) or open an issue on GitHub.

---

<div align="center">

**Made with care by Team Kaju Katli**

*If you find ResolveAI helpful, please consider giving it a star*

</div>
