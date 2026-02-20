from coreengine.extraction import extract
from coreengine.detection import detection,skill_detection,experience_signal_detection
from coreengine.nlp import analyze_spacy,fallback_skill_detection
from coreengine.evaluator import evaluate_resume
from coreengine.chunknizer import chunk_text
from coreengine.engine import semantic_engine


FALLBACK_THRESHOLD=4

def process_resume(file_path:str,ai_enabled:bool=False,jd_requirements:list| None = None)->dict:

    text=extract(file_path)

    if not text or not text.strip():
        return {"error":"No text extracted from the resume."}
    
    section=detection(text)

    rule_skills=skill_detection(section)

    spacy_metrics=analyze_spacy(text)
    experience=experience_signal_detection(text)

    evaluation=evaluate_resume(rule_skills,spacy_metrics,experience)

    skill_score=evaluation["skill_metrics"]["total_unique"]

    if skill_score<FALLBACK_THRESHOLD:
        fallback_skills=fallback_skill_detection(section)

        for category,skills in fallback_skills.items():
            if category not in rule_skills:
                rule_skills[category]=skills
            else:
                for skill,count in skills.items():
                    if skill not in rule_skills[category]:
                        rule_skills[category][skill]=count

    evaluation=evaluate_resume(rule_skills,spacy_metrics,experience)
    rule_score=evaluation["rule_score"]
    confidence=evaluation["confidence"]
    experience_score=evaluation["experience_score"]
    
    semanetic_score=None
    final_score=rule_score

    if ai_enabled and jd_requirements:
        resume_chunk=chunk_text(text)

        semanetic_score=semantic_engine.compute_semantic_score(resume_chunk,jd_requirements)
        
        if experience.get("years_experience", 0) <= 0:
            final_score = (
                0.7 * rule_score +
                0.3 * semanetic_score
            )
        else:
            final_score = (
                0.4 * rule_score +
                0.3 * semanetic_score +
                0.5 * experience_score
            )
    else:
        if experience.get("years_experience", 0) <= 0:
            final_score = rule_score
        else:
            final_score = (
                0.6 * rule_score +
                0.4 * experience_score
            )

    return {
        "sections": section,
        "skills": rule_skills,
        "spacy_metrics": spacy_metrics,
        "evaluation": evaluation,
        "semantic_score": semanetic_score,
        "experience_score": experience_score,
        "final_score": round(final_score, 2),
        "confidence": confidence
    }