const {cos, sin, tan, acos, atan, atan2, PI, sqrt, abs, ceil, floor, max, min} = Math;

const EPSILON = 1e-12;

function dpformat(n,dp=2) {
    const s = n.toFixed(dp);
    return s.replace(/\.?0*$/,'');
}

function ZERO(n) {
    return abs(n)<EPSILON;
}

function EQL(x,y) {
    return abs(x-y)<EPSILON;
}

function RTOD(x) {
    return 180*x/PI;
}
function hypot(x,y) {
    return sqrt(x*x+y*y);
}
function argument(A,B) {
    return atan2(B.y-A.y, B.x-A.x);
}

function principal(an) {
    return an-360*ceil(an/360-0.5);
}

function det2(a,b,c,d) {
    return a*d-b*c;
}

function det3(a,b,c,d,e,f,g,h,i) {
    return a*det2(e,f,h,i) - d*det2(b,c,h,i) + g*det2(b,c,e,f);
}

function parametric_ellipse(t,x0,y0,a,b,c,s) {
    const u = a*cos(t);
    const v = b*sin(t);
    const x = x0 + c*u - s*v;
    const y = y0 + s*u + c*v;
    return [x,y];
}

function parametric_hyperbola(t,x0,y0,a,b,c,s) {
    const u = a/sin(t);
    const v = b/tan(t);
    const x = x0 + c*u - s*v;
    const y = y0 + s*u + c*v;
    return [x,y];
}

function parametric_parabola(t,x0,y0,p,c,s) {
    const q = cos(t);
    const r = -p/(1+q);
    const u = r*q;
    const v = r*sin(t);
    const x = x0 + c*u - s*v;
    const y = y0 + s*u + c*v;
    return [x,y];
}

function cosine(a,b,c) {
    return (b*b+c*c-a*a)/(2*b*c);
}

function tangent(x) {
    return sqrt(1-x*x)/x;
}

class Obj {
}

class Point extends Obj {
    constructor(x,y) {
        super();
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${dpformat(this.x)},${dpformat(this.y)})`;
    }

    static create_polar(r,a) {
        return new Point(r*cos(a), r*sin(a)); 
    }

    static create_point_on_segment(set,t) {
        const [A,B] = set;
        const x = A.x + t*(B.x-A.x);
        const y = A.y + t*(B.y-A.y);
        return new Point(x,y);
    }

    static create_point_on_line(l,t) {
        const x = l.x + t*cos(l.a);
        const y = l.y + t*sin(l.a);
        return new Point(x,y);
    }

    static create_point_with_abscissa(l,x) {
        const c = cos(l.a);
        if(ZERO(c)) {
            throw(new Error("invalid line"));
        }
        return new Point(x,l.y+(x-l.a)*sin(l.a)/c);
    }

    static create_point_with_ordinate(l,y) {
        const s = sin(l.a);
        if(ZERO(s)) {
            throw(new Error("invalid line"));
        }
        return new Point(l.x+(y-l.y)*cos(l.a)/s,y);
    }

    static create_point_on_circle(c,a) {
        return new Point(c.x+c.r*cos(a), c.y+c.r*sin(a));
    }

    static create_midpoint(set) {
        const [A,B] = set.points;
        return new Point((A.x+B.x)/2, (A.y+B.y)/2);
    }

    static create_barycenter(points,weights) {
        let x = 0;
        let y = 0;
        let s = 0;
        for(let i=0;i<points.length;i++) {
            const c = weights[i];
            const p = points[i];
            x += c*p.x;
            y += c*p.y;
            s += c;
        }
        return new Point(x/s, y/s);
    }

    static create_orthocenter(A,B,C) {
        const a = B.distance(C);
        const b = A.distance(C);
        const c = A.distance(B);

        if(ZERO(a) || ZERO(b) || ZERO(c)) {
            throw(new Error("invalid triangle"));
        }

        let ca = cosine(a,b,c);
        let cb = cosine(b,c,a);
        let cc = cosine(c,a,b);

        if(ca==0) {
            ca = 1;
            cb = 0;
            cc = 0;
        } else if(cb==0) {
            ca = 0;
            cb = 1;
            cc = 0;
        } else if(cc==0) {
            ca = 0;
            cb = 0;
            cc = 1;
        } else {
            ca = tangent(ca);
            cb = tangent(cb);
            cc = tangent(cc);
        }
        const d = ca+cb+cc;
        return new Point(
            (ca*A.x + cb*B.x + cc*C.x)/d,
            (ca*A.y + cb*B.y + cc*C.y)/d
        );
    }

    translate(u) {
        return new Point(this.x+u.x, this.y+u.y);
    }

    reflect(l) {
        const c = cos(l.a);
        const s = sin(l.a);

        const x = this.x - l.x;
        const y = this.y - l.y;
        const p = 2*(c*x+s*y);
        return new Point(l.x+p*c-x, l.y+p*s-y);
    }

    symmetric(O) {
        return new Point(2*O.x - this.x, 2*O.y - this.y);
    }

    rotate(a,O) {
        const c = cos(a);
        const s = sin(a);
        const x = this.x - O.x;
        const y = this.y - O.y;
        return new Point(O.x + c*x - s*y, O.y + s*x + c*y);
    }

    distance(B) {
        const dx = this.x - B.x;
        const dy = this.y - B.y;
        return sqrt(dx*dx+dy*dy);
    }

    homothetic(O,k) {
        return new Point(O.x + k*(A.x-O.x), O.y + k*(A.y-O.y));
    }

    abscissa() {
        return this.x;
    }

    ordinate() {
        return this.y;
    }
}

class Vector extends Object {
    constructor(x,y) {
        super();
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${dpformat(this.x)},${dpformat(this.y)})`;
    }

    static create_polar(r,a) {
        return new Vector(r*cos(a), r*sin(a));
    }

    static create_from_points(A,B) {
        return new Vector(B.x-A.x, B.y-A.y);
    }

    static create_from_segment(set) {
        const [A,B] = set;
        return new Vector(B.x-A.x, B.y-A.y);
    }

    static create_from_line(l) {
        return new Vector(cos(l.a), sin(l.a));
    }

    add(v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtract(v) {
        return new Vector(this.x-v.x, this.y-v.y);
    }

    reverse() {
        return new Vector(-this.x, -this.y);
    }

    multiply(k) {
        return new Vector(k*this.x, k*this.y);
    }

    divide(k) {
        return new Vector(this.x/k, this.y/k);
    }

    rotate(a) {
        const c = cos(a);
        const s = sin(a);
        return new Vector(c*this.x - s*this.y, s*this.x + c*this.y);
    }

    abscissa() {
        return this.x;
    }

    ordinate() {
        return this.y;
    }

    length() {
        return hypot(this.x,this.y);
    }

    argument() {
        return atan2(this.y,this.x);
    }

    static angle_between(u,v) {
        return (u.x*v.y > u.y*v.x ? 1 : -1) * acos( Vector.scalar_product(u,v)/(u.length()*v.length()) );
    }

    static scalar_product(u,v) {
        return u.x*v.x + u.y*v.y;
    }
}

class Line extends Object {
    constructor(x,y,a) {
        super();
        this.x = x;
        this.y = y;
        this.a = a;
        this.defined_by = {kind:'heading',through:new Point(x,y), heading: a};
    }
    static create_with_points(A,B) {
        if(EQL(A.x,B.x) && EQL(A.y,B.y)) {
            throw(new Error("undefined line"));
        }
        const l = new Line(A.x,A.y,argument(A,B));
        l.defined_by = {kind: 'points', points: [A,B]};
        return l;
    }
    static create_with_vector(O,u) {
        const l = new Line(O.x,O.y,atan2(u.y,u.x));
        l.defined_by = {kind: 'vector', through: O, vector: u};
        return l;
    }
    static create_with_segment(s) {
        const [A,B] = s.points;
        return Line.create_with_points(A,B);
    }
    parallel(O) {
        return new Line(O.x,O.y,this.a);
    }
    static create_parallel_to_segment(seg,O) {
        const [A,B] = seg;
        if(EQL(A.x,B.x) && EQL(A.y,B.y)) {
            throw(new Error("invalid argument"));
        }
        return new Line(O.x,O.y,argument(A,B));
    }
    perpendicular(O) {
        return new Line(O.x,O.y,this.a + (this.a<=PI/2 ? PI/2 : -PI*3/2));
    }

    static create_angle_bisector(A,B,C) {
        if((EQL(A.x,B.x) && EQL(A.y,B.y)) || (EQL(B.x,C.x) && EQL(B.y,C.y))) {
            throw(new Error("invalid angle"));
        }
        return new Line(B.x,B.y,(argument(B,A) + argument(B,C))/2);
    }

    static create_lines_bisector(l1,l2) {
        const c1 = cos(l1.a);
        const s1 = sin(l1.a);
        const c2 = cos(l2.a);
        const s2 = sin(l2.a);
        const d = det2(c1,c2,s1,s2);
        if(ZERO(d)) {
            if(ZERO(det2(l2.x-l1.x, l2.y-l1.y, c1,s1))) {
                return l1;
            } else {
                throw(new Error("parallel lines"));
            }
        } else {
            const b1 = det2(l1.x,l1.y,c1,s1);
            const b2 = det2(l2.x,l2.y,c2,s2);
            const x = det2(c1,c2,b1,b2)/d;
            const y = det2(s1,s2,b1,b2)/d;
            let a = (l1.a+l2.a)/2;
            if(abs(l1.a-l2.a)>PI/2) {
                a += (a<=PI/2 ? PI/2 : -PI*3/2);
            }
            return new Line(x,y,a);
        }
    }

    static create_altitude(A,B,C) {
        const a = argument(B,C);
        return new Line(A.x,A.y,a+(a<=PI/2 ? PI/2 : -PI*3/2));
    }

    static create_median(A,B,C) {
        const x = (B.x+C.x)/2;
        const y = (B.y+C.y)/2;
        if(EQL(A.x,x) && EQL(A.y,y)) {
            throw(new Error("invalid triangle"));
        }
        return new Line(A.x,A.y,atan2(y-A.y,x-A.x));
    }

    translate(u) {
        return new Line(this.x+u.x, this.y+u.y, this.a);
    }

    reflect(d) {
        const c = cos(this.a);
        const s = sin(this.a);
        const x = this.x-d.x;
        const y = this.y-d.y;
        const p = 2*(c*x+s*y);
        return new Line(d.x+p*c-x, d.y+p*s-y, principal(2*d.a-this.a));
    }

    symmetric(O) {
        return new Line(2*O.x-this.x, 2*O.y-this.y, this.a+(this.a>0 ? -PI : PI));
    }

    rotate(O,a) {
        const c = cos(a);
        const s = sin(a);
        const x = this.x - O.x;
        const y = this.y - O.y;
        return new Line(O.x+c*x-s*y, O.y+s*x+c*y, principal(this.a+a));
    }

    homothetic(O,k) {
        if(k==0) {
            throw(new Error("invalid ratio"));
        }
        return new Line(O.x+k*(this.x-O.x), O.y+k*(this.y-O.y), this.a+(k<0?(this.a>0?-PI:PI):0));
    }

    argument() {
        return this.a;
    }
}

function point_line_distance(A,l) {
    const c = cos(l.a);
    const s = sin(l.a);
    return abs(s*(A.x-l.x) - c*(A.y-l.y));
}

class Set extends Obj {
    constructor(points) {
        super();
        this.points = points.slice();
    }

    static create_polygon(n,O,r,a) {
        const points = [];
        for(let i=0;i<n;i++) {
            const [x,y] = [
                O.x + r*cos(a+2*PI*i/n),
                O.y + r*sin(a+2*PI*i/n)
            ];
            points.push(new Point(x,y));
        }
        return new Set(points);
    }

    segment(tail) {
        const head = this.points[0];
        const s = new Set([head,tail]);
        return s;
    }

    add_head_point(p) {
        return new Set([p].concat(this.points));
    }

    add_tail_point(p) {
        return new Set(this.points.concat([p]));
    }

    concatenate(second) {
        return new Set(this.points.concat(second.points));
    }

    extract_point(i) {
        return this.points[i];
    }

    extract_subset(i,j) {
        return new Set(this.points.slice(i,j));
    }
    
    translate(u) {
        const points = this.points.map(p=>p.translate(u));
        return new Set(points);
    }

    reflect(l) {
        const points = this.points.map(p=>p.reflect(l));
        return new Set(points);
    }

    symmetric(O) {
        const points = this.points.map(p=>p.symmetric(O));
        return new Set(points);
    }

    rotate(O,a) {
        const points = this.points.map(p=>p.rotate(O,a));
        return new Set(points);
    }

    cardinal() {
        return this.points.length;
    }

    path_length() {
        let t = 0;
        for(let i=1;i<this.points.length+(this.points.length>2 ? 1 : 0);i++) {
            const a = this.points[i%this.points.length];
            const b = this.points[i-1];
            t += a.distance(b);
        }
        return t;
    }

    area() {
        if(this.points.length==0) {
            return 0;
        } else {
            return abs(compute_area(this.points,this.points))*0.5;
        }
    }

    perpendicular_to_segment(O) {
        const [A,B] = this.points;
        if(EQL(A.x,B.x) && EQL(A.y,B.y)) {
            throw(new Error("invalid set"));
        }
        const a = argument(A,B);
        return new Line(O.x,O.y,a+(a<=PI/2 ? PI/2 : -PI*3/2));
    }

    perpendicular_bisector() {
        const [A,B] = this.points;
        if(EQL(A.x,B.x) && EQL(A.y,B.y)) {
            throw(new Error("invalid set"));
        }
        const a = argument(A,B);
        return new Line((A.x+B.x)/2, (A.y+B.y)/2, a+(a<=PI/2 ? PI/2 : -PI*3/2));
    }

    isobarycenter() {
        let x = 0;
        let y = 0;
        for(let p of this.points) {
            x += p.x;
            y += p.y;
        }
        const n = this.points.length;
        return new Point(x/n, y/n);
    }

    is_rectangle() {
        if(this.points.length!=4) {
            return false;
        }
        const [a,b,c,d] = this.points;
        const [u,v] = [Vector.create_from_points(a,b), Vector.create_from_points(a,d)];
        const f = a.translate(u.add(v));
        const parallelogram = EQL(f.x,c.x) && EQL(f.y,c.y);
        const dp = u.x*v.x + u.y*v.y;
        return parallelogram && ZERO(dp);
    }

    is_square() {
        if(!this.is_rectangle()) {
            return false;
        }
        const [a,b,c,d] = this.points;
        const [u,v] = [Vector.create_from_points(a,b), Vector.create_from_points(a,d)];
        return EQL(u.length(),v.length());
    }

