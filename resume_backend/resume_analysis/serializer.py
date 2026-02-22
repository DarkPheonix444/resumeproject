from rest_framework import serializers
from .models import Resume, ResumeAnalysis

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    data = serializers.SerializerMethodField()

    class Meta:
        model = ResumeAnalysis
        fields = ['id', 'version', 'hard_score', 'soft_score', 'total_score', 'skills_json', 'sections_json', 'experience_json', 'jd_text', 'ai_enabled', 'created_at', 'data']

    def get_data(self, obj):
        """Transform stored data into the format expected by the frontend"""
        experience = obj.experience_json or {}
        skills = obj.skills_json or {}
        
        # Build strong domains from skills
        strong_domains = sorted(
            skills.keys(),
            key=lambda d: sum(skills[d].values()) if isinstance(skills[d], dict) else 0,
            reverse=True
        )[:2]
        
        # Determine experience level
        years_exp = experience.get("experience_score", 0) if isinstance(experience, dict) else 0
        if years_exp < 20:
            experience_level = "fresher"
        elif years_exp < 50:
            experience_level = "junior"
        elif years_exp < 75:
            experience_level = "mid-level"
        else:
            experience_level = "senior"
        
        # Build the scores structure
        scores = {
            "final": obj.total_score or 0,
            "confidence": experience.get("confidence", 50) if isinstance(experience, dict) else 50,
            "breakdown": {
                "rule": obj.hard_score or 0,
                "semantic": obj.soft_score or 0,
                "experience": experience.get("experience_score", 0) if isinstance(experience, dict) else 0,
            }
        }
        
        # Build the profile structure
        profile = {
            "experience_level": experience_level,
            "strong_domains": strong_domains,
        }
        
        # Build skills summary
        total_unique = len(skills) if isinstance(skills, dict) else 0
        total_mentions = sum(
            sum(skill_dict.values()) if isinstance(skill_dict, dict) else 0
            for skill_dict in skills.values() if isinstance(skill_dict, dict)
        ) if isinstance(skills, dict) else 0
        
        # Calculate domain diversity (number of unique skill categories)
        domain_diversity = total_unique
        
        skills_summary = {
            "total_unique": total_unique,
            "total_mentions": total_mentions,
            "domain_diversity": domain_diversity,
        }
        
        return {
            "scores": scores,
            "profile": profile,
            "skills_summary": skills_summary,
            "analyzed_at": obj.created_at.isoformat() if obj.created_at else None,
        }

class ResumeSerializer(serializers.ModelSerializer):
    latest_analysis = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at', 'latest_analysis']

    def get_latest_analysis(self, obj):
        latest = obj.analyses.first()
        if not latest:
            return None
        return ResumeAnalysisSerializer(latest).data