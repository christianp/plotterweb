from contextlib import asynccontextmanager
from datetime import datetime


RAPID_POSITION = 'G00'
LINEAR_MOVE = 'G01'
CIRCULAR_CLOCKWISE_MOVE = 'G02'
CIRCULAR_ANTICLOCKWISE_MOVE = 'G03'
PAUSE = 'G04'
SET_ORIGIN = 'G10'
USE_INCHES = 'G20'
USE_MM = 'G21'
RETURN_HOME = 'G28'
SERVO_CLOCKWISE_MOVE = 'M3'

class ScriptStage(object):
    reason = ''

    def __str__(self):
        return self.reason

class ChangePenStage(ScriptStage):
    def __init__(self,colour):
        self.reason = f'Change the pen to {colour}'
        self.colour = colour

class GCodeSender(object):

    transform_fn = lambda p: p
    # A transformation applied to all points

    speed = 2000
    # Default feed rate, in mm/minute
    
    RX_BUFFER_SIZE = 50
    # Size of the device's input buffer
    
    WAIT_TIME = 0.01
    
    PEN_UP_POSITION = 0
    PEN_DOWN_POSITION = 50

    MIN_MOVE = 0.1
    # Minimum distance to bother moving

    INTERRUPT_PERIOD = 1
    # The amount of time to spend running commands before interrupting and letting the rest of the event loop continue

    def __init__(self, device, flip_x = False, flip_y = False, flip_z = False, number_precision=3, immediate=False, debug=False):
        """
            Initialise a GCode sender.

            This sends GRBL-compatible commands by default, with the pen holder controlled by a servo.
            For other plotters, you should create a subclass of this and override the methods to produce different commands.
            
            Arguments:
                device: A pySerial Serial object
                flip_x: Should x coordinates be flipped? +x is mapped to -x
                flip_y: Should y coordinates be flipped? +y is mapped to -y
                flip_z: Should z coordinates be flipped? +z is mapped to -z
                number_precision: The number of decimal places to write numbers.
        """
        self.device = device
        self.flip_x = flip_x
        self.flip_y = flip_y
        self.flip_z = flip_z
        self.number_precision = number_precision
        
        #self.device.reset_input_buffer()
        
        self.staged_script = []
        
        self.immediate = immediate
        self.debug = debug

        self.current_pos = (0,0)
        
    def format_number(self, n):
        """
            Format a number for use in GCode.
            Rounds to `self.number_precision`.

            Argument:
                n - float

            Returns:
                string
        """

        return ('{:.' + str(self.number_precision) + 'f}').format(n)
    
    def format_coordinates(self, position, axes=('X','Y','Z')):
        """
            Format a set of 2D or 3D coordinates for GCode.

            Arguments:
                position - (float,float) or (float,float,float)
                axes - the names of the axes

            Returns
                list of strings
        """

        return [axis+self.format_number(n) for axis,n in zip(axes,position)]
    
    def transform_coordinates(self,coordinates):
        """
        Transform a pair of coordinates into the machine's coordinates.
        
        At the moment: apply flips.
        """
        return [-n if flip else n for n,flip in zip(self.transform_fn(coordinates), (self.flip_x, self.flip_y, self.flip_z))]

    def get_output(self):
        """
            Get a line of output from the plotter.

            Returns:
                string
        """

        out = ''
        while True:
            r = self.device.read_until()
            if r and r not in (b'\r\n',b'ok\r\n'):
                out += r.decode('ascii')
            else:
                break
        return out
    
    def send_command(self,command,arguments=[],immediate=False):
        """
        Send a command to the machine.
        
        Arguments:
            command: the g-code, for example 'G00'
            arguments: a list of string arguments.
            immediate: if true, run the command immediately. Otherwise, add it to the staged script.
        """
        
        
        line = ' '.join([command]+arguments)+'\n'
        if not immediate:
            self.staged_script.append(line)
        else:
            self.run_script([line])
        
    async def run_script(self,script=None, startline=0):
        """
            Run lines from the staged script until self.INTERRUPT_PERIOD seconds have elapsed, a `ScriptStage` object is reached, or the end of the script is reached.

            Arguments:
                script - a list of commands or `ScriptStage` objects
                startline - the index of the line to start from.

            Returns:
                (line, message) - the next line to evaluate, and a `ScriptStage` object or None
        """
        
        if script is None:
            script = self.staged_script

        if self.debug:
            print("running script")
            print(script)

        s = self.device
        
        if startline==0:
            s.reset_input_buffer()
            
            s.write(b'\r\n')
            s.readline()
        
        o = ''

        progress = 0

        t1 = datetime.now()

        i = 0

        for i,line in enumerate(script[startline:],startline):
            if isinstance(line,ScriptStage):
                return i+1, line
            # Send the command to the machine
            s.write(line.encode('ascii')) # Send g-code block to grbl
            oline = s.readline().decode('ascii').strip()
            o += oline
            t2 = datetime.now()
            if (t2-t1).total_seconds()> self.INTERRUPT_PERIOD:
                return i, None
        
        return i+1, None

    def before_script(self):
        """
            This is run by the `script` context manager before any other commands.
        """
        self.return_home()

    def after_script(self):
        """
            This is run by the `script` context manager at the end of the context.
        """
        self.return_home()
    
    @asynccontextmanager
    async def script(self,transform_fn=lambda p: p):
        """
            A context manager to stage a script for the plotter.

            Example:
                async with plotter.script():
                    plotter.move((0,0))
                    plotter.line((10,10))

            Argument:
                transform_fn - a function which applies a transformation to all points sent through the plotter.
        """
        try:
            self.transform_fn = transform_fn
            self.before_script()
            self.staged_script = []
            self.colour = None
            yield self
        finally:
            self.after_script()
            script = self.staged_script
    
    def move(self, position):
        """
            Move the pen up, then move the plotter to the given position, then move the pen down.
            Doesn't move if the distance from the current position is less than `self.MIN_MOVE`.

            Argument:
                position - (float,float)
        """
        x1,y1 = self.current_pos
        x2,y2 = position
        dx,dy = x2-x1,y2-y1
        d = dx*dx+dy*dy
        if d>self.MIN_MOVE**2:
            self.pen_up()
            self.send_command(RAPID_POSITION,self.format_coordinates(self.transform_coordinates(position)))
            self.pen_down()

        self.current_pos = position
    
    def line(self, position, speed=None):
        """
        Move to the given coordinates.
        
        Arguments:
            position: the coordinates to move to: a tuple of either two or three numbers.
            speed: optional speed to move, in mm/minute. If not given, the machine's most recent speed is used.
        """
        
        tposition = self.transform_coordinates(position)
        args = self.format_coordinates(tposition)
        
        if speed is None:
            speed = self.speed

        args.append('F'+self.format_number(speed))
            
        self.send_command(LINEAR_MOVE,args)

        self.current_pos = position
    
    def arcto(self, position, radius, speed=None, clockwise=True):
        """
            Draw a circular arc to the given position.

            Arguments:
                position - (float,float) - the position to move to.
                radius - float - the radius of the circle.
                speed - float - the speed to move, in mm/hour
                clockwise - if True, draw the clockwise arc between the two points, otherwise anti-clockwise.
        """
        tposition = self.transform_coordinates(position)
        
        if self.flip_x:
            clockwise = not clockwise
        if self.flip_y:
            clockwise = not clockwise
        
        args = self.format_coordinates(tposition)+['R'+self.format_number(radius)]
        
        command = CIRCULAR_CLOCKWISE_MOVE if clockwise else CIRCULAR_ANTICLOCKWISE_MOVE
        
        self.send_command(command, args)

        self.current_pos = position
    
    def move_pen(self,position):
        """
            Move the pen to the given position.

            Argument:
                position - float
        """
        self.send_command(SERVO_CLOCKWISE_MOVE,['S'+self.format_number(position)])
    
    def pen_up(self):
        """
            Move the pen up, to `self.PEN_UP_POSITION`.
        """
        self.move_pen(self.PEN_UP_POSITION)
    
    def pen_down(self):
        """
            Move the pen down, to `self.PEN_DOWN_POSITION`.
        """
        self.move_pen(self.PEN_DOWN_POSITION)
    
    def get_status(self):
        """
            Get the status output from the plotter.

            Returns:
                string
        """
        self.device.write(b'?')
        return self.get_output().strip()
    
    def return_home(self):
        """
            Move the pen up, then move the plotter to its home position. 
            Unless you change it, home is (0,0).
        """
        if self.current_pos != (0,0):
            self.pen_up()
            self.send_command(RETURN_HOME)

        self.current_pos = (0,0)

    def change_pen(self, colour):
        """
            Get the plotter ready to change pen: move the plotter to its home position, and keep the pen up.
            Adds a `ChangePenStage` line to the script.

            Argument:
                colour - the colour to change to.
        """
        if self.colour is not None and self.colour != colour:
            self.return_home()
            self.pen_up()
            self.staged_script.append(ChangePenStage(colour))
            self.move(self.current_pos)
        self.colour = colour