    is_equilateral_triangle() {
        if(this.points.length!=3) {
            return false;
        }
        const [a,b,c] = this.points;
        const [u,v,w] = [Vector.create_from_points(a,b), Vector.create_from_points(a,c), Vector.create_from_points(c,b)];
        const [lu,lv,lw] = [u.length(), v.length(), w.length()];
        return EQL(lu,lv) && EQL(lv,lw);
    }

    compute_shape_name() {
        if(this.is_rectangle()) {
            if(this.is_square()) {
                return 'square';
            } else {
                return 'rectangle';
            }
        } else if(this.is_equilateral_triangle()) {
            return 'equilateral triangle';
        } else {
            const names = ['', '', 'segment', 'triangle', 'quadrilateral', 'pentagon', 'hexagon'];
            if(this.points.length<names.length) {
                return names[this.points.length];
            } else {
                return 'polygon';
            }
        }
    }

    shape_name() {
        if(!this._shape_name) {
            this._shape_name = this.compute_shape_name();
        }
        return this._shape_name;
    }
}

function compute_area(A,B) {
    if(B.length==1) {
        return B[0].x*A[0].y - A[0].x*B[0].y;
    } else {
        return B[0].x*B[1].y - B[1].x*b[0].y + compute_area(A,B.slice(1));
    }
}

class Circle extends Obj {
    constructor(center,r) {
        super();
        this.x = center.x;
        this.y = center.y;
        this.r = r;
    }

    static create_circle_with_diameter(set) {
        const [A,B] = set.points;
        const r = A.distance(B)/2;
        const center = new Point((A.x+B.x)/2, (A.y+B.y)/2);
        return new Circle(center,r);
    }

    static create_circumcircle(A,B,C) {
        const s1 = A.x*A.x + A.y*A.y;
        const s2 = B.x*B.x + B.y*B.y;
        const s3 = C.x*C.x + C.y*C.y;
        const a = det3(A.x,B.x,C.x,A.y,B.y,C.y,1,1,1);
        if(ZERO(a)) {
            throw(new Error("invalid points"));
        }
        const d = det3(s1, s2, s3, A.y, B.y, C.y, 1, 1, 1);
        const e = det3(s1, s2, s3, A.x, B.x, C.x, 1, 1, 1);
        const f = det3(s1, s2, s3, A.x, B.x, C.x, A.y, B.y, C.y);
        const r = sqrt((d*d+e*e)/(4*a*a)+f/a);
        const center = new Point(d/(2*a), -e/(2*a));
        return new Circle(center,r);
    }

    static create_incircle(A,B,C) {
        const a = B.distance(C);
        const b = A.distance(C);
        const c = A.distance(B);
        const s = det2(B.x-A.x, C.x-A.x, B.y-A.y, C.y-A.y) > 0 ? 1 : -1;
        const s1 = sqrt((a-b+c)*(a+b-c));
        const s2 = sqrt((b+c-a)*(b+c+a));
        if(ZERO(s1) || ZERO(s2)) {
            throw(new Error("invalid points"));
        }
        const r = 0.5*s1*s2/(a+b+c);
        const t = s1/s2;
        const u = (B.x-A.x)/c;
        const v = (B.y-A.y)/c;
        const center = new Point(A.x+r*(u/t-s*v), A.y=r*(v/t+s*u));
        return new Circle(center,r);
    }

    translate(u) {
        const center = (new Point(this.x,this.y)).translate(u);
        return new Circle(center, this.r);
    }

    center() {
        return new Point(this.x,this.y);
    }
    
    tangent(a) {
        return new Line(this.x+this.r*cos(a), this.y+this.r*sin(a), a+(a<=PI/2 ? PI/2 : -PI*3/2));
    }
}

class Conic extends Obj {
    constructor(v,a,b,d) {
        super();
        this.d = d;
        this.b = b;
        this.a = a;
        this.x = v.x;
        this.y = v.y;
    }

    static create_with_directrix(A,l,e) {
        const c = cos(l.a);
        const s = sin(l.a);
        const d = s*(A.x-l.x) - c*(A.y-l.y);
        if(ZERO(d)) {
            throw(new Error("d is 0"));
        }
        const dd = principal(l.a + (d<0 ? PI/2 : -PI/2));
        if(e==1) {
            return new Parabola(A, abs(d), dd);
        } else {
            const h = 1/e - e;
            const f = abs(d)*e/h;
            const {x,y} = {x: A.x+s*f, y: A.y-c*f};
            const v = new Point(x,y);
            const a = abs(d/h);
            if(e<1) {
                const b = a*sqrt(1-e*e);
                return new Ellipse(v,a,b,dd);
            } else {
                const b = a*sqrt(e*e-1);
                return new Hyperbola(v,a,b,dd);
            }
        }
    }

    static create_with_foci(A,B,a) {
        if(a<=0) {
            throw(new Error("invalid major or real axis"));
        }
        const f = A.distance(B);
        if(ZERO(f) || EQL(f,a)) {
            throw(new Error("invalid parameters"));
        }
        const x = (A.x+B.x)/2;
        const y = (A.y+B.y)/2;
        const v = new Point(x,y);
        const d = argument(A,B);
        if(f<a) {
            const eb = sqrt(a*a-f*f);
            return new Ellipse(v,a,eb,d);
        } else {
            const hb = sqrt(f*f-a*a);
            return new Hyperbola(v,a,hb,d);
        }
    }
    center() {
        return new Point(this.x,this.y);
    }

    foci() {
        const c = cos(this.d);
        const s = sin(this.d);
        const f = sqrt(this.a*this.a + this.b*this.b*(this instanceof Ellipse ? -1 : 1));
        const first = {x: this.x + c*f, y: this.y + s*f};
        const second = {x: this.x - c*f, y: this.y - s*f};
        return [first,second];
    }

    translate(u) {
        return new (this.__proto__.constructor)(new Point(this.x+u.x,this.y+u.y), this.a, this.b, this.d);
    }

    reflect(l) {
        const c = cos(l.a);
        const s = sin(l.a);
        const x = this.x-l.x;
        const y = this.y-l.y;
        const p = 2*(c*x+s*y);
        return new (this.__proto__.constructor)(
            new Point(l.x+p*c-x, l.y+p*s-y),
            this.a,
            this.b,
            principal(2*l.a-this.d)
        );
    }

    symmetric(O) {
        return new (this.__proto__.constructor)(
            new Point(2*O.x-this.x, 2*O.y-this.y),
            this.a,
            this.b,
            this.d+(this.d > 0 ? -PI : PI)
        );
    }

    rotate(O,a) {
        const c = cos(a);
        const s = sin(a);
        const x = this.x - O.x;
        const y = this.y - O.y;
        return new (this.__proto__.constructor)(
            new Point(O.x + c*x - s*y, O.y + s*x + c*y),
            this.a,
            this.b,
            principal(this.d+a)
        );
    }

    homothetic(O,k) {
        return new (this.__proto__.constructor)(
            new Point(O.x + k*(this.x - O.x), O.y + k*(this.y - O.y)),
            abs(k)*this.a,
            abs(k)*this.b,
            this.d
        );
    }

    major_axis() {
        return this.a;
    }

    minor_axis() {
        return this.b;
    }

    argument() {
        return this.d;
    }
}

class Ellipse extends Conic {
    constructor(v,a,b,d) {
        if(a<=0 || b<=0 || a<b) {
            throw(new Error("invalid parameters"));
        }
        super(v,a,b,d);
    }
    point_on(t) {
        const c = cos(this.d);
        const s = sin(this.d);
        const [x,y] = parametric_ellipse(t,this.x,this.y,this.a,this.b,c,s);
        return new Point(x,y);
    }

    eccentricity() {
        return sqrt(1-this.b*this.b/(this.a*this.a));
    }

    point_argument(A) {
        const c = cos(this.d);
        const s = sin(this.d);
        const x = A.x-this.x;
        const y = A.y-this.y;
        const u = c*x + s*y;
        const v = -s*x + c*y;

        return atan2(v*this.a,u*this.b);
    }

    tangent(t) {
        const [x,y] = parametric_ellipse(t,this.x,this.y,this.a,this.b,c,s);
        const a = atan2(this.b*cos(t), -this.a*sin(t));
        return new Line(x,y,a);
    }
}

class Hyperbola extends Conic {
    point_on(t) {
        const c = cos(this.d);
        const s = sin(this.d);
        if(t<=-PI || t>= PI || t==0) {
            throw(new Error("invalid argument"));
        }
        const [x,y] = parametric_hyperbola(t,this.x,this.y,this.a,this.b,c,s);
        return new Point(x,y);
    }

    eccentricity() {
        return sqrt(1+this.b*this.b/(this.a*this.a));
    }

    point_argument(A) {
        const c = cos(this.d);
        const s = sin(this.d);
        const x = A.x-this.x;
        const y = A.y-this.y;
        const u = c*x + s*y;
        const v = -s*x + c*y;

        return atan2(this.b,v) - (u<0 ? PI : 0);
    }

    tangent(t) {
        const c = cos(this.d);
        const s = sin(this.d);
        if(t<=-PI || t>=PI) {
            throw(new Error("invalid argument"));
        }
        let x,y,a;
        if(t==0 || t==PI) {
            x = this.x;
            y = this.y;
            a = atan2(this.b,this.a*(t==0?1:-1));
        } else {
            const [x,y] = parametric_hyperbola(t,this.x,this.y,this.a,this.b,c,s);
            a = atan2(-this.b, -this.a*cos(t));
        }
        return new Line(x,y,principal(a+this.d));
    }
}

class Parabola extends Conic {
    point_on(t) {
        const c = cos(this.d);
        const s = sin(this.d);
        if(t<=-PI || t>= PI || t==0) {
            throw(new Error("invalid argument"));
        }
        const [x,y] = parametric_parabola(t,this.x,this.y,this.a,this.b,c,s);
        return new Point(x,y);
    }

    constructor(v,a,d) {
        if(a<0) {
            throw(new Error("Invalid a"));
        }
        const [nx,ny] = [
            v.x+a*Math.cos(d)/2,
            v.y+a*Math.sin(d)/2
        ];
        super(new Point(nx,ny),a,0,d);
    }

    center() {
        throw(new Error("undefined center"));
    }

    eccentricity() {
        return 1;
    }

    point_argument(A) {
        const c = cos(this.d);
        const s = sin(this.d);
        const x = A.x-this.x;
        const y = A.y-this.y;
        const u = c*x + s*y;
        const v = -s*x + c*y;

        return atan2(-v, (this.a-v*v/this.a)/2);
    }
    
    tangent(t) {
        if(t<=-PI || t>=PI) {
            throw(new Error("invalid argument"));
        }
        const c = cos(this.d);
        const s = sin(this.d);
        const [x,y] = parametric_parabola(t,this.x,this.y,this.a,c,s);
        const a = principal(atan2(-1-cos(t),sin(t))+this.d);
        return new Line(x,y,a);
    }
}

class TriangleMaker {
    constructor(vertices) {
        this.vertices = vertices.slice();
    }

    assign_A_B() {
        let A,B;
        switch(this.vertices.length) {
            case 0:
                A = new Point(0,0);
                B = new Point(this.a*this.x,this.a*this.y);
                this.vertices = [A,B];
                break;
            case 1:
                [A] = this.vertices;
                B = new Point(A.x + this.a*this.x, A.y + this.a*this.y);
                this.vertices = [A,B];
                break;
            case 2:
                [A,B] = this.vertices;
                this.a = A.distance(B);
                if(ZERO(this.a)) {
                    throw(new Error("invalid points"));
                }
                [this.x,this.y] = [(B.x-A.x)/this.a, (B.y-A.y)/this.a];
                break;
        }

    }

    assign_C(u,v) {
        const [A,B] = this.vertices;
        const C = new Point(
            A.x+u*this.x-v*this.y,
            A.y+v*this.x+u*this.y
        );
        this.vertices = [A,B,C];
    }

    static define_optimal_scalene(vertices,a,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        tm.assign_C(tm.a*.375, tm.a*.61237244);
        return tm.vertices;
    }

    static define_triangle_SSS(vertices,a,b,c,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        a = tm.a;
        const s1 = (b-a+c)*(b+a-c);
        const s2 = (a+c-b)*(a+b+c);
        let u,v;
        if(ZERO(s2)) {
            u = -c;
            v = 0;
        } else {
            const s = s1/s2;
            if(s<0) {
                throw(new Error("invalid lengths"));
            }
            t = 2*atan(sqrt(s));
            u = c*cos(t);
            v = c*sin(t);
        }
        tm.assign_C(u,v);
        return tm.vertices;
    }

    static define_triangle_SAA(vertices,a,u,v,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        const cu = cos(u);
        const su = sin(u);
        const cv = cos(v);
        const sv = sin(v);
        const d = cu*sv + su*cv;
        if(ZERO(d)) {
            throw(new Error("invalid angles"));
        }
        tm.assign_A_B();
        const c = a*sv/d;
        tm.assign_C(c*cu,c*su);
        return tm.vertices;
    }

    static define_triangle_SAS(vertices,a,u,c,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        tm.assign_C(c*cos(u),c*sin(u));
        return tm.vertices;
    }

    static define_triangle_SSA(vertices,a,c,v,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        const cv = cos(v);
        const sv = sin(v);
        const s = c*c-a*a*sv*sv;
        if(s<0) {
            throw(new Error("invalid parameters"));
        }
        const b = a*cv + sqrt(s);
        tm.assign_C(a-b*cv, b*sv);
        return tm.vertices;
    }

    static define_right_SS(vertices,a,b,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        a = tm.a;
        tm.assign_C(a, b);
        return tm.vertices;
    }
    
    static define_right_SA(vertices,a,u,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        if(u>=PI/2 || u<=-PI/2) {
            throw(new Error("invalid angle"));
        }
        tm.assign_A_B();
        a = tm.a;
        tm.assign_C(a, a*tan(u));
        return tm.vertices;
    }

    static define_isosceles_SS(vertices,a,b,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        a = tm.a/2;
        const s = b*b-a*a;
        if(s<0) {
            throw(new Error("invalid lengths"));
        }
        tm.assign_C(a,sqrt(s));
        return tm.vertices;
    }

    static define_isosceles_SA(vertices,a,u,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        if(u>=PI/2 || u<=-PI/2) {
            throw(new Error("invalid angle"));
        }
        tm.assign_A_B();
        a = tm.a/2;
        tm.assign_C(a,a*tan(u));
        return tm.vertices;
    }

