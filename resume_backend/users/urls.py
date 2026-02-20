from .views import signupview
from django.urls import path

urlpatterns = [
    path('signup/',signupview.as_view(),name='signup'),
]
