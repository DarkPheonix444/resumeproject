# Hybrid NLP-Based Resume Analysis & JD Matching System

## 1. Overview

This project is a modular resume analysis system that evaluates resume quality and optionally matches resumes against job descriptions (JD). It combines deterministic, rule-based extraction with NLP-assisted fallback mechanisms to improve skill detection recall while preserving explainability and pipeline traceability.

The system is organized into three layers:

- **Core Engine (Python):** Parsing, extraction, scoring, and matching logic.
- **Backend (Django):** API orchestration, persistence, and version history management.
- **Frontend (React + Vite):** Upload, analysis visualization, and historical comparison UI.

## Key Features

- Hybrid deterministic + NLP resume analysis pipeline
- Weighted scoring model normalized to a 0–100 scale
- Job Description (JD) skill matching and gap detection
- Resume version comparison and improvement tracking
- Modular architecture enabling independent module upgrades
- Deterministic-first design for explainable scoring

## 2. Problem Statement

Many resume analysis tools rely on rigid keyword matching, which can produce inconsistent extraction and non-transparent scoring. This often leads to weak reproducibility across resumes and poor interpretability of why a resume received a particular score.

This project addresses those limitations by:

- using deterministic-first extraction for consistency,
- activating NLP fallback when deterministic confidence is insufficient,
- normalizing scores to a 0–100 range,
- exposing structured outputs for measurable comparison across resume versions.

## 3. System Approach

The system uses a hybrid multi-layered strategy to balance determinism, fairness, and extensibility.

- **Scoring Framework:** Weighted scoring normalized to 0–100 using skill coverage, experience signals, and optional JD alignment.
- **Skill Detection:** Structured skill database lookup, rule/pattern matching, and NLP-assisted extraction.
- **Fallback Strategy:** spaCy-based and semantic similarity methods are used when deterministic confidence drops below threshold.
- **Deduplication:** Repeated mentions of the same skill are counted once to prevent artificial score inflation.
- **Modularity:** Independent modules for extraction, detection, matching, and evaluation simplify extension and maintenance.

## Design Principles

The architecture follows a deterministic-first philosophy with controlled semantic augmentation. The core principles are:

- **Deterministic-first processing:** Rule-based extraction executes first to provide stable, reproducible outputs and predictable runtime behavior.
- **NLP fallback strategy:** NLP and semantic similarity are invoked conditionally when deterministic confidence is insufficient, improving recall without making NLP the default path.
- **Modular pipeline design:** Extraction, chunking, detection, matching, and evaluation are implemented as separable modules to support isolated upgrades and targeted testing.
- **Explainable scoring:** Weighted scoring and normalized output are designed to keep score composition interpretable and debuggable.
- **Resume version tracking:** Historical result storage and delta comparison are treated as first-class design concerns for measurable progression across submissions.

## 4. System Architecture

The architecture is split into three cooperating layers:

1. **Core Engine (Python):** Resume and JD analysis logic.
2. **Backend Layer (Django):** REST orchestration and data persistence.
3. **Frontend Layer (React + Vite):** User interaction and result visualization.

Data flows from frontend upload requests to backend APIs, then into the core engine for analysis, followed by structured JSON responses persisted and returned to the frontend.

## High-Level Architecture Diagram

```text
┌──────────────────────────────┐
│ Frontend (React + Vite)      │
│ - Upload & Results UI        │
│ - History Comparison Views   │
└───────────────┬──────────────┘
                │ HTTP/JSON
                ▼
┌──────────────────────────────┐
│ Backend API Layer            │
│ (Django + DRF)               │
│ - Request handling           │
│ - Orchestration              │
│ - Response formatting        │
└───────────────┬──────────────┘
                │ Internal service calls
                ▼
┌──────────────────────────────┐
│ Core Engine (Python)         │
│ - Resume parsing             │
│ - Skill detection/matching   │
│ - NLP fallback               │
│ - Scoring & JD alignment     │
└───────────────┬──────────────┘
                │ Persist/Read
                ▼
┌──────────────────────────────┐
│ Persistence Layer            │
│ - Resume analyses            │
│ - Version history            │
│ - Comparison records         │
└──────────────────────────────┘
```

## 5. Processing Pipeline

```text
Resume Input
     ↓
Text Extraction
     ↓
Raw Text Processing

├── Custom Skill Extraction Pipeline
│     ↓
│  Skill Detection
│     ↓
│  NLP Fallback & Semantic Enhancement
│
└── Resume Chunking Pipeline
               ↓
      Section Detection
               ↓
      Contextual / Semantic Analysis

↓
Evaluation Engine (weighted scoring normalized 0–100)
↓
Structured Resume Analysis Output
```

## Performance Considerations

- **Deterministic runtime efficiency:** Rule-based extraction, regex matching, and structured skill lookup execute in predictable time and are generally faster than full semantic analysis.
- **Conditional NLP execution:** NLP fallback is only triggered when deterministic extraction confidence is below threshold, avoiding unnecessary model-level processing for straightforward resumes.
- **Reduced computational overhead:** By limiting NLP to ambiguous or low-confidence cases, the system lowers average inference cost and improves throughput while preserving recall in edge cases.

## 6. Core Engine

The core engine implements deterministic-first parsing and analysis with NLP fallback support.

### Main Modules

