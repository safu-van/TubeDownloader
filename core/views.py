from django.shortcuts import render


def home(request):
    url = None
    if request.method == 'POST':
        url = request.POST.get('url')
        print(url)
    
    context = {
        'url': url,
    }
    return render(request, 'core/index.html', context)


def youtube_to_mp4(request):
    url = None
    if request.method == 'POST':
        url = request.POST.get('url')
        print(url)
    
    context = {
        'url': url,
    }
    return render(request, 'core/ytmp4.html', context)


def contact_us(request):
    return render(request, 'core/contact.html')