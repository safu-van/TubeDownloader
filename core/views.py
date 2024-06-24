import io

from django.shortcuts import render
from django.http import HttpResponse
from pytube import YouTube
from pytube.exceptions import RegexMatchError


# Change yt_duration format
def format_duration(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60

    return f"{hours:02}:{minutes:02}:{seconds:02}"


# Change audio_size format
def format_audio_size(size):
    suffixes = ['B', 'KB', 'MB', 'GB', 'TB']
    threshold = 1024
    index = 0
    
    # Convert size to appropriate unit
    while size >= threshold and index < len(suffixes) - 1:
        size /= threshold
        index += 1
    
    return f"{size:.2f} {suffixes[index]}"


# Home page and youtube to mp3
def home(request):
    yt_url = None
    yt_title = None
    yt_thumbnail = None
    yt_duration = None
    audio_size =None

    if request.method == "POST":
        yt_url = request.POST.get("url")

        try:
            yt_video = YouTube(yt_url)
            yt_title = yt_video.title
            yt_thumbnail = yt_video.thumbnail_url
            yt_duration = format_duration(yt_video.length)
            audio = yt_video.streams.filter(only_audio=True).first()
            if audio:
                audio_size = format_audio_size(audio.filesize)
            else:
                audio_size = "Unable to get Size"
        except RegexMatchError:
            message = "Invalid URL"
            context = {
                "url": yt_url,
                "message": message,
            }
            return render(request, "core/index.html", context)
 
    context = {
        "url": yt_url,
        "yt_thumbnail": yt_thumbnail,
        "yt_title": yt_title,
        "yt_duration": yt_duration,
        "audio_size": audio_size
    }
    return render(request, "core/index.html", context)


# Download audio
def download_audio(request):
    yt_url = request.GET.get("yt_url")
    yt_video = YouTube(yt_url)
    audio = yt_video.streams.filter(only_audio=True).first()
    
    buffer = io.BytesIO()
    audio.stream_to_buffer(buffer)
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='audio/mp3')
    response['Content-Disposition'] = f'attachment; filename="{yt_video.title}.mp3"'
    return response


# Youtube to mp4 
def youtube_to_mp4(request):
    url = None
    if request.method == "POST":
        url = request.POST.get("url")
        print(url)

    context = {
        "url": url,
    }
    return render(request, "core/ytmp4.html", context)


# Contact Page
def contact_us(request):
    return render(request, "core/contact.html")
