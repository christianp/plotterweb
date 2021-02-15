from channels_redis.core import RedisChannelLayer
from channels.layers import InMemoryChannelLayer, ChannelFull

import asyncio
import time
from copy import deepcopy
class Layer(InMemoryChannelLayer):
    async def send(self, channel, message):
        """
        Send a message onto a (general or specific) channel.
        """
        # Typecheck
        print("layer send",channel)
        assert isinstance(message, dict), "message is not a dict"
        assert self.valid_channel_name(channel), "Channel name not valid"
        # If it's a process-local channel, strip off local part and stick full
        # name in message
        assert "__asgi_channel__" not in message

        queue = self.channels.setdefault(channel, asyncio.Queue())
        # Are we full
        if queue.qsize() >= self.capacity:
            raise ChannelFull(channel)

        # Add message
        await queue.put((time.time() + self.expiry, deepcopy(message)))

    async def receive(self, channel):
        print("layer receive",channel)
        return await super().receive(channel)
