config = {
    "max_unique_skills_reference": 25,
    "max_domain_reference": 8,
    "max_mentions_reference": 60,

    "weights": {
        "breadth": 0.30,
        "depth": 0.35,
        "intensity": 0.20,
        "linguistic": 0.15
    },
    "experience_reference": {
    "max_years": 8,
    "max_impact": 5,
    "max_leadership": 5,
    "max_deployment": 5
},
"experience_weights": {
    "years": 0.35,
    "impact": 0.25,
    "leadership": 0.20,
    "deployment": 0.20
},
    "min_verb_ratio": 0.07
}


def evaluate_skill(skill_data: dict) -> dict:
    if not isinstance(skill_data, dict):
        raise ValueError("Skill data must be a dictionary.")

    total_unique = 0
    total_mentions = 0
    domain_diversity = 0

    for domain, skills in skill_data.items():
        if not skills:
            continue

        domain_diversity += 1
        total_unique += len(skills)
        total_mentions += sum(skills.values())

    return {
        "total_unique": total_unique,
        "total_mentions": total_mentions,
        "domain_diversity": domain_diversity
    }


def normalization(value: float, reference: float) -> float:
    if reference <= 0:
        return 0.0
    return min(value / reference, 1.0)


def compute_rule_score(skill_metrics: dict, spacy_metrics: dict) -> float:
    breadth_score = normalization(
        skill_metrics["domain_diversity"],
        config["max_domain_reference"]
    )

    depth_score = normalization(
        skill_metrics["total_unique"],
        config["max_unique_skills_reference"]
    )

    intensity_score = normalization(
        skill_metrics["total_mentions"],
        config["max_mentions_reference"]
    )

    linguistic_score = 0.0

    if spacy_metrics.get("verb_ratio", 0) >= config["min_verb_ratio"]:
        linguistic_score += 0.6

    if spacy_metrics.get("org_count", 0) > 0:
        linguistic_score += 0.4

    weights = config["weights"]

    final_score = (
        breadth_score * weights["breadth"] +
        depth_score * weights["depth"] +
        intensity_score * weights["intensity"] +
        linguistic_score * weights["linguistic"]
    )

    return round(final_score * 100, 2)


def compute_confidence(skill_metrics: dict) -> float:
    if skill_metrics["total_unique"] == 0:
        return 0.0

    if skill_metrics["domain_diversity"] == 0:
        return 0.0

    structural_strength = normalization(
        skill_metrics["total_unique"],
        config["max_unique_skills_reference"]
    )

    diversity_strength = normalization(
        skill_metrics["domain_diversity"],
        config["max_domain_reference"]
    )

    confidence = (structural_strength + diversity_strength) / 2

    return round(confidence*100, 2)  

def compute_experience_score(exp_metrics: dict) -> float:
    if not exp_metrics:
        return 0.0
    
    ref = config["experience_reference"]
    weights = config["experience_weights"]

    years_score = normalization(
        exp_metrics.get("years_experience", 0),
        ref["max_years"]
    )

    impact_score = normalization(
        exp_metrics.get("impact_mentions", 0),
        ref["max_impact"]
    )

    leadership_score = normalization(
        exp_metrics.get("leadership_mentions", 0),
        ref["max_leadership"]
    )

    deployment_score = normalization(
        exp_metrics.get("deployment_mentions", 0),
        ref["max_deployment"]
    )

    final = (
        years_score * weights["years"] +
        impact_score * weights["impact"] +
        leadership_score * weights["leadership"] +
        deployment_score * weights["deployment"]
    )

    return round(final * 100, 2)

def evaluate_resume(skill_data: dict, spacy_metrics: dict, exp_metrics: dict) -> dict:
    skill_metrics = evaluate_skill(skill_data)

    rule_score = compute_rule_score(skill_metrics, spacy_metrics)

    confidence = compute_confidence(skill_metrics)

    experience_score=compute_experience_score(exp_metrics)

    return {
        "skill_metrics": skill_metrics,
        "rule_score": rule_score,
        "confidence": confidence,
        "experience_score": experience_score
    }