    static define_equilateral(vertices,a,t) {
        const tm = new TriangleMaker(vertices);
        if(vertices.length<2) {
            tm.a = a;
            tm.x = cos(t);
            tm.y = sin(t);
        }
        tm.assign_A_B();
        a = tm.a/2;
        tm.assign_C(a,a*sqrt(3));
        return tm.vertices;
    }
}

class QuadrilateralMaker {
    constructor(vertices) {
        this.vertices = vertices.slice();
    }

    /** Assign the positions of the vertices of a quadrilateral ABCD
     * @param {Number} x - x-component of vector in direction of first side (A-B)
     * @param {Number} y - y-component of vector in direction of first side (A-B)
     * @param {Number} u - x-component of vector in direction of second side (B-C)
     * @param {Number} v - y-component of vector in direction of second side (B-C)
     * @param {Number} l - length of first side (A-B)
     * @param {Number} m - length of second side (B-C)
     * @param {Boolean} square - is the quadrilateral a square? (i.e., length of second side equals length of first side)
     * @returns {Array.<Point>} - the vertices A,B,C,D
     */
    assign(x,y,u,v,l,m,square) {
        let [A,B,C] = this.vertices;
        if(this.vertices.length<3) {
            switch(this.vertices.length) {
                case 0:
                    A = new Point(0,0);
                    B = new Point(l*x,l*y);
                    break;
                case 1:
                    B = new Point(A.x+l*x, A.y+l*y);
                    break;
                case 2:
                    l = A.distance(B);
                    if(ZERO(l)) {
                        throw(new Error("invalid points"));
                    }
                    x = (B.x-A.x)/l;
                    y = (B.y-A.y)/l;
                    break;
            }
            if(square) {
                m = l;
            }
            C = new Point(B.x+m*(u*x-v*y), B.y+m*(v*x+u*y));
        }
        const D = new Point(
            A.x+C.x-B.x,
            A.y+C.y-B.y
        );
        this.vertices = [A,B,C,D];
        return this.vertices;
    }

    static define_parallelogram_SSA(vertices,m,a,l,b) {
        let x,y,u,v;
        if(vertices.length < 2) {
            x = cos(b);
            y = sin(b);
            u = cos(a);
            v = sin(a);
        } else {
            u = cos(a);
            v = sin(a);
        }
        const qm = new QuadrilateralMaker(vertices);
        return qm.assign(x,y,u,v,l,m);
    }

    static define_parallelogram_VV(vertices,u,v) {
        let [A] = vertices;
        if(vertices.length==0) {
            A = new Point(0,0);
        }
        const B = new Point(A.x+u.x, A.y+u.y);
        const C = new Point(A.x+u.x+v.x, A.y+u.y+v.y);
        const D = new Point(A.x+v.x,A.y+v.y);
        return [A,B,C,D];
    }

    static define_rectangle(vertices,l,m,b) {
        let x,y;
        if(vertices.length<2) {
            x = cos(b);
            y = sin(b);
        }
        const qm = new QuadrilateralMaker(vertices);
        return qm.assign(x,y,0,1,l,m);
    }

    static define_square(vertices,l,b) {
        let x,y;
        if(vertices.length<2) {
            x = cos(b);
            y = sin(b);
        }
        const qm = new QuadrilateralMaker(vertices);
        return qm.assign(x,y,0,1,l,l,true);
    }
}

function orthogonal_projection(A,l) {
    const c = cos(l.a);
    const s = sin(l.a);
    const p = c*(A.x - l.x) + s*(A.y-l.y);

    return new Point(l.x + p*c, l.y + p*s);
}

function intersection_point(x1,y1,a1,x2,y2,a2) {
    const c1 = cos(a1);
    const s1 = sin(a1);
    const c2 = cos(a2);
    const s2 = sin(a2);
    const d = det2(c1,c2,s1,s2);
    if(ZERO(d)) {
        throw(new Error("parallel lines"));
    }
    const b1 = det2(x1,y1,c1,s1);
    const b2 = det2(x2,y2,c2,s2);
    return new Point(
        det2(c1,c2,b1,b2)/d,
        det2(s1,s2,b1,b2)/d
    );
}

function parallel_projection(A,l1,l2) {
    return intersection_point(l1.x,l1.y,l1.a,A.x,A.y,l2.a);
}

function lines_intersection(l1,l2) {
    return intersection_point(l1.x,l1.y,l1.a,l2.x,l2.y,l2.a);
}

function line_segment_intersection(set,a,b,c,d) {
    const [p,t] = set;
    if(t===undefined) {
        return [];
    }
    function dist(p) {
        return a*p.x+b*p.y+c;
    }

    const e = dist(t,a,b,c);
    if(d*e<=EPSILON && abs(e)>EPSILON) {
        const f = abs(d)+abs(e);
        const g = f==0 ? 0 : abs(d)/f;
        const p1 = new Point(p.x+g*(t.x-p.x), p.y+g*(t.y-p.y));
        return [p1].concat(line_segment_intersection(set.slice(1),a,b,c,e));
    }
    return line_segment_intersection(set.slice(1),a,b,c,e);
}

function line_set_intersection(l,s) {
    if(s.points.length==0) {
        return new Set([]);
    }
    const a = sin(l.a);
    const b = -cos(l.a);
    const c = -a*l.x-b*l.y;
    function dist(p) {
        return a*p.x+b*p.y+c;
    }

    return new Set(line_segment_intersection(s.points,a,b,c,dist(s.points[0],a,b,c)));
}

/** Solve a quadratic equation a*x^2 + b*x + c = 0
 */
function solve(a,b,c) {
    if(ZERO(a)) {
        if(ZERO(b)) {
            return [];
        }
        return [-c/b,1];
    }
    const d = b*b-4*a*c;
    if(d<0) {
        return [];
    }
    if(ZERO(d)) {
        return [-b/(2*a)];
    }
    const r = sqrt(d);
    const x1 = (-b-r)/(2*a);
    const x2 = (-b+r)/(2*a);
    return [x1,x2];
}

function line_circle_intersection(l,C) {
    const x = l.x-C.x;
    const y = l.y-C.y;
    const c = cos(l.a);
    const s = sin(l.a);
    const roots = solve(1,2*(x*c+y*s),x*x+y*y-C.r*C.r);
    return new Set(roots.map(t=>new Point(l.x+c*t, l.y+s*t)));
}

function line_conic_intersection(l,C) {
    const c = cos(C.d);
    const s = sin(C.d);
    const a = C.a*C.a;
    const b = C.b*C.b;
    const x = c*(l.x-C.x)+s*(l.y-C.y);
    const y = -s*(l.x-C.x)+c*(l.y-C.y);
    const ca = cos(l.a);
    const sa = sin(l.a);
    const u = c*ca+s*sa;
    const v = -s*ca+c*sa;
    let roots;
    if(C instanceof Ellipse) {
        roots = solve(u*u/a + v*v/b, 2*(x*u/a + y*v/b), x*x/a + y*y/b - 1);
    } else if(C instanceof Hyperbola) {
        roots = solve(u*u/a - v*v/b, 2*(x*u/a - y*v/b), x*x/a - y*y/b - 1);
    } else if(C instanceof Parabola) {
        roots = solve(v*v/(2*C.a), y*v/C.a - u, y*y/(2*C.a) - x - C.a/2);
    }

    return new Set(roots.map(t=>new Point(l.x+ca*t, l.y+sa*t)));
}

function sets_intersection(s1,s2) {
    if(s1.points.length==0 || s2.points.length==0) {
        return new Set([]);
    }
    const out = [];
    let s = s1.points[s1.points.length-1];
    for(let t of s1.points) {
        let v = s2.points[s2.points.length-1];
        for(let w of s2.points) {
            if(max(s.x,t.x) >= min(v.x,w.x)
                && max(v.x,w.x) >= min(s.x,t.x)
                && max(s.y,t.y) >= min(v.y,w.y)
                && max(v.y,w.y) >= min(s.y,t.y)
            ) {
                const d1 = s.distance(t);
                const c1 = (t.x-s.x)/d1;
                const s1 = (t.y-s.y)/d1;
                const d2 = v.distance(w);
                const c2 = (w.x-v.x)/d2;
                const s2 = (w.y-v.y)/d2;
                const x = v.x-s.x;
                const y = v.y-s.y;
                const d = det2(c1,c2,s1,s2);
                if(ZERO(d)) {
                    if(ZERO(det2(x,y,c1,s1))) {
                        out.push(s);
                    }
                } else {
                    const t1 = det2(x,y,c2,s2)/d;
                    const t2 = det2(x,y,c1,s1)/d;
                    if(t1>=0 && t1<=d1 && t2>+0 && t2<=d2) {
                        out.push(new Point(s.x+c1*t1,s.y+s1*t1));
                    }
                }
            }
            v = w;
        }
        s = t;
    }
    return new Set(out);
}

function circles_intersection(c1,c2) {
    let x = c2.x-c1.x;
    let y = c2.y-c1.y;
    const a = hypot(x,y);
    const b = c2.r;
    const c = c1.r;
    if(ZERO(a) || a>b+c || a<abs(b-c)) {
        return new Set([]);
    }
    x /= a;
    y /= a;
    if(a==b+c || a==abs(b-c)) {
        return new Set([new Point(
            c1.x+c*x,
            c2.x+c*y
        )]);
    }

    const t = 2*atan(sqrt((b-a+c)*(b+a-c)/((a+c-b)*(a+b+c))));
    const u = c*cos(t);
    const v = c*sin(t);
    const first = new Point(
        c1.x+u*x-v*y,
        c1.y+v*x+u*y
    );
    const second = new Point(
        c1.x+u*x+v*y,
        c1.y-v*x+u*y
    );
    return new Set([first,second]);
}

function circle_set_intersection(set,c) {
    const out = [];
    if(set.points.length<2) {
        return [];
    }
    let s = set.points[set.points.length-1];
    function dist(s) {
        return hypot(s.x-c.x,s.y-c.y);
    }
    for(let t of set.points) {
        const d = dist(s);
        const e = dist(t);
        if(d>=c.r || e>=c.r) {
            const f = s.distance(t);
            const x = s.x-c.x;
            const y = s.y-c.y;
            const u = (t.x-s.x)/f;
            const v = (t.y-s.y)/f;
            const roots = solve(1,2*(x*u+y*v), x*x+y*y-c.r*c.r);
            if(roots.length>0) {
                const [t1,t2] = roots;
                if(roots.length>1 && t2>=0 && t2<=f) {
                    const v2 = new Point(
                        s.x+u*t2,
                        s.y+v*t2
                    );
                    out.push(v2);
                }
                if(t1>=0 && t1<=f) {
                    const v1 = new Point(
                        s.x+u*t1,
                        s.y+v*t1
                    );
                    out.push(v1);
                }
            }
        }
        s = t;
    }
    return new Set(out);
}

function clean_label(text) {
    text = text+'';
    text = text.replace("'","′");
    var superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    var subscripts = '₀₁₂₃₄₅₆₇₈₉';
    text = text.replace(/\^(\d)/g,function(m){return superscripts[parseInt(m[1])]});
    text = text.replace(/_(\d)/g,function(m){return subscripts[parseInt(m[1])]});

    return text;
}


class Drawer {
    constructor() {
    }

    initialise() {
        this.restore_default_settings();
        this.restore_local_settings();
        this.setup_frame(-2,-2,8,6,1);
        this.settings_stack = [];
    }

    restore_default_settings() {
        this.global = {
            label: false,
            label_segment: NONE,
            aria_mode: NOSPOILERS,
            color: BLACK,
            size: 1,
            step: 3,
            style: FULL,
            shape: DOT,
            part: ENTIRE,
            dir: FORTH,
            arrow: NONE,
            font_desc: '',
            segment: SIMPLE,
            angle: SIMPLE,
            dec: NONE,
            opacity: 1,
            font_size: 0.2,
            bold: false,
            italic: false,
            font_family: 'sans-serif',
            close: true,
            label_dist: 0.2
        }
    }

    restore_local_settings() {
        this.local = Object.assign({},this.global);
    }

    push_local_settings() {
        this.settings_stack.push(this.local);
        this.local = {...this.local};
    }
    pop_local_settings() {
        this.local = this.settings_stack.pop();
    }

    setup_frame(min_x,min_y,max_x,max_y,scale) {
        this.min_x = min_x;
        this.min_y = min_y;
        this.max_x = max_x;
        this.max_y = max_y;
        this.scale = scale || 1;
        this.font_scale = 100;
        this.default_dist = 0.2;
    }

    SIZE(x) {
        return this.local.size*x/this.scale;
    }

    check_basic_settings() {
        this.check_color();
        this.check_size();
        this.check_style();
    }

    set_xy(A,B,C,d) {
        const l1 = B.distance(A);
        if(ZERO(l1)) {
            throw(new Error("invalid angle"));
        }
        const x1 = d*(A.x-B.x)/l1;
        const y1 = d*(A.y-B.y)/l1;
        const l2 = B.distance(C);
        if(ZERO(l2)) {
            throw(new Error("invalid angle"));
        }
        const x2 = d*(C.x-B.x)/l2;
        const y2 = d*(C.y-B.y)/l2;
        return [x1,y1,x2,y2];
    }

    // distance to the furthest corner of the frame
    get_max(x,y) {
        const {min_x,min_y,max_x,max_y} = this;
        let m = hypot(min_x-x,min_y-y);
        let l = hypot(max_x-x,min_y-y);
        if(l>m) {
            m = l;
        }
        l = hypot(max_x-x,max_y-y);
        if(l>m) {
            m = l;
        }
        l = hypot(min_x-x,max_y-y);
        if(l>m) {
            m = l;
        }
        return m;
    }

    draw_hyperbolic_arc(x0,y0,a,b,f,g,c,s) {
        const e = atan(b/this.get_max(x0,y0));
        if(f<-e) {
            this.draw_branch(-PI+e,-e,x0,y0,a,b,f,g,c,s);
        }
        if(g>e) {
            this.draw_branch(e,PI-e,x0,y0,a,b,f,g,c,s);
        }
    }

    draw_conic(C) {
        this.check_basic_settings();
        if(C instanceof Parabola) {
            this.draw_parabolic_arc(C.x,C.y,C.a,-PI,PI,cos(C.d),sin(C.d));
        } else if(C instanceof Ellipse) {
            this.draw_elliptic_arc(C.x,C.y,C.a,C.b,-PI,PI,cos(C.d),sin(C.d));
        } else if(C instanceof Hyperbola) {
            this.draw_hyperbolic_arc(C.x, C.y, C.a, C.b, -PI, PI, cos(C.d), sin(C.d));
        }
    }

