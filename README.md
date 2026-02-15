<!-- ResolveAI - Modern Animated README -->
<style>
  /* Modern animations and effects */
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
    50% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes neon-glow {
    0%, 100% { box-shadow: 0 0 5px #3b82f6, 0 0 10px #3b82f6; }
    50% { box-shadow: 0 0 15px #3b82f6, 0 0 30px #3b82f6; }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .animated-title {
    animation: glow 2s ease-in-out infinite;
    font-size: 2.5em;
    font-weight: 900;
  }
  
  .fade-in {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .slide-in {
    animation: slideInLeft 0.6s ease-out;
  }
  
  .pulse-effect {
    animation: pulse 2s infinite;
  }
  
  .neon-button {
    animation: neon-glow 1.5s infinite;
    border: 2px solid #3b82f6;
    padding: 10px 20px;
    border-radius: 5px;
    background: rgba(59, 130, 246, 0.1);
  }
</style>

<div align="center">

# <span class="animated-title">✨ ResolveAI ✨</span>

### AI-Powered Grievance Redressal System

*Transforming complaint management through intelligent automation and human-aligned decision support*

[Demo Video](#demo-video) • [Documentation](#documentation) • [Quick Start](#quick-start) • [Features](#features)

---

</div>

## Demo Video

> **🎬 Watch ResolveAI in Action!** Auto-playing below

<iframe width="100%" height="420" src="https://www.youtube.com/embed/qqGPYvj9Dck?autoplay=1&mute=1&loop=1" title="ResolveAI Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="border-radius: 10px; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);"></iframe>

**[Full System Demonstration and Walkthrough](https://youtu.be/qqGPYvj9Dck?si=mI9eNUjfZ9X3opgR)**

---

## Documentation

📄 **[Download Complete Project Report](https://drive.google.com/file/d/12sMgsOqGXHHN5mhdgVVdwsH8wr0pjLnD/view?usp=sharing)**

*Comprehensive technical documentation including mathematical proofs, system architecture, and feature explanations*

---

## Required Downloads

🤖 **[Download AI Model Weights](https://drive.google.com/file/d/1otbd6p3k0UJJv8_dsyrDY7dapAp_-Hid/view?usp=sharing)** (Required for AI Service)

> Place the downloaded model files in a folder named `local_model` in the root directory before starting the AI service.

---

## What is ResolveAI?

ResolveAI is a **next-generation grievance redressal system** that combines artificial intelligence with human oversight to create a fair, transparent, and efficient complaint resolution process. Unlike traditional systems, ResolveAI learns from every interaction, adapts to institutional context, and keeps users informed at every step.

<details>
<summary><b>🎯 The Problem We Solve</b></summary>

Traditional grievance systems suffer from:
- **Slow Manual Triage**: Human reviewers create bottlenecks
- **Inconsistent Categorization**: Depends on individual judgment
- **Poor Prioritization**: Critical issues get buried in queues
- **No Learning**: Systems never improve from past cases
- **Lack of Transparency**: Users don't know what to expect

</details>

---

## Features

### 🤖 Intelligent AI Classification

<details>
<summary><b>🎲 Confidence-Aware Routing with Human-in-the-Loop</b></summary>

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
<summary><b>📚 Feedback-Driven Continuous Learning</b></summary>

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

### ⚡ Smart Prioritization

<details>
<summary><b>📊 Dynamic SLA Estimation</b></summary>

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
<summary><b>🌟 Community Signal-Driven Urgency</b></summary>

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

### 👥 Role-Based Portals

| Role | Features |
|------|----------|
| **📝 Complainants** | Submit complaints, track status, engage with community |
| **👮 Authorities** | Review cases, provide feedback, manage assignments |
| **⚙️ Admins** | AI-assisted insights, review queue, system oversight |

---

### 🧠 Administrative Intelligence

<details>
<summary><b>💬 AI-Assisted Admin Chat Interface</b></summary>

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
<summary><b>✅ Review Queue for Uncertain AI Decisions</b></summary>

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

## 🚀 Quick Start

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

## 🏗️ Project Architecture

```
ResolveAI/
│
├── api.py                        # Main AI API entry point (FastAPI)
├── local_model/                  # Fine-tuned classification model files
├── requirements.txt              # Python dependencies
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

## 🧪 Development & Testing with Requestly

### API-First Development Approach

ResolveAI was developed using **Requestly** as the primary API command center during development and testing. Instead of relying on the frontend UI for validation, all critical backend and AI workflow testing happened at the API level.

<details>
<summary><b>⚙️ Why Requestly Was Essential</b></summary>

ResolveAI consists of multiple interacting components:
- A Node.js backend handling business logic
- A FastAPI-based AI service performing complaint classification
- Strict JSON-based contracts between services

Testing such a system purely through the UI is slow and error-prone. Requestly allowed us to:
- Directly test APIs in isolation
- Simulate edge cases without UI constraints
- Validate AI behavior with precision
- Debug complex multi-service interactions

</details>

<details>
<summary><b>📋 API Collection Organization</b></summary>

Requestly collections were organized by responsibility:

**Health & Diagnostics**
- `GET /health` – Verify AI service availability and model loading

**AI Classification**
- `POST /classify` – Single complaint classification
- `POST /classify/batch` – Batch complaint processing
- `POST /explain` – Explainability endpoint for admin insights

**Failure & Edge Cases**
- Empty complaint text
- Ambiguous complaints
- Multi-category complaints
- High-risk harassment scenarios

Each request was saved with example payloads and expected responses, creating a reusable and well-documented API workspace.

</details>

<details>
<summary><b>🔧 Complex Request Construction</b></summary>

Requestly was used to construct non-trivial POST requests with structured JSON bodies.

**Example single complaint payload:**
```json
{
  "complaint": "The water cooler on the third floor is broken and feels unsafe"
}
```

**Example batch testing payload:**
```json
{
  "complaints": [
    "Professor is threatening students over grades",
    "WiFi not working in hostel block B",
    "Water leakage near electrical panel"
  ]
}
```

This allowed us to validate:
- Multi-category detection
- Severity assignment
- SLA calculation logic
- Correct department routing

</details>

<details>
<summary><b>🔍 Endpoint Validation & Debugging</b></summary>

Requestly was heavily used to:
- Verify response schemas matched the expected Pydantic models
- Ensure strict JSON output from the AI service
- Check HTTP status codes for success and failure cases
- Inspect response timing to identify slow inference paths

When classification failed or returned unexpected output, Requestly made it easy to:
- Replay the exact same request
- Compare outputs before and after logic changes
- Debug fallback mechanisms without UI interference

</details>

<details>
<summary><b>🧠 Testing AI Logic Without UI Dependency</b></summary>

Using Requestly, we validated:
- Confidence-aware routing logic
- Escalation rules for critical complaints
- Anonymous submission recommendations
- SLA calculations based on severity

This ensured the AI and backend logic were correct before being integrated into the frontend, significantly reducing debugging time.

</details>

<details>
<summary><b>⚡ Workflow Efficiency & Impact</b></summary>

Requestly improved development speed and reliability by:
- Acting as a single source of truth for API behavior
- Allowing rapid iteration on AI prompts and parsing logic
- Making backend validation independent of frontend readiness
- Enabling repeatable, deterministic testing of sensitive grievance scenarios

For a system handling privacy-sensitive and high-impact complaints, this level of API-level validation was essential.

</details>

### Summary

Requestly was not used as a simple request sender, but as a **professional-grade API testing and validation platform**. It enabled faster debugging, cleaner architecture, and higher confidence in AI-driven decision making.

---

## 🔄 How It Works

### The Intelligence Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Submits Complaint                       │
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

## 📐 Mathematical Foundations

<details>
<summary><b>⏱️ Dynamic SLA Formula</b></summary>

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
<summary><b>📈 Community Escalation Score</b></summary>

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
<summary><b>🎯 Confidence-Based Routing</b></summary>

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

## �� Key Innovations

| Feature | Traditional Systems | ResolveAI |
|---------|-------------------|-----------|
| **Classification** | Manual or Rule-based | AI with confidence scoring |
| **Prioritization** | FIFO or static rules | Multi-signal urgency + community input |
| **SLA** | Fixed deadlines | Dynamic workload-aware estimation |
| **Learning** | Static | Continuous improvement from feedback |
| **Transparency** | Black box | Explainable AI decisions |
| **Error Handling** | Silent failures | Confidence-aware human review |

---

## 👥 Team

<div align="center">

### Team Kaju Katli

**🎨 Nishant Kaushik** | **💻 Ayush Raj**

</div>

---

## 🛠️ Tech Stack

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

**Development & Testing:**
- Requestly API Client for API testing and validation

---

## 💼 Use Cases

### 🎓 Educational Institutions
Student grievances, facility issues, academic concerns

### 🏥 Healthcare
Patient feedback, service complaints, facility management

### 🏛️ Government
Citizen complaints, public services, infrastructure issues

### 🏢 Corporate
Employee grievances, HR issues, workplace concerns

### 🏙️ Municipal
Community issues, infrastructure problems, public services

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support

Having issues? Check out our [documentation](https://drive.google.com/file/d/12sMgsOqGXHHN5mhdgVVdwsH8wr0pjLnD/view?usp=sharing) or open an issue on GitHub.

---

<div align="center">

### 💖 Made with care by Team Kaju Katli

*If you find ResolveAI helpful, please consider giving it a star ⭐*

</div>
