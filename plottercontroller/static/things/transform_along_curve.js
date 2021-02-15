import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function rectify_curve(fn,tolerance) {
    return rpoints;
}

class Curve {
    constructor(fn,tolerance,limit) {
        this.limit = limit;
        this.fn = fn;

        function point(x) {
            return {t:x, p:fn(x)};
        }
        function subdivide(a,b) {
            const [dx,dy] = [b.p.x-a.p.x, b.p.y-a.p.y];
            const d = dx*dx+dy*dy;
            if(d<tolerance*tolerance) {
                b.d = Math.sqrt(d);
                return [a,b];
            } else {
                const c = point((a.t+b.t)/2);
                return subdivide(a,c).concat(subdivide(c,b).slice(1));
            }
        }
        const rpoints = subdivide(point(0),point(limit));
        let a = rpoints[0];
        let along = 0;
        a.along = 0;
        rpoints.slice(1).forEach((b,i) => {
            if(b.d === undefined) {
                const [dx,dy] = [b.p.x-a.p.x, b.p.y-a.p.y];
                const d = dx*dx+dy*dy;
                b.d = Math.sqrt(d);
            }
            b.along = along;
            along += b.d;
            
            a = b;
        })
        this.points = rpoints;
    }

    map(p) {
        const t = p.x;
        const oy = p.y;
        if(t>this.limit) {
            console.log(t);
            return {x:0,y:0,angle:0};
        }
        let a = this.points[0];
        for(let b of this.points.slice(1)) {
            if(t>=a.t && t<=b.t) {
                const t1 = a.t;
                const t2 = b.t;
                const dt = (t2-t1);
                const dx = (b.p.x-a.p.x);
                const dy = (b.p.y-a.p.y);
                const d = b.d;
                const [x,y] = [a.p.x + dt*dx + oy*dy/d, a.p.y + dt*dy - oy*dx/d];
                const angle = Math.atan2(dy,dx);
                return {x,y,angle};
            }

            a = b;
        }
    }
}

window.rectify_curve = rectify_curve;
const curve = window.c = new Curve(t=>{return {x: t, y: -10000+5000*Math.sin(t/3000)}},10,136000);


const _primes = [2,3];
function* primes() {
    for(let p of _primes) {
        yield p;
    }
    for(let i=_primes[_primes.length-1]+2;;i+=2) {
        let prime = true;
        for(let p of _primes) {
            if(p*p>i) {
                break;
            }
            if(i%p==0) {
                prime = false;
                break;
            }
        }
        if(prime) {
            yield i;
            _primes.push(i);
        }
    }
}

function factorise(n) {
    const factors = [];
    for(let p of primes()) {
        if(n<=1) {
            break;
        }
        let x = 0;
        while(n%p==0) {
            x += 1;
            n = n/p;
        }
        factors.push([p,x]);
    }
    return factors;
}

function tex_factorise(n) {
    if(n==1) {
        return '1';
    }
    let bits = [];
    const tex = factorise(n).map(([p,x],i)=> x>0 && p+(x>1 ? `^{${x}}` : '')).filter(x=>x).join(' \\times ');
    return tex;
}

let tex = '';
for(let i=1;i<50;i++) {
    tex += `\\frac{1}{${i}!}x^{${i}} + `;
}

function spiral_transform(cx,cy,a,start) {
    return p => {
        let theta = invert(arclength(a),start+p.x,1);
        let r = theta*a+p.y;
        return {
            x: cx+Math.cos(theta)*r, 
            y: cy+Math.sin(theta)*r,
            angle: Math.PI/2+theta
        };
    };
}
math(tex,0,0,2,false).then(g => {
    const svg = document.querySelector('svg');
    let screenm = svg.getScreenCTM();
    screenm.e = 0;
    screenm.f = 0;
    const root = g;
    const rm = root.getCTM();
    const p = svg.createSVGPoint();
    p.x = 40;
    p.y = 65;
    const tp = p.matrixTransform(rm.inverse().multiply(screenm));
    const t = p=>curve.map({x:p.x,y:p.y});
    Array.from(g.querySelectorAll('path')).forEach(p => {
        let pp = p;
        let sm = svg.createSVGMatrix();
        let go = true;
        while(pp && go) {
            if(pp.transform.baseVal.length>0) {
                go = false;
                const t = pp.transform.baseVal[pp.transform.baseVal.length-1];
                if(t.type==SVGTransform.SVG_TRANSFORM_SCALE) {
                    sm = sm.multiply(t.matrix);
                }
            }
            pp = pp.parentElement;
        }
        const m = p.getCTM().multiply(sm.inverse());
        let relm = rm.inverse().multiply(m);
        const dx = relm.e/relm.a;
        const dy = relm.f/relm.d;
        const {x,y,angle} = t({x:dx,y:-dy});
        let om = relm.translate(-dx,-dy);
        om = om.translate(x,y).rotate(angle*180/Math.PI).multiply(sm);

        root.appendChild(p);
        p.transform.baseVal.initialize(svg.createSVGTransformFromMatrix(om));
    })
});
