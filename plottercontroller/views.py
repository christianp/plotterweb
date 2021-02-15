from django.conf import settings
from django.shortcuts import render
from django.templatetags.static import static
from django.template.loader import get_template, TemplateDoesNotExist
from django.views import generic
from django import http
from pathlib import Path

from .models import Drawing

def index(request):
    things = [f.stem for f in Path('plottercontroller/static/things').iterdir() if f.is_file]
    return render(request,'plottercontroller/index.html',{'things':things})

# Create your views here.
def thing(request,thing):
    thing_js = static(f'things/{thing}.js')
    try:
        template = get_template(f'plottercontroller/{thing}.html')
    except TemplateDoesNotExist:
        template = get_template('plottercontroller/thing.html')
    content = template.render({'thing': thing, 'thing_js': thing_js}, request)
    return http.HttpResponse(content)

def eukleides(request):
    return render(request, 'plottercontroller/eukleides.html')

def postcard(request):
    return render(request, 'plottercontroller/postcard.html',{'MY_ADDRESS': settings.POSTCARD_FROM_ADDRESS})

class DrawingsView(generic.ListView):
    model = Drawing
    template_name = 'plottercontroller/drawings.html'
