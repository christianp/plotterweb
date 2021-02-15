import {stroke, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

function regular_polygon(cx,cy,r,n) {
    const points = [];
    const oa = Math.random()*2*PI;
    for(let i=0;i<n;i++) {
        const a = 2*PI*i/n + oa;
        points.push({x:cx+r*cos(a), y: cy+r*sin(a)});
    }
    return points;
}

const colors = ['#ffe119','#4363d8','#f58231','#e6beff','#800000','#000075'];


const poly = regular_polygon(W/2,H/2,40,3);

function shrink(poly,f) {
    let tx = 0;
    let ty = 0;
    for(let p of poly) {
        tx += p.x;
        ty += p.y;
    }
    const n = poly.length;
    tx /= n;
    ty /= n;
    return poly.map(p=>{ return {x: tx+(p.x-tx)*f, y: ty+(p.y-ty)*f} });
}

function corner_shrink(poly,corner,f) {
    const c = poly[corner];
    return poly.map((p,i) => { return {x: c.x+(p.x-c.x)*f, y: c.y+(p.y-c.y)*f} });
}

function radial_fill(poly,step=2) {
    poly.forEach((p,i) => {
        const a = poly[(i+poly.length-1)%poly.length];
        const b = poly[(i+1)%poly.length];
        const [dax,day] = [a.x-p.x, a.y-p.y];
        const [dbx,dby] = [b.x-p.x, b.y-p.y];
        const da = Math.sqrt(dax*dax+day*day);
        const db = Math.sqrt(dbx*dbx+dby*dby);
        for(let r=step;r<da/2;r+= step) {
            stroke(path(`M ${p.x+dax*r/da},${p.y+day*r/da} A ${r} ${r} 0 0 0 ${p.x+dbx*r/db},${p.y+dby*r/db}`),colors[i]);
        }
    });
}
function randrange(n) {
    return Math.floor(Math.random()*n);
}

function transform(rot,tx,ty) {
    return poly => poly.map(p=> {
        return {x: tx + Math.cos(rot)*p.x + Math.sin(rot)*p.y, y: ty - Math.sin(rot)*p.x + Math.cos(rot)*p.y}
    });
}

function midpoint(a,b) {
    return {x: (a.x+b.x)/2, y: (a.y+b.y)/2};
}

function subdivide(poly) {
    const [a,b,c] = poly;
    const ab = midpoint(a,b);
    const ac = midpoint(a,c);
    const bc = midpoint(b,c);
    return [[ab,bc,ac], [a,ab,ac], [ab,b,bc], [bc,c,ac] ];
}

function go(poly,n,t,s) {
    poly = s(poly);
    if(n<=0 ) {
        t(poly);
    } else {
        const sub = subdivide(poly);
        t(sub[0]);
        for(let p of sub.slice(1)) {
            go(p,n-1,t,s);
        }
    }
}

const R = 90;
const TH = Math.sqrt(3)/2 * R;
const SHRINK = 0.95;
const xsteps = W/R;
const ysteps = H/(TH);
const t = transform(uniform(-0.5,0.5),W/2,H/2);
const s = poly => shrink(corner_shrink(poly,randrange(3),uniform(SHRINK,1)),uniform(SHRINK,1));
const d = poly => radial_fill(t(poly),uniform(1,3));
for(let ix=-xsteps;ix<xsteps; ix++) {
    const x = ix*R;
    for(let iy=-ysteps;iy<ysteps; iy++) {
        const y = iy*TH;
        const c1 = randrange(3);
        const poly1 = [ {x: x, y: y}, {x:x+R, y:y}, {x:x+R/2, y:y+TH} ];
        go(poly1,2,d,s);
        const poly2 = [ {x: x+R, y: y}, {x:x+R*3/2, y:y+TH}, {x:x+R/2, y:y+TH} ];
        go(poly2,2,d,s);
    }
}
