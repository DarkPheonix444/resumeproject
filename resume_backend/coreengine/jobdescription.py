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
def get_jd_text(jd_requirement: str | None) -> str:
    if jd_requirement:
            jd_requirement = jd_requirement.strip()

    jd_skills={
        'skills': [],
        'experience': [],
        'domains': [],
    }

    for jd in jd_requirement.split('\n'):
        if "experience" in jd.lower():
            jd_skills['experience'].append(jd)
        elif any(keyword in jd.lower() for keyword in ["skill", "technology", "tool"]):
            jd_skills['skills'].append(jd)
        else:
            jd_skills['domains'].append(jd)