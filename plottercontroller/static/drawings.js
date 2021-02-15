import {Controller} from './controller.js';

function Drawing(d) {
    const svg = d.querySelector('svg');
    if(svg) {
        svg.removeAttribute('width');
        svg.removeAttribute('height');
    }
    const b = d.querySelector('button.plot');
    b.addEventListener('click',() => {
        console.log('gooo');
        plotting = d.querySelector('.svg svg');
        c.go();
    });
}

let plotting = null;
const c = new Controller(() => plotting);
for(let d of document.querySelectorAll('.drawing')) {
    new Drawing(d);
}
