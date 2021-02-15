import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function arclength(r) {
    return theta => 0.5 * r* (theta*Math.sqrt(1+theta*theta) + Math.log(theta+Math.sqrt(1+theta*theta)));
}

/** Find x such that |fn(x) - y| < tolerance.
 */
function invert(fn,y,x0,tolerance) {
    let x = x0;
    let steps = 0;
    while(steps<100) {
        steps += 1;
        const dx = 0.001;
        const y0 = fn(x);
        if(Math.abs(y0-y)<tolerance) {
            break;
        }
        const y1 = fn(x+dx);
        const dy = y1-y0;
        const d = dy/dx;
        x = x + (y-y0)/d;
    }
    return x;
}

window.invert = invert;
window.arclength = arclength;

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
for(let i=1;i<500;i++) {
    tex += tex_factorise(i)+' \\quad ';
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
    console.log(screenm);
    const root = g;
    const rm = root.getCTM();
    const p = svg.createSVGPoint();
    p.x = 40;
    p.y = 65;
    const tp = p.matrixTransform(rm.inverse().multiply(screenm));
    const t = spiral_transform(tp.x,-tp.y,200,3000);
    console.log(rm);
    console.log(tp.x,tp.y);
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
