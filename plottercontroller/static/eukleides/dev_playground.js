import * as euk from './eukleides.js';
import {Controller} from '../controller.js';
import './playground.js';
window.eukleides = euk;
run_playground();

const controller = new Controller(() => {
    const svg = document.querySelector('#output svg');
    svg.setAttribute('width',140);
    svg.setAttribute('height',110);
    svg.style.transform = '';
    return svg;
});
