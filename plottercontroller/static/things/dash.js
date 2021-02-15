import {dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

let [x,y] = [5,5];
let [dx,dy] = [10,0];
let p = `M ${x} ${y}`;
for(let i=0;i<10;i++) {
    p += ` C ${x+dx} ${y+dy}`;
    [dx,dy] = [uniform(-10,10),uniform(-10,10)];
    [x,y] = [uniform(20,W-20),uniform(20,H-20)];
    p += ` ${x-dx} ${y-dy} ${x} ${y}`;
}
dash(path(p),[8,3,2,3]);
