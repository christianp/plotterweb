from django.shortcuts import render
from django.templatetags.static import static

# Create your views here.
def index(request):
    thing = request.GET.get('thing','thing')
    thing_js = static(f'things/{thing}.js')
    return render(request, 'plottercontroller/index.html',{'thing': thing, 'thing_js': thing_js})

def eukleides(request):
    return render(request, 'plottercontroller/eukleides.html')

def postcard(request):
    return render(request, 'plottercontroller/postcard.html')
