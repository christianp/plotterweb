from svgelements import SVGElement
from io import StringIO
import vpype
import vpype_cli
from itertools import cycle
from math import sqrt

def path_filter(result, path):
    """
        Filter paths produced by vpype when reading an SVG file.
        Replaces paths with a 'stroke-dasharray' attribute with the corresponding dashes.
    """
    if isinstance(path,list):
        for s in path:
            if isinstance(s,SVGElement):
                path = s
                break
    stroke_dash = path.values.get('stroke-dasharray')
    if stroke_dash is not None and stroke_dash != 'none':
        try:
            pattern = [float(x) for x in stroke_dash.split(' ')]
        except ValueError:
            raise Exception("Invalid stroke-dasharray parameter: "+stroke_dash)
            
        segs = []
        for seg in result:
            segs += dottedpolyline(seg,pattern)
        return segs
    return result

def dottedline(p1,p2,pattern,offset=0):
    """
        Replace a line segment with dashes, following the given pattern.

        Arguments:
            p1 - the start of the line
            p2 - the end of the line
            pattern - a list of dash lengths, alternating drawn and not-drawn.
            offset - the offset in the pattern to start from.

        Returns:
            (offset, segments)
            offset - the position in the pattern of the end of the line
            segments - pairs of points (p1,p2)
    """
    x1,y1 = p1.real, p1.imag
    x2,y2 = p2.real, p2.imag
    dx,dy = x2-x1, y2-y1
    d = sqrt(dx*dx+dy*dy)
    dx /= d
    dy /= d
    dashes = []
    offset = offset % sum(pattern)
    on = True
    t = -offset
    d += offset
    for i,dash in cycle(enumerate(pattern)):
        dt = min(d,dash)
        if t+dash>=0:
            if on:
                t1 = max(0,t)
                t2 = t+dt
                p1 = (x1+t1*dx) + (y1+t1*dy)*1j
                p2 = (x1+t2*dx) + (y1+t2*dy)*1j
                dashes.append((p1,p2))
        t += dt
        offset = max(0,offset-dt)
        d -= dt
        if d<=0:
            break
        on = not on
    return sum(pattern[:i])+dt, dashes

def dottedpolyline(points,pattern,offset=0):
    """
        Replace a list of line segments with dashes, following the given pattern.

        Arguments:
            points - a list of complex values (.real corresponds to x, .imag corresponds to y)
            pattern - a list of dash lengths, alternating drawn and not-drawn.
            offset - the offset in the pattern to start from.

        Generates:
            line segments - pairs of points (p1,p2)
    """
            
    for p1,p2 in zip(points,points[1:]):
        offset,segments = dottedline(p1,p2,pattern,offset)
        yield from segments

def vpype_svg(svgcode):
    """ 
    Run an SVG drawing through vpype.

    Arguments:
        svgcode - a string containing an SVG diagram.

    Returns:
        A string containing the processed SVG diagram.
    """

    doc = vpype.read_multilayer_svg(StringIO(svgcode), quantization=0.1, path_filter=path_filter, crop=True)
    doc = vpype_cli.execute('linemerge linesort', document = doc)

    return doc

def im_to_tuple(z):
    """
        Convert a complex number to a pair of floats.
    """
    return (z.real, z.imag)

def paths_to_plotter(plotter, doc):
    """
    Send paths to a plotter.

    Arguments:
        plotter - A GCodeSender object

        paths - An iterable of svgelements.Path objects
    """

    for i,layer in doc.layers.items():
        stroke = doc.layer_id_stroke(i)
        plotter.change_pen(stroke)
        print(i,layer)
        for line in layer:
            plotter.move(im_to_tuple(line[0]))
            for p in line[1:]:
                plotter.line(im_to_tuple(p))

def draw_svg(plotter, svgcode):
    """
        Draw an SVG file on the plotter.

        Arguments:
            plotter - a GCodeSender object.
            svgcode - a string containing the SVG document
    """
    doc = vpype_svg(svgcode)
    paths_to_plotter(plotter, doc)

def show_svg(svgcode):
    doc = vpype_svg(svgcode)
    s = StringIO('')
    vpype.write_svg(s,doc)
    s.seek(0)
    return s.read()
