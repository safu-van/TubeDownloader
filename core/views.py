from django.shortcuts import render


def home(request):
    return render(request, 'core/index.html')


def youtube_to_mp4(request):
    return render(request, 'core/ytmp4.html')


def contact_us(request):
    return render(request, 'core/contact.html')