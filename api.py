from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import json
import re
import logging
import os

# Suppress transformers warnings
logging.getLogger("transformers").setLevel(logging.ERROR)

app = FastAPI(title="Grievance Classification API", version="1.0")

# ========================
# PYDANTIC MODELS
# ========================

class ClassifyRequest(BaseModel):
    complaint: str = Field(..., min_length=1, description="Complaint text to classify")

class BatchClassifyRequest(BaseModel):
    complaints: List[str] = Field(..., min_items=1, description="List of complaints")

class ClassificationResponse(BaseModel):
    categories: List[str]
    severity: str  # "Critical" | "High" | "Normal"
    anonymous_recommended: bool
    escalation_required: bool
    route_to: str
    sla_hours: int

class ExplainResponse(BaseModel):
    summary_reason: str
    key_triggers: List[str]

# ========================
# MODEL WRAPPER
# ========================

class ComplaintClassifier:
    def __init__(self, model_id: str = "smolify/smolified-complaint-classification"):
        # Check for local model directory
        local_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_model")
        
        if os.path.exists(local_path) and os.path.isdir(local_path):
            print(f"[INIT] Loading model from local directory: {local_path}")
            model_to_load = local_path
        else:
            print(f"[INIT] Local model not found at {local_path}. Loading from Hub: {model_id}")
            model_to_load = model_id
            
        self.tokenizer = AutoTokenizer.from_pretrained(model_to_load)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_to_load,
            device_map="auto",
            torch_dtype=torch.float32
        )
        
    def _extract_json(self, text: str) -> Optional[dict]:
        """Extract JSON object from text"""
        try:
            start = text.index('{')
            end = text.rindex('}') + 1
            json_str = text[start:end]
            return json.loads(json_str)
        except (ValueError, json.JSONDecodeError):
            return None
    
    def _parse_native_format(self, text: str) -> Optional[dict]:
        """
        Parse the model's native training format:
        'Categories: X, Y, Z | Severity: Level'
        """
        try:
            # Pattern: "Categories: ... | Severity: ..."
            pattern = r'Categories:\s*(.+?)\s*\|\s*Severity:\s*(\w+)'
            match = re.search(pattern, text, re.IGNORECASE)
            
            if match:
                categories_str = match.group(1).strip()
                severity = match.group(2).strip()
                
                # Split categories by comma
                categories = [cat.strip() for cat in categories_str.split(',')]
                
                return {
                    "categories": categories,
                    "severity": severity
                }
            return None
        except Exception:
            return None
    
    def _get_system_prompt(self, strict: bool = False) -> str:
        """Generate system prompt (stricter version for retry)"""
        base = (
            "You are an AI assistant for grievance redressal and incident reporting.\n"
            "Given a complaint description, classify it.\n\n"
            "Respond ONLY in valid JSON.\n"
            "Do NOT add explanations.\n\n"
            "JSON format:\n"
            "{\n"
            '  "categories": [string],\n'
            '  "severity": "Critical" | "High" | "Normal"\n'
            "}\n\n"
        )
        if strict:
            base += "CRITICAL: Output MUST be valid JSON only. No preamble, no markdown, no text before or after.\n\n"
        base += "Now output the JSON:"
        return base
    
    def _generate(self, complaint: str, strict: bool = False) -> str:
        """Generate model output (original working method)"""
        messages = [
            {"role": "system", "content": self._get_system_prompt(strict)},
            {"role": "user", "content": complaint}
        ]
        
        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        
        inputs = self.tokenizer(text, return_tensors="pt").to(self.model.device)
        
        # Simple generation without scores (this works!)
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=False,
                eos_token_id=self.tokenizer.eos_token_id,
                pad_token_id=self.tokenizer.eos_token_id if self.tokenizer.pad_token_id is None else self.tokenizer.pad_token_id,
            )
        
        # Extract generated text
        generated_ids = outputs[0][inputs["input_ids"].shape[1]:]
        generated_text = self.tokenizer.decode(generated_ids, skip_special_tokens=True)
        
        return generated_text
    
    def _fallback_classification(self, complaint: str) -> dict:
        """Simple keyword-based fallback classification when model fails"""
        complaint_lower = complaint.lower()
        
        # Check for categories (can have multiple)
        categories = []
        
        # PRIORITY 1: Harassment (most critical)
        if any(word in complaint_lower for word in ['harassment', 'harass', 'bully', 'abuse', 'discriminate', 'threaten', 'assault', 'scold']):
            categories.append('Harassment')
        
        # Check for Infrastructure
        if any(word in complaint_lower for word in ['water', 'cooler', 'drink', 'fountain', 'ac', 'air', 'conditioning', 
                                                      'temperature', 'hot', 'cold', 'toilet', 'bathroom', 'washroom', 
                                                      'restroom', 'broken', 'repair', 'maintenance']):
            if 'Infrastructure' not in categories:
                categories.append('Infrastructure')
        
        # Check for Academic issues
        if any(word in complaint_lower for word in ['grade', 'marks', 'exam', 'test', 'class', 'professor', 'teacher', 
                                                      'lecture', 'assignment', 'homework']):
            if 'Harassment' not in categories:  # Don't override harassment
                categories.append('Academic')
        
        # Default if nothing matched
        if not categories:
            categories.append('Other')
        
        # Determine severity
        severity = "Normal"
        if any(word in complaint_lower for word in ['urgent', 'critical', 'emergency', 'immediately', 'harassment', 'harass', 'assault']):
            severity = "High"
        
        print(f"[FALLBACK] Categories: {categories}, Severity: {severity}")
        
        return {
            "categories": categories,
            "severity": severity
        }
    
    def classify_base(self, complaint: str) -> dict:
        """Generate base classification"""
        try:
            # Use working generation method
            raw_output = self._generate(complaint, strict=False)
            
            print(f"[CLASSIFY_BASE] Raw output: '{raw_output[:100]}...'")
            
            # If output is empty or too short, use fallback
            if not raw_output or len(raw_output.strip()) < 10:
                print("[CLASSIFY_BASE] Empty or too short output, using FALLBACK")
                return self._fallback_classification(complaint)
            
            # Try JSON extraction first
            result = self._extract_json(raw_output)
            
            # Try native format parser
            if result is None:
                result = self._parse_native_format(raw_output)
            
            # Retry with strict prompt if failed
            if result is None:
                print("[CLASSIFY_BASE] First attempt failed, retrying with strict prompt")
                raw_output = self._generate(complaint, strict=True)
                
                # Check for empty again
                if not raw_output or len(raw_output.strip()) < 10:
                    print("[CLASSIFY_BASE] Retry also empty, using FALLBACK")
                    return self._fallback_classification(complaint)
                
                result = self._extract_json(raw_output)
                
                # Try native format again
                if result is None:
                    result = self._parse_native_format(raw_output)
            
            # If still failed, use fallback
            if result is None:
                print(f"[CLASSIFY_BASE] All parsing failed, using FALLBACK")
                return self._fallback_classification(complaint)
            
            print(f"[CLASSIFY_BASE] Success! Categories: {result.get('categories')}")
            
            return result
        except Exception as e:
            print(f"[CLASSIFY_BASE] Exception: {e}, using FALLBACK")
            return self._fallback_classification(complaint)

