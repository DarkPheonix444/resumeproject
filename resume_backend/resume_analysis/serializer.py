from rest_framework import serializers
from .models import Resume,resume_analysis
class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = resume_analysis
        fields = ['id', 'version', 'hard_score', 'soft_score', 'total_score', 'skills_json', 'sections_json', 'experience_json', 'jd_text', 'ai_enabled', 'created_at']
class ResumeSerializer(serializers.ModelSerializer):
    latest_analysis = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'file', 'uploaded_at', 'latest_analysis']

        def get_latest_analysis(self, obj):
            latest=obj.analyses.first()
            if not latest:
                return None
            return ResumeAnalysisSerializer(latest).data