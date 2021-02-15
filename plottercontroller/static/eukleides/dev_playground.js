import * as euk from './eukleides.js';
import {Controller} from '../controller.js';
import {text, replace_text} from '../page.js';
import * as Length from '../Length.js';
import './playground.js';
window.eukleides = euk;
run_playground();

window.replace_text = (fontname) => replace_text(document.querySelector('svg'),{fontname});

function rough_replace() {
    const svg = document.querySelector('#output svg');
    const rc = rough.svg(svg);

    function options(el) {
        const strokeWidth = parseFloat(el.getAttribute('stroke-width') || 1);
        const stroke = el.getAttribute('stroke');
        const fill = el.getAttribute('fill');
        return {
            strokeWidth,
            stroke,
            fill,
            fillStyle: 'zigzag', 
            hachureGap: strokeWidth*2,
            hachureAngle: Math.random()*360,
        };
    }
    function replace_with_rough(el,rel) {
        el.parentElement.replaceChild(rel,el);
    }
    for(let p of svg.querySelectorAll('polygon')) {
        const points = p.getAttribute('points').split(' ').map(v=>v.split(',').map(s=>parseFloat(s)));
        const rp = rc.polygon(points,options(p));
        replace_with_rough(p,rp);
    }
    for(let p of svg.querySelectorAll('circle')) {
        const cx = parseFloat(p.getAttribute('cx'));
        const cy = parseFloat(p.getAttribute('cy'));
        const r = parseFloat(p.getAttribute('r'));
        const rp = rc.circle(cx,cy,2*r,options(p));
        replace_with_rough(p,rp);
    }
    for(let p of svg.querySelectorAll('path')) {
        const rp = rc.path(p.getAttribute('d'),options(p));
        replace_with_rough(p,rp);
    }
}

window.rough_replace = rough_replace;

const controller = new Controller(() => {
    const svg = document.querySelector('#output svg');
    const [WIDTH,HEIGHT] = [297/2,210/2];
    svg.setAttribute('width',WIDTH);
    svg.setAttribute('height',HEIGHT);
    svg.style.transform = '';
    return svg;
});
