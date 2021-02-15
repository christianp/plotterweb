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
