import fonts from './fonts.js';

window.fonts = fonts;

const page = document.querySelector('#page svg');

const IMMEDIATE = true;

export function uniform(a,b) {
    return Math.random()*(b-a)+a;
}

export function choice(l) {
    return l[Math.floor(Math.random()*l.length)];
}

export function element(name,attr,content) {
    const page = document.querySelector('#page svg');
    const e = document.createElementNS('http://www.w3.org/2000/svg',name);
    if(attr) {
        Object.entries(attr).forEach(([k,v]) => e.setAttribute(k,v));
    }
    if(content) {
        e.innerHTML = content;
    }
    if(IMMEDIATE) {
        page.appendChild(e);
    }
    return e;
}

export function ignore(e) {
    e.classList.add('ignore');
    return e;
}

export function fill(e,color='white') {
    e.setAttribute('fill',color);
    e.style.fill = color;
    return e;
}

export function stroke(e,color='black') {
    e.setAttribute('stroke',color);
    e.style.stroke = color;
    return e;
}

export function dash(e,pattern) {
    e.setAttribute('stroke-dasharray',pattern.join(' '));
    return e;
}

export function group() {
    return element('g',...arguments);
}

export function circle(cx,cy,r) {
    const c = element('circle',{cx,cy,r});
    return c;
}

export function line(x1,y1,x2,y2) {
    return element('line',{x1,y1,x2,y2});
}

export function rect(x,y,width,height) {
    return element('rect',{x,y,width,height});
}

export function path(d) {
    return element('path',{d});
}

export function polyline(points,close) {
    if(close) {
        points = points.slice();
        points.push(points[0]);
    }
    return element('polyline', {points: points.map(([x,y]) => `${x} ${y}`).join(' ')});
}
export function attr(e, attr) {
    Object.entries(attr).forEach(([k,v]) => e.setAttribute(k,v));
    return e;
}

export function text(str,tx,ty,options={}) {
    const defaults = {
        fontname: 'EMSDelight',
        size: 10,
        maxwidth: undefined,
        halign: 'left',
        fit_width: false
    }
    const {fontname, size, maxwidth, halign, maxheight, valign, fit_width} = Object.assign({},defaults,options);
    const font = fonts[fontname];
    let scale = size/1000;
    let [x,y] = [0,0];
    let line = [];
    const lines = [];
    const line_height = -1000*1.2;

    function output_line(line) {
        if(line.length>0) {
            lines.push(line);
        }
        y += line_height;
    }

    for(let c of str) {
        if(c=='\n') {
            output_line(line);
            line = [];
            x = 0;
            continue;
        }
        const glyph = font[c];
        line.push({c,glyph,x,y});
        x += glyph.horizontal_advance_x;
        y += glyph.vertical_advance_y;
        if(maxwidth/scale!==undefined && x>maxwidth/scale) {
            let i = line.length-1;
            for(;i>=0 && !line[i].c.match(/\s/);i--) {
            }
            if(i>0) {
                output_line(line.slice(0,i));
                line = line.slice(i);
                i = 0;
                for(;i<line.length && line[i].c.match(/\s/);i++) {}
                line = line.slice(i);
                if(line.length) {
                    const sx = line[0].x;
                    x -= sx;
                    line.forEach(d=>{d.x -= sx; d.y = y});
                } else {
                    x = 0;
                }
            }
        }
    }
    output_line(line);

    if(fit_width) {
        const biggest = lines.reduce((w,line)=>Math.max(w,line[line.length-1].x),0);
        scale *= maxwidth/scale/biggest;
    }

    if(maxwidth/scale!==undefined) {
        lines.forEach(line => {
            const last = line[line.length-1];
            const width = last.x + last.glyph.horizontal_advance_x;
            let shift_x = 0;
            switch(halign) {
                case 'center':
                    shift_x = (maxwidth/scale-width)/2;
                    break;
                case 'right':
                    shift_x = (maxwidth/scale-width);
            }
            line.forEach(c=>c.x += shift_x);
        });
    }

    if(lines.length>0 && maxheight/scale!==undefined) {
        const height = -lines[lines.length-1][0].y - 1000;
        let shift_y = 0;
        switch(valign) {
            case 'center':
                shift_y = (maxheight/scale-height)/2;
                break;
            case 'right':
                shift_y = (maxheight/scale-height);
        }
        lines.forEach(line=>line.forEach(c=>c.y -= shift_y));
    }

    const group = element('g',{
        transform: `translate(${tx} ${ty}) scale(${scale} -${scale})`,
    });
    function draw_line(line) {
        const g = element('g');
        group.appendChild(g);
        for(let {glyph,x,y} of line) {
            const p = element('path',{
                transform: `translate(${x} ${y})`,
                d: glyph.d
            });
            p.style['stroke-width'] = 0.35/scale;
            g.appendChild(p);
        }
    }
    lines.forEach(draw_line);
    return group;
}

function font_picker(select) {
    for(let n of Object.keys(fonts)) {
        const option = document.createElement('option');
        option.setAttribute('value',n);
        option.textContent = n;
        select.appendChild(option);
    }
}
for(let select of document.querySelectorAll('select.font')) {
    font_picker(select);
}
