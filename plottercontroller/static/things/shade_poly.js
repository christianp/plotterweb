import {attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI, sqrt} = Math;

function shade_poly(points,n=10) {
    let length = 0;
    let lastp = points[points.length-1];
    for(let p of points) {
        const [x1,y1] = lastp;
        const [x2,y2] = p;
        const [dx,dy] = [x2-x1, y2-y1];
        const d = sqrt(dx*dx+dy*dy);
        length += d;
        lastp = p;
    }

    function pos(t) {
        t *= length;
        let lastp = points[points.length-1];
        for(let p of points) {
            const [x1,y1] = lastp;
            const [x2,y2] = p;
            const [dx,dy] = [x2-x1, y2-y1];
            const d = sqrt(dx*dx+dy*dy);
            if(t<d) {
                return [x1+t*dx/d, y1+t*dy/d];
            } else {
                t -= d;
            }
            lastp = p;
        }
        return [0,0];
    }

    for(let i=0;i<points.length;i++) {
        for(let j=0;j<points.length;j++) {
            if(i==j) {
                continue;
            }
            const [x1,y1] = pos(i/points.length);
            const [x2,y2] = pos(j/points.length);
            const [dx,dy] = [x2-x1,y2-y1];
            const d = sqrt(dx*dx+dy*dy);
            const r = uniform(2,3)*d;
            attr(path(`M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`),{'buffer':1});
        }
    }
}

function regular_polygon(cx,cy,r,n) {
    const points = [];
    const oa = Math.random()*2*PI;
    for(let i=0;i<n;i++) {
        const a = 2*PI*i/n + oa;
        points.push([cx+r*cos(a), cy+r*sin(a)]);
    }
    return points;
}

const COLS = 2;
const start = 4;
const last = 4;
const ROWS = Math.ceil((last+1-start)/COLS);
const MARGIN = 5;
for(let n=start;n<=last;n++) {
    const x = (n-start)%COLS;
    const y = (n-start-x)/COLS;
    const r = (110-2*MARGIN)/ROWS/2;
    const cx = MARGIN +(140-110)/2+ 2*(r)*x + r;
    const cy = MARGIN + 2*(r)*y + r;
    shade_poly(regular_polygon(cx,cy,r-MARGIN/2,n),15);
}
