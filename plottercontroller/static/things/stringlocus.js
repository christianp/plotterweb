import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function dist(a,b) {
    const [dx,dy] = [b.x-a.x, b.y-a.y];
    return Math.sqrt(dx*dx+dy*dy);
}

function locus(points,slack) {
    let length = 0;
    for(let i=0;i<points.length;i++) {
        const d = dist(points[i],points[(i+1)%points.length]);
        length += d;
    }

    for(let i=0;i<points.length;i++) {
        const [a,b] = [points[i],points[(i+1)%points.length]];
        const d = dist(a,b);
        const t = length - d;
    }
}

const s = 30;
const k = 0.8;
const j = 0.25;
let d = `M ${-s} 0`;
for(let x=-1;x<=1;x+=0.01) {
    const z = Math.exp(x*j)
    const y = k*z*Math.sqrt(1-x*x);
    d += ` L ${s*x},${s*y}`;
}
for(let x=1;x>=-1;x-=0.01) {
    const z = Math.exp(x*j)
    const y = k*z*Math.sqrt(1-x*x);
    d += ` L ${s*x},${-s*y}`;
}
d += ' z';
attr(path(d),{transform: 'translate(33 30) '});
math('x^2 + \\frac{4}{5}y^2 e^{x/4} = 1',11,32,2.8);
