import {text,attr, choice,polyline, stroke, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

document.body.addEventListener('dragover',e => {
    e.preventDefault();
})
document.body.addEventListener('drop',e => {
    e.preventDefault();
    console.log('drop',e.dataTransfer.items);
    const f = e.dataTransfer.items[0];
    console.log(f);
    f.getAsFile().text().then(t=>{
        document.getElementById('page').innerHTML = t;
        console.log(t)
    });
})


def hilbert(n,scale=10):
    s = 'A'
    for i in range(n):
        ns = ''
        for c in s:
            if c=='A':
                ns += '+BF-AFA-FB+'
            elif c=='B':
                ns += '-AF+BFB+FA-'
            else:
                ns += c
        s = ns
    s = s.replace('A','').replace('B','').replace('+-','').replace('-+','')
    
    x,y = (0,0)
    dx,dy = (scale,0)
    yield x,y
    for c in s:
        if c=='F':
            x,y = x+dx,y+dy
            yield x,y
        elif c=='-':
            dx,dy = dy,-dx
        elif c=='+':
            dx,dy = -dy,dx

function hilbert(i,scale=10) {
    let s = 'A';
    for(let i=0;i<n;i++) {
        let ns = '';
        for(let c of s) {
            switch(c) {
                case 'A':
                    ns += '+BF-AFA-FB+';
                    break;
                case 'B':
                    ns += '-AF+BFB+FA-';
                    break;
                default:
                    ns += c;
            }
        }
        s = ns;
    }
    s = s.replace('A','').replace('B','').replace('+-','').replace('-+','');

    let [x,y] = [0,0];
    let [dx,dy] = [scale,0];
    const out = [];
    out.push([x,y]);
    for(let c of s) {
        switch(c) {
            case 'F':
                [x,y] = [x+dx,y+dy];
                out.push([x,y]);
                break;
            case '-':
                [dx,dy] = [dy,-dx];
}
