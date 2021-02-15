import {text,attr, choice,polyline, stroke, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

const THICKNESS = 0.3;

const COLOURS = ['red','yellow','green','blue','violet'];

circle(W/2,H/2,20);

for(let n=0;n<500;n++) {
    const R = 20;
    const TURN = 0.01;
    const SPEED = 0.01;
    const theta = uniform(0,2*PI);
    const rr = uniform(1,5)*R
    const [cx,cy] = [W/2,H/2];
    let [x,y] = [cx+rr*cos(theta), cy+rr*sin(theta)];
    const points = [[x,y]];
    let an = -theta;
    let travel = 0;
    let steps = 0;
    while(steps<1000 && travel<10) {
        const [dx,dy] = [x-cx,y-cy];
        const r = Math.sqrt(dx*dx+dy*dy);
        const d = Math.abs(r-R);
        const v = d*SPEED;
        an += uniform(-TURN,TURN);
        [x,y] = [x+v*cos(an), y+v*sin(an)];
        points.push([x,y]);
        travel += v;
        steps += 1;
    }
    stroke(polyline(points),'hsla(0,0%,0%,0.2)');
}
