import {stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function heart(cx,cy,s) {
    return path(`M ${cx} ${cy+s} l ${-s} ${-s} a ${s/2} ${s/2} 00 0 1 ${s} ${-s} a ${s/2} ${s/2} 90 0 1 ${s} ${s} z`);
}

const colors = 'red orange green yellow blue indigo violet'.split(' ').reverse();

const MINR = 1;
const MAXR = 40;
const N = 7;
for(let i=0;i<N;i++) {
    const s1 = i*(MAXR-MINR)/N+MINR;
    const s2 = s1 + (MAXR-MINR)/N;
    const g = group();
    for(let r = Math.ceil(s1);r<s2;r++) {
        g.appendChild(stroke(heart(70,55,r),colors[i]));
    }
}
