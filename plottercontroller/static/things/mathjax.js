import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

const tex_input = document.getElementById('input');
const size_input = document.getElementById('size');
const text_font_picker = document.getElementById('text-font');

const nh =document.querySelector('#page svg').innerHTML;

function go() {
    const tex = tex_input.value.trim();
    const size = parseFloat(size_input.value);
    document.querySelector('#page svg').innerHTML = nh;
 //   math(tex,10,5,size,true,'top');
    mathjax_ready.then(() => {
        text(tex,0,85,{
            fontname: text_font_picker.value, 
            size:size, 
            valign:'top',
            maxwidth: 110
        });
    });
}

tex_input.addEventListener('keyup',go);
size_input.addEventListener('change',go);
text_font_picker.addEventListener('change',go);

go();

window.import_symbols = function() {
    const d = window.frames[0].document
    let [original,traced] = d.querySelectorAll('svg > g')
    Array.from(original.children).forEach((p,i) => {
        const t = traced.children[i];
        const id = p.getAttribute('id').replace(/MJX-\d+-/,'');
        console.log(id);
        traced_tex[id] = t.getAttribute('d');
    });
    console.log(JSON.stringify(traced_tex))
}

import_symbols();
