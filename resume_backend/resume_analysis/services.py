from django.db.models import Max
from .models import ResumeAnalysis

def create_analysis(resume, result_dict,jd_dict=None, ai_enabled=False, jd_text=None):
    latest_version = ResumeAnalysis.objects.filter(resume=resume).aggregate(Max('version'))['version__max']

    new_version = 1 if latest_version is None else latest_version + 1
    # matched_skill=None
    # missing_skill=None
    # extra_skill=None
    # jd_skill=None
    # total_required_skill=None
    # total_matched_skill=None
    return ResumeAnalysis.objects.create(
        resume=resume,
        version=new_version,
        hard_score=result_dict["hard_score"],
        soft_score=result_dict["soft_score"],
        total_score=result_dict["total_score"],
        skills_json=result_dict["skills"],
        sections_json=result_dict["sections"],
        experience_json=result_dict["experience"],
        jd_text=jd_text,
        ai_enabled=ai_enabled,
        matched_skill=jd_dict.get("matched_skills") if jd_dict else None,
        missing_skill=jd_dict.get("missing_skills") if jd_dict else None,
        extra_skill=jd_dict.get("extra_skills") if jd_dict else None,
        jd_score=jd_dict.get("jd_score") if jd_dict else None,
        total_required_skill=jd_dict.get("total_required_skills") if jd_dict else None,
        total_matched_skill=jd_dict.get("total_matched_skills") if jd_dict else None

    )

