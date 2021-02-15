import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function show_perm(glabel,p,left,top,w,h) {
    const n = p.length;
    const m = 0.25;
    const sw = 1/(n-1)*w;
    p.forEach(([to,swap,label],from) => {
        const [x1,y1] = [left + from/(n-1)*w, top];
        const [x2,y2] = [left + to/(n-1)*w, top+h];
        let d = `
            M ${x1-sw/4},${y1} 
        `;
        if(swap) {
            d += ` c 0 ${m*m*h} ${sw/2} ${m*(1-m)*h} ${sw/2} ${m*h} `;
        } else {
            d += ` l 0 ${m*h} `;
        }
        d += `
            c 0 ${m*h} ${x2-x1} ${(1-3*m)*h} ${x2-x1} ${(1-2*m)*h}
            l 0 ${m*h}
            l ${(swap ? -1 : 1)*sw/2} 0
            l 0 ${-m*h}
            c 0 ${-m*h} ${x1-x2} ${(3*m-1)*h} ${x1-x2} ${(2*m-1)*h}
        `;
        if(swap) {
            d += `c 0 ${-m*m*h} ${sw/2} ${-m*(1-m)*h} ${sw/2} ${-m*h}`;
        } else {
            d += `l 0 ${-m*h}`;
        }
        d += ' z';
        path(d);
        const texsize = 3;
        text('$-'+label+'$',x1-sw/4,y1-texsize/2,{size:texsize,halign:'center'});
        text('$'+label+'$',x1+sw/4,y1-texsize/2,{size:texsize,halign:'center'});
        text('$-'+label+'$',x1-sw/4,y2+texsize,{size:texsize,halign:'center'});
        text('$'+label+'$',x1+sw/4,y2+texsize,{size:texsize,halign:'center'});
    });
    text('$'+glabel+'$',left+sw/4,top+h/2,{size:8,halign:'right'});
}

const [W,H] = [297/2, 210/2];
const MARGIN = 1;
const cw = (W-2*MARGIN)/4;
const ch = (H-2*MARGIN)/2;

const perms = [
    [[0,false,'1'],[1,false,'i'],[2,false,'j'],[3,false,'k']],
    [[2,true,'1'],[3,true,'i'],[0,false,'j'],[1,false,'k']],
    [[1,true,'1'],[0,false,'i'],[3,false,'j'],[2,true,'k']],
    [[3,true,'1'],[2,false,'i'],[1,true,'j'],[0,false,'k']],
    [[0,true,'1'],[1,true,'i'],[2,true,'j'],[3,true,'k']],
    [[2,false,'1'],[3,false,'i'],[0,true,'j'],[1,true,'k']],
    [[1,false,'1'],[0,true,'i'],[3,true,'j'],[2,false,'k']],
    [[3,false,'1'],[2,true,'i'],[1,false,'j'],[0,true,'k']],
]
const labels = ['1','i','j','k','-1','-i','-j','-k'];

mathjax_ready.then(() => {
    for(let y=0;y<2;y++) {
        for(let x=0;x<4;x++) {
            const tx = MARGIN + x*cw;
            const ty = MARGIN + y*ch;
            const cmargin = 7;
            show_perm(labels[4*y+x],perms[4*y+x],tx+cmargin,ty+cmargin,cw-2*cmargin,ch-2*cmargin);
        }
    }
});