    draw_conic_arc(C,f,g) {
        this.check_basic_settings();
        if(C instanceof Ellipse && f>g) {
            g += 360;
        }
        if(f>=g) {
            throw(new Error("invalid boundaries"));
        }
        if(C instanceof Parabola) {
            this.draw_parabolic_arc(C.x,C.y,C.a,f,g,cos(C.d),sin(C.d));
        } else if(C instanceof Ellipse) {
            this.draw_elliptic_arc(C.x,C.y,C.a,C.b,f,g,cos(C.d),sin(C.d));
        } else if(C instanceof Hyperbola) {
            this.draw_hyperbolic_arc(C.x,C.y,C.a,C.b,f,g,cos(C.d),sin(C.d));
        }
    }
}

const labels = ["simple","double","triple"];
const [SIMPLE,DOUBLE,TRIPLE] = labels;
const styles = ["full","dotted","dashed"];
const [FULL,DOTTED,DASHED] = styles;
const shapes = ["dot","disc","box","plus","cross"];
const [DOT,DISC,BOX,PLUS,CROSS] = shapes;
const parts = ["entire","half"];
const [ENTIRE,HALF] = parts;
const dirs = ["right","forth","back"];
const [RIGHT,FORTH,BACK] = dirs;
const arrows = ["none","arrow","arrows"];
const [NONE,ARROW,ARROWS] = arrows;
const colors = ['black','darkgray','gray','lightgray','white','red','green','blue','cyan','magenta','yellow'];
const [BLACK,DARKGRAY,GRAY,LIGHTGRAY,WHITE,RED,GREEN,BLUE,CYAN,MAGENTA,YELLOW] = colors;
const aria_modes = ['verbose','nospoilers'];
const [VERBOSE,NOSPOILERS] = aria_modes;

function dp(n) {
    return parseFloat(n).toFixed(7);
}

class SVGDrawer extends Drawer {
    constructor(svg,doc) {
        super();
        this.svg = svg;
        this.doc = doc || document;
        this.maing = this.doc.createElementNS('http://www.w3.org/2000/svg','g');
        this.svg.appendChild(this.maing);

        this.shapes = {};
        this.elements = {};
        this.initialise();
        this.before_render();
    }

    initialise() {
        super.initialise();
        let defs = this.svg.querySelector('defs');
        if(!defs) {
            defs = this.doc.createElementNS('http://www.w3.org/2000/svg','defs');
            this.svg.appendChild(defs);
        }
        const def_items = {
            'eukleides-pattern-stripes': `
                <pattern id="eukleides-pattern-stripes" x="0" y="0" width="0.75" height="0.75" patternContentUnits="userSpaceOnUse" patternUnits="userSpaceOnUse" viewBox="0 0 10 10" fill="white" patternTransform="rotate(57)"> 
                    <rect x="1" y="0" width="9" height="10"/>
                </pattern>
            `,
            'eukleides-mask-stripes': `
                <mask id="eukleides-mask-stripes" x="-0.5" y="-0.5" width="2" height="2" maskContentUnits="userSpaceOnUse">
                    <rect x="-1000000" y="-1000000" width="2000000" height="2000000" fill="url(#eukleides-pattern-stripes)">
                </mask>
            `,
            'eukleides-pattern-dots': `
                <pattern id="eukleides-pattern-dots" width="0.5" height="0.5" patternContentUnits="userSpaceOnUse" patternUnits="userSpaceOnUse" viewBox="0 0 1 1" fill="white" patternTransform="rotate(27)"> 
                    <rect x="0" y="0" width="1" height="1" fill="white"/>
                    <circle cx="0.5" cy="0.5" r="0.15" fill="black"/>
                </pattern>
            `,
            'eukleides-mask-dots': `
                <mask id="eukleides-mask-dots" x="-0.5" y="-0.5" width="2" height="2" maskContentUnits="userSpaceOnUse">
                    <rect x="-1000000" y="-1000000" width="2000000" height="2000000" fill="url(#eukleides-pattern-dots)">
                </mask>
            `
        }
        for(let [id,def] of Object.entries(def_items)) {
            if(!defs.querySelector('#'+id)) {
                defs.innerHTML += def;
            }
        }
    }

    before_render() {
        this.used_ids = {};
        this.idacc = 0;
        this.point_labels = [];
    }
    after_render() {
        Object.entries(this.elements).forEach(([id,element]) => {
            if(!this.used_ids[id]) {
                delete this.elements[id];
                for(let el of this.svg.querySelectorAll(`[data-eukleides-id="${id}"]`)) {
                    el.parentElement.removeChild(el);
                }
            }
        });
    }

    add_point_label(p) {
        this.point_labels.push({point: p, label: clean_label(this.local.label_text)});
    }

    has_label_for_point(p) {
        if(this.aria_mode==VERBOSE) {
            return true;
        }
        const d = this.point_labels.find(d=>d.point.x==p.x && d.point.y==p.y);
        return d;
    }
    
    label_for_point(p) {
        const d = this.point_labels.find(d=>d.point.x==p.x && d.point.y==p.y);
        return d ? d.label : `(${dpformat(p.x)},${dpformat(p.y)})`;
    }

    setup_frame(min_x,min_y,max_x,max_y,scale) {
        super.setup_frame(min_x,min_y,max_x,max_y,scale);

        this.svg.setAttribute('viewBox',`${dp(min_x)} ${dp(min_y)} ${dp(max_x-min_x)} ${dp(max_y-min_y)}`);
        this.maing.setAttribute('transform',`scale(${scale} ${-scale}) translate(0 ${min_y-max_y})`);
    }

    check_color() { }
    check_font() { }
    check_size() { }
    check_style() { }
    check_angle_style() { }


    set_fill(e,apply_pattern=true) {
        if(apply_pattern) {
            switch(this.local.style) {
                case DOTTED:
                    e.setAttribute('mask','url(#eukleides-mask-dots)');
                    break;
                case DASHED:
                    e.setAttribute('mask','url(#eukleides-mask-stripes)');
                    break;
            }
        }
        e.setAttribute('fill',this.local.color);
        e.style.opacity = this.local.opacity;
    }
    set_stroke(e) {
        e.setAttribute('fill','none');
        e.setAttribute('stroke',this.local.color);
        e.setAttribute('stroke-width',this.local.size*0.02);
        e.setAttribute('stroke-linejoin','round');
        e.setAttribute('stroke-linecap','round');
        e.style.opacity = this.local.opacity;
    }
    set_style(e) {
        let s = '';
        switch(this.local.style) {
            case FULL:
                break;
            case DOTTED:
                const lineWidth = e.getAttribute('stroke-width') || this.local.size*0.02;
                s = `0 0.2`;
                break;
            case DASHED:
                s = `${this.SIZE(0.15)} ${this.SIZE(0.1)}`;
                break;
        }
        if(s) {
            e.setAttribute('stroke-dasharray',s);
        }
    }
    set_font(e) {
        const size = this.font_scale*this.SIZE(this.local.font_size)/100;
        e.style['font'] = `${this.local.italic ? 'italic ': ''}${this.local.bold ? 'bold ' : ''}${dp(size)}pt ${this.local.font_family}`;
    }

    element(name,attr,content) {
        const id = this.local.key || this.idacc++;
        this.used_ids[id] = true;
        const olde = this.elements[id];
        let e;
        if(olde && olde.tagName==name) {
            e = olde;
            e.removeAttribute('transform');
        } else {
            for(let e of this.svg.querySelectorAll(`[data-eukleides-id="${id}"]`)) {
                e.parentElement.removeChild(e);
            }
            e = this.doc.createElementNS('http://www.w3.org/2000/svg',name);
            e.setAttribute('data-eukleides-id',id);
        }
        if(name!='text') {
            e.setAttribute('role','presentation');
        }
        this.elements[id] = e;
        if(attr) {
            for(let [k,v] of Object.entries(attr)) {
                e.setAttribute(k,v);
            }
        }
        if(content!==undefined) {
            e.innerHTML = content;
        }
        this.maing.appendChild(e);
        return e;
    }

    transform(element,def) {
        var odef = element.getAttribute('transform') || '';
        element.setAttribute('transform',[odef,def].join(' '));
        return element;
    }

    describe_style(desc) {
        switch(this.local.style) {
            case DOTTED:
                desc = `dotted ${desc}`;
                break;
            case DASHED:
                desc = `dashed ${desc}`;
                break;
        }
        return desc;
    }
    
    describe_arrows(desc) {
        if(this.local.arrow==NONE) {
            return desc;
        } else if(this.local.arrow==ARROWS) {
            desc += ' with an arrow at each end';
        } else {
            desc += this.local.dir==BACK ? ' with an arrow at the start' : ' with an arrow at the end';
        }
        return desc;
    }

    set_aria_label(element,label) {
        if(this.local.color_description) {
            label = `${this.local.color_description} ${label}`;
        } else if(colors.contains(this.local.color) && this.local.color != this.global.color) {
            label = `${this.local.color} ${label}`;
        }
        if(this.local.opacity<1) {
            label = `transparent ${label}`;
        }
        if(this.local.description!==undefined) {
            label = this.local.description;
        }
        element.setAttribute('aria-label',label);
        if(element.getAttribute('role')=='presentation') {
            element.setAttribute('role','img');
        }
    }

    handle_dragging(element,callback) {
        var onstart = (e) => {
            const ondrag = callback();
            e.stopPropagation();
            e.preventDefault();
            e = e.touches ? e.touches[0] : e;
            const [sx,sy] = [e.clientX, e.clientY];
            var onmove = (e) => {
                e.preventDefault();
                e = e.touches ? e.touches[0] : e;
                const m = element.getScreenCTM().inverse();
                const p = this.svg.createSVGPoint();
                p.x = e.clientX;
                p.y = e.clientY;
                const tp1 = p.matrixTransform(m);
                p.x = sx;
                p.y = sy;
                const tp0 = p.matrixTransform(m);
                const [dx,dy] = [tp1.x-tp0.x,tp1.y-tp0.y];
                ondrag(dx,dy);
            }
            var onend = (e) => {
                e.preventDefault();
                document.removeEventListener('mousemove',onmove);
                document.removeEventListener('mouseup',onend);
                document.removeEventListener('touchmove',onmove);
                document.removeEventListener('touchend',onend);
                document.removeEventListener('touchcancel',onend);
            }
            document.addEventListener('mousemove',onmove);
            document.addEventListener('touchmove',onmove);
            document.addEventListener('mouseup',onend);
            document.addEventListener('touchend',onend);
            document.addEventListener('touchcancel',onend);
        }
        element.addEventListener('mousedown',onstart);
        element.addEventListener('touchstart',onstart);
    }

    show(element) {
        this.svg.appendChild(element);
        return element;
    }
    
    draw_dot(x,y,r) {
        const c = this.element('circle',{cx: x, cy: y, r: r});
        this.set_fill(c,false);
        return c;
    }

    arc(x,y,r,a,b) {
        let d = b-a;
        let sweep = 0;
        if(d>0) {
            d -= 2*PI;
        }
        let large_circle = Math.abs(d)>=PI ? 1 : 0;
        if(d>=2*PI) {
            return this.element('circle',{cx:x,cy:y,r:r});
        } else {
            return this.element('path',{d: `M ${dp(x+Math.cos(a)*r)} ${dp(y+Math.sin(a)*r)} A ${dp(r)} ${dp(r)} 0 ${large_circle} ${sweep} ${dp(x+Math.cos(b)*r)} ${dp(y+Math.sin(b)*r)}`});
        }
    }

    draw_dash(x,y,angle,a,b) {
        const e = this.transform(
            this.element('path',{d: `M ${dp(a)} 0 L ${dp(b)} 0`}), 
            `translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))})`
        );
        this.set_stroke(e);
        return e;
    }

    draw_double_dot(x,y,angle,t,d,r) {
        const g = this.transform(this.element('g'),`translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))})`);
        for(let i=0;i<2;i++) {
            const dot = this.transform(this.draw_dot(d,0,r), `rotate(${dp(RTOD(i*t))})`);
            g.appendChild(dot);
        }
        return g;
    }

    draw_double_dash(x,y,angle,a,b,t) {
        const g = this.transform(this.element('g'),`translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))})`);
        for(let i=0;i<2;i++) {
            const p = this.transform(this.element('path',{d:`M ${dp(a)} 0 L ${dp(b)} 0`}), `rotate(${dp(RTOD(i*t))})`);
            g.appendChild(p);
        }
        this.set_stroke(g);
        return g;
    }

    draw_double_arc(x,y,r1,r2,a,b) {
        const g = this.element('g');
        g.appendChild(this.arc(x,y,r1,a,b));
        g.appendChild(this.arc(x,y,r2,a,b));
        this.set_stroke(g);
        return g;
    }

    draw_triple_dot(x,y,angle,t,d,r) {
        const g = this.transform(this.element('g'),`translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))})`);
        for(let i=0;i<2;i++) {
            const dot = this.transform(this.draw_dot(d,0,r), `rotate(${dp(RTOD(i*t))})`);
            g.appendChild(dot);
        }
        g.appendChild(this.transform(this.draw_dot(d*.75,0,r),`rotate(${dp(RTOD(t*0.5))})`));
        return g;
    }

    draw_triple_dash(x,y,angle,a,b,t) {
        const g = this.transform(this.element('g'),`translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))})`);
        for(let i=0;i<3;i++) {
            const p = this.transform(this.element('path',{d:`M ${dp(a)} 0 L ${dp(b)} 0`}), `rotate(${dp(RTOD(i*t))})`);
            g.appendChild(p);
        }
        this.set_stroke(g);
        return g;
    }

    draw_triple_arc(x,y,r1,r2,r3,a,b) {
        const g = this.element('g');
        g.appendChild(this.arc(x,y,r1,a,b));
        g.appendChild(this.arc(x,y,r2,a,b));
        g.appendChild(this.arc(x,y,r3,a,b));
        this.set_stroke(g);
        return g;
    }