- `extraction.py` → extracts raw text from PDF/DOCX resumes
- `chunknizer.py` → segments resume content into logical sections
- `detection.py` → rule-based section and skill detection
- `skill_db.py` → structured skill knowledge base
- `matcher.py` → custom skill matching logic
- `nlp.py` → spaCy fallback and semantic similarity analysis
- `evaluator.py` → weighted score computation (0–100 normalization)
- `jobdescription.py` → JD parsing and skill requirement extraction
- `engine.py` → pipeline orchestration
- `model.py` → internal data structures and objects

### Naming Note

The current module name `chunknizer.py` is intentionally preserved for compatibility with existing imports.
If a naming cleanup is planned, `chunker.py`, `resume_chunker.py`, or `section_chunker.py` are clearer alternatives.

## 7. Job Description Processing Pipeline

The JD analysis flow is isolated from resume parsing and feeds normalized requirements into the evaluator.

```text
Job Description Input
     ↓
JD Text Extraction
     ↓
JD Skill Extraction
     ↓
Semantic Skill Mapping
     ↓
JD Skill Requirement Model
```

The JD pipeline runs independently and its output is consumed by the evaluation engine to compute JD alignment metrics.

## 8. Resume History & Versioning

Each resume submission is persisted as a new analysis version. The system compares the latest result with previous versions to compute:

- score deltas,
- newly added skills,
- removed or missing skills,
- JD alignment improvements.

This enables measurable tracking of resume evolution over time.

## 9. Backend Architecture

The Django backend is the orchestration layer between UI and analysis engine.

### Responsibilities

- request validation and API routing,
- resume file ingestion and processing triggers,
- execution of core engine analysis pipeline,
- persistence of analysis outputs and version history,
- delivery of structured JSON responses for frontend consumption.

## 10. Frontend Architecture

The React + Vite frontend provides user workflows for resume analysis and comparison.

### User Capabilities

- upload resumes,
- view normalized resume scores,
- inspect extracted and matched skills,
- view JD matching outcomes,
- compare historical resume versions,
- track measurable improvement history.

## 11. Example Output

```json
{
     "resume_id": "e2a9a8d1-9f66-4fcb-8a74-6f0d4efea4a2",
     "overall_score": 78.5,
     "score_breakdown": {
          "skills": 42.0,
          "experience": 21.5,
          "jd_alignment": 15.0
     },
     "detected_skills": ["Python", "Django", "REST API", "SQL", "spaCy"],
     "missing_skills": ["Docker", "CI/CD"],
     "jd_match": {
          "score": 73.0,
          "matched": ["Python", "Django", "SQL"],
          "missing": ["Docker", "CI/CD"]
     },
     "version_comparison": {
          "previous_score": 71.0,
          "score_delta": 7.5,
          "added_skills": ["REST API", "spaCy"],
          "removed_skills": []
     }
}
```

## 12. Tech Stack

- **Language:** Python, JavaScript
- **NLP:** spaCy, semantic similarity methods
- **Backend:** Django, Django REST Framework
- **Frontend:** React, Vite
- **Data Exchange:** JSON over REST APIs
- **Storage:** Django ORM-backed persistence for analysis history

## Getting Started

### Backend Setup

```bash
git clone <repository-url>
cd resumeproject/resume_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd ../resume-frontend
npm install
npm run dev
```

The frontend is available at:

`http://localhost:5173`

The backend API is available at:

`http://localhost:8000`

## Security & Privacy

Uploaded resumes are processed solely for analysis and evaluation purposes.
No personal data is shared externally, and stored analysis results are used only for version comparison and scoring history.

Future improvements may include configurable data retention policies and anonymization pipelines.

## 13. Project Structure

```text
resumeproject/
├── README.md
├── requirements.txt
├── resume_backend/
│   ├── manage.py
│   ├── coreengine/
│   │   ├── chunknizer.py
│   │   ├── controller.py
│   │   ├── detection.py
│   │   ├── engine.py
│   │   ├── evaluator.py
│   │   ├── extraction.py
│   │   ├── jobdescription.py
│   │   ├── main.py
│   │   ├── matcher.py
│   │   ├── model.py
│   │   ├── nlp.py
│   │   └── skill_db.py
│   ├── resume_analysis/
│   ├── resume_backend/
│   ├── resumes/
│   └── users/
└── resume-frontend/
          ├── package.json
          ├── src/
          │   ├── api/
          │   ├── components/
          │   ├── context/
          │   ├── pages/
          │   └── styles/
          └── public/
```

### Documentation Conventions

- Use `README.md` for the repository root documentation file.
- Use `requirements.txt` for Python dependency specification.
- Keep section headers in consistent title case and use fenced code blocks with explicit language identifiers.

## 14. Future Improvements

- add configurable scoring weights through admin-level controls,
- expand skill ontology with domain-specific taxonomies,
- improve semantic matching with transformer-based embeddings,
- add model-level evaluation dashboards for precision/recall tracking,
- support multilingual resume and JD analysis,
- introduce asynchronous processing for high-throughput batch analysis.

---

## Evaluation

The system was evaluated on a dataset of **30 resumes** with annotated ground-truth labels. Evaluation focused on four engineering dimensions:

- **Skill extraction correctness:** Verification that detected skills align with annotated ground-truth skill mentions.
- **Scoring consistency:** Validation that semantically similar resumes produce stable and proportionate score behavior under the weighted normalization model.
- **JD alignment validation:** Confirmation that matched and missing JD skills are correctly reflected in alignment outputs and downstream scoring components.
- **Format stability:** Consistency checks across different resume input structures and formats (including PDF and DOCX parsing paths) to ensure robust pipeline behavior.


