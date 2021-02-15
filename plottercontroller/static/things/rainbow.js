import {attr, choice,polyline, stroke, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

const THICKNESS = 0.3;

const COLOURS = ['red','yellow','green','blue','violet'];

function rainbow(cx,cy,r) {
    const a = uniform(0,PI);
    const l = (uniform(0,1)**2+1)*0.1*PI;
    const start = Math.max(0,a-l/2);
    const end = Math.min(PI,a+l/2);
    const [x1,y1] = [cx + cos(PI+start)*r, cy+sin(PI+start)*r];
    const [x2,y2] = [cx + cos(PI+end)*r, cy+sin(PI+end)*r];
    const N = COLOURS.length;
    const s = (N-1)*a/PI;
    const i = Math.floor(s) + (Math.random()<(s%1) ? 1 : 0);
    const e = stroke(path(`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`),COLOURS[i]);
    layers[i].appendChild(e);
    return e;
}

const layers = [];
COLOURS.forEach((c,i) => {
    const g = stroke(element('g',{id: `Pen ${i+1}`}),c);
    layers.push(g);
})

for(let i=0;i<500;i++) {
    rainbow(W/2,H-10,uniform(1-THICKNESS,1)*H/2);
}