    draw_point(A) {
        const size = this.SIZE(0.05);
        this.check_color();

        const element = (() => {
            switch(this.local.shape) {
                case DOT:
                    return this.draw_dot(A.x,A.y,size);
                case DISC:
                    const disc = this.element('circle',{cx: A.x, cy: A.y, r: size});
                    this.set_stroke(disc);
                    return disc;
                case BOX:
                    const r = this.element('rect',{x:A.x-size, y:A.y-size, width: 2*size, height: 2*size});
                    this.set_fill(r,false);
                    return r;
                case PLUS:
                    const plus = this.element('path',{
                        d: `M ${dp(A.x-size)} ${dp(A.y)} l ${dp(2*size)} 0 M ${dp(A.x)} ${dp(A.y-size)} l 0 ${dp(2*size)}`
                    });
                    this.set_stroke(plus);
                    return plus;
                case CROSS:
                    const cross = this.element('path',{
                        d: `M ${dp(A.x-size)} ${dp(A.y-size)} l ${dp(2*size)} ${dp(2*size)} M ${dp(A.x-size)} ${dp(A.y+size)} l ${dp(2*size)} ${dp(-2*size)}`
                    });
                    this.set_stroke(cross);
                    return cross;
                default:
                    console.error("no style");
            }
        })();
        let desc = this.local.shape;
        if(this.local.draggable) {
            desc = `draggable ${desc}`;
        }
        if(this.has_label_for_point(A)) {
            desc += ` at ${this.label_for_point(A)}`;
        }
        this.set_aria_label(element,desc);
        return element;
    }

    draw_text(text,x,y) {
        const e = this.element('text',{x:x,y:-y,'dominant-baseline': 'central', transform: 'scale(1,-1)'},clean_label(text));
        this.set_font(e);
        this.set_fill(e,false);
        return e;
    }

    label_point(A) {
        const text = this.local.label_text;
        if(!text) {
            return;
        }
        let angle = this.local.label_direction || 0;
        if(angle>PI) {
            angle -= 2*PI;
        }
        if(angle<-PI) {
            angle += 2*PI;
        }
        const dist = this.SIZE(this.local.label_dist);
        const x = A.x+dist*cos(angle);
        const y = A.y+dist*sin(angle);
        const e = this.draw_text(text,x,y);
        let textAlign = 'start';
        let dy = '0';
        if(angle>=3*PI/4 || angle<=-3*PI/4) {
            textAlign = 'end';
        } else if(angle>PI/4 || angle<-PI/4) {
            textAlign = 'middle';
            if(angle>PI/4) {
                dy = '-0.5em';
            } else {
                dy = '0.5em';
            }
        }
        if(dist==0) {
            textAlign = 'middle';
        }
        e.setAttribute('dy',dy);
        e.setAttribute('text-anchor',textAlign);
        let desc = `label "${clean_label(text)}"`;
        if(this.aria_mode==VERBOSE) {
            desc += ` at ${A}`;
        } 
        this.set_aria_label(e,desc);
        return e;
    }

    label_segment(A,B) {
        const size = this.SIZE(0.1);

        const angle = argument(A,B);
        const x = (A.x+B.x)/2;
        const y = (A.y+B.y)/2;

        const g = this.element('g');
        const s = this.draw_polygon(new Set([A,B]));
        let desc = s.getAttribute('aria-label') || '';
        g.appendChild(s);

        let mark, text;
        if(this.local.label_segment!=NONE) {
            mark = this.transform(this.element('path'), `translate(${dp(x)} ${dp(y)}) scale(${dp(size)}) rotate(${dp(RTOD(angle))})`);
            this.set_stroke(mark);
            mark.setAttribute('stroke-width',mark.getAttribute('stroke-width')/size);
            this.set_style(mark);
            let d;
            switch(this.local.label_segment) {
                case SIMPLE: 
                    d = `M -0.5 -1 L 0.5 1`;
                    desc += ', marked with a dash';
                    break;
                case DOUBLE:
                    d = `M -1 -1 L 0 1 M 0 -1 L 1 1`;
                    desc += ', marked with two dashes';
                    break;
                case TRIPLE:
                    d = `M -1.5 -1 L -0.5 1 M -0.5 -1 L 0.5 1 M 0.5 -1 L 1.5 1`;
                    desc += ', marked with three dashes';
                    break;
            }
            mark.setAttribute('d',d);
            g.appendChild(mark);
        }
        if(this.local.label_text) {
            this.push_local_settings();
            if(this.local.label_direction===undefined) {
                this.local.label_direction = argument(A,B)+PI/2;
            }
            const m = Point.create_midpoint(new Set([A,B]));
            text = this.label_point(m);
            this.pop_local_settings();
            g.appendChild(text);
            text.removeAttribute('aria-label');
            desc += `, labelled "${this.local.label_text}"`;
        }
        g.setAttribute('aria-label',desc);
        return g;
    }

    draw_mark(B,r,a,b) {
        const e = this.arc(B.x,B.y,r,a,b);
        this.set_stroke(e);
        return e;
    }

    draw_arrow(x,y,angle,size) {
        const p = this.transform(
            this.element('path',{d:`M -2 1 L 0.0362998 0.0803779 A 0.088194 0.088194 0 0 0 0.0362998 -0.0803779 L -2 -1 L -1 0 z`}),
            `translate(${dp(x)} ${dp(y)}) rotate(${dp(RTOD(angle))}) scale(${dp(size)})`
        );
        this.set_fill(p,false);
        return p;
    }

    label_angle(A,B,C) {
        const a = argument(B,C);
        const b = argument(B,A);
        const wiggle = (a%(2*PI)+(a<0 ? 2*PI : 0))/(4*PI)*0.2; // so angles round the same point can be distinguished
        const r = this.SIZE(0.5+wiggle);
        const s = 0.08/this.scale;
        let mida = (b-a)/2;
        if(mida>0) {
            mida += PI;
        }
        let x1,y1,x2,y2;
        const t = (8*PI/180)/this.local.size;
        const g = this.element('g');

        let desc = 'angle';
        if(this.has_label_for_point(A) && this.has_label_for_point(B) && this.has_label_for_point(C)) {
            desc += ` ${this.label_for_point(A)} ${this.label_for_point(B)} ${this.label_for_point(C)}`;
        }
        switch(this.local.angle) {
            case SIMPLE:
                g.appendChild(this.draw_mark(B,r,a,b));
                switch(this.local.dec) {
                    case DOTTED:
                        [x1,y1,x2,y2] = this.set_xy(A,B,C,this.SIZE(Math.sqrt(2)/8));
                        g.appendChild(this.draw_dot(B.x+x1+x2,B.y+y1+y2,this.SIZE(0.05)));
                        desc += ' marked with a dot';
                        break;
                    case DASHED:
                        g.appendChild(this.draw_dash(B.x,B.y,(a+b)/2,r-s,r+s));
                        desc += ' marked with a dash';
                        break;
                }
                break;
            case DOUBLE:
                switch(this.local.dec) {
                    case DOTTED:
                        g.appendChild(this.draw_mark(B,r,a,b));
                        g.appendChild(this.draw_double_dot(B.x,B.y,(a+b)/2-t,t*2,r*0.75,0.03));
                        desc += ' marked with two dots';
                        break;
                    case DASHED:
                        g.appendChild(this.draw_mark(B,r,a,b));
                        g.appendChild(this.draw_double_dash(B.x,B.y,(a+b)/2-t/2,r+s,r-s,t));
                        desc += ' marked with two dashes';
                        break;
                    default:
                        g.appendChild(this.draw_double_arc(B.x,B.y,r-s/2,r+s/2,a,b));
                        desc += ' double marked';
                }
                break;
            case TRIPLE:
                switch(this.local.dec) {
                    case DASHED:
                        g.appendChild(this.draw_mark(B,r,a,b));
                        g.appendChild(this.draw_triple_dash(B.x,B.y,(a+b)/2-t,r+s,r-s,t));
                        desc += ' marked with three dashes';
                        break;
                    case DOTTED:
                        g.appendChild(this.draw_mark(B,r,a,b));
                        g.appendChild(this.draw_triple_dot(B.x,B.y,(a+b)/2-t,t*2,r*0.75,0.03));
                        desc += ' marked with three dots';
                        break;
                    default:
                        g.appendChild(this.draw_triple_arc(B.x,B.y,r-s,r,r+s,a,b));
                        desc += ' triple marked';
                        break;
                }
                break;
            case RIGHT:
                [x1,y1,x2,y2] = this.set_xy(A,B,C,this.SIZE(0.35));
                const p = this.element('path',{d:`M ${dp(B.x+x1)} ${dp(B.y+y1)} l ${dp(x2)} ${dp(y2)} l ${dp(-x1)} ${dp(-y1)}`});
                this.set_stroke(p);
                g.appendChild(p);
                desc = 'right '+desc;
                if(this.local.dec==DOTTED) {
                    g.appendChild(this.draw_dot(B.x+(x1+x2)/2,B.y+(y1+y2)/2,this.SIZE(0.05)));
                    desc += ' marked with a dot';
                }
                break;
            case FORTH:
                this.draw_mark(B,r,a,b);
                [x1,y1,x2,y2] = this.set_xy(A,B,C,r);
                g.appendChild(this.draw_arrow(B.x+x2,B.y+y2, a+acos(0.12/this.scale), 0.1/this.scale));
                desc += ' clockwise';
                break;
            case BACK:
                this.draw_mark(B,r,a,b);
                [x1,y1,x2,y2] = this.set_xy(A,B,C,r);
                g.appendChild(this.draw_arrow(B.x+x1,B.y+y1, b-acos(0.12/this.scale), 0.1/this.scale));
                desc += ' anti-clockwise';
                break;
        }
        if(this.local.label_text) {
            desc += ` labelled "${clean_label(this.local.label_text)}"`;
            this.push_local_settings();
            this.local.label_direction = a + mida;
            this.local.label_dist = (r+2*s)*this.scale;
            const text = this.label_point(B);
            g.appendChild(text);
            this.pop_local_settings();
        }
        this.set_aria_label(g,desc);
        return g;
    }

    polygon(set,closed) {
        const p = this.element(closed ? 'polygon' : 'polyline');
        p.setAttribute('points',set.points.map(p=>`${p.x},${p.y}`).join(' '));
        return p;
    }

    draw_polygon(set) {
        const p = this.polygon(set, set.points.length>2 && this.local.arrow==NONE && this.local.close);
        this.set_stroke(p);
        this.set_style(p);
        let desc;
        if(set.points.length==2) {
            desc = `line segment`;
            if(this.has_label_for_point(set.points[0]) && this.has_label_for_point(set.points[1])) {
                desc += ` from ${this.label_for_point(set.points[0])} to ${this.label_for_point(set.points[1])}`;
            }
        } else {
            desc = this.local.close ? set.shape_name() : 'path';
            if(set.points.every(p=>this.has_label_for_point(p))) {
                desc += ` through ${set.points.map(p=>this.label_for_point(p)).join(', ')}`;
            } else if(desc=='polygon' || desc=='path') {
                desc += ` through ${set.points.length} vertices`;
            }
        }
        desc = this.describe_style(desc);
        if(this.local.arrow != NONE && set.points.length>=2) {
            const g = this.element('g');
            g.appendChild(p);
            if(this.local.dir==BACK || this.local.arrow==ARROWS) {
                const [p1,p2] = set.points;
                g.appendChild(this.draw_arrow(p1.x,p1.y,argument(p2,p1),this.SIZE(0.1)));
            }
            if(this.local.dir==FORTH || this.local.arrow==ARROWS) {
                const [p3,p4] = [set.points[set.points.length-2], set.points[set.points.length-1]];
                g.appendChild(this.draw_arrow(p4.x,p4.y,argument(p3,p4),this.SIZE(0.1)));
            }
            desc = this.describe_arrows(desc);
            this.set_aria_label(g,desc);
            return g;
        } else {
            this.set_aria_label(p,desc);
            return p;
        }
    }

    fill_polygon(set) {
        const p = this.polygon(set,true);
        this.set_fill(p);
        let desc = `filled ${set.shape_name()}`;
        switch(this.local.style) {
            case DOTTED:
                desc = `dotted ${desc}`;
                break;
            case DASHED:
                desc = `striped ${desc}`;
                break;
        }
        if(set.points.every(p=>this.has_label_for_point(p))) {
            desc += ` through vertices ${set.points.map(p=>this.label_for_point(p)).join(', ')}`;
        } else if(set.shape_name()=='polygon') {
            desc += ` through ${set.points.length} vertices`;
        }
        this.set_aria_label(p,desc);
        return p;
    }

    draw_line(l) {
        let m_x=this.min_x, m_y = this.min_y, M_x = this.max_x, M_y = this.max_y;
        let desc = 'line';
        if(this.local.part==HALF) {
            desc = 'ray';
            if((this.local.dir==FORTH && (l.a> -PI/2 && l.a <= PI/2)) || (this.local.dir==BACK && (l.a<= -PI/2 || l.a > PI/2))) {
                m_x = l.x;
            } else {
                M_x = l.x;
            }
            if((this.local.dir == FORTH && l.a > 0) || (this.local.dir == BACK && l.a<=0)) {
                m_y = l.y;
            } else {
                M_y = l.y;
            }
        }
        const x = [0,0];
        const y = [0,0];
        let i = 0;
        if(l.a==PI/2 || l.a==-PI/2) {
            if(l.x >= m_x && l.x <= M_x) {
                x[0] = x[1] = l.x;
                y[0] = m_y;
                y[1] = M_y;
                i = 2;
            }
        } else if(l.a==0 || l.a==PI) {
            if(l.y >= m_y && l.y <= M_y) {
                y[0] = y[1] = l.y;
                x[0] = m_x;
                x[1] = M_x;
                i = 2;
            }
        } else {
            const t = tan(l.a);
            let z = t*(m_x-l.x)+l.y;
            if(z >= m_y && z <= M_y) {
                x[i] = m_x;
                y[i] = z;
                i += 1;
            }
            z = t*(M_x-l.x)+l.y;
            if(z >= m_y && z<= M_y) {
                x[i] = M_x;
                y[i] = z;
                i += 1;
            }
            z = (m_y-l.y)/t+l.x;
            if(z > m_x && z< M_x && i<2) {
                x[i] = z;
                y[i] = m_y;
                i += 1;
            }
            z = (M_y-l.y)/t+l.x;
            if(z > m_x && z< M_x && i<2) {
                x[i] = z;
                y[i] = M_y;
                i += 1;
            }
        }
        if(i==2) {
            const p = this.element('line',{x1:x[0],y1:y[0],x2:x[1],y2:y[1]});
            switch(l.defined_by.kind) {
                case 'heading':
                    if(this.has_label_for_point(l)) {
                        desc += ` through ${this.label_for_point(l)}`;
                    }
                    if(this.aria_mode==VERBOSE) {
                        desc += ` with heading ${dpformat(RTOD(l.a))}°`;
                    }
                    break;
                case 'points':
                    const lps = l.defined_by.points.filter(p=>this.has_label_for_point(p));
                    if(lps.length>0) {
                        desc += ` through ${lps.join(' and ')}`;
                    }
                    break;
                case 'vector':
                    if(this.has_label_for_point(l)) {
                        desc += ` through ${this.label_for_point(l)}`;
                    }
                    if(this.aria_mode==VERBOSE) {
                        desc += ` with vector ${l.defined_by.vector}`;
                    }
                    break;
            }
            desc = this.describe_style(desc);
            this.set_aria_label(p,desc);
            this.set_stroke(p);
            this.set_style(p);
            return p;
        }

    }

