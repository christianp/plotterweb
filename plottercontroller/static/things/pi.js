import {math, stroke, group, text, dash, attr, choice,polyline, path,fill,rect,line,circle,uniform,element} from '/static/page.js';

const pidigits = '141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481117450284102701938521105559644622';

const nlines = 4;
const lwidth = 10;
let t1 = '\\begin{align} \\pi = 3.&';
for(let i=0;i<nlines;i++) {
    t1 += pidigits.slice(i*lwidth,(i+1)*lwidth) + ' \\\\ &';
}
t1 += pidigits.slice(lwidth*nlines, lwidth*nlines + 7)+'\\ldots \\end{align}';
math(t1,10,20,2,true,'top');

math(' = ',50,15,2,true);

const picf = [7, 15, 1, 292, 1, 1, 1, 2, 1, 3, 1, 14, 2, 1, 1, 2, 2, 2, 2, 1, 84, 2, 1, 1, 15, 3, 13, 1, 4, 2, 6, 6, 99, 1, 2, 2, 6, 3, 5, 1, 1, 6, 8, 1, 7, 1, 2, 3, 7, 1, 2, 1, 1, 12, 1, 1, 1, 3, 1, 1, 8, 1, 1, 2, 1, 6, 1, 1, 5, 2, 2, 3, 1, 2, 4, 4, 16, 1, 161, 45, 1, 22, 1, 2, 2, 1, 4, 1, 2, 24, 1, 2, 1, 3, 1, 2, 1];
const ncf = 7;
let pre = '3';
let post = '';
for(let i=0;i<ncf;i++) {
    pre += `+ \\frac{1}{${picf[i]}`;
    post += '}';
}
pre += ' + \\ldots';
math(pre+post,58,15,2,true,'top');
