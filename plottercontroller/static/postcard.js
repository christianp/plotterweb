import {text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
import {Controller} from './controller.js';

new Controller(() => document.querySelector('#page svg'));

const message_area = document.getElementById('message');
const message_font_picker = document.getElementById('message-font');
const address_area = document.getElementById('address');
const address_font_picker = document.getElementById('address-font');

function draw() {
    const svg = document.querySelector('#page svg');
    svg.innerHTML = '';

    const message = message_area.value;
    const address = address_area.value;

    text(address.trim(),75,20, {fontname: address_font_picker.value, size: 2, halign: 'center', valign: 'center', maxwidth: 60, maxheight: 70, fit_width: true});
    text(message.trim(),5,20, {fontname: message_font_picker.value, size: 6, halign: 'left', valign: 'center', maxwidth: 60, maxheight: 70, fit_width: false});
}

message_area.addEventListener('input',draw)
address_area.addEventListener('input',draw)
message_font_picker.addEventListener('input',draw)
address_font_picker.addEventListener('input',draw)
draw();
