import {text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

const address = `
Philippa Lawson-Perfect
1, Woodburn Way
Whitley Bay
NE26 3DX
`

text(address.trim(),75,20, {fontname: 'EMSCasualHand', size: 2, halign: 'center', valign: 'center', maxwidth: 60, maxheight: 70, fit_width: true});

const message = `
Dear Philippa,
Here's a postcard written by the robot. I hope you like it!

Love from,
    Dad
`;

text(message.trim(),5,20, {fontname: 'EMSBrush', size: 7, halign: 'left', valign: 'center', maxwidth: 60, maxheight: 70, fit_width: true});
