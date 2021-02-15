from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('thing/<thing>/', views.thing, name='thing'),
    path('eukleides', views.eukleides, name='eukleides'),
    path('postcard', views.postcard, name='postcard'),
    path('drawings', views.DrawingsView.as_view(), name='drawings'),
]
