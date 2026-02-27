def flatten(skill_dict:dict)->set:
    flat_set=set()
    if not skill_dict:
        return flat_set
    for category,skills in skill_dict.items():
        for skill in skills.keys():
            flat_set.add(skill)

    return flat_set

def matcher(resume_skill:dict,jd_skill:dict)->dict:
    resume_flat=flatten(resume_skill)
    jd_flat=flatten(jd_skill)

    if not jd_flat:
        return {
            'matched_skill':[],
            'missing_skill':[],
            'extra_skill':list(resume_flat),
            'match_percentage':0.0
        }
    
    matched_skill=resume_flat.intersection(jd_flat)
    missing_skill=jd_flat-resume_flat
    extra_skill=resume_flat-jd_flat
    match_percentage=(len(matched_skill)/len(jd_flat))*100 if jd_flat else 0.0

    return {
        "matched_skill": sorted(list(matched_skill)),
        "missing_skill": sorted(list(missing_skill)),
        "extra_skill": sorted(list(extra_skill)),
        "total_required": len(jd_flat),
        "total_matched": len(matched_skill),
        "match_percentage": round(match_percentage, 2)
    }