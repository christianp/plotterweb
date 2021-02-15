import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

const ease_cubicinout = function(t) {
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function spiral(g,cx,cy) {
    return function(x,y) {
        const h = g*x+10;
        const r = h*(x/(2*Math.PI) + y);
        return [cx+r*Math.cos(x),cy+r*Math.sin(x)];
    }
}

function split(x1,y1,y2,w,depth,fn) {
    const my = (y1+y2)/2;
    const [cx,cy] = fn(x1,my);
    let d1 = `M ${cx} ${cy}`;
    let d2 = `M ${cx} ${cy}`;
    for(let rt=0;rt<=100;rt++) {
        const t = rt/100;
        const x = x1+t*w;
        const tt = ease_cubicinout(t);
        const ya = (1-tt)*my + tt*(3*y1+y2)/4;
        const yb = (1-tt)*my + tt*(3*y2+y1)/4;
        const [dx1,dy1] = fn(x,ya);
        const [dx2,dy2] = fn(x,yb);
        d1 += ` L ${dx1} ${dy1}`;
        d2 += ` L ${dx2} ${dy2}`;
    }
    let o = [];
    o.push(path(d1));
    o.push(path(d2));
    if(depth>0) {
        o = o.concat(split(x1+w,y1,(y1+y2)/2,w*1.3,depth-1,fn));
        o = o.concat(split(x1+w,(y2+y1)/2,y2,w*1.3,depth-1,fn));
    }
    return o;
}

const sp = spiral(1,70,50);
split(0,0,1.7,1.6,5,sp);
for(let p of split(0,0,1.7,1.6,5,((x,y) => [40*Math.sqrt(x),100*y/1.7]))) {
    stroke(p,'green');
}

let d = `M 70 50`;
for(let t=0;t<10;t+=0.01) {
    const [x,y] = sp(t,Math.sin(10*t)*2+5);
    d += ` L ${x} ${y}`;
}
//path(d);