    draw_circle(c) {
        const e = this.element('circle',{cx:c.x,cy:c.y,r:c.r});
        this.set_stroke(e);
        this.set_style(e);
        let desc = 'circle';
        if(this.has_label_for_point(c)) {
            desc += ` centred at ${this.label_for_point(c)}`;
        }
        if(this.aria_mode==VERBOSE) {
            desc += ` with radius ${dpformat(c.r)}`;
        }
        desc = this.describe_style(desc);
        this.set_aria_label(e,desc);
        return e;
    }

    draw_arc(c,a,b) {
        const arc = this.arc(c.x,c.y,c.r,b,a);
        this.set_stroke(arc);
        this.set_style(arc);
        let desc = 'arc';
        if(this.has_label_for_point(c)) {
            desc += ` centred at ${this.label_for_point(c)}`;
        }
        if(this.aria_mode==VERBOSE) {
            desc += ` with radius ${dpformat(c.r)} between ${dpformat(RTOD(a))}° and ${dpformat(RTOD(b))}°`;
        }
        desc = this.describe_style(desc);
        if(this.local.arrow!=NONE) {
            const g = this.element('g');
            g.appendChild(arc);
            const d = acos(this.SIZE(.06)/c.r);
            if(this.local.dir == BACK || this.local.arrow == ARROWS) {
                g.appendChild(this.draw_arrow(c.x+c.r*cos(b), c.y+c.r*sin(b), b+d, this.SIZE(0.1)));
            }
            if(this.local.dir == FORTH || this.local.arrow == ARROWS) {
                g.appendChild(this.draw_arrow(c.x+c.r*cos(a), c.y+c.r*sin(a), a-d, this.SIZE(0.1)));
            }
            if(this.local.arrow==ARROWS) {
                desc += ' with an arrow at each end';
            } else {
                desc += this.local.dir==BACK ? ' anti-clockwise' : ' clockwise';
            }
            this.set_aria_label(g,desc);
            return g;
        } else {
            this.set_aria_label(arc,desc);
            return arc;
        }
    }

    fill_arc(c,a,b) {
        const arc = this.arc(c.x,c.y,c.r,b,a);
        this.set_fill(arc);
        this.set_style(arc);
        let desc = 'filled arc';
        if(this.has_label_for_point(c)) {
            desc += ` centred at ${this.label_for_point(c)}`;
        }
        if(this.aria_mode==VERBOSE) {
            desc += ` with radius ${dpformat(c.r)} between ${dpformat(RTOD(a))}° and ${dpformat(RTOD(b))}°`;
        }
        desc = this.describe_style(desc);
        this.set_aria_label(arc,desc);
        return arc;
    }

    fill_circle(c) {
        const e = this.element('circle',{cx:c.x,cy:c.y,r:c.r});
        this.set_fill(e);
        let desc = 'filled circle';
        if(this.has_label_for_point(c)) {
            desc += ` centred at ${this.label_for_point(c)}`;
        }
        if(this.aria_mode==VERBOSE) {
            desc += ` with radius ${dpformat(c.r)}`;
        }
        this.set_aria_label(e,desc);
        return e;
    }

    draw_parabolic_arc(x0,y0,p,f,g,c,s) {
        const e = acos(p/this.get_max(x0,y0)-1);
        f = Math.max(f,-e);
        g = Math.min(g,e);
        const ds = [];
        for(let t=f, n=1; t<=g; t+=this.local.step*PI/180, n++) {
            const [x,y] = parametric_parabola(t,x0,y0,p,c,s);
            ds.push(n==1 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        const path = this.element('path',{d:ds.join(' ')});
        this.set_stroke(path);
        this.set_style(path);
        let desc = `parabola`;
        desc = this.describe_style(desc);
        this.set_aria_label(path,desc);
        return path;
    }

    draw_elliptic_arc(x0,y0,a,b,f,g,c,s) {
        const ds = [];
        for(let t=f,n=1; t<=g; t+= this.local.step*PI/180, n++) {
            const [x,y] = parametric_ellipse(t,x0,y0,a,b,c,s);
            ds.push(n==1 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        const path = this.element('path',{d:ds.join(' ')});
        this.set_stroke(path);
        this.set_style(path);
        let desc = 'ellipse';
        desc = this.describe_style(desc);
        this.set_aria_label(path,desc);
        return path;
    }

    draw_branch(i,j,x0,y0,a,b,f,g,c,s) {
        i = Math.max(i,f);
        j = Math.min(j,g);
        const ds = [];
        for(let t=i,n=1; t<=j; t+=this.local.step*PI/180, n++) {
            const [x,y] = parametric_hyperbola(t,x0,y0,a,b,c,s);
            ds.push(n==1 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        const path = this.element('path',{d:ds.join(' ')});
        this.set_stroke(path);
        this.set_style(path);
        let desc = 'hyperbola';
        desc = this.describe_style(desc);
        this.set_aria_label(path,desc);
        return path;
    }
}

/** Minimization routines
 * from https://github.com/bijection/g9/blob/master/src/minimize.js
 * 
 * MIT License
 * 
 * Copyright (c) 2016
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

function norm2(x){
    return Math.sqrt(x.reduce((a,b)=>a+b*b,0))
}

function identity(n){
    var ret = Array(n)
    for (var i = 0; i < n; i++) {
        ret[i] = Array(n)
        for (var j = 0; j < n; j++) ret[i][j] = +(i == j) ;
    }
    return ret
}

function neg(x){
    return x.map(a=>-a)
}

function dot(a,b){
    if (typeof a[0] !== 'number'){
        return a.map(x=>dot(x,b))
    }
    return a.reduce((x,y,i) => x+y*b[i],0)
}

function sub(a,b){
    if(typeof a[0] !== 'number'){
        return a.map((c,i)=>sub(c,b[i]))
    }
    return a.map((c,i)=>c-b[i])
}

function add(a,b){
    if(typeof a[0] !== 'number'){
        return a.map((c,i)=>add(c,b[i]))
    }
    return a.map((c,i)=>c+b[i])
}

function div(a,b){
    return a.map(c=>c.map(d=>d/b))
}

function mul(a,b){
    if(typeof a[0] !== 'number'){
        return a.map(c=>mul(c,b))
    }
    return a.map(c=>c*b)
}

function ten(a,b){
    return a.map((c,i)=>mul(b,c))
}

function isZero(a){
    for (var i = 0; i < a.length; i++) {
        if(a[i]!== 0) return false
    }
    return true
}

// Adapted from the numeric.js gradient and uncmin functions
// Numeric Javascript
// Copyright (C) 2011 by Sébastien Loisel

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

function gradient(f,x) {
    var dim = x.length, f1 = f(x);
    if(isNaN(f1)) throw new Error('The gradient at ['+x.join(' ')+'] is NaN!');
    var {max, abs, min} = Math
    var tempX = x.slice(0), grad = Array(dim);
    for(var i=0; i<dim; i++) {
        var delta = max(1e-6*f1, 1e-8);
        for (var k = 0;; k++) {
            if(k == 20) throw new Error("Gradient failed at index "+i+" of ["+x.join(' ')+"]");
            tempX[i] = x[i]+delta;
            var f0 = f(tempX);
            tempX[i] = x[i]-delta;
            var f2 = f(tempX);
            tempX[i] = x[i];
            if(!(isNaN(f0) || isNaN(f2))) {
                grad[i] = (f0-f2)/(2*delta)
                var t0 = x[i]-delta;
                var t1 = x[i];
                var t2 = x[i]+delta;
                var d1 = (f0-f1)/delta;
                var d2 = (f1-f2)/delta;
                var err = min(max(abs(d1-grad[i]),abs(d2-grad[i]),abs(d1-d2)),delta);
                var normalize = max(abs(grad[i]),abs(f0),abs(f1),abs(f2),abs(t0),abs(t1),abs(t2),1e-8);
                if(err/normalize < 1e-3) break; //break if this index is done
            }
            delta /= 16
        }
    }
    return grad;
}

function minimize(f, x0, end_on_line_search,tol=1e-8,maxit=1000) {


    tol = Math.max(tol,2e-16);
    var grad = a => gradient(f,a)

    x0 = x0.slice(0)
    var g0 = grad(x0)
    var f0 = f(x0)
    if(isNaN(f0)) throw new Error('minimize: f(x0) is a NaN!');
    var n = x0.length;
    var H1 = identity(n)
    
    for(var it = 0; it<maxit; it++) {
        if(!g0.every(isFinite)) { var msg = "Gradient has Infinity or NaN"; break; }
        var step = neg(dot(H1,g0));
        if(!step.every(isFinite)) { var msg = "Search direction has Infinity or NaN"; break; }
        var nstep = norm2(step);
        if(nstep < tol) { var msg="Newton step smaller than tol"; break; }
        var t = 1;
        var df0 = dot(g0,step);
        // line search
        var x1 = x0;
        var s;
        for(;it < maxit && t*nstep >= tol; it++) {
            s = mul(step,t);
            x1 = add(x0,s);
            var f1 = f(x1);
            if(!(f1-f0 >= 0.1*t*df0 || isNaN(f1))) break;
            t *= 0.5;
        }
        if(t*nstep < tol && end_on_line_search) {var msg = "Line search step size smaller than tol"; break; }
        if(it === maxit) { var msg = "maxit reached during line search"; break; }
        var g1 = grad(x1);
        var y = sub(g1,g0);
        var ys = dot(y,s);
        var Hy = dot(H1,y);
        H1 = sub(add(H1,mul(ten(s,s),(ys+dot(y,Hy))/(ys*ys))),div(add(ten(Hy,s),ten(s,Hy)),ys));
        x0 = x1;
        f0 = f1;
        g0 = g1;
    }

    return {solution: x0, f: f0, gradient: g0, invHessian: H1, iterations:it, message: msg};
}

function findPhaseChange(f, known_true, known_false){
    while(Math.abs(known_true - known_false) > 1e-3){
        var mid = (known_true + known_false) / 2
        f(mid) ? known_true = mid : known_false = mid
    }
    return (known_true + known_false) / 2
}


/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/).
 
 https://groups.google.com/forum/?fromgroups=#!topic/d3-js/iyXFgJR1JY0
 */

const colorbrewer = { 

/*** Diverging ***/
Spectral:  {3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(153,213,148)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(171,221,164)', 'rgb(43,131,186)'], 6: ['rgb(213,62,79)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(50,136,189)'], 7: ['rgb(213,62,79)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(153,213,148)', 'rgb(50,136,189)'], 8: ['rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)'], 9: ['rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)'], 10: ['rgb(158,1,66)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(94,79,162)'], 11: ['rgb(158,1,66)', 'rgb(213,62,79)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(230,245,152)', 'rgb(171,221,164)', 'rgb(102,194,165)', 'rgb(50,136,189)', 'rgb(94,79,162)'], 'properties':{'type': 'div', 'blind':[2,2,2,0,0,0,0,0,0],'print':[1,1,1,0,0,0,0,0,0],'copy':[1,1,1,0,0,0,0,0,0],'screen':[1,1,2,0,0,0,0,0,0] } } ,
RdYlGn:  {3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(145,207,96)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(166,217,106)', 'rgb(26,150,65)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(166,217,106)', 'rgb(26,150,65)'], 6: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(145,207,96)', 'rgb(26,152,80)'], 7: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(145,207,96)', 'rgb(26,152,80)'], 8: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'], 9: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)'], 10: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)', 'rgb(0,104,55)'], 11: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,139)', 'rgb(255,255,191)', 'rgb(217,239,139)', 'rgb(166,217,106)', 'rgb(102,189,99)', 'rgb(26,152,80)', 'rgb(0,104,55)'], 'properties':{'type': 'div', 'blind':[2,2,2,0,0,0,0,0,0],'print':[1,1,1,2,0,0,0,0,0],'copy':[0],'screen':[1,1,1,0,0,0,0,0,0] } } ,
RdBu:  {3: ['rgb(239,138,98)', 'rgb(247,247,247)', 'rgb(103,169,207)'], 4: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(146,197,222)', 'rgb(5,113,176)'], 5: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(247,247,247)', 'rgb(146,197,222)', 'rgb(5,113,176)'], 6: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(103,169,207)', 'rgb(33,102,172)'], 7: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(103,169,207)', 'rgb(33,102,172)'], 8: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)'], 9: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)'], 10: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)', 'rgb(5,48,97)'], 11: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(247,247,247)', 'rgb(209,229,240)', 'rgb(146,197,222)', 'rgb(67,147,195)', 'rgb(33,102,172)', 'rgb(5,48,97)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,1,1,0,0,0,0,0],'copy':[0],'screen':[1,1,1,0,0,0,0,0,0] } } ,
PiYG:  {3: ['rgb(233,163,201)', 'rgb(247,247,247)', 'rgb(161,215,106)'], 4: ['rgb(208,28,139)', 'rgb(241,182,218)', 'rgb(184,225,134)', 'rgb(77,172,38)'], 5: ['rgb(208,28,139)', 'rgb(241,182,218)', 'rgb(247,247,247)', 'rgb(184,225,134)', 'rgb(77,172,38)'], 6: ['rgb(197,27,125)', 'rgb(233,163,201)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(161,215,106)', 'rgb(77,146,33)'], 7: ['rgb(197,27,125)', 'rgb(233,163,201)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(161,215,106)', 'rgb(77,146,33)'], 8: ['rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)'], 9: ['rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)'], 10: ['rgb(142,1,82)', 'rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)', 'rgb(39,100,25)'], 11: ['rgb(142,1,82)', 'rgb(197,27,125)', 'rgb(222,119,174)', 'rgb(241,182,218)', 'rgb(253,224,239)', 'rgb(247,247,247)', 'rgb(230,245,208)', 'rgb(184,225,134)', 'rgb(127,188,65)', 'rgb(77,146,33)', 'rgb(39,100,25)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,2,0,0,0,0,0,0],'copy':[0],'screen':[1,1,2,0,0,0,0,0,0] } } ,
PRGn:  {3: ['rgb(175,141,195)', 'rgb(247,247,247)', 'rgb(127,191,123)'], 4: ['rgb(123,50,148)', 'rgb(194,165,207)', 'rgb(166,219,160)', 'rgb(0,136,55)'], 5: ['rgb(123,50,148)', 'rgb(194,165,207)', 'rgb(247,247,247)', 'rgb(166,219,160)', 'rgb(0,136,55)'], 6: ['rgb(118,42,131)', 'rgb(175,141,195)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(127,191,123)', 'rgb(27,120,55)'], 7: ['rgb(118,42,131)', 'rgb(175,141,195)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(127,191,123)', 'rgb(27,120,55)'], 8: ['rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)'], 9: ['rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)'], 10: ['rgb(64,0,75)', 'rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)', 'rgb(0,68,27)'], 11: ['rgb(64,0,75)', 'rgb(118,42,131)', 'rgb(153,112,171)', 'rgb(194,165,207)', 'rgb(231,212,232)', 'rgb(247,247,247)', 'rgb(217,240,211)', 'rgb(166,219,160)', 'rgb(90,174,97)', 'rgb(27,120,55)', 'rgb(0,68,27)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,1,1,0,0,0,0,0],'copy':[0],'screen':[1,1,2,2,0,0,0,0,0] } } ,
RdYlBu:  {3: ['rgb(252,141,89)', 'rgb(255,255,191)', 'rgb(145,191,219)'], 4: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(171,217,233)', 'rgb(44,123,182)'], 5: ['rgb(215,25,28)', 'rgb(253,174,97)', 'rgb(255,255,191)', 'rgb(171,217,233)', 'rgb(44,123,182)'], 6: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(145,191,219)', 'rgb(69,117,180)'], 7: ['rgb(215,48,39)', 'rgb(252,141,89)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(145,191,219)', 'rgb(69,117,180)'], 8: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)'], 9: ['rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)'], 10: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)', 'rgb(49,54,149)'], 11: ['rgb(165,0,38)', 'rgb(215,48,39)', 'rgb(244,109,67)', 'rgb(253,174,97)', 'rgb(254,224,144)', 'rgb(255,255,191)', 'rgb(224,243,248)', 'rgb(171,217,233)', 'rgb(116,173,209)', 'rgb(69,117,180)', 'rgb(49,54,149)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,1,1,2,0,0,0,0],'copy':[0],'screen':[1,1,1,2,0,0,0,0,0] } } ,
BrBG:  {3: ['rgb(216,179,101)', 'rgb(245,245,245)', 'rgb(90,180,172)'], 4: ['rgb(166,97,26)', 'rgb(223,194,125)', 'rgb(128,205,193)', 'rgb(1,133,113)'], 5: ['rgb(166,97,26)', 'rgb(223,194,125)', 'rgb(245,245,245)', 'rgb(128,205,193)', 'rgb(1,133,113)'], 6: ['rgb(140,81,10)', 'rgb(216,179,101)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(90,180,172)', 'rgb(1,102,94)'], 7: ['rgb(140,81,10)', 'rgb(216,179,101)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(90,180,172)', 'rgb(1,102,94)'], 8: ['rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)'], 9: ['rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)'], 10: ['rgb(84,48,5)', 'rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)', 'rgb(0,60,48)'], 11: ['rgb(84,48,5)', 'rgb(140,81,10)', 'rgb(191,129,45)', 'rgb(223,194,125)', 'rgb(246,232,195)', 'rgb(245,245,245)', 'rgb(199,234,229)', 'rgb(128,205,193)', 'rgb(53,151,143)', 'rgb(1,102,94)', 'rgb(0,60,48)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,1,1,0,0,0,0,0],'copy':[0],'screen':[1,1,1,1,0,0,0,0,0] } } ,
RdGy:  {3: ['rgb(239,138,98)', 'rgb(255,255,255)', 'rgb(153,153,153)'], 4: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(186,186,186)', 'rgb(64,64,64)'], 5: ['rgb(202,0,32)', 'rgb(244,165,130)', 'rgb(255,255,255)', 'rgb(186,186,186)', 'rgb(64,64,64)'], 6: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(153,153,153)', 'rgb(77,77,77)'], 7: ['rgb(178,24,43)', 'rgb(239,138,98)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(153,153,153)', 'rgb(77,77,77)'], 8: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)'], 9: ['rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)'], 10: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)', 'rgb(26,26,26)'], 11: ['rgb(103,0,31)', 'rgb(178,24,43)', 'rgb(214,96,77)', 'rgb(244,165,130)', 'rgb(253,219,199)', 'rgb(255,255,255)', 'rgb(224,224,224)', 'rgb(186,186,186)', 'rgb(135,135,135)', 'rgb(77,77,77)', 'rgb(26,26,26)'], 'properties':{'type': 'div','blind':[2],'print':[1,1,1,2,0,0,0,0,0],'copy':[0],'screen':[1,1,2,0,0,0,0,0,0] } } ,
PuOr:  {3: ['rgb(241,163,64)', 'rgb(247,247,247)', 'rgb(153,142,195)'], 4: ['rgb(230,97,1)', 'rgb(253,184,99)', 'rgb(178,171,210)', 'rgb(94,60,153)'], 5: ['rgb(230,97,1)', 'rgb(253,184,99)', 'rgb(247,247,247)', 'rgb(178,171,210)', 'rgb(94,60,153)'], 6: ['rgb(179,88,6)', 'rgb(241,163,64)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(153,142,195)', 'rgb(84,39,136)'], 7: ['rgb(179,88,6)', 'rgb(241,163,64)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(153,142,195)', 'rgb(84,39,136)'], 8: ['rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)'], 9: ['rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)'], 10: ['rgb(127,59,8)', 'rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)', 'rgb(45,0,75)'], 11: ['rgb(127,59,8)', 'rgb(179,88,6)', 'rgb(224,130,20)', 'rgb(253,184,99)', 'rgb(254,224,182)', 'rgb(247,247,247)', 'rgb(216,218,235)', 'rgb(178,171,210)', 'rgb(128,115,172)', 'rgb(84,39,136)', 'rgb(45,0,75)'], 'properties':{'type': 'div','blind':[1],'print':[1,1,2,2,0,0,0,0,0],'copy':[1,1,0,0,0,0,0,0,0],'screen':[1,1,1,1,0,0,0,0,0] } } ,

