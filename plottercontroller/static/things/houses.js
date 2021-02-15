import {attr, choice,polyline, stroke, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

const THICKNESS = 0.3;

const COLOURS = ['red','yellow','green','blue','violet'];

function house(x,y,w,h,floors) {
    const height = floors*h;
    fill(rect(x,y-height,w,height));
    door(x,y,w/2,h);
    for(let floor=0;floor<floors;floor++) {
        for(let rx=0;rx<2;rx++) {
            if(floor==0 && rx==0) {
                continue;
            }
            windowframe(x+rx*w/2, y-floor*h, w/2, h);
        }
    }
    const overhang = 0.1*w;
    fill(polyline([[x-overhang,y-height], [x+overhang+w, y-height], [x+w/2, y-height-h]],true));
}
function door(x,y,w,h) {
    const xmargin = 0.25;
    const height = 0.9*h;
    const width = w*(1-2*xmargin);
    rect(x+w*xmargin, y-height, width, height);
    const handle_r = 
    circle(x+w*xmargin+width*0.2, y-height/2, width*0.07);
}
function windowframe(x,y,w,h) {
    const s = Math.min(w,h)*0.5;
    rect(x+(w-s)/2, y-h+(h-s)/2, s,s);
}

house(30,100,25,10,3);
