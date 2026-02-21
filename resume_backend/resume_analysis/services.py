from django.db.models import Max
from .models import resume_analysis

def create_analysis(resume, result_dict, ai_enabled=False, jd_text=None):
    latest_version=(resume_analysis.objects.filter(resume=resume).aggregate(Max('version'))['version__max'] )

    new_version=1 if latest_version is None else latest_version + 1

    return resume_analysis.objects.create(
        resume=resume,
        version=new_version,
        hard_score=result_dict["hard_score"],
        soft_score=result_dict["soft_score"],
        total_score=result_dict["total_score"],
        skills_json=result_dict["skills"],
        sections_json=result_dict["sections"],
        experience_json=result_dict["experience"],
        jd_text=jd_text,
        ai_enabled=ai_enabled
    )