/*** Qualitative ***/
Set2:  {3: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)'], 4: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)'], 5: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)'], 6: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)'], 7: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)'], 8: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)', 'rgb(179,179,179)'], 'properties':{'type': 'qual','blind':[1,2,2,2,0,0,0],'print':[1,1,1,2,2,2],'copy':[0],'screen':[1,1,2,2,2,2] } } ,
Accent:  {3: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)'], 4: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)'], 5: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)'], 6: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)'], 7: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)', 'rgb(191,91,23)'], 8: ['rgb(127,201,127)', 'rgb(190,174,212)', 'rgb(253,192,134)', 'rgb(255,255,153)', 'rgb(56,108,176)', 'rgb(240,2,127)', 'rgb(191,91,23)', 'rgb(102,102,102)'], 'properties':{'type': 'qual','blind':[2,0,0,0,0,0,0],'print':[1,1,2,2,2,2],'copy':[0],'screen':[1,1,1,2,2,2] } } ,
Set1:  {3: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)'], 4: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)'], 5: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)'], 6: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)'], 7: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)'], 8: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)', 'rgb(247,129,191)'], 9: ['rgb(228,26,28)', 'rgb(55,126,184)', 'rgb(77,175,74)', 'rgb(152,78,163)', 'rgb(255,127,0)', 'rgb(255,255,51)', 'rgb(166,86,40)', 'rgb(247,129,191)', 'rgb(153,153,153)'], 'properties':{'type': 'qual','blind':[2],'print':[1],'copy':[0],'screen':[1] } } ,
Set3:  {3: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)'], 4: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)'], 5: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)'], 6: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)'], 7: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)'], 8: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)'], 9: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)'], 10: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)'], 11: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)'], 12: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)', 'rgb(255,237,111)'], 'properties':{'type': 'qual','blind':[2,2,0,0,0,0,0,0,0,0],'print':[1,1,1,1,1,1,2,0,0,0],'copy':[1,2,2,2,2,2,2,0,0,0],'screen':[1,1,1,2,2,2,0,0,0,0] } } ,
Dark2:  {3: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)'], 4: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)'], 5: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)'], 6: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)'], 7: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)', 'rgb(166,118,29)'], 8: ['rgb(27,158,119)', 'rgb(217,95,2)', 'rgb(117,112,179)', 'rgb(231,41,138)', 'rgb(102,166,30)', 'rgb(230,171,2)', 'rgb(166,118,29)', 'rgb(102,102,102)'], 'properties':{'type': 'qual','blind':[1,2,2,2,0,0],'print':[1],'copy':[0],'screen':[1] } } ,
Paired:  {3: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)'], 4: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)'], 5: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)'], 6: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)'], 7: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)'], 8: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)'], 9: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)'], 10: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)'], 11: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)', 'rgb(255,255,153)'], 12: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)', 'rgb(202,178,214)', 'rgb(106,61,154)', 'rgb(255,255,153)', 'rgb(177,89,40)'], 'properties':{'type': 'qual','blind':[1,1,2,2,2,2,0,0,0],'print':[1,1,1,1,1,2,2,2,2],'copy':[0],'screen':[1,1,1,1,1,1,1,1,2] } } ,
Pastel2:  {3: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)'], 4: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)'], 5: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)'], 6: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)'], 7: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)', 'rgb(241,226,204)'], 8: ['rgb(179,226,205)', 'rgb(253,205,172)', 'rgb(203,213,232)', 'rgb(244,202,228)', 'rgb(230,245,201)', 'rgb(255,242,174)', 'rgb(241,226,204)', 'rgb(204,204,204)'], 'properties':{'type': 'qual','blind':[2,0,0,0,0,0],'print':[2,0,0,0,0,0],'copy':[0],'screen':[2,2,0,0,0,0] } } ,
Pastel1:  {3: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)'], 4: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)'], 5: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)'], 6: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)'], 7: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)'], 8: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)', 'rgb(253,218,236)'], 9: ['rgb(251,180,174)', 'rgb(179,205,227)', 'rgb(204,235,197)', 'rgb(222,203,228)', 'rgb(254,217,166)', 'rgb(255,255,204)', 'rgb(229,216,189)', 'rgb(253,218,236)', 'rgb(242,242,242)'], 'properties':{'type': 'qual','blind':[2,0,0,0,0,0,0],'print':[2,2,2,0,0,0,0],'copy':[0],'screen':[2,2,2,2,0,0,0] } } ,

// from https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/
Trubetskoy: {3: ['#ffe119','#4363d8','#f58231'], 4: ['#ffe119','#4363d8','#f58231','#e6beff'], 5: ['#ffe119','#4363d8','#f58231','#e6beff','#800000'], 6: ['#ffe119','#4363d8','#f58231','#e6beff','#800000','#000075'], 'properties': {'type': 'qual','blind':[1],'print':[1],'copy':[1],'screen':[1] } },

