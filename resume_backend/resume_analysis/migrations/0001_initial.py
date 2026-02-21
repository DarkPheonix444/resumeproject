from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Resume',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('file', models.FileField(upload_to='resumes/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='resumes', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='resume_analysis',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('version', models.IntegerField()),
                ('hard_score', models.FloatField()),
                ('soft_score', models.FloatField()),
                ('total_score', models.FloatField()),
                ('skills_json', models.JSONField()),
                ('sections_json', models.JSONField()),
                ('experience_json', models.JSONField()),
                ('jd_text', models.TextField(blank=True, null=True)),
                ('ai_enabled', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('resume', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analyses', to='resume_analysis.resume')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('resume', 'version')},
            },
        ),
    ]