# ========================
# BUSINESS LOGIC
# ========================

def compute_anonymous_recommended(categories: List[str], complaint_text: str) -> bool:
    """Determine if anonymous submission is recommended"""
    # Keywords indicating power imbalance or fear
    fear_keywords = [
        "scared", "afraid", "fear", "retaliation", "threatened", 
        "controls my", "power over", "dependent on", "blackmail"
    ]
    
    # Category-based rules
    sensitive_categories = [
        "Workplace Harassment", "Abuse of Authority", 
        "Discrimination or Bias", "Sexual Harassment","Corruption or Bribery",
        "Fraud","Retaliation","Whistleblowing"
    ]
    
    # Check categories
    for cat in categories:
        if any(sensitive in cat for sensitive in sensitive_categories):
            return True
    
    # Check text for fear indicators
    complaint_lower = complaint_text.lower()
    if any(keyword in complaint_lower for keyword in fear_keywords):
        return True
    
    return False

def compute_escalation_required(severity: str) -> bool:
    """Escalation required for Critical severity"""
    return severity == "Critical"

def compute_route_to(categories: List[str]) -> str:
    """Map categories to department/authority"""
    # Priority-based routing (first match wins)
    routing_rules = [
        (["Workplace Harassment", "Sexual Harassment", "Abuse of Authority"], "Internal Complaints Committee"),
        (["Corruption or Bribery", "Fraud"], "Vigilance / Ethics Office"),
        (["Discrimination or Bias"], "Diversity & Inclusion Office"),
        (["Safety Hazard"], "Health & Safety Department"),
        (["Mental Health or Stress"], "Employee Wellness / HR"),
        (["Academic Misconduct"], "Academic Affairs / Disciplinary Committee"),
        (["Infrastructure or Facility Issue", "Service Issue"], "Operations / Facilities Management"),
        (["HR"], "Human Resources"),
    ]
    
    for keywords, department in routing_rules:
        for cat in categories:
            if any(keyword.lower() in cat.lower() for keyword in keywords):
                return department
    
    return "Customer Support / General Grievance Cell"

