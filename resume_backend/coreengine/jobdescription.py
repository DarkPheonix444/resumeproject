from coreengine.detection import skill_detection

def get_default_jd() -> list[str]:
    return [
        "Strong software engineering fundamentals and problem-solving ability",
        "Experience building scalable and maintainable applications",
        "Understanding of backend systems, APIs, and database design",
        "Familiarity with frontend frameworks and modern development tools",
        "Experience working with cloud platforms and deployment workflows",
        "Knowledge of data processing or machine learning concepts is a plus",
        "Ability to write clean, efficient, and production-ready code",
        "Understanding of system architecture, performance optimization, and security best practices"
    ]
def get_jd_text(jd_requirement: str | None) -> dict:
    if not jd_requirement or not jd_requirement.strip():
        return {}
    jd_text=jd_requirement.strip()

    jd_sections={
        'skills':jd_text,
        'experience':jd_text,
        'projects':''
    }

    extracted_skills=skill_detection(jd_sections)

    return {
        'raw_text':jd_text,
        'extracted_skills':extracted_skills
    }