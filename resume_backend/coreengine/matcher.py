def flatten(skill_dict: dict) -> set:
    
    flat_set = set()

    if not skill_dict:
        return flat_set

    for _, skills in skill_dict.items():
        for skill in skills.keys():
            flat_set.add(skill)

    return flat_set


def compute_jd_match(resume_skill: dict, jd_skill: dict) -> dict:
    

    if not isinstance(resume_skill, dict) or not isinstance(jd_skill, dict):
        raise ValueError("Skills must be dictionaries.")

    resume_flat = flatten(resume_skill)
    jd_flat = flatten(jd_skill)

    # If JD has no skills
    if not jd_flat:
        return {
            "matched_skills": [],
            "missing_skills": [],
            "extra_skills": sorted(list(resume_flat)),
            "total_required": 0,
            "total_matched": 0,
            "match_percentage": 0.0
        }

    matched_skills = resume_flat.intersection(jd_flat)
    missing_skills = jd_flat - resume_flat
    extra_skills = resume_flat - jd_flat

    match_percentage = (len(matched_skills) / len(jd_flat)) * 100

    return {
        "matched_skills": sorted(list(matched_skills)),
        "missing_skills": sorted(list(missing_skills)),
        "extra_skills": sorted(list(extra_skills)),
        "total_required": len(jd_flat),
        "total_matched": len(matched_skills),
        "match_percentage": round(match_percentage, 2)
    }