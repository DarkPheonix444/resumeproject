from django.urls import include, path
from .views import ResumeAnalysisView, ResumeViewSet, ResumeAnalysisViewSet
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'resumes', ResumeViewSet, basename='resume')
router.register(r'analyses', ResumeAnalysisViewSet, basename='analysis')
urlpatterns = [
    path("", include(router.urls)),
    path("analyze/", ResumeAnalysisView.as_view(), name="resume-analyze"),
]
