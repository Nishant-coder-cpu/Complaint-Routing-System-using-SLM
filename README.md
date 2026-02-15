# Smolify: AI-Powered Grievance Redressal

An AI-driven system for automated grievance classification, routing, and management.

## 🚀 Features

- **Automated Classification**: Uses fine-tuned LLMs to categorize complaints and determine severity.
- **Smart Routing**: automatically routes issues to the correct department.
- **Role-Based Access**: Specialized portals for Complainants, Authorities, and Admins.
- **Real-Time Tracking**: Monitor complaint status and SLA compliance.
- **Analytics**: Visualization of grievance trends.

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL (or Supabase)

### 1. 🤖 AI Service & API

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Smolify
    ```

2.  **Install Python dependencies:**
    ```bash
    # Create a virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

    # Install requirements
    pip install -r requirements.txt
    ```

3.  **Download Model Weights:**
    The AI model weights are required for the classification service.
    
    [**DOWNLOAD MODEL WEIGHTS HERE**](placeholder-link-to-be-provided-by-user)

    > **Note:** Download the model files and place them in a folder named `local_model` in the root directory.

4.  **Start the API Server:**
    ```bash
    uvicorn api:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 2. 🔙 Backend (Node.js)

1.  Navigate to the backend directory:
    ```bash
    cd webapp/backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Create a `.env` file based on `.env.example` and fill in your Supabase credentials.

4.  Start the server:
    ```bash
    npm run dev
    ```

### 3. 🎨 Frontend (React)

1.  Navigate to the frontend directory:
    ```bash
    cd webapp/frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `api.py`: Main entry point for the AI Classification API.
- `webapp/backend`: Node.js backend handling user auth and database interactions.
- `webapp/frontend`: React frontend for the user interface.
- `requirements.txt`: Python dependencies.
- `local_model/`: Directory for AI model weights (to be added manually).

## 📝 License
This project is licensed under the MIT License.
