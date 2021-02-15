"""
ASGI config for plotterweb project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from channels.routing import ProtocolTypeRouter
from django.core.asgi import get_asgi_application

import plottercontroller.routing
import plottercontroller.consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'plotterweb.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            plottercontroller.routing.websocket_urlpatterns
        )
    ),
    'channel': ChannelNameRouter({
        'plotter-manager': plottercontroller.consumers.PlotterControlConsumer.as_asgi(),
    })
})
