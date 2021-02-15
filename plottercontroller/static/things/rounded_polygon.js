import {clear, number_input, input, stroke, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI, sqrt} = Math;

function regular_polygon(cx,cy,r,n, oa) {
    const points = [];
    oa = oa===undefined ? Math.random()*2*PI : oa;
    for(let i=0;i<n;i++) {
        const a = 2*PI*i/n + oa;
        points.push([cx+r*cos(a), cy+r*sin(a)]);
    }
    return points;
}

function star(cx,cy,r1,r2,n,oa) {
    const points = [];
    oa = oa===undefined ? Math.random()*2*PI : oa;
    for(let i=0;i<n;i++) {
        const a = 2*PI*i/n + oa;
        points.push([cx+r1*cos(a), cy+r1*sin(a)]);
        const b = 2*PI*(i+0.5)/n + oa;
        points.push([cx+r2*cos(b), cy+r2*sin(b)]);
    }
    return points;
}

function round_polygon(points,r) {
    const l = points.length;
    let d = '';
    points.forEach(([px,py],i) => {
        const [ax,ay] = points[(i+l-1)%l];
        const [bx,by] = points[(i+1)%l];
        const [dx1,dy1] = [ax-px,ay-py];
        const d1 = Math.sqrt(dx1*dx1 + dy1*dy1);
        const [dx2,dy2] = [bx-px,by-py];
        const d2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        const [aax,aay] = [px+dx1*r/d1, py+dy1*r/d1];
        const [bbx,bby] = [px+dx2*r/d2, py+dy2*r/d2];
        const dp = (dx1*dx2+dy1*dy2)/(d1*d2);
        const alpha = Math.PI/2 - Math.acos(dp)/2;
        const rr = r/Math.tan(alpha);
        const ndp = (dx1*dy2-dy1*dx2)/(d1*d2);
        const concave = ndp>0;
        d += `${d ? 'L' : 'M'} ${aax} ${aay} A ${rr} ${rr} 0 0 ${concave ? 0 : 1} ${bbx} ${bby}`;
    });
    d += `z`;
    return path(d);
}

function jewel(cx,cy,r,n) {
    const r1 = r;
    const r2 = r*7/20;
    const rounding = r*6/20;
    const poly = star(cx,cy,r1,r2,n,0);
    round_polygon(poly,rounding);
    round_polygon(regular_polygon(cx,cy,r1,n,0),rounding);
    round_polygon(regular_polygon(cx,cy,r2,n,0),rounding*r2/r1);
}

const r1_input = number_input(1,100,'Big radius',20,go);
const r2_input = number_input(1,100,'Small radius',8,go);
const rounding_input = number_input(1,100,'Rounding',2,go);

function go() {
    const r1 = parseFloat(r1_input.value);
    const r2 = parseFloat(r2_input.value);
    const rounding = parseFloat(rounding_input.value);

    clear();
    const COLS = 3;
    const ROWS = 2;
    const w = r1*2.5;
    for(let i=0;i<6;i++) {
        const x = i%COLS-(COLS-1)/2;
        const y = (i-x)/COLS-1;
        jewel(x*w+70,y*w+55,r1,i+3);
    }
}

go();
