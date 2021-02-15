import {clear, number_input, input, stroke, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI, sqrt} = Math;

function ease_cubicinout(t) {
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

function noise(w,n) {
    const v = [];
    for(let i=0;i<=w;i++) {
        v.push(0);
    }

    function sample() {
        return Math.random();
    }
    function interpolate(a,b,t) {
        return a + (b-a)*ease_cubicinout(t);
    }

    for(let i=1;i<=n;i++) {
        let a = sample();
        let b = sample();
        const s = Math.pow(2,-i);
        let k = 0;
        for(let j=0;j<=w;j++) {
            if(j/w >= (k+1)*s) {
                k += 1;
                [a,b] = [b, sample()];
            }
            const d = (j/w/s-k);
            v[j] += interpolate(a,b,d)/n;
        }
    }
    return v.map(c=>c-0.5);
}

function poly_lerp(x,points) {
    let t = 0;
    for(let i=0;i<points.length-1;i++) {
        const [ax,ay] = points[i];
        const [bx,by] = points[i+1];
        const [dx,dy] = [bx-ax,by-ay];
        const d = Math.sqrt(dx*dx+dy*dy);
        if(d>=x) {
            return [ax+dx*x/d, ay+dy*x/d];
        } else {
            x -= d;
        }
    }
    throw(new Error("out of bounds"));
}

function tree(x,y) {
    const height = uniform(6,10);
    line(x,y,x,y-height);
    for(let j=height;j>height*0.45;j-=1.5) {
        const l =(height-j)*0.2 + 1;
        line(x,y-j,x-l,y-j+l);
        line(x,y-j,x+l,y-j+l);
    }
}

function hills(x,y,jut,roll) {
    const NUM_POINTS = 50;
    const points = noise(NUM_POINTS,jut).map((h,i)=>[142*i/NUM_POINTS-1,y+h*roll]);
    const d = points.map(([x,y],i) => `${i==0 ? 'M' : 'L'} ${x} ${y}`).join(' ')+` L 141 111 L -1 111 z`;
    let dx = 1;
    for(let i=0;i<15;i++) {
        dx = dx*1.1 + uniform(0.5,1.5);
        try {  
            const [px,py] = poly_lerp(x+dx*choice([-1,1]),points);
            tree(px,py);
        } catch(e) {
        }
    }
    return fill(path(d),'white');
}

for(let i=0;i<4;i++) {
    hills(uniform(0,140),20*i+30,Math.floor(i/2)+1,50/Math.sqrt(i+1));
}

