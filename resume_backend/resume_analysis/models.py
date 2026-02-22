from django.db import models
import uuid
from django.conf import settings



class Resume(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume {self.user.email}-{self.uploaded_at}"
    


class ResumeAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='analyses')
    version = models.IntegerField()
    hard_score = models.FloatField()
    soft_score = models.FloatField()
    total_score = models.FloatField()


    skills_json=models.JSONField()
    sections_json=models.JSONField()
    experience_json=models.JSONField()
    jd_text = models.TextField(null=True, blank=True)

    ai_enabled=models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ('resume', 'version')
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis {self.resume.user.email} - Version {self.version}"
    

# Create your models here.
