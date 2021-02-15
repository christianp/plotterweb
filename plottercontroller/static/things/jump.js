import {attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI, sqrt} = Math;

function jump(last,next) {
    if(last==next) {
        return '';
    }
    const r = Math.abs(last-next)/2;
    return ` A ${r} ${r} 0 0 0 ${next} 0`;
}

let d = 'M 1 0';
for(let n=1;n<8;n++) {
    const last = (n-2)*(n-1)/2+1;
    const next = n*(n+1)/2;
    d += jump(last,next);
    for(let j=next-1;j>last;j--) {
        d += jump(j+1,j);
    }
}
attr(path(d),{transform: 'translate(20 20) scale(4)'});
