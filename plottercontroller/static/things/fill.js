import {stroke, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

let d = `M 0 0`;
let u = 1;
for(let x=10;x<W;x+=10) {
    d += ` A 5 5 0 0 ${u} ${x} 0`;
    u = 1-u;
}
for(let y=10;y<H-10;y+=7) {
    attr(path(d),{transform: `translate(0 ${y})`});
}


const MARGIN = 5;
let [x,y] = [W/2,H/2];
let r = 2;
for(let i=0;i<100;i++) {
    attr(circle(x,y,r),{'fill':'white'});
    const mr = Math.random()**0.5 * r * 2;
    const an = uniform(0,2*PI);
    [x,y] = [x + mr*cos(an), y+mr*sin(an)/2];
    const drag = 0.1;
    [x,y] = [x + (W/2-x)*drag, y + (H/2-y)*drag];
}

/*
const [cx,cy] = [50,80];
let d = `M ${cx} ${cy}`;
const dots = [];
const g = 30;
const turns = 6;
const steps = 400;
const maxr = 30
for(let i=0;i<steps;i++) {
    const a = i*2*PI*turns/steps;
    const r = i*maxr/steps;
    const [x,y] = [cx+cos(a)*r, cy+sin(a)*r];
    d += `L ${x} ${y}`;
    if(i%g==g-1) {
        dots.push([x,y]);
    }
}
attr(path(d),{'stroke-dasharray': '3 1'});
for(let [x,y] of dots) {
    fill(circle(x,y,2));
}
*/

/*
function twiddle(SIZE,scale,x1,y1) {
    const g = element('g',{transform: `translate(${x1} ${y1})`});
    const grid = [];
    for(let y=0;y<SIZE;y++) {
        const row = [];
        grid.push(row);
        for(let x=0;x<SIZE;x++) {
            const e = {h:false, v:false, visited:false};
            row.push(e);
        }
    }
    let arrowd = '';

    while(true) {
        const options = [];
        for(let x=0;x<SIZE;x++) {
            for(let y=0;y<SIZE;y++) {
                if(x<SIZE-1 && !grid[y][x].h) {
                    options.push([x,y,'h']);
                }
                if(y<SIZE-1 && !grid[y][x].v) {
                    options.push([x,y,'v']);
                }
            }
        }
        if(!options.length) {
            break;
        }
        let [x,y,_] = choice(options);

        const points = [];
        while(true) {
            points.push([x,y]);
            const choices = [];
            x<SIZE-1 && !grid[y][x].h && choices.push('h');
            x>0 && !grid[y][x-1].h && choices.push('-h');
            y<SIZE-1 && !grid[y][x].v && choices.push('v');
            y>0 && !grid[y-1][x].v && choices.push('-v');
            if(!choices.length) {
                break;
            }
            const d = choice(choices);
            switch(d) {
                case 'h':
                    grid[y][x].h = true;
                    [x,y] = [x+1,y];
                    break;
                case '-h':
                    grid[y][x-1].h = true;
                    [x,y] = [x-1,y];
                    break;
                case 'v':
                    grid[y][x].v = true;
                    [x,y] = [x,y+1];
                    break;
                case '-v':
                    grid[y-1][x].v = true;
                    [x,y] = [x,y-1];
                    break;
            }
        }
        console.log('points',points);

        function f(bits) {
            let s = '';
            for(let i=0;i<bits.length;i++) {
                s += bits[i];
                if(i<arguments.length-1) {
                    const n = arguments[i+1];
                    s += scale*n;
                }
            }
            return s;
        }


        let [ox,oy] = points[0];
        let visitlast = grid[oy][ox].visited;
        grid[oy][ox].visited = true;
        let d = '';
        if(!visitlast) {
            d += f`M ${ox} ${oy}`;
        }

        const gap = 0.2;
        const arrow = 0.1;

        points.slice(1).forEach(([x,y])=> {
            if(visitlast) {
                d += f` M ${(1-gap)*ox + gap*x} ${(1-gap)*oy + gap*y}`
            }
            visitlast = grid[y][x].visited;
            const [px,py] = visitlast ? [(1-gap)*x + gap*ox,(1-gap)*y + gap*oy] : [x,y];
            d += f` L ${px} ${py}`;
            const [dx,dy] = [x-ox,y-oy];
            const [nx,ny] = [dy,-dx];
            const [mx,my] = [(x+ox)/2+arrow*dx/2, (y+oy)/2+arrow*dy/2];
            arrowd += f`M ${mx+arrow*(nx-dx)} ${my+arrow*(ny-dy)} L ${mx} ${my} L ${mx+arrow*(-nx-dx)} ${my+arrow*(-ny-dy)}`;
            grid[y][x].visited = true;
            [ox,oy] = [x,y];
        });
        g.appendChild(path(d));
    }

    g.appendChild(path(arrowd));
}

const SIZE = 3;
const SCALE = 8;
for(let x=0;x<2;x++) {
for(let y=0;y<2;y++) {
    twiddle(SIZE,SCALE,x*(SIZE)*SCALE,y*SIZE*SCALE);
}
}
*/

/*
const trajectory = [];
const vx = 60;
const h = 30;
const vy = 4*h;
const a = -2*vy;
const STEPS = 300;
for(let i=0;i<STEPS;i++) {
    const t = i/STEPS;
    trajectory.push([vx*t+10, 100-(vy*t + 0.5*a*t*t)]);
}
attr(polyline(trajectory), {'stroke-dasharray': '3 2 1 2'});
*/

/*
function twiddle(speed, x1,y1,x2,y2) {
    let [x,y] = [x1,y1];
    const points = [[x,y]];
    while(true) {
        const [dx,dy] = [x2-x, y2-y];
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d<1) {
            break;
        }
        const s = Math.min(d,speed);
        const bias = Math.abs(dx)/(Math.abs(dx)+Math.abs(dy));
        const [mx,my] = Math.random()<Math.sqrt(bias) ? [s*dx/d,0] : [0,s*dy/d];
        [x,y] = [x+mx, y+my];
        points.push([x,y]);
    }
    polyline(points);
}
for(let i=0;i<5;i++) {
    twiddle(1, 10,100, 60,50);
}
*/

/*
function grad(x,y) {
    return x*y+x*x-y;
}

const SCALE = 20;
for(let i=0;i<30; i++) {
    let [x,y] = [uniform(-2,2), uniform(-2,2)];
    const points = [[x,y]];
    for(let j=0;j<500;j++) {
        let dy = grad(x,y);
        const d = Math.sqrt(1+dy*dy);
        const dx = 1/d;
        dy /= d;
        const s = 0.1;
        [x,y] = [x+dx*s,y+dy*s];
        if(x<-2 || x>2 || y<-2 || y>2) {
            break;
        }
        points.push([x,y])
    }
    polyline(points.map(([x,y])=>[SCALE*x+50, SCALE*y+50]));
}
*/

//attr(line(0,0,5,5),{'stroke':'black'});
//attr(line(0,5,5,10),{'stroke':'green'});