def compute_sla_hours(severity: str) -> int:
    """Calculate SLA based on severity"""
    sla_map = {
        "Critical": 24,
        "High": 72,
        "Normal": 168
    }
    return sla_map.get(severity, 168)

def extend_classification(base: dict, complaint_text: str) -> ClassificationResponse:
    """Extend base model output with business logic"""
    categories = base.get("categories", [])
    severity = base.get("severity", "Normal")
    
    return ClassificationResponse(
        categories=categories,
        severity=severity,
        anonymous_recommended=compute_anonymous_recommended(categories, complaint_text),
        escalation_required=compute_escalation_required(severity),
        route_to=compute_route_to(categories),
        sla_hours=compute_sla_hours(severity)
    )

# ========================
# GLOBAL CLASSIFIER
# ========================

classifier = ComplaintClassifier()

# ========================
# ENDPOINTS
# ========================

@app.post("/classify", response_model=ClassificationResponse)
def classify_complaint(request: ClassifyRequest):
    """
    Classify a single complaint
    """
    try:
        base_classification = classifier.classify_base(request.complaint)
        return extend_classification(base_classification, request.complaint)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/classify/batch", response_model=List[ClassificationResponse])
def classify_batch(request: BatchClassifyRequest):
    """
    Classify multiple complaints
    """
    results = []
    errors = []
    
    for idx, complaint in enumerate(request.complaints):
        try:
            base_classification = classifier.classify_base(complaint)
            results.append(extend_classification(base_classification, complaint))
        except Exception as e:
            errors.append({"index": idx, "complaint": complaint[:50], "error": str(e)})
            # Return partial error response
            results.append(ClassificationResponse(
                categories=["Error"],
                severity="Normal",
                anonymous_recommended=False,
                escalation_required=False,
                route_to="Error - Manual Review Required",
                sla_hours=168
            ))
    
    # If too many errors, raise exception
    if len(errors) > len(request.complaints) * 0.5:
        raise HTTPException(
            status_code=500, 
            detail=f"Batch processing failed for {len(errors)} items: {errors}"
        )
    
    return results

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": classifier.model is not None}

@app.post("/explain", response_model=ExplainResponse)
def explain_classification(request: ClassifyRequest):
    """
    Explain why a complaint was classified in a certain way
    """
    try:
        # Get classification
        base_classification = classifier.classify_base(request.complaint)
        full_classification = extend_classification(base_classification, request.complaint)
        
        # Generate explanation
        key_triggers = []
        
        # Severity trigger keywords
        severity_keywords = {
            "Critical": ["harassment", "harass", "abuse", "threatened", "scared", "afraid",
                        "corruption", "bribery", "fraud", "blackmail", "unsafe", "fire", "safety"],
            "High": ["repeated", "multiple", "ongoing", "persistent", "unresolved", "weeks", "months"]
        }
        
        # Category-specific triggers
        category_keywords = {
            "Workplace Harassment": ["comments", "body", "stares", "follows", "unwanted"],
            "Abuse of Authority": ["controls", "authority", "boss", "supervisor", "power"],
            "Corruption or Bribery": ["pay", "money", "bribe", "rupees", "cash"],
            "Safety Hazard": ["fire", "broken", "unsafe", "dangerous", "equipment"],
            "Discrimination or Bias": ["bias", "discriminate", "caste", "religion", "gender"],
            "Infrastructure or Facility Issue": ["not working", "broken", "faulty", "wifi"],
        }
        
        complaint_lower = request.complaint.lower()
        
        # Extract triggers
        for keyword in severity_keywords.get(full_classification.severity, []):
            if keyword in complaint_lower and keyword not in key_triggers:
                key_triggers.append(keyword)
        
        for category in full_classification.categories:
            for cat_name, keywords in category_keywords.items():
                if cat_name.lower() in category.lower():
                    for keyword in keywords:
                        if keyword in complaint_lower and keyword not in key_triggers:
                            key_triggers.append(keyword)
        
        # Limit triggers
        key_triggers = key_triggers[:5]
        
        # Generate summary
        category_str = ", ".join(full_classification.categories)
        if full_classification.severity == "Critical":
            reason = f"Classified as Critical due to {category_str.lower()}"
            if full_classification.anonymous_recommended:
                reason += " with power imbalance indicators"
        elif full_classification.severity == "High":
            reason = f"Classified as High - {category_str.lower()} requiring urgent attention"
        else:
            reason = f"Classified as Normal - general {category_str.lower()}"
        
        return ExplainResponse(
            summary_reason=reason,
            key_triggers=key_triggers if key_triggers else ["general complaint indicators"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
