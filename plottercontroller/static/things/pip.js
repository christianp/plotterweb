import {text,attr, choice,polyline, stroke, path,fill,rect,line,circle,uniform,element} from '/static/page.js';
const {cos,sin, PI} = Math;

const [W,H] = [140,110];

const THICKNESS = 0.3;

const COLOURS = ['red','yellow','green','blue','violet'];


const MARGIN = 5;
const SIZE = 10;
const TEXT = `
Each peach, pear, plum,
I spy Tom Thumb.
Tom Thumb in the cupboard,
I spy Mother Hubbard.
Mother Hubbard in the cellar,
I spy Cinderalla.
`
text(TEXT.trim(),'EMSBrush',MARGIN,SIZE+MARGIN,SIZE,W-2*MARGIN);
