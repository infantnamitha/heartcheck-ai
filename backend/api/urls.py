from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register),
    path('login', views.login),
    path('questions', views.get_questions),
    path('submit-answers', views.submit_answers),
    path('results', views.get_results),
    path('history', views.get_history),
    path('profile', views.profile),
]
