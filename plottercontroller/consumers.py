import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer, SyncConsumer, AsyncConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async

class PlotterSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            'plotter',
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            'plotter',
            self.channel_name
        )

    async def receive(self, text_data):
        d = json.loads(text_data)
        message = d['message']
        if message['type'] == 'draw':

            await self.channel_layer.send(
                'plotter-manager',
                {
                    'type': 'script',
                    'script': message,
                }
            )
        elif message['type'] == 'carryon':
            await self.channel_layer.send(
                'plotter-manager',
                {
                    'type': 'carryon',
                }
            )
        elif message['type'] == 'cancel':
            await self.channel_layer.send(
                'plotter-manager',
                {
                    'type': 'cancel',
                }
            )

    async def message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': event['message']
        }))

from serial.tools import list_ports
import serial
from gcodesender import GCodeSender
from svg2gcode import draw_svg
import xml.etree.ElementTree as ETree

class PlotterException(Exception):
    pass

class PlotterManager(object):
    plotter = None

    def __init__(self, channel_layer):
        self.channel_layer = channel_layer
        self.tasks = []
        self.task_pos = 0

    def get_plotter(self):
        if self.plotter is None:
            ports = list_ports.comports()
            if len(ports):
                port = ports[0]
                s = serial.Serial(port.device,115200, timeout=10)

                self.plotter = GCodeSender(s, flip_y = False)
            else:
                raise PlotterException("no plotter")
        return self.plotter

    async def run_script(self, script):
        try:
            plotter = self.get_plotter()
            async with plotter.script(progress_fn = self.report_progress):
                if script['format'] == 'gcode':
                    plotter.staged_script += script['content']
                elif script['format'] == 'svg':
                    self.svg(script['content'])
            self.task_pos = 0
            self.cancelling = False
            print(len(plotter.staged_script),'tasks')
            await self.run_task()
        except PlotterException as e:
            await self.report_error(e)

    async def run_task(self):
        try:
            plotter = self.get_plotter()
            if self.task_pos >= len(plotter.staged_script) or self.cancelling:
                if self.cancelling:
                    print("Cancelling!", plotter.current_pos)
                    await self.report_cancelled()
                else:
                    print("Finished")
                async with plotter.script():
                    plotter.current_pos = (1,1)
                    plotter.return_home()
                await plotter.run_script()
                return
            print("running line",self.task_pos)
            self.task_pos, reason = await self.plotter.run_script(startline=self.task_pos)
            await self.report_progress(self.task_pos/len(plotter.staged_script))

            if reason is not None:
                await self.channel_layer.group_send(
                    'plotter',
                    {
                        'type': 'message',
                        'message': {
                            'type': 'pause',
                            'message': str(reason),
                        }
                    }
                )
            else:
                await self.channel_layer.send(
                    'plotter-manager',
                    {
                        'type': 'carryon',
                    }
                )
        except PlotterException as e:
            await self.report_error(e)

    async def cancel(self):
        self.cancelling = True

    def svg(self, svg):
        try:
            plotter = self.get_plotter()
            draw_svg(plotter, svg)
        except Exception as e:
            self.report_error(e)

    async def report_progress(self,amount):
        await self.channel_layer.group_send(
            'plotter',
            {
                'type': 'message',
                'message': {
                    'progress': amount
                }
            }
        )

    async def report_error(self,e):
        await self.channel_layer.group_send(
            'plotter',
            {
                'type': 'message',
                'message': {
                    'type': 'error',
                    'error': str(e)
                }
            }
        )

    async def report_cancelled(self):
        await self.channel_layer.group_send(
            'plotter',
            {
                'type': 'message',
                'message': {
                    'type': 'cancelled',
                }
            }
        )


manager = PlotterManager(get_channel_layer('default'))

class PlotterControlConsumer(AsyncConsumer):

    async def script(self, data):
        print("got a script")
        script = data['script']

        await manager.run_script(script)

    async def carryon(self, data):
        await manager.run_task()

    async def cancel(self, data):
        await manager.cancel()