/*** Sequential ***/
OrRd:  {3: ['rgb(254,232,200)', 'rgb(253,187,132)', 'rgb(227,74,51)'], 4: ['rgb(254,240,217)', 'rgb(253,204,138)', 'rgb(252,141,89)', 'rgb(215,48,31)'], 5: ['rgb(254,240,217)', 'rgb(253,204,138)', 'rgb(252,141,89)', 'rgb(227,74,51)', 'rgb(179,0,0)'], 6: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(227,74,51)', 'rgb(179,0,0)'], 7: ['rgb(254,240,217)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 8: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(153,0,0)'], 9: ['rgb(255,247,236)', 'rgb(254,232,200)', 'rgb(253,212,158)', 'rgb(253,187,132)', 'rgb(252,141,89)', 'rgb(239,101,72)', 'rgb(215,48,31)', 'rgb(179,0,0)', 'rgb(127,0,0)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,0,0,0,0,0],'copy':[1,1,2,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
PuBu:  {3: ['rgb(236,231,242)', 'rgb(166,189,219)', 'rgb(43,140,190)'], 4: ['rgb(241,238,246)', 'rgb(189,201,225)', 'rgb(116,169,207)', 'rgb(5,112,176)'], 5: ['rgb(241,238,246)', 'rgb(189,201,225)', 'rgb(116,169,207)', 'rgb(43,140,190)', 'rgb(4,90,141)'], 6: ['rgb(241,238,246)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(43,140,190)', 'rgb(4,90,141)'], 7: ['rgb(241,238,246)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(3,78,123)'], 8: ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(3,78,123)'], 9: ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(4,90,141)', 'rgb(2,56,88)'], 'properties':{'type': 'seq','blind':[1],'print':[1,2,2,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,2,0,0,0,0] } } ,
BuPu:  {3: ['rgb(224,236,244)', 'rgb(158,188,218)', 'rgb(136,86,167)'], 4: ['rgb(237,248,251)', 'rgb(179,205,227)', 'rgb(140,150,198)', 'rgb(136,65,157)'], 5: ['rgb(237,248,251)', 'rgb(179,205,227)', 'rgb(140,150,198)', 'rgb(136,86,167)', 'rgb(129,15,124)'], 6: ['rgb(237,248,251)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(136,86,167)', 'rgb(129,15,124)'], 7: ['rgb(237,248,251)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(110,1,107)'], 8: ['rgb(247,252,253)', 'rgb(224,236,244)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(110,1,107)'], 9: ['rgb(247,252,253)', 'rgb(224,236,244)', 'rgb(191,211,230)', 'rgb(158,188,218)', 'rgb(140,150,198)', 'rgb(140,107,177)', 'rgb(136,65,157)', 'rgb(129,15,124)', 'rgb(77,0,75)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,2,2,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
Oranges:  {3: ['rgb(254,230,206)', 'rgb(253,174,107)', 'rgb(230,85,13)'], 4: ['rgb(254,237,222)', 'rgb(253,190,133)', 'rgb(253,141,60)', 'rgb(217,71,1)'], 5: ['rgb(254,237,222)', 'rgb(253,190,133)', 'rgb(253,141,60)', 'rgb(230,85,13)', 'rgb(166,54,3)'], 6: ['rgb(254,237,222)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(230,85,13)', 'rgb(166,54,3)'], 7: ['rgb(254,237,222)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(140,45,4)'], 8: ['rgb(255,245,235)', 'rgb(254,230,206)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(140,45,4)'], 9: ['rgb(255,245,235)', 'rgb(254,230,206)', 'rgb(253,208,162)', 'rgb(253,174,107)', 'rgb(253,141,60)', 'rgb(241,105,19)', 'rgb(217,72,1)', 'rgb(166,54,3)', 'rgb(127,39,4)'], 'properties':{'type': 'seq','blind':[1],'print':[1,2,0,0,0,0,0],'copy':[1,2,2,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
BuGn:  {3: ['rgb(229,245,249)', 'rgb(153,216,201)', 'rgb(44,162,95)'], 4: ['rgb(237,248,251)', 'rgb(178,226,226)', 'rgb(102,194,164)', 'rgb(35,139,69)'], 5: ['rgb(237,248,251)', 'rgb(178,226,226)', 'rgb(102,194,164)', 'rgb(44,162,95)', 'rgb(0,109,44)'], 6: ['rgb(237,248,251)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(44,162,95)', 'rgb(0,109,44)'], 7: ['rgb(237,248,251)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,88,36)'], 8: ['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,88,36)'], 9: ['rgb(247,252,253)', 'rgb(229,245,249)', 'rgb(204,236,230)', 'rgb(153,216,201)', 'rgb(102,194,164)', 'rgb(65,174,118)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,2,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
YlOrBr:  {3: ['rgb(255,247,188)', 'rgb(254,196,79)', 'rgb(217,95,14)'], 4: ['rgb(255,255,212)', 'rgb(254,217,142)', 'rgb(254,153,41)', 'rgb(204,76,2)'], 5: ['rgb(255,255,212)', 'rgb(254,217,142)', 'rgb(254,153,41)', 'rgb(217,95,14)', 'rgb(153,52,4)'], 6: ['rgb(255,255,212)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(217,95,14)', 'rgb(153,52,4)'], 7: ['rgb(255,255,212)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(140,45,4)'], 8: ['rgb(255,255,229)', 'rgb(255,247,188)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(140,45,4)'], 9: ['rgb(255,255,229)', 'rgb(255,247,188)', 'rgb(254,227,145)', 'rgb(254,196,79)', 'rgb(254,153,41)', 'rgb(236,112,20)', 'rgb(204,76,2)', 'rgb(153,52,4)', 'rgb(102,37,6)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,2,0,0,0,0],'copy':[1,2,2,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
YlGn:  {3: ['rgb(247,252,185)', 'rgb(173,221,142)', 'rgb(49,163,84)'], 4: ['rgb(255,255,204)', 'rgb(194,230,153)', 'rgb(120,198,121)', 'rgb(35,132,67)'], 5: ['rgb(255,255,204)', 'rgb(194,230,153)', 'rgb(120,198,121)', 'rgb(49,163,84)', 'rgb(0,104,55)'], 6: ['rgb(255,255,204)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(49,163,84)', 'rgb(0,104,55)'], 7: ['rgb(255,255,204)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,90,50)'], 8: ['rgb(255,255,229)', 'rgb(247,252,185)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,90,50)'], 9: ['rgb(255,255,229)', 'rgb(247,252,185)', 'rgb(217,240,163)', 'rgb(173,221,142)', 'rgb(120,198,121)', 'rgb(65,171,93)', 'rgb(35,132,67)', 'rgb(0,104,55)', 'rgb(0,69,41)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,1,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
Reds:  {3: ['rgb(254,224,210)', 'rgb(252,146,114)', 'rgb(222,45,38)'], 4: ['rgb(254,229,217)', 'rgb(252,174,145)', 'rgb(251,106,74)', 'rgb(203,24,29)'], 5: ['rgb(254,229,217)', 'rgb(252,174,145)', 'rgb(251,106,74)', 'rgb(222,45,38)', 'rgb(165,15,21)'], 6: ['rgb(254,229,217)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(222,45,38)', 'rgb(165,15,21)'], 7: ['rgb(254,229,217)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(153,0,13)'], 8: ['rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(153,0,13)'], 9: ['rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)', 'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)', 'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'], 'properties':{'type': 'seq','blind':[1],'print':[1,2,2,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
RdPu:  {3: ['rgb(253,224,221)', 'rgb(250,159,181)', 'rgb(197,27,138)'], 4: ['rgb(254,235,226)', 'rgb(251,180,185)', 'rgb(247,104,161)', 'rgb(174,1,126)'], 5: ['rgb(254,235,226)', 'rgb(251,180,185)', 'rgb(247,104,161)', 'rgb(197,27,138)', 'rgb(122,1,119)'], 6: ['rgb(254,235,226)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(197,27,138)', 'rgb(122,1,119)'], 7: ['rgb(254,235,226)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)'], 8: ['rgb(255,247,243)', 'rgb(253,224,221)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)'], 9: ['rgb(255,247,243)', 'rgb(253,224,221)', 'rgb(252,197,192)', 'rgb(250,159,181)', 'rgb(247,104,161)', 'rgb(221,52,151)', 'rgb(174,1,126)', 'rgb(122,1,119)', 'rgb(73,0,106)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,1,2,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
Greens:  {3: ['rgb(229,245,224)', 'rgb(161,217,155)', 'rgb(49,163,84)'], 4: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(35,139,69)'], 5: ['rgb(237,248,233)', 'rgb(186,228,179)', 'rgb(116,196,118)', 'rgb(49,163,84)', 'rgb(0,109,44)'], 6: ['rgb(237,248,233)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(49,163,84)', 'rgb(0,109,44)'], 7: ['rgb(237,248,233)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,90,50)'], 8: ['rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,90,50)'], 9: ['rgb(247,252,245)', 'rgb(229,245,224)', 'rgb(199,233,192)', 'rgb(161,217,155)', 'rgb(116,196,118)', 'rgb(65,171,93)', 'rgb(35,139,69)', 'rgb(0,109,44)', 'rgb(0,68,27)'], 'properties':{'type': 'seq','blind':[1],'print':[1,0,0,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
YlGnBu:  {3: ['rgb(237,248,177)', 'rgb(127,205,187)', 'rgb(44,127,184)'], 4: ['rgb(255,255,204)', 'rgb(161,218,180)', 'rgb(65,182,196)', 'rgb(34,94,168)'], 5: ['rgb(255,255,204)', 'rgb(161,218,180)', 'rgb(65,182,196)', 'rgb(44,127,184)', 'rgb(37,52,148)'], 6: ['rgb(255,255,204)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(44,127,184)', 'rgb(37,52,148)'], 7: ['rgb(255,255,204)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(12,44,132)'], 8: ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(12,44,132)'], 9: ['rgb(255,255,217)', 'rgb(237,248,177)', 'rgb(199,233,180)', 'rgb(127,205,187)', 'rgb(65,182,196)', 'rgb(29,145,192)', 'rgb(34,94,168)', 'rgb(37,52,148)', 'rgb(8,29,88)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,1,2,2,2,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,2,0,0,0,0] } } ,
Purples:  {3: ['rgb(239,237,245)', 'rgb(188,189,220)', 'rgb(117,107,177)'], 4: ['rgb(242,240,247)', 'rgb(203,201,226)', 'rgb(158,154,200)', 'rgb(106,81,163)'], 5: ['rgb(242,240,247)', 'rgb(203,201,226)', 'rgb(158,154,200)', 'rgb(117,107,177)', 'rgb(84,39,143)'], 6: ['rgb(242,240,247)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(117,107,177)', 'rgb(84,39,143)'], 7: ['rgb(242,240,247)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(74,20,134)'], 8: ['rgb(252,251,253)', 'rgb(239,237,245)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(74,20,134)'], 9: ['rgb(252,251,253)', 'rgb(239,237,245)', 'rgb(218,218,235)', 'rgb(188,189,220)', 'rgb(158,154,200)', 'rgb(128,125,186)', 'rgb(106,81,163)', 'rgb(84,39,143)', 'rgb(63,0,125)'], 'properties':{'type': 'seq','blind':[1],'print':[1,0,0,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,0,0,0,0,0,0] } } ,
GnBu:  {3: ['rgb(224,243,219)', 'rgb(168,221,181)', 'rgb(67,162,202)'], 4: ['rgb(240,249,232)', 'rgb(186,228,188)', 'rgb(123,204,196)', 'rgb(43,140,190)'], 5: ['rgb(240,249,232)', 'rgb(186,228,188)', 'rgb(123,204,196)', 'rgb(67,162,202)', 'rgb(8,104,172)'], 6: ['rgb(240,249,232)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(67,162,202)', 'rgb(8,104,172)'], 7: ['rgb(240,249,232)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,88,158)'], 8: ['rgb(247,252,240)', 'rgb(224,243,219)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,88,158)'], 9: ['rgb(247,252,240)', 'rgb(224,243,219)', 'rgb(204,235,197)', 'rgb(168,221,181)', 'rgb(123,204,196)', 'rgb(78,179,211)', 'rgb(43,140,190)', 'rgb(8,104,172)', 'rgb(8,64,129)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,1,2,2,2,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,2,0,0,0,0] } } ,
Greys:  {3: ['rgb(240,240,240)', 'rgb(189,189,189)', 'rgb(99,99,99)'], 4: ['rgb(247,247,247)', 'rgb(204,204,204)', 'rgb(150,150,150)', 'rgb(82,82,82)'], 5: ['rgb(247,247,247)', 'rgb(204,204,204)', 'rgb(150,150,150)', 'rgb(99,99,99)', 'rgb(37,37,37)'], 6: ['rgb(247,247,247)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(99,99,99)', 'rgb(37,37,37)'], 7: ['rgb(247,247,247)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(115,115,115)', 'rgb(82,82,82)', 'rgb(37,37,37)'], 8: ['rgb(255,255,255)', 'rgb(240,240,240)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(115,115,115)', 'rgb(82,82,82)', 'rgb(37,37,37)'], 9: ['rgb(255,255,255)', 'rgb(240,240,240)', 'rgb(217,217,217)', 'rgb(189,189,189)', 'rgb(150,150,150)', 'rgb(115,115,115)', 'rgb(82,82,82)', 'rgb(37,37,37)', 'rgb(0,0,0)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,2,0,0,0,0],'copy':[1,0,0,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
YlOrRd:  {3: ['rgb(255,237,160)', 'rgb(254,178,76)', 'rgb(240,59,32)'], 4: ['rgb(255,255,178)', 'rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(227,26,28)'], 5: ['rgb(255,255,178)', 'rgb(254,204,92)', 'rgb(253,141,60)', 'rgb(240,59,32)', 'rgb(189,0,38)'], 6: ['rgb(255,255,178)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(240,59,32)', 'rgb(189,0,38)'], 7: ['rgb(255,255,178)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(177,0,38)'], 8: ['rgb(255,255,204)', 'rgb(255,237,160)', 'rgb(254,217,118)', 'rgb(254,178,76)', 'rgb(253,141,60)', 'rgb(252,78,42)', 'rgb(227,26,28)', 'rgb(177,0,38)'], 9:['rgb(255,255,204)','rgb(255,237,160)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(189,0,38)','rgb(128,0,38)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,2,2,0,0,0],'copy':[1,2,2,0,0,0,0],'screen':[1,2,2,0,0,0,0] } } ,
PuRd:  {3: ['rgb(231,225,239)', 'rgb(201,148,199)', 'rgb(221,28,119)'], 4: ['rgb(241,238,246)', 'rgb(215,181,216)', 'rgb(223,101,176)', 'rgb(206,18,86)'], 5: ['rgb(241,238,246)', 'rgb(215,181,216)', 'rgb(223,101,176)', 'rgb(221,28,119)', 'rgb(152,0,67)'], 6: ['rgb(241,238,246)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(221,28,119)', 'rgb(152,0,67)'], 7: ['rgb(241,238,246)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(145,0,63)'], 8: ['rgb(247,244,249)', 'rgb(231,225,239)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(145,0,63)'], 9: ['rgb(247,244,249)', 'rgb(231,225,239)', 'rgb(212,185,218)', 'rgb(201,148,199)', 'rgb(223,101,176)', 'rgb(231,41,138)', 'rgb(206,18,86)', 'rgb(152,0,67)', 'rgb(103,0,31)'], 'properties':{'type': 'seq','blind':[1],'print':[1,1,1,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,1,0,0,0,0] } } ,
Blues:  {3: ['rgb(222,235,247)', 'rgb(158,202,225)', 'rgb(49,130,189)'], 4: ['rgb(239,243,255)', 'rgb(189,215,231)', 'rgb(107,174,214)', 'rgb(33,113,181)'], 5: ['rgb(239,243,255)', 'rgb(189,215,231)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'], 6: ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'], 7: ['rgb(239,243,255)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,69,148)'], 8: ['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,69,148)'], 9: ['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)'], 'properties':{'type': 'seq','blind':[1],'print':[1,2,0,0,0,0,0],'copy':[1,0,0,0,0,0,0],'screen':[1,2,0,0,0,0,0] } } ,
PuBuGn:  {3: ['rgb(236,226,240)', 'rgb(166,189,219)', 'rgb(28,144,153)'], 4: ['rgb(246,239,247)', 'rgb(189,201,225)', 'rgb(103,169,207)', 'rgb(2,129,138)'], 5: ['rgb(246,239,247)', 'rgb(189,201,225)', 'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,108,89)'], 6: ['rgb(246,239,247)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,108,89)'], 7: ['rgb(246,239,247)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,100,80)'], 8: ['rgb(255,247,251)', 'rgb(236,226,240)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,100,80)'], 9: ['rgb(255,247,251)', 'rgb(236,226,240)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(103,169,207)', 'rgb(54,144,192)', 'rgb(2,129,138)', 'rgb(1,108,89)', 'rgb(1,70,54)'], 'properties':{'type': 'seq','blind':[1],'print':[1,2,2,0,0,0,0],'copy':[1,2,0,0,0,0,0],'screen':[1,1,2,0,0,0,0] } } 
}

function color_schemes(n, kind) {
    const scheme_names = Object.keys(colorbrewer).filter(name=>{
        const scheme = colorbrewer[name];
        function check(oks) {
            return oks.length==1 ? oks[0] : oks[n-3];
        }
        return scheme.properties.type==kind && check(scheme.properties.blind)==1 && check(scheme.properties.screen)==1;
    });
    const schemes = scheme_names.map(name=>colorbrewer[name][n]);
    return schemes;
}

export {
    Obj, Point, Vector, Line, Set, Circle, Conic, Ellipse, Hyperbola, Parabola,
    point_line_distance,
    orthogonal_projection, parallel_projection, lines_intersection, line_set_intersection, 
    line_circle_intersection, line_conic_intersection, sets_intersection, circles_intersection,
    circle_set_intersection,
    TriangleMaker, QuadrilateralMaker,
    Drawer, SVGDrawer,
    labels, styles, shapes, parts, dirs, arrows, colors,
    minimize, gradient, findPhaseChange,
    colorbrewer, color_schemes
};
