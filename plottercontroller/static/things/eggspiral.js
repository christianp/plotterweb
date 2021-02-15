import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

function spiral(points,cx,cy) {
    const minr = points.reduce((mr,{r,an})=>Math.min(mr,r),Infinity);
    console.log(minr);
    let opoints = [];
    const SHRINK = 1.5;
    const MINR = 2;
    const MINGAP = 1;
    //const LOOPS = Math.ceil(-Math.log(MINGAP*SHRINK/(minr*(SHRINK-1)))/Math.log(SHRINK));
    //const LOOPS = Math.ceil(-Math.log(MINR/minr)/Math.log(SHRINK));
    const LOOPS = Math.floor((minr-MINR)/SHRINK);
    for(let i=0;i<LOOPS;i++) {
        opoints = opoints.concat(points.map(({r,an}) => { return {
        //    r: r/Math.pow(SHRINK,i+an/(2*Math.PI)), 
            r: r-(i+an/(2*Math.PI))*SHRINK,
            an
        } }));
    }
    return opoints.map(({r,an}) => [Math.cos(an)*r+cx, Math.sin(an)*r+cy]);
}
function logspiral(points,cx,cy) {
    const minr = points.reduce((mr,{r,an})=>Math.min(mr,r),Infinity);
    console.log(minr);
    let opoints = [];
    const SHRINK = 1.5;
    const MINR = 2;
    const MINGAP = 1;
    const LOOPS = Math.ceil(-Math.log(MINGAP*SHRINK/(minr*(SHRINK-1)))/Math.log(SHRINK));
    //const LOOPS = Math.ceil(-Math.log(MINR/minr)/Math.log(SHRINK));
    for(let i=0;i<LOOPS;i++) {
        opoints = opoints.concat(points.map(({r,an}) => { return {
            r: r/Math.pow(SHRINK,i+an/(2*Math.PI)), 
            an
        } }));
    }
    return opoints.map(({r,an}) => [Math.cos(an)*r+cx, Math.sin(an)*r+cy]);
}

let egg = [];
const STEPS = 100;
for(let rx=-STEPS;rx<=STEPS;rx++) {
    const x = -rx/STEPS;
    const y = Math.sqrt(1-x*x)*4/5*Math.exp(x/4);
    const an = Math.atan2(y,x);
    const r = 40*Math.sqrt(x*x+y*y);
    egg.push({r, an: an + (an<0 ? 2*Math.PI : 0)});
}

egg = egg.concat(egg.slice().reverse().map(({r,an})=>{return {r,an:2*Math.PI-an}})).map(({r,an}) => { return {r, an: an+Math.PI/2} });

window.egg = egg;

polyline(spiral(egg,40,50));
polyline(logspiral(egg,110,50));
