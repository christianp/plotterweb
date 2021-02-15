import {stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {PI} = Math;

function polygon(x,y,r,n,wobble) {
    const amps = [];
    for(let i=0;i<n;i++) {
        amps.push(uniform(0,wobble));
    }
    const rs = [];
    for(let i=0;i<n;i++) {
        let t = 0;
        amps.forEach((a,j) => t += Math.pow(1.3,-j)*a*Math.sin(2*PI*i/360*(j+1)));
        rs.push(t);
    }
    const points = [];
    for(let i=0;i<n;i++) {
        const an = 2*PI*i/n;
        const R = (1+rs[i])*r;
        points.push([x+R*Math.cos(an), y+R*Math.sin(an)]);
    }
    return points;
}

function len(p) {
    const [x,y] = p;
    return Math.sqrt(x*x+y*y);
}

function centroid(points) {
    let tx = 0;
    let ty = 0;
    for(let [x,y] of points) {
        tx += x;
        ty += y;
    }
    tx /= points.length;
    ty /= points.length;
    return [tx,ty];
}

function zigzag(points,minr) {
    const [cx,cy] = centroid(points);
    let out = [];
    let steps = 0;
    while(steps<100) {
        steps += 1;
        out = out.concat(points);
        let maxd = 0;
        points = points.map(p=>{
            let [x,y] = p;
            const d = len([x-cx,y-cy]);
            maxd = Math.max(d,maxd);
            return [(x-cx)*(d-1)/d+cx, (y-cy)*(d-1)/d+cy];
        });
        if(maxd<minr) {
            break;
        }
    }
    return polyline(out);
}

zigzag(polygon(70,55,40,360,0.5),1);
