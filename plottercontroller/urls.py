from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('eukleides', views.eukleides, name='eukleides'),
    path('postcard', views.postcard, name='postcard'),
]
