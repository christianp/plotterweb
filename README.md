# plotterweb

This is a web-based controller for my pen plotter, an EleksDraw.

It uses vpype to read in SVG files and produce a load of line segments, then sends GCode to a plotter device connected on a serial port, which it tries to detect.

There are two processes that need to run: the web server, and the worker which talks to the plotter.

To run the web server:

```
python manage.py runserver
```

To run the worker:

```
python manage.py runworker plotter-manager
```
