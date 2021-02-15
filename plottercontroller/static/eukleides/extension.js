Numbas.addExtension('eukleides',['math','jme','jme-display'], function(extension) {

    var euk = window.eukleides;
    var math = Numbas.math;
    var jme = Numbas.jme;
    var types = extension.types = {};

    /** Wrapper to convert Numbas vector (list of numbers) to Eukleides Vector object
     */
    function vec(vector) {
        return new euk.Vector(vector[0],vector[1]);
    }

    /** Wrapper to convert Eukleides Vector object to Numbas vector (list of numbers)
     */
    function unvec(vector) {
        return [vector.x,vector.y];
    }

    function registerType(constructor,name,casts,display) {
        jme.registerType(constructor,name,casts);
        if(display) {
            jme.display.registerType(constructor,display);
        } else {
            console.error("no display code for "+name);
        }
        types[name] = constructor;
    }


	var TAngle = function(angle) {
		this.value = angle;
	};
    registerType(
        TAngle,
        'eukleides_angle',
        {
            string: function(v) {
                return new TString(math.niceNumber(math.precround(math.degrees(v.value),2))+'°');
            }
        },
        {
            tex: function(thing,tok,texArgs,settings) {
                return settings.texNumber(tok.value,settings)+'°';
            },
            jme: function(tree,tok,bits,settings) {
                var deg = math.degrees(tok.value);
                if(Numbas.util.isInt(deg)) {
                    return 'deg('+settings.jmeNumber(deg,settings)+')';
                } else {
                    return 'rad('+settings.jmeNumber(tok.value,settings)+')';
                }
            },
            displayString: function(a) {
                return math.niceNumber(math.precround(math.degrees(a.value),2))+'°'.toString();
            }
        }
    );

	var TPoint = function(point) {
		this.value = point;
	};
    registerType(
        TPoint,
        'eukleides_point',
        {},
        {
            tex: function(thing,tok,texArgs,settings) {
                return '\\left( '+settings.jmeNumber(tok.value.x,settings)+', '+settings.jmeNumber(tok.value.y, settings)+' \\right)';
            },
            jme: function(tree,tok,bits,settings) {
                return 'point('+settings.jmeNumber(tok.value.x,settings)+', '+settings.jmeNumber(tok.value.y,settings)+')';
            },
            displayString: function(p) {
                return '('+math.niceNumber(p.value.x)+','+math.niceNumber(p.value.y)+')';
            }
        }
    );

	var TLine = function(line) {
		this.value = line;
	};
    registerType(
        TLine,
        'eukleides_line',
        {},
        {
            jme: function(tree,tok,bits,settings) {
                return 'line(point('+settings.jmeNumber(tok.value.x)+','+settings.jmeNumber(tok.value.y)+'),rad('+settings.jmeNumber(tok.value.a)+'))';
            }
        }
    );

	var TPointSet = function(point_set) {
		this.value = point_set;
	};
    registerType(
        TPointSet,
        'eukleides_point_set',
        {
            'list': function(s) {
                return new TList(s.value.points.map(function(p){return new TPoint(p)}));
            }
        },
        {
            tex: function(thing,tok,texArgs,settings) {
                return tok.value.points.map(function(p) { return Numbas.jme.display.texify({tok:new TPoint(p)}) }).join(' \\ldots ');
            },
            jme: function(tree,tok,bits,settings) {
                return tok.value.points.map(function(p) { return Numbas.jme.display.treeToJME({tok: new TPoint(p)}) }).join(' .. ');
            },
            displayString: function(l) {
                return tok.value.points.map(function(p) { return Numbas.jme.tokenToDisplayString(new TPoint(p)) }).join(' … ');
            }
        }
    );

	var TCircle = function(circle) {
		this.value = circle;
	};
    registerType(
        TCircle,
        'eukleides_circle',
        {},
        {
            jme: function(tree,tok,bits,settings) {
                return 'circle(point('+settings.jmeNumber(tok.value.x,settings)+','+settings.jmeNumber(tok.value.y,settings)+'),'+settings.jmeNumber(tok.value.r,settings)+')';
            }
        }
    );

	var TConic = function(conic) {
		this.value = conic;
	};
    registerType(
        TConic,
        'eukleides_conic',
        {},
        {
            jme: function(tree,tok,bits,settings) {
                var foci = tok.value.foci().map(function(p){ return Numbas.jme.display.treeToJME({tok:new TPoint(p)}) });
                return 'conic('+foci[0]+','+foci[1]+','+settings.jmeNumber(tok.value.a,settings)+')';
            }
        }
    );

	var TDrawing = function(objects,style) {
        this.value = {
            objects: objects || [],
            style: style || {}
        };
	};
    registerType(
        TDrawing,
        'eukleides_drawing',
        {},
        {}
    );

	var TAngleLabel = function(a,b,c) {
        this.a = a;
        this.b = b;
        this.c = c;
	};
    registerType(
        TAngleLabel,
        'eukleides_angle_label',
        {},
        {
            jme: function(tree,tok,bits,settings) {
                var points = [tok.a,tok.b,tok.c].map(function(p){ return Numbas.jme.display.treeToJME({tok: new TPoint(p)}) });
                return 'angle('+points.join(',')+')';
            },
        }
    );

    function drawing_visitor(fn) {
        function visit(drawer,drawing,ctx) {
            drawer.push_local_settings();
            Object.entries(drawing.style).forEach(function(d) {
                if(d[1]!==undefined) {
                    drawer.local[d[0]] = d[1];
                }
            });
            drawing.objects.forEach(function(obj) {
                fn(drawer,obj,ctx);
                switch(obj.type) {
                    case 'eukleides_drawing':
                        visit(drawer,obj.value,ctx);
                        break;
                    case 'list':
                        visit(drawer, {objects:obj.value, style:{}},ctx);
                        break;
                    default:
                }
            });
            drawer.pop_local_settings();
        }
        return visit;
    }

    var get_point_labels = drawing_visitor(function(drawer,obj) {
        switch(obj.type) {
            case 'eukleides_point':
                if(drawer.local.label) {
                    drawer.add_point_label(obj.value);
                }
                break;
        }
    });

    var draw_drawing = drawing_visitor(function(drawer,obj,ctx) {
        switch(obj.type) {
            case 'eukleides_point':
                if(drawer.local.label) {
                    drawer.label_point(obj.value);
                } else {
                    var point = drawer.draw_point(obj.value);
                    if(ctx && drawer.local.draggable) {
                        ctx.make_draggable(point, drawer.local.interactive_vars);
                    }
                }
                break;
            case 'eukleides_point_set':
                if(drawer.local.label) {
                    drawer.label_segment(obj.value.points[0],obj.value.points[1]);
                } else if(drawer.local.fill) {
                    drawer.fill_polygon(obj.value);
                } else {
                    drawer.draw_polygon(obj.value);
                }
                break;
            case 'eukleides_line':
                drawer.draw_line(obj.value);
                break;
            case 'eukleides_circle':
                if(drawer.local.fill) {
                    if(obj.from!==undefined) {
                        drawer.fill_arc(obj.value,obj.from,obj.to);
                    } else {
                        drawer.fill_circle(obj.value);
                    }
                } else {
                    if(obj.from!==undefined) {
                        drawer.draw_arc(obj.value,obj.from,obj.to)
                    } else {
                        drawer.draw_circle(obj.value);
                    }
                }
                break;
            case 'eukleides_conic':
                if(obj.from!==undefined) {
                    drawer.draw_conic_arc(obj.value,obj.from,obj.to)
                } else {
                    drawer.draw_conic(obj.value);
                }
                break;
            case 'eukleides_angle_label':
                drawer.label_angle(obj.a,obj.b,obj.c);
                break;
            case 'eukleides_drawing':
            case 'list':
                break;
            default:
                throw(new Numbas.Error('Eukleides trying to draw unknown object type: '+obj.type));
        }
    });

    var translate_types = {
        'eukleides_point': function(p,u) {
            return new TPoint(p.value.translate(u));
        },
        'eukleides_line': function(line,u) {
            return new TLine(line.value.translate(u));
        },
        'eukleides_point_set': function(set,u) {
            return new TPointSet(set.value.translate(u));
        },
        'eukleides_circle': function(circle,u) {
            var c2 = new TCircle(circle.value.translate(u));
            c2.from = circle.from;
            c2.to = circle.to;
            return c2;
        },
        'eukleides_conic': function(conic,u) {
            return new TConic(conic.value.translate(u));
        },
        'eukleides_drawing': function(drawing,u) {
            return new TDrawing(drawing.value.objects.map(function(x){return translate_object(x,u)}),drawing.value.style);
        },
        'eukleides_angle_label': function(l,u) {
            return new TAngleLabel(l.a.translate(u), l.b.translate(u), l.c.translate(u));
        },
        'list': function(list,u) {
            return new TList(list.value.map(function(x){return translate_object(x,u)}));
        }
    };

    function translate_object(x,v) {
        return translate_types[x.type](x,v);
    }

	var funcObj = Numbas.jme.funcObj;
	var TString = Numbas.jme.types.TString;
	var TNum = Numbas.jme.types.TNum;
    var TInt = Numbas.jme.types.TInt;
	var TList = Numbas.jme.types.TList;
    var TDict = Numbas.jme.types.TDict;
	var TBool = Numbas.jme.types.TBool;
	var TVector = Numbas.jme.types.TVector;
	var TRange = Numbas.jme.types.TRange;
    var THTML = Numbas.jme.types.THTML;

    var sig = Numbas.jme.signature;
    function named(s,name) {
        s.param_name = name;
        return s;
    }
    function spoint(name) {
        var s = sig.type('eukleides_point');
        s.param_name = name;
        return s;
    }
    function sangle(name) {
        var s = sig.type('eukleides_angle');
        s.param_name = name;
        return s;
    }
    function snum(name) {
        var s = sig.type('number');
        s.param_name = name;
        return s;
    }
    function snumorangle(name_num,name_angle) {
        return sig.optional(sig.or(snum(name_num),sangle(name_angle)));
    }
    var sig_eukleides = sig.or.apply(sig,['eukleides_angle','eukleides_point','eukleides_point_set','eukleides_line','eukleides_circle','eukleides_conic','eukleides_angle_label','eukleides_angle','eukleides_drawing'].map(sig.type));

    function sig_drawing_of(sig) {

        var f = function(args) {
            if(args.length==0) {
                return false;
            }
            var d = args[0];
            if(d.type!='eukleides_drawing') {
                return false;
            }
            var items = sig(d.value.objects);
            if(items===false || items.length != d.value.objects.length) {
                return false;
            } else {
                return [{type:'eukleides_drawing', items: items}];
            }
        }
        f.kind = 'eukleides_drawing';
        f.signature = sig;
        return f;
    }

    extension.scope.setVariable('origin',new TPoint(new euk.Point(0,0)));

    extension.scope.addFunction(new funcObj('degrees',[TAngle],TNum,function(v){return math.degrees(v)},
    {description: 'Convert an angle to a number of degrees.'}));

    var sig_translatable = sig.or.apply(sig,Object.keys(translate_types).map(sig.type));
    extension.scope.addFunction(new funcObj('+',[sig_translatable,TVector],'?',null,{
        evaluate: function(args,scope) {
            var x = args[0];
            var v = vec(args[1].value);
            return translate_object(x,v);
        },
        description: 'Translate an object or list of objects by the given vector.'
    }));
    extension.scope.addFunction(new funcObj('-',[sig_translatable,TVector],'?',null,{
        evaluate: function(args,scope) {
            var x = args[0];
            var v = vec(Numbas.vectormath.negate(args[1].value));
            return translate_object(x,v);
        },
        description: 'Translate an object or list of objects by the opposite of the given vector.'
    }));

    extension.scope.addFunction(new funcObj('sin',[TAngle],TNum,math.sin),
    {description: 'Sine'});
    extension.scope.addFunction(new funcObj('cos',[TAngle],TNum,math.cos),
    {description: 'Cosine'});
    extension.scope.addFunction(new funcObj('tan',[TAngle],TNum,math.tan),
    {description: 'Tangent'});
    extension.scope.addFunction(new funcObj('cosec',[TAngle],TNum,math.cosec),
    {description: 'Cosecant'});
    extension.scope.addFunction(new funcObj('sec',[TAngle],TNum,math.sec),
    {description: 'Secant'});
    extension.scope.addFunction(new funcObj('cot',[TAngle],TNum,math.cot),
    {description: 'Tangent'});

    extension.scope.addFunction(new funcObj('+',[TAngle,TAngle],TAngle,math.add,
    {description: 'Add two angles.'}));
    extension.scope.addFunction(new funcObj('-u',[TAngle],TAngle,math.negate,
    {description: 'Flip the direction of the given angle.'}));
    extension.scope.addFunction(new funcObj('-',[TAngle,TAngle],TAngle,math.sub,
    {description: 'Subtract two angles.'}));
    extension.scope.addFunction(new funcObj('*',[TNum,TAngle],TAngle,math.mul,
    {description: 'Multiply an angle by the given scale factor.'}));
    extension.scope.addFunction(new funcObj('*',[TAngle,TNum],TAngle,math.mul,
    {description: 'Multiply an angle by the given scale factor.'}));
    extension.scope.addFunction(new funcObj('/',[TAngle,TNum],TAngle,math.div,
    {description: 'Divide an angle by the given scale factor.'}));

    extension.scope.addFunction(new funcObj('deg',[TNum],TAngle,function(degrees) {
        var rad = math.radians(degrees);
        return rad;
    },{description: 'Construct an angle in degrees.'}));

    extension.scope.addFunction(new funcObj('rad',[TNum],TAngle,function(radians) {
        return radians;
    },{description: 'Construct an angle in radians.'}));

    extension.scope.addFunction(new funcObj('point',[TNum,TNum],TPoint,function(x,y) {
        return new euk.Point(x,y);
    },{description: 'A point at the given coordinates.'}));

    extension.scope.addFunction(new funcObj('point',[TNum,TAngle],TPoint,function(r,a) {
        return euk.Point.create_polar(r,a);
    },{description: 'A point at the given polar coordinates.'}));

    extension.scope.addFunction(new funcObj('point',[TPointSet,TNum],TPoint,function(set,t) {
        return euk.Point.create_point_on_segment(set,t);
    },{description: 'A point along the first edge of the given polygon.'}));

    extension.scope.addFunction(new funcObj('point',[TLine,TNum],TPoint,function(line,t) {
        return euk.Point.create_point_on_line(line,t);
    },{description:'A point on the given line, the given distance away from its origin.'}));

    extension.scope.addFunction(new funcObj('point_with_abscissa',[TLine,TNum],TPoint,function(line,x) {
        return euk.Point.create_point_with_abscissa(line,x);
    },{description:'A point on the given line with the given abscissa, with respect to the implicit coordinate system.'}));

    extension.scope.addFunction(new funcObj('point_with_ordinate',[TLine,TNum],TPoint,function(line,y) {
        return euk.Point.create_point_with_ordinate(line,y);
    },{description:'A point on the given line with the given ordinate, with respect to the implicit coordinate system.'}));

    extension.scope.addFunction(new funcObj('point',[TCircle,TAngle],TPoint,function(circle,a) {
        return euk.Point.create_point_on_circle(circle,a);
    },{description:'A point on the given circle at the given angle.'}));

    extension.scope.addFunction(new funcObj('list',[TPointSet],TList,function(ps){
        return ps.points.map(function(p){return new TPoint(p)});
    },{description: 'Convert a set of points to a list of points.'}));

    extension.scope.addFunction(new funcObj('midpoint',[TPointSet],TPoint,function(set) {
        return euk.Point.create_midpoint(set);
    },{description:'The midpoint of the given segment.'}));

    extension.scope.addFunction(new funcObj('barycenter',[TPointSet,TList],TPoint,function(points,weights) {
        return euk.Point.create_barycenter(points,weights);
    },{unwrapValues: true, description:'The barycenter of the given polygon.'}));

    extension.scope.addFunction(new funcObj('orthocenter',[TPoint,TPoint,TPoint],TPoint,function(A,B,C) {
        return euk.Point.create_orthocenter(A,B,C);
    },{description:'The orthocenter of the given triangle.'}));

    extension.scope.addFunction(new funcObj('reflect',[TPoint,TLine],TPoint,function(p,l) {
        return p.reflect(l);
    },{description:'Reflect a point in a line.'}));

    extension.scope.addFunction(new funcObj('symmetric',[TPoint,TPoint],TPoint,function(p,origin) {
        return p.symmetric(origin);
    },{description:'180° rotation of the first point around the second.'}));

    extension.scope.addFunction(new funcObj('rotate',[TPoint,TPoint,TAngle],TPoint,function(p,origin,angle) {
        return p.rotate(angle,origin);
    },{description:'Rotate the first point the given angle around the second.'}));

    extension.scope.addFunction(new funcObj('distance',[TPoint,TPoint],TNum,function(a,b) {
        return a.distance(b);
    },{description:'Distance between two points.'}));

    extension.scope.addFunction(new funcObj('homothetic',[TPoint,TPoint,TNum],TPoint,function(p,origin,k) {
        return p.homothetic(origin,k);
    },{description:'Homothecy (reduction or dilation) of the first point with respect to the second, and the given scale.'}));

    extension.scope.addFunction(new funcObj('x',[TPoint],TNum,function(p) {
        return p.abscissa();
    },{description:'x coordinate of a point.'}));

    extension.scope.addFunction(new funcObj('y',[TPoint],TNum,function(p) {
        return p.ordinate();
    },{description:'y coordinate of a point.'}));

    extension.scope.addFunction(new funcObj('-',[TPoint,TPoint],TVector,function(a,b) {
        return unvec(euk.Vector.create_from_points(b,a));
    },{description:'Vector from the second point\'s position to the first\'s.'}));

    extension.scope.addFunction(new funcObj('vector',[TPointSet],TVector,function(set) {
        return unvec(euk.Vector.create_from_segment(set));
    },{description:'Vector from the first point of the polygon to the second.'}));

    extension.scope.addFunction(new funcObj('vector',[TLine],TVector,function(line) {
        return unvec(euk.Vector.create_from_line(line));
    },{description:'Unit vector in the direction of the given line.'}));

    extension.scope.addFunction(new funcObj('rotate',[TVector,TAngle],TVector,function(v,a) {
        return unvec(vec(c).rotate(a));
    },{description:'Rotate a vector by the given angle.'}));

    extension.scope.addFunction(new funcObj('argument',[TVector],TAngle,function(v) {
        return vec(v).argument();
    },{description:'Direction of the given vector.'}));

    extension.scope.addFunction(new funcObj('angle_between',[TVector,TVector],TAngle,function(u,v) {
        return euk.Vector.angle_between(vec(u),vec(v));
    },{description:'Angle between two vectors.'}));

    extension.scope.addFunction(new funcObj('line',[TPoint,TAngle],TLine,function(origin,angle) {
        return new euk.Line(origin.x,origin.y,angle);
    },{description:'A line with the given origin and direction.'}));

    extension.scope.addFunction(new funcObj('line',[TPoint,TPoint],TLine,function(A,B) {
        return euk.Line.create_with_points(A,B);
    },{description:'A line containing the two given points.'}));

    extension.scope.addFunction(new funcObj('line',[TPoint,TVector],TLine,function(origin,u) {
        return euk.Line.create_with_vector(origin,vec(u));
    },{description:'A line with the given origin and direction vector.'}));

    extension.scope.addFunction(new funcObj('line',[TPointSet],TLine,function(set) {
        return euk.Line.create_with_segment(set);
    },{description:'A line containing the given segment.'}));

    extension.scope.addFunction(new funcObj('parallel',[TLine,TPoint],TLine,function(line,p) {
        return line.parallel(p);
    },{description:'A line parallel to the given line and containing the given point.'}));

    extension.scope.addFunction(new funcObj('parallel',[TPointSet,TPoint],TLine,function(set,p) {
        return euk.Line.create_parallel_to_segment(set,p);
    },{description:'A line parallel to the given segment and containing the given point.'}));

    extension.scope.addFunction(new funcObj('perpendicular',[TLine,TPoint],TLine,function(line,p) {
        return line.perpendicular(p);
    },{description:'A line perpendicular to the given line and containing the given point.'}));

    extension.scope.addFunction(new funcObj('bisector',[TPoint,TPoint,TPoint],TLine,function(A,B,C) {
        return euk.Line.create_angle_bisector(A,B,C);
    },{description:'The bisector of the angle formed by the given points, and containing the second.'}));

    extension.scope.addFunction(new funcObj('bisector',[TLine,TLine],TLine,function(l1,l2) {
        return euk.Line.create_lines_bisector(l1,l2);
    },{description:'The bisector of the two given lines.'}));

    extension.scope.addFunction(new funcObj('altitude',[TPoint,TPoint,TPoint],TLine,function(A,B,C) {
        return euk.Line.create_altitude(A,B,C);
    },{description:'The line containing the first point and perpendicular to the segment between the second and third.'}));

    extension.scope.addFunction(new funcObj('median',[TPoint,TPoint,TPoint],TLine,function(A,B,C) {
        return euk.Line.create_median(A,B,C);
    },{description:'The line containing the first point and passing through the midpoint of the segment between the second and third.'}));

    extension.scope.addFunction(new funcObj('reflect',[TLine,TPoint],TLine,function(line,p) {
        return line.reflect(p);
    },{description:'Reflect a line in a point.'}));

    extension.scope.addFunction(new funcObj('symmetric',[TLine,TPoint],TLine,function(line,p) {
        return line.symmetric(p);
    },{description:'180° degree rotation of a line around the given point.'}));

    extension.scope.addFunction(new funcObj('rotate',[TLine,TPoint,TAngle],TLine,function(line,origin,angle) {
        return line.rotate(origin,angle);
    },{description:'Rotate a line by the given angle around the given point.'}));

    extension.scope.addFunction(new funcObj('homothetic',[TLine,TPoint,TNum],TLine,function(line,origin,k) {
        return line.homothetic(origin,k);
    },{description:'Homothecy (reduction or dilation) of a line with respect to the given point and scale factor.'}));

    extension.scope.addFunction(new funcObj('argument',[TLine],TAngle,function(line) {
        return line.argument();
    },{description:'Direction angle of the given line.'}));

    extension.scope.addFunction(new funcObj('distance',[TLine,TPoint],TNum,function(l,p) {
        return euk.point_line_distance(p,l);
    },{description:'Distance between the given line and point.'}));

    extension.scope.addFunction(new funcObj('distance',[TPoint,TLine],TNum,function(p,l) {
        return euk.point_line_distance(p,l);
    },{description:'Distance between the given point and line.'}));

    extension.scope.addFunction(new funcObj('..',[TPoint,TPoint],TPointSet,function(a,b) {
        return new euk.Set([a,b]);
    },{description:'A segment between two points.'}));

    extension.scope.addFunction(new funcObj('..',[TPointSet,TPoint],TPointSet,function(set,p) {
        return set.add_tail_point(p);
    },{description:'Add a point to the end of a polygon.'}));

    extension.scope.addFunction(new funcObj('..',[TPoint,TPointSet],TPointSet,function(p,set) {
        return set.add_head_point(p);
    },{description:'Add a point to the start of a polygon.'}));

    extension.scope.addFunction(new funcObj('polygon',[sig.listof(sig.type('eukleides_point'))],TPointSet,function(points) {
        return new TPointSet(new euk.Set(points));
    },{unwrapValues: true, description:'Construct a polygon from the given list of points.'}))

    extension.scope.addFunction(new funcObj('polygon',[TNum,TPoint,TNum,TAngle],TPointSet,function(n,origin,r,a) {
        return euk.Set.create_polygon(n,origin,r,a);
    },{description:'A regular polygon with the given number of sides and circumradius, with center at the given point and rotated by the given angle.'}));

    extension.scope.addFunction(new funcObj('segment',[TPointSet,TPoint],TPointSet,function(set,p) {
        return set.segment(p);
    },{description:'A segment from the first point of the given polygon to the given point.'}));

    extension.scope.addFunction(new funcObj('..',[TPointSet,TPointSet],TPointSet,function(a,b) {
        return a.concatenate(b);
    },{description:'Concatenate two polygons.'}));

    extension.scope.addFunction(new funcObj('..',[named(sig.type('eukleides_point'),'p1'),named(sig_drawing_of(sig.type('eukleides_point')),'p2')],TDrawing,null,{
        evaluate: function(args,scope) {
            var p1 = args[0].value;
            var d = args[1].value;
            var p2 = d.objects[0].value;
            return new TDrawing([new TPointSet(new euk.Set([p1,p2]))],d.style);
        },
        description: 'A segment between two points.'
    }));

    extension.scope.addFunction(new funcObj('..',[named(sig.type('eukleides_point_set'),'set'),named(sig_drawing_of(sig.type('eukleides_point')),'p')],TDrawing,null,{
        evaluate: function(args,scope) {
            var s = args[0].value;
            var d = args[1].value;
            var p = d.objects[0].value;
            return new TDrawing([new TPointSet(s.add_tail_point(p))],d.style);
        },
        description: 'Add a point to the end of a polygon.'
    }));

    extension.scope.addFunction(new funcObj('..',[named(sig.type('eukleides_point'),'p'),named(sig_drawing_of(sig.type('eukleides_point_set')),'set')],TDrawing,null,{
        evaluate: function(args,scope) {
            var p = args[0].value;
            var d = args[1].value;
            var s = d.objects[0].value;
            return new TDrawing([new TPointSet(s.add_head_point(p))],d.style);
        },
        description: 'Add a point to the start of a polygon.'
    }));

    extension.scope.addFunction(new funcObj('reflect',[TPointSet,TLine],TPointSet,function(set,line) {
        return set.reflect(line);
    },{description:'Reflect a polygon in the given point.'}));

    extension.scope.addFunction(new funcObj('symmetric',[TPointSet,TPoint],TPointSet,function(set,p) {
        return set.symmetric(p);
    },{description:'180° degree rotation of the given polygon around the given point.'}));

    extension.scope.addFunction(new funcObj('rotate',[TPointSet,TPoint,TAngle],TPointSet,function(set,origin,a) {
        return set.rotate(origin,a);
    },{description:'Rotation of a polygon by the given angle around the given point.'}));

    extension.scope.addFunction(new funcObj('cardinality',[TPointSet],TNum,function(set) {
        return set.cardinal();
    },{description:'Number of vertices in the given polygon.'}));

    extension.scope.addFunction(new funcObj('perimeter',[TPointSet],TNum,function(set) {
        return set.path_length();
    },{description:'Total length of the given polygon\'s edges.'}));

    extension.scope.addFunction(new funcObj('area',[TPointSet],TNum,function(set) {
        return set.area();
    },{description:'Area of the given polygon.'}));

    extension.scope.addFunction(new funcObj('perpendicular',[TPointSet,TPoint],TLine,function(set,p) {
        return set.perpendicular_to_segment(p);
    },{description:'A line perpendicular to the given segment and containing the given point.'}));

    extension.scope.addFunction(new funcObj('perpendicular_bisector',[TPointSet],TLine,function(set) {
        return set.perpendicular_bisector();
    },{description:'The perpendicular bisector of the given segment.'}));

    extension.scope.addFunction(new funcObj('center',[TPointSet],TPoint,function(set) {
        return set.isobarycenter();
    },{description:'The isobarycenter (centre of gravity) of the given polygon.'}));

    extension.scope.addFunction(new funcObj('isobarycenter',[TPointSet],TPoint,function(set) {
        return set.isobarycenter();
    },{description:'The isobarycenter (centre of gravity) of the given polygon.'}));

    extension.scope.addFunction(new funcObj('circle',[TPoint,TNum],TCircle,function(center,r) {
        return new euk.Circle(center,r);
    },{description:'A circle centered at the given point and with the given radius.'}));

    extension.scope.addFunction(new funcObj('circle',[TPointSet],TCircle,function(set) {
        return euk.Circle.create_circle_with_diameter(set);
    },{description:'The circle with the given segment as a diameter.'}));

    extension.scope.addFunction(new funcObj('circle',[TPoint,TPoint,TPoint],TCircle,function(A,B,C) {
        return euk.Circle.create_circumcircle(A,B,C);
    },{description:'The circle through the given points.'}));

    extension.scope.addFunction(new funcObj('incircle',[TPoint,TPoint,TPoint],TCircle,function(A,B,C) {
        return euk.Circle.create_incircle(A,B,C);
    },{description:'The circle inscribed in the triangle defined by the given points.'}));

    extension.scope.addFunction(new funcObj('center',[TCircle],TPoint,function(circle) {
        return circle.center();
    },{description:'The center of the given circle.'}));

    extension.scope.addFunction(new funcObj('tangent',[TCircle,TAngle],TLine,function(circle,a) {
        return circle.tangent(a);
    },{description:'A line tangent to the given circle at the given heading.'}));

    extension.scope.addFunction(new funcObj('arc',[TCircle,TAngle,TAngle],TCircle,function(circle,from,to) {
        var c = new TCircle(circle);
        c.from = from;
        c.to = to;
        return c;
    },{unwrapValues:true, description: 'An arc of the given circle between the given angles.'}));

    extension.scope.addFunction(new funcObj('ellipse',[TPoint,TNum,TNum,TAngle],TConic,function(v,a,b,d) {
        return new euk.Ellipse(v,a,b,d);
    },{description:'An ellipse with the given center, major and minor axis, and rotated by the given angle.'}));

    extension.scope.addFunction(new funcObj('hyperbola',[TPoint,TNum,TNum,TAngle],TConic,function(v,x,y,a) {
        return new euk.Hyperbola(v,x,y,a);
    },{description:'A hyperbola with the given center, real and imaginary axis, and rotated by the given angle.'}));

    extension.scope.addFunction(new funcObj('parabola',[TPoint,TNum,TAngle],TConic,function(v,a,d) {
        return new euk.Parabola(v,a,d);
    },{description:'A parabola with the given summit and parameter, rotated by the given angle.'}));

    extension.scope.addFunction(new funcObj('parabola',[TPoint,TLine],TConic,function(A,l) {
        return euk.Conic.create_with_directrix(A,l,1);
    },{description:'A parabola with the given focus and directrix.'}));

    extension.scope.addFunction(new funcObj('conic',[TPoint,TLine,TNum],TConic,function(A,l,x) {
        return euk.Conic.create_with_directrix(A,l,x);
    },{description:'A conic with the given focus, directrix and eccentricity.'}));

    extension.scope.addFunction(new funcObj('conic',[TPoint,TPoint,TNum],TConic,function(A,B,a) {
        return euk.Conic.create_with_foci(A,B,a);
    },{description:'A conic with the given foci and eccentricity.'}));

    extension.scope.addFunction(new funcObj('center',[TConic],TPoint,function(conic) {
        return conic.center();
    },{description:'The center of the given conic.'}));

    extension.scope.addFunction(new funcObj('foci',[TConic],TList,function(conic) {
        return conic.foci();
    },{unwrapValues:true, description: 'The foci of the given conic.'}));

    extension.scope.addFunction(new funcObj('reflect',[TConic,TLine],TConic,function(conic,line) {
        return conic.reflect(line);
    },{description:'Reflect a conic in a line.'}));

    extension.scope.addFunction(new funcObj('symmetric',[TConic,TPoint],TConic,function(conic,p) {
        return conic.symmetric(p);
    },{description:'180° rotation of the given conic around the given point.'}));

    extension.scope.addFunction(new funcObj('rotate',[TConic,TPoint,TAngle],TConic,function(conic,origin,a) {
        return conic.rotate(origin,a);
    },{description:'Rotate a conic by the given angle around the given point.'}));

    extension.scope.addFunction(new funcObj('homothetic',[TConic,TPoint,TNum],TConic,function(conic,origin,k) {
        return conic.homothetic(origin,k);
    },{description:'Homothecy (reduction or dilation) of a conic with respect to the given point and scaling factor.'}));

    extension.scope.addFunction(new funcObj('major',[TConic],TNum,function(conic) {
        return conic.major_axis();
    },{description:'The major axis of the given conic.'}));

    extension.scope.addFunction(new funcObj('minor',[TConic],TNum,function(conic) {
        return conic.minor_axis();
    },{description:'The minor axis of the given conic.'}));

    extension.scope.addFunction(new funcObj('argument',[TConic],TAngle,function(conic) {
        return conic.argument();
    },{description:'The direction of the given conic.'}));

    extension.scope.addFunction(new funcObj('point',[TConic,TNum],TPoint,function(conic,t) {
        return conic.point_on(t);
    },{description:'A point with the given argument on the given conic.'}));

    extension.scope.addFunction(new funcObj('eccentricity',[TConic],TNum,function(conic) {
        return conic.eccentricity();
    },{description:'The eccentricity of the given conic.'}));

    extension.scope.addFunction(new funcObj('argument',[TConic,TPoint],TAngle,function(conic,p) {
        return conic.point_argument(p);
    },{description:'Polar angle of the given point with respect to the center of the given conic.'}));

    extension.scope.addFunction(new funcObj('tangent',[TConic,TNum],TLine,function(conic,t) {
        return conic.tangent(t);
    },{description:'A line tangent to the given conic at the given argument.'}));

    extension.scope.addFunction(new funcObj('arc',[TConic,TAngle,TAngle],TConic,function(conic,from,to) {
        var c = new TConic(conic);
        c.from = from;
        c.to = to;
        return c;
    },{unwrapValues:true, description: 'The portion of the given conic between the given arguments.'}));

    function wrap_vertices(vertices) {
        return new TList(vertices.map(function(v){ return new TPoint(v); }));
    }

    var sig_triangle = sig.or(
        sig.sequence(spoint('p1'), spoint('p2'), snumorangle('l2','a2')),
        sig.sequence(spoint('p1'), sig.optional(sig.sequence(snum('l1'), sig.optional(snumorangle('l2','a2')))), sig.optional(sangle('orientation'))),
        sig.sequence(sig.optional(sig.sequence(snum('l1'), sig.optional(sig.sequence(snumorangle('l2','a2'), snumorangle('l3','a3'))))), sig.optional(sangle('orientation')))
    );

    function remove_undefined(args) {
        return args.filter(function(a) { return a.type!='nothing'; });
    }

    extension.scope.addFunction(new funcObj('triangle',[sig_triangle],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var x,s1,s2,a = 0;
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2) {
                if(i>=args.length) {
                    x = 6;
                } else {
                    x = args[i].value;
                    i += 1;
                }
            }
            // can optionally give the two remaining lengths or angles
            if(i<args.length-1) {
                s1 = args[i];
                s2 = args[i+1];
                i += 2;
            }
            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            var out;
            if(s1===undefined) {
                out = euk.TriangleMaker.define_optimal_scalene(vertices,x,a);
            } else if(s1.type=='number' && s2.type=='number') {
                out = euk.TriangleMaker.define_triangle_SSS(vertices,x,s1.value,s2.value,a);
            } else if(s1.type=='eukleides_angle' && s2.type=='eukleides_angle') {
                out = euk.TriangleMaker.define_triangle_SAA(vertices,x,s1.value,s2.value,a);
            } else if(s1.type=='eukleides_angle' && s2.type=='number') {
                out = euk.TriangleMaker.define_triangle_SAS(vertices,x,s1.value,s2.value,a);
            } else if(s1.type=='number' && s2.type=='eukleides_angle') {
                out = euk.TriangleMaker.define_triangle_SSA(vertices,x,s1.value,s2.value,a);
            }
            return wrap_vertices(out);
        },
        description:'Create a triangle from the given parameters. Can give up to two vertices; any remaining lengths or angles; and the orientation of the first side if fewer than two vertices given.'
    }));

    var sig_right = sig.or(
        sig.sequence(spoint('p1'), spoint('p2'), snumorangle('l2','a1'), sig.optional(sangle('orientation'))),
        sig.sequence(sig.optional(spoint('p1')), sig.optional(spoint('p2')), sig.optional(
            sig.sequence(snum('l1'), snumorangle('l2','a1'), sig.optional(sangle('orientation')))
        ))
    );
    extension.scope.addFunction(new funcObj('right',[sig_right],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var x,s,a = 0;
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2) {
                x = args[i].value;
                i += 1;
            }

            // must give one other length or angle
            var s = args[i];
            i += 1;

            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            
            var out;
            if(s.type=='number') {
                out = euk.TriangleMaker.define_right_SS(vertices,x,s.value,a);
            } else {
                out = euk.TriangleMaker.define_right_SA(vertices,x,s.value,a);
            }
            return wrap_vertices(out);
        },
        description:'Create a right-angled triangle from the given parameters. Can give up to two vertices; one other length or angle; and the orientation of the first side if fewer than two vertices given.'
    }));

    var sig_isosceles = sig.or(
        sig.sequence(spoint('p1'), spoint('p1'), sig.or(snum('l2'),sangle('a1'))),
        sig.sequence(sig.optional(spoint('p1')), sig.optional(spoint('p2')), sig.optional(
            sig.sequence(snum('l1'), sig.or(snum('l2'),sangle('a1')), sig.optional(sangle('orientation')))
        ))
    );
    extension.scope.addFunction(new funcObj('isosceles',[sig_isosceles],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var x,s,a = 0;
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2) {
                if(i==args.length) {
                    x = 6;
                } else {
                    x = args[i].value;
                    i += 1;
                }
            }

            // must give one other length or angle
            if(i==args.length) {
                s = new TAngle(Numbas.math.radians(39));
            } else {
                s = args[i];
                i += 1;
            }

            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            
            var out;
            if(s.type=='number') {
                out = euk.TriangleMaker.define_isosceles_SS(vertices,x,s.value,a);
            } else {
                out = euk.TriangleMaker.define_isosceles_SA(vertices,x,s.value,a);
            }
            return wrap_vertices(out);
        },
        description:'Create an isosceles triangle from the given points. Can give up to two vertices; one other length or angle; and the orientation of the first side if fewer than two vertices given.'
    }));

    var sig_equilateral = sig.or(
        sig.sequence(spoint('p1'), spoint('p2')),
        sig.sequence(sig.optional(spoint('p1')), snum('l1'), sig.optional(sangle('orientation')))
    );
    extension.scope.addFunction(new funcObj('equilateral',[sig_equilateral],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var x, a = 0;
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2) {
                x = args[i].value;
                i += 1;
            }

            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            
            var out = euk.TriangleMaker.define_equilateral(vertices,x,a);
            return wrap_vertices(out);
        },
        description:'Create an equilateral triangle from the given points. Can give up two two vertices; if fewer than two vertices are given must give the length of the first side and optionally the orientation of the first side.'
    }));

    var sig_parallelogram = sig.or(
        sig.sequence(spoint('p1'), spoint('p2'), spoint('p3')),
        sig.sequence(spoint('p1'), spoint('p2'), sig.optional(sig.sequence(snum('l2'), sangle('a1')))),
        sig.sequence(sig.optional(spoint('p1')), sig.optional(sig.sequence(snum('l1'), snum('l2'), sangle('a1'), sig.optional(sangle('orientation')))))
    );
    extension.scope.addFunction(new funcObj('parallelogram',[sig_parallelogram],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to three vertices
            for(var i=0;i<3 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            if(vertices.length==3) {
                return wrap_vertices(euk.QuadrilateralMaker.define_parallelogram_SSA(vertices));
            }
            var num_vertices = vertices.length;
            var s1 = 5, s2 = 4, an = Math.PI*5/12, a = 0;
            if(i<args.length) {
                // length of first side must be given if fewer than two vertices given
                if(num_vertices<2) {
                    s1 = args[i].value;
                    i += 1;
                }
                // must give one more side and an angle
                s2 = args[i].value;
                an = args[i+1].value;
                i += 2;
                // can optionally give the orientation of the first side if fewer than two vertices given
                if(num_vertices<2 && i<args.length) {
                    a = args[i].value;
                }
            }
            return wrap_vertices(euk.QuadrilateralMaker.define_parallelogram_SSA(vertices,s2,an,s1,a));
        },
        description:'Create a parallelogram from the given points. Can give up to three vertices. If fewer than two vertices given, must give the length of the first side, one more side and an angle, and optionally the orientation of the first side.'
    }));

    var sig_rectangle = sig.or(
        sig.sequence(spoint('p1'), spoint('p2'), sig.optional(snum('l2'))),
        sig.sequence(sig.optional(spoint('p1')), sig.optional(sig.sequence(snum('l1'), snum('l2'), sig.optional(sangle('orientation')))))
    );
    extension.scope.addFunction(new funcObj('rectangle',[sig_rectangle],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var s1 = 6, s2 = 6*2/(1+Math.sqrt(5)), a = 0;
            if(i==args.length) {
                return wrap_vertices(euk.QuadrilateralMaker.define_rectangle(vertices,s1,s2,a));
            }
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2) {
                s1 = args[i].value;
                i += 1;
            }
            // must give one more side
            s2 = args[i].value;
            i += 1;
            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            return wrap_vertices(euk.QuadrilateralMaker.define_rectangle(vertices,s1,s2,a));
        },
        description:'Create a rectangle from the given points. Can give up to two vertices. If fewer than two vertices given, must give the length of the first side. Must give the length of one more side and optionally the orientation of the first side.'
    }));

    var sig_square = sig.or(
        sig.sequence(spoint('p1'), spoint('p2')),
        sig.sequence(sig.optional(spoint('p1')), sig.optional(sig.sequence(snum('l'), sig.optional(sangle('orientation')))))
    );
    extension.scope.addFunction(new funcObj('square',[sig_square],TList,null,{
        evaluate: function(args,scope) {
            args = remove_undefined(args);
            var vertices = [];
            // can give up to two vertices
            for(var i=0;i<2 && i<args.length && args[i].type=='eukleides_point';i++) {
                vertices.push(args[i].value);
            }
            var num_vertices = vertices.length;
            var s = 4, a = 0;
            // length of first side must be given if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                s = args[i].value;
                i += 1;
            }
            // can optionally give the orientation of the first side if fewer than two vertices given
            if(num_vertices<2 && i<args.length) {
                a = args[i].value;
            }
            return wrap_vertices(euk.QuadrilateralMaker.define_square(vertices,s,a));
        },
        description:'Create a square from the given points. Can give up to two vertices. If fewer than two vertices given, must give the length of the first side and can optionally give the orientation of the first side.'
    }));

    extension.scope.addFunction(new funcObj('projection',[TPoint,TLine],TPoint,function(A,l) {
        return euk.orthogonal_projection(A,l);
    },{description:'The projection of point A onto line l.'}));

    extension.scope.addFunction(new funcObj('projection',[TPoint,TLine,TLine],TPoint,function(A,l1,l2) {
        return euk.parallel_projection(A,l1,l2);
    },{description:'The projection of point A in the direction of line l2 onto line l1.'}));

    extension.scope.addFunction(new funcObj('intersection',[TLine,TLine],TPoint,function(l1,l2) {
        return euk.lines_intersection(l1,l2);
    },{description:'The intersection point of two lines.'}));

    extension.scope.addFunction(new funcObj('intersection',[TLine,TPointSet],TPointSet,function(l,set) {
        return euk.line_set_intersection(l,set);
    },{description:'All points at which the line intersects the perimeter of the given point set.'}));

    extension.scope.addFunction(new funcObj('intersection',[TLine,TCircle],TPointSet,function(l,c) {
        return euk.line_circle_intersection(l,c);
    },{description:'All points at which the line intersects the given circle.'}));

    extension.scope.addFunction(new funcObj('intersection',[TLine,TConic],TPointSet,function(l,c) {
        return euk.line_conic_intersection(l,c);
    },{description:'All points at which the tline intersects the given conic.'}));

    extension.scope.addFunction(new funcObj('intersection',[TPointSet,TPointSet],TPointSet,function(s1,s2) {
        return euk.sets_intersection(s1,s2);
    },{description:'All points at which the perimeters of the two point sets intersect.'}));

    extension.scope.addFunction(new funcObj('intersection',[TCircle,TCircle],TPointSet,function(c1,c2) {
        return euk.circles_intersection(c1,c2);
    },{description:'The points of intersection of the two circles.'}));

    extension.scope.addFunction(new funcObj('intersection',[TPointSet,TCircle],TPointSet,function(s,c) {
        return euk.circle_set_intersection(s,c);
    },{description:'All points of intersection of the perimeter of the point set with the given circle.'}));

    var style_commands = {
        'dot': {shape:'dot'},
        'disc': {shape:'disc'},
        'box': {shape:'box'},
        'plus': {shape: 'plus'},
        'cross': {shape: 'cross', label_segment: 'cross'},
        'closed': {close: true},
        'open': {close: false},
        'filled': {fill: true},
        'simple': {label_segment: 'simple', angle: 'simple', label:true},
        'double': {label_segment: 'double', angle: 'double', label:true},
        'triple': {label_segment: 'triple', angle: 'triple', label:true},
        'full': {style: 'full'},
        'dotted': {style: 'dotted', dec: 'dotted'},
        'dashed': {style: 'dashed', dec: 'dashed'},
        'entire': {part: 'entire'},
        'half': {part: 'half'},
        'right': {dir: 'right', angle: 'right'},
        'forth': {dir: 'forth', angle: 'forth'},
        'back': {dir: 'back', angle: 'back'},
        'noarrow': {arrow: 'none'},
        'arrow': {arrow: 'arrow'},
        'arrows': {arrow: 'arrows'},
        'transparent': {opacity: 0.5},
        'bold': {bold: true},
        'italic': {italic: true},
        'verbose': {aria_mode: 'verbose'},
        'nospoilers': {aria_mode: 'nospoilers'}
    }

    var colors = ['black','darkgray','gray','lightgray','white'];
    colors.forEach(function(color) {
        style_commands[color] = {color: color}
    });

    var default_color_scheme = euk.colorbrewer['Trubetskoy'][6];
    default_color_scheme.forEach(function(color,i) {
        style_commands['color'+(i+1)] = {color: color, color_description: 'color '+(i+1)};
    });

    Object.entries(style_commands).forEach(function(e) {
        var name = e[0];
        var style = e[1];
        extension.scope.setVariable(name,new TDrawing([],style));
    })

    extension.scope.addFunction(new funcObj('draggable',[sig.optional(sig.type('string')),sig.optional(sig.listof(sig.type('string')))],TDrawing,function(key,names) {
        return new TDrawing([],{draggable:true, key: key, color: 'blue',size:1.5, interactive_vars: names});
    }, {unwrapValues: true, description:'Make a point draggable.'}));

    extension.scope.addFunction(new funcObj('label',[sig.optional(sig.or(sig.type('string'),sig.type('number'))),sig.optional(sig.type('eukleides_angle')),sig.optional(sig.type('number'))],TDrawing,function(text,angle,dist) {
        return new TDrawing([],{label:true, label_text: text, label_direction: angle, label_dist: dist});
    }, {unwrapValues: true, description:'Label a point, segment or angle.'}));

    extension.scope.addFunction(new funcObj('description',[TString],TDrawing,function(description) {
        return new TDrawing([],{description: description});
    },{unwrapValues: true, description:'Set the accessible description for the object being drawn.'}));

    extension.scope.addFunction(new funcObj('text',[TString],TDrawing,function(text) {
        return new TDrawing([],{label:true, label_text: text, label_dist: 0});
    }, {unwrapValues: true, description:'Draw text at a point.'}));

    extension.scope.addFunction(new funcObj('angle',[TPoint,TPoint,TPoint],TAngleLabel,function(a,b,c) {
        return new TAngleLabel(a,b,c);
    },{unwrapValues: true, description:'Draw an angle label.'}));

    extension.scope.addFunction(new funcObj('size',[TNum],TDrawing,function(size) {
        return new TDrawing([],{size:size});
    }, {unwrapValues: true, description:'Set the size and stroke width.'}));

    extension.scope.addFunction(new funcObj('font',[TString],TDrawing,function(font) {
        return new TDrawing([],{font_family:font});
    }, {unwrapValues: true, description:'Set the font.'}));

    extension.scope.addFunction(new funcObj('color',[TString],TDrawing,function(color) {
        return new TDrawing([],{color:color});
    }, {unwrapValues: true, description:'Set the fill or stroke colour.'}));

    function get_color_schemes(n,kind) {
        var schemes = euk.color_schemes(Math.max(n,3),kind);
        if(schemes.length<1) {
            throw(new Error("No appropriate colour scheme could be found."));
        }
        schemes = schemes.map(function(scheme) {
            return new TList(scheme.slice(0,n).map(function(color,i) {
                return new TDrawing([],{color:color, color_description: 'color '+(i+1)});
            }));
        })
        return schemes;
    }
    function get_color_scheme(n,kind) {
        return get_color_schemes(n,kind)[0];
    }

    extension.scope.addFunction(new funcObj('sequential_color_schemes',[TInt],TList, function(n) {
        return new TList(get_color_schemes(n,'seq'));
    }, {unwrapValues: true, description: 'Get a list of colour schemes for a sequential data set.'}));

    extension.scope.addFunction(new funcObj('divergent_color_schemes',[TInt],TList, function(n) {
        return new TList(get_color_schemes(n,'div'));
    }, {unwrapValues: true, description: 'Get a list of colour schemes for a divergent data set.'}));

    extension.scope.addFunction(new funcObj('qualitative_color_schemes',[TInt],TList, function(n) {
        return new TList(get_color_schemes(n,'qual'));
    }, {unwrapValues: true, description: 'Get a list of colour schemes for a qualitative data set.'}));

    extension.scope.addFunction(new funcObj('sequential_color_scheme',[TInt],TList, function(n) {
        return get_color_scheme(n,'seq');
    }, {unwrapValues: true, description: 'Get a list of colours for a sequential data set.'}));

    extension.scope.addFunction(new funcObj('divergent_color_scheme',[TInt],TList, function(n) {
        return get_color_scheme(n,'div');
    }, {unwrapValues: true, description: 'Get a list of colours for a divergent data set.'}));

    extension.scope.addFunction(new funcObj('qualitative_color_scheme',[TInt],TList, function(n) {
        return get_color_scheme(n,'qual');
    }, {unwrapValues: true, description: 'Get a list of colours for a qualitative data set.'}));

    extension.scope.addFunction(new funcObj('opacity',[TNum],TDrawing,function(opacity) {
        return new TDrawing([],{opacity:opacity});
    }, {unwrapValues: true, description:'Set the opacity. 0 is invisible and 1 is solid.'}));

    extension.scope.addFunction(new funcObj('hsl',[TNum,TNum,TNum],TDrawing,function(h,s,l) {
        return new TDrawing([],{color:'hsl('+h+','+(100*s)+'%,'+(100*l)+'%)'});
    }, {unwrapValues: true, description:'Set the colour, in HSL format. H is between 0 and 360; S and L are between 0 and 1.'}));

    extension.scope.addFunction(new funcObj('hsla',[TNum,TNum,TNum,TNum],TDrawing,function(h,s,l,a) {
        return new TDrawing([],{color:'hsla('+h+','+(100*s)+'%,'+(100*l)+'%,'+a+')'});
    }, {unwrapValues: true, description:'Set the colour, in HSLA format. H is between 0 and 360, S, L and A are between 0 and 1.'}));

    extension.scope.addFunction(new funcObj('rgb',[TNum,TNum,TNum],TDrawing,function(r,g,b) {
        return new TDrawing([],{color:'rgb('+r+','+g+','+b+')'});
    }, {unwrapValues: true, description:'Set the colour, in RGB format. R, G and B are between 0 and 255.'}));

    extension.scope.addFunction(new funcObj('rgba',[TNum,TNum,TNum,TNum],TDrawing,function(r,g,b,a) {
        return new TDrawing([],{color:'rgb('+r+','+g+','+b+','+a+')'});
    }, {unwrapValues: true, description:'Set the colour, in RGBA format. R,G and B are between 0 and 255; A is between 0 and 1.'}));

    extension.scope.addFunction(new funcObj('*',[TDrawing,TDrawing],TDrawing,function(d1,d2) {
        var objects = d1.objects.concat(d2.objects);
        var style = Numbas.util.extend_object({},d1.style,d2.style);
        return new TDrawing(objects,style);
    }, {unwrapValues: true, description:'Combine two drawings.'}));

    extension.scope.addFunction(new funcObj('*',[named(sig.type('eukleides_point_set'),'set'),named(sig.type('eukleides_drawing'),'drawing')],TDrawing,null,{
        evaluate: function(args,scope) {
            var object = args[0];
            var d = args[1].value;
            var nobjects = d.objects.concat([object]);
            return new TDrawing(nobjects, d.style);
        },
        description:'Add a drawing modifier to a set of points.'
    }));

    extension.scope.addFunction(new funcObj('*',[named(sig.type('list'),'list'),named(sig.type('eukleides_drawing'),'drawing')],TDrawing,null,{
        evaluate: function(args,scope) {
            var objects = args[0].value;
            var d = args[1].value;
            var nobjects = d.objects.concat(objects);
            return new TDrawing(nobjects, d.style);
        },
        description:'Add a drawing modifier to a list of objects.'
    }));

    extension.scope.addFunction(new funcObj('group',[sig.multiple(sig.or(sig_eukleides,sig.type('list')))],TDrawing,null,{
        evaluate: function(args,scope) {
            return new TDrawing(args,{});
        },
        description:'Group objects as a drawing.'
    }));

    extension.scope.addFunction(new funcObj('*',['?',TDrawing],TDrawing,null,{
        evaluate: function(args,scope) {
            var object = args[0];
            var d = args[1].value;
            var nobjects = d.objects.concat([object]);
            return new TDrawing(nobjects, d.style);
        },
        description:'Add a drawing modifier to an object.'
    }));

    var svg_acc = 0;
    function create_svg() {
        var id = 'eukleides-diagram-'+(svg_acc++)+'-';
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('role','img');
        var title = document.createElementNS('http://www.w3.org/2000/svg','title');
        title.setAttribute('id',id+'title');
        svg.appendChild(title);
        return svg;
    }

    function find_bounding_box(svg) {
        document.body.appendChild(svg);
        var svg_rect = svg.getBoundingClientRect();
        var min_x = Infinity, min_y = Infinity, max_x = -Infinity, max_y = -Infinity;
        var children = Array.prototype.slice.apply(svg.children);
        children.forEach(function(c) {
            try {
                if(!c.getBBox) {
                    return;
                }
                var r = c.getBBox();
                var m = c.getCTM();
            } catch(e) {
                return;
            }

            /* Text elements are scaled (1,-1) to get them the right way up, since
             * the global coords are flipped so positive y is up.
             * getBBox doesn't apply the transformation, even though it should,
             * so we have to flip the y coordinate manually
             */
            var y = c.tagName!='text' ? r.y : -(r.y+r.height);  

            min_x = Math.min(min_x, r.x);
            min_y = Math.min(min_y, y);
            max_x = Math.max(max_x, r.x+r.width);
            max_y = Math.max(max_y, y+r.height);
        });
        if(children.length==0) {
            min_x = 0;
            max_x = 1;
            min_y = 0;
            max_y = 1;
        }

        var w = (max_x-min_x)*1.1;
        var h = (max_y-min_y)*1.1;
        var cx = (max_x+min_x)/2;
        var cy = (max_y+min_y)/2;
        min_x = cx - w/2;
        min_y = cy - h/2;
        max_x = cx + w/2;
        max_y = cy + h/2;

        document.body.removeChild(svg);
        
        return {min_x: min_x, min_y: min_y, max_x: max_x, max_y: max_y};
    }

    function InteractiveContext(drawer,title_tree,objects,scope,initial_values) {
        var ctx = this;
        
        this.drawer = drawer;
        this.title_tree = title_tree;
        this.objects = objects;
        this.scope = scope;
        this.elements = {};

        this.mousex = 0;
        this.mousey = 0;
        this.animating = false;

        this.start_time = new Date();

        var all_free_vars = jme.findvars(objects);
        var animates = all_free_vars.contains('time');
        var takes_input = all_free_vars.find(function(n){return ['mousex','mousey'].contains(n)})!==undefined;

        this.free_vars = jme.findvars(objects,['time','mousex','mousey'].concat(Object.keys(ctx.scope.allVariables())));
        this.optimise_names = {};
        initial_values = initial_values || {};
        this.values = [];
        this.free_vars.forEach(function(n) {
            if(initial_values[n]) {
                ctx.values.push(jme.unwrapValue(initial_values[n]));
            } else {
                ctx.values.push(0);
            }
        });
        this.initial_values = this.values.slice();

        function frame() {
            if(ctx.animating) {
                ctx.draw();
            }
            if(animates) {
                requestAnimationFrame(frame);
            }
        }
        if(animates) {
            drawer.svg.addEventListener('mouseover',function(e) {
                ctx.animating = animates;
            });
            drawer.svg.addEventListener('mouseout',function(e) {
                ctx.animating = false;
            });
        }
        if(takes_input) {
            drawer.svg.addEventListener('mousemove',function(e) {
                var r = ctx.drawer.svg.getBoundingClientRect();
                ctx.mousex = (e.clientX-r.x)/r.width*(ctx.drawer.max_x-ctx.drawer.min_x) + ctx.drawer.min_x;
                ctx.mousey = (e.clientY-r.y)/r.height*(ctx.drawer.min_y-ctx.drawer.max_y) + ctx.drawer.max_y;
                requestAnimationFrame(frame);
            });
        }
        drawer.svg.addEventListener('dblclick',function(e) {
            e.preventDefault();
            ctx.values = ctx.initial_values.slice();
            ctx.draw();
        });
        this.draw();
        if(animates) {
            frame();
        }

        var shadow_svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        this.optimisation_drawer = new euk.SVGDrawer(shadow_svg,document);
    }
    InteractiveContext.prototype = {
        redraw: function(drawer,vars) {
            var ctx = this;
            var wrapped_vars = {};
            drawer.before_render();
            Object.entries(vars).forEach(function(d) {
                wrapped_vars[d[0]] = jme.wrapValue(d[1]);
            });
            var title = ctx.scope.evaluate(ctx.title_tree).value;
            var title_el = drawer.svg.querySelector('title');
            if(title_el) {
                title_el.textContent = title;
            }
            var drawing = new TDrawing([ctx.scope.evaluate(ctx.objects,wrapped_vars)]);
            get_point_labels(drawer,drawing.value);
            draw_drawing(drawer,drawing.value,ctx);
            drawer.after_render();
        },

        draw: function() {
            this.redraw(this.drawer,this.make_values(this.values));
        },

        make_values: function(values) {
            var now = new Date();
            var time = (now - this.start_time)/1000;

            var vars = {
                time: time,
                mousex: this.mousex,
                mousey: this.mousey
            };
            this.free_vars.forEach(function(n,i){
                vars[n] = values[i];
            });
            return vars;
        },

        optimisation_redraw: function(values) {
            this.redraw(this.optimisation_drawer,this.make_values(values));
            return this.optimisation_drawer.elements;
        },

        make_draggable: function(element, optimise_names) {
            var ctx = this;
            var id = element.getAttribute('data-eukleides-id');
            optimise_names = optimise_names || ctx.free_vars;
            optimise_names = optimise_names.filter(function(n){ return ctx.free_vars.contains(n)});
            ctx.optimise_names[id] = optimise_names;
            if(this.elements[id]) {
                return;
            }
            this.elements[id] = element;
            element.setAttribute('tabindex',"1");
            function get_position(elements) {
                var element = elements[id];
                var cx = parseFloat(element.getAttribute('cx'));
                var cy = parseFloat(element.getAttribute('cy'));
                return {x:cx,y:cy};
            }
            var last_good_values = null;
            function onstart() {
                var initial = get_position(ctx.elements);
                function ondrag(dx,dy) {
                    function fill_remaining_values(vs) {
                        var values = ctx.values.slice();
                        ctx.optimise_names[id].forEach(function(n,i) {
                            var j = ctx.free_vars.indexOf(n);
                            values[j] = vs[i];
                        });
                        return values;
                    };
                    function cost(values) {
                        var elements = ctx.optimisation_redraw(fill_remaining_values(values));
                        var npos = get_position(elements);
                        var delta_x = npos.x-(initial.x+dx);
                        var delta_y = npos.y-(initial.y+dy);
                        var c = delta_x*delta_x + delta_y*delta_y;
                        return c;
                    }
                    function grad(values) {
                        return euk.gradient(cost,values);
                    }
                    function gradZero(values) {
                        return grad(values).every(function(x){return x==0});
                    }
                    var values = ctx.optimise_names[id].map(function(n) {
                        var i = ctx.free_vars.indexOf(n);
                        return ctx.values[i];
                    });
                    var low_precision = true;
                    if(gradZero(values)) {
                        if(last_good_values) {
                            values = last_good_values;
                        } else {
                            values = ctx.initial_values;
                        }
                        low_precision = false;
                    }
                    var nvalues = fill_remaining_values(euk.minimize(cost,values,low_precision).solution);
                    if(gradZero(nvalues)) {
                        values.forEach(function(v,i) {
                            nvalues[i] = euk.findPhaseChange(function(v){
                                var mock = nvalues.slice();
                                mock[i] = v;
                                return grad(mock)[i]==0;
                            },nvalues[i],values[i]);
                        });
                    } else {
                        last_good_values = nvalues;
                    }
                    ctx.values = nvalues;
                    ctx.draw();
                }
                return ondrag;
            }
            ctx.drawer.handle_dragging(element,onstart);
        }
    }

    var sig_draw_eukleides = sig.sequence(
        sig.type('string'),
        sig.optional(sig.sequence(sig.type('number'),sig.type('number'),sig.type('number'),sig.type('number'))),
        sig.or(sig_eukleides,sig.type('list')),
        sig.optional(sig.type('dict'))
    );
    extension.scope.addFunction(new funcObj('eukleides',[sig_draw_eukleides],THTML,null,{
        evaluate: function(args,scope) {
            var objects;
            var title_tree = args[0];
            var min_x,min_y,max_x,max_y,initial_values;
            if(args.length<=3) {
                objects = args[1];
                if(args[2]) {
                    initial_values = scope.evaluate(args[2]);
                    if(initial_values.type!='dict') {
                        throw(new Numbas.Error("The final argument to <code>eukleides</code> must be a dictionary, not "+initial_values.type));
                    }
                    initial_values = initial_values.value;
                }
            } else {
                min_x = scope.evaluate(args[1]).value;
                min_y = scope.evaluate(args[2]).value;
                max_x = scope.evaluate(args[3]).value;
                max_y = scope.evaluate(args[4]).value;
                objects = args[5];
                if(args[6]) {
                    initial_values = scope.evaluate(args[6]);
                    if(initial_values.type!='dict') {
                        throw(new Numbas.Error("The final argument to <code>eukleides</code> must be a dictionary, not "+initial_values.type));
                    }
                    initial_values = initial_values.value;
                }
            }
            var svg = create_svg();
            var drawer = new euk.SVGDrawer(svg,document);

            if(min_x!==undefined) {
                drawer.setup_frame(min_x,min_y,max_x,max_y,1);
            }

            var ctx = new InteractiveContext(drawer,title_tree,objects,scope,initial_values,min_x===undefined);

            if(min_x===undefined) {
                var res = find_bounding_box(svg);
                drawer.setup_frame(res.min_x,res.min_y,res.max_x,res.max_y,1);
                ctx.draw();
            }

            return new THTML(svg);
        },
        description:'Draw a Eukleides diagram.'
    }));
    jme.lazyOps.push('eukleides');
    jme.findvarsOps.eukleides = function(tree,boundvars,scope) {
        var vars = [];
        var initial_values;
        var args = tree.args;
        if(args.length<=3) {
            initial_values = args[2];
        } else {
            for(var i=1;i<5;i++) {
                vars = vars.concat(jme.findvars(args[i],boundvars,scope));
            }
            initial_values = args[6];
        }
        if(initial_values) {
            vars = vars.concat(jme.findvars(initial_values,boundvars,scope));
        }
        return vars;
    }
});
