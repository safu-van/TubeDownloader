from django.urls import path
from core import views

app_name = "core"

urlpatterns = [
    path("", views.home, name="home"),
    path("download-audio/", views.download_audio, name="download_audio"),
    path("ytmp4/", views.youtube_to_mp4, name="ytmp4"),
    path("contact/", views.contact_us, name="contact"),
]
