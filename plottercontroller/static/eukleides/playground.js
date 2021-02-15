import * as euk from './eukleides.js';
window.eukleides = euk;

window.run_playground = function() {

const nice_type_names = {
    'eukleides_angle': 'angle',
    'eukleides_point': 'point',
    'eukleides_line': 'line',
    'eukleides_point_set': 'point set',
    'eukleides_circle': 'circle',
    'eukleides_conic': 'conic',
    'eukleides_drawing': 'drawing',
    'eukleides_angle_label': 'angle label'
}

const type_descriptions = {
    'eukleides_angle': 'An angle. The positive direction is anti-clockwise, and 0 points right.',
    'eukleides_point': 'A single point.',
    'eukleides_line': 'An infinite line.',
    'eukleides_point_set': 'An ordered list of points, interpreted as a line segment, an outline, or a polygon, depending on context.',
    'eukleides_circle': 'A circle, defined by its centre point and radius.',
    'eukleides_conic': 'A conic curve: an ellipse, hyperbola or parabola.',
    'eukleides_drawing': 'A collection of drawing modifiers, applied to a list of objects.',
    'eukleides_angle_label': 'A curve showing the angle defined by three points.'
}

const modifier_descriptions = {
    'origin': 'The point at coordinates (0,0).',
    'dot': 'Points are drawn as solid dots.',
    'disc': 'Points are drawn as hollow discs.',
    'box': 'Points are drawn as solid squares.',
    'plus': 'Points are drawn as + shapes.',
    'cross': 'Points are drawn as x shapes.',
    'closed': 'Point sets are drawn as closed polygons - the last point is joined to the first.',
    'open': 'Point sets are drawn as open paths.',
    'filled': 'Point sets are drawn as filled polygons.',
    'simple': 'Segments and angle labels are marked with a single dash.',
    'double': 'Segments and angle labels are marked with a double dash. If <code>dotted</code> is also applied, angle labels will instead be labelled with two dots.',
    'triple': 'Segments and angle labels are marked with a triple dash. If <code>dotted</code> is also applied, angle labels will instead be labelled with three dots.',
    'full': 'Lines are drawn as continuous lines. This is the default.',
    'dotted': 'Lines and filled shapes are drawn with a dotted pattern.',
    'dashed': 'Lines are drawn with a dashed pattern, and filled shapes are drawn with stripes.',
    'entire': 'Draw lines and conics as far as possible in both directions.',
    'half': 'Only draw lines and curves in the direction specified. The default is forwards.',
    'right': 'Draw angle labels as right angles.',
    'forth': 'When <code>half</code> is applied, draw lines and curves in the forward direction. Arrows on line segments are drawn on the last point. Arrows on angle labels are drawn pointing anti-clockwise.',
    'back': 'When <code>half</code> is applied, draw lines and curves in the backward direction. Arrows on line segments are drawn on the first point. Arrows on angle labels are drawn pointing clockwise.',
    'noarrow': 'Do not draw an arrow on segments or angle labels. This is the default.',
    'arrow': 'Draw an arrow on line segments and angle labels, in the direction specified by <code>forth</code> or <code>back</code>.',
    'arrows': 'Draw arrows on both ends of line segments and angle labels.',
    'transparent': 'Set the opacity to 0.5.',
    'bold': 'Text is drawn in boldface.',
    'italic': 'Text is drawn in italic style.',
    'verbose': 'Accessible descriptions give information not explicitly given in the visual rendering, such as coordinates and bearings.',
    'nospoilers': 'Accessible descriptions will not give any information not explicitly given in the visual rendering.',
};

function nice_type_name(name) {
    return nice_type_names[name] || name;
}

function nice_fn_name(name) {
    const prefix = Object.entries(Numbas.jme.prefixForm).find(([d,o])=>o==name);
    if(prefix) {
        return prefix[0];
    } else {
        return name;
    }
}

function join_word(list,comma,word) {
    if(list.length>1) {
        return [list.slice(0,list.length-1).join(`${comma} `),list[list.length-1]].join(` ${word} `);
    } else {
        return list.join('');
    }
}

function desc_type(type) {
    if(!type.match) {
        console.error(type);
        return type;
    }
    const local = type.match(/^eukleides_/);
    const href = local ? `#type-${type}` : `https://docs.numbas.org.uk/en/latest/jme-reference.html#${type}`;
    const target = local ? '' : 'jme-docs';
    return [`<a href="${href}" target="${target}"><code class="type">${nice_type_name(type)}</code></a>`];
}

function desc_named_sig(sig) {
    let desc = desc_sig(sig);
    if(!desc) {
        console.error(sig);
        
    }
    if(sig.param_name) {
        desc[0] = `<code class="name">${sig.param_name}</code>: ${desc[0]}`;
    }
    return desc;
}

function desc_sig(sig) {
	switch(sig.kind) {
		case 'anything': 
            return ['anything'];
        case 'type':
            return [desc_type(sig.type)];
		case 'multiple': 
            return ['multiple '+desc_named_sig(sig.signature)];
		case 'optional': 
            return ['['+desc_named_sig(sig.signature).join(', ')+']'];
    	case 'sequence': 
            return Array.prototype.concat.apply([],sig.signatures.map(desc_named_sig));
		case 'list':
            return ['<code>list</code> of '+sig.signatures.map(desc_named_sig)];
		case 'dict':
            return ['<code>dict</code> of '+desc_named_sig(sig.signature)];
		case 'or':
            const bits = sig.signatures.map(s=>{
                let d = desc_named_sig(s);
                if(s.kind!='type' && s.kind!='anything') {
                    d = `(${d.join(', ')})`;
                }
                return d;
            });
            return [bits.join(' | ')];
        case 'eukleides_drawing':
            return ['drawing of '+desc_named_sig(sig.signature)];
	}
}

function describe_definitions(fns) {
    function describe_def(fn,sig) {
        if(sig.kind=='sequence' && sig.signatures.length==1 && sig.signatures[0].kind=='or') {
            return sig.signatures[0].signatures.map(s=>describe_def(fn,s)).join('\n');
        }
        let intype = desc_named_sig(sig);
        const names = arg_names(fn.fn);
        if(names) {
            intype = intype.map((s,i)=>`<code class="name">${names[i]}</code>: ${s}`);
        } else {
        }
        const open = '<span class="function-bracket">(</span>';
        const close = '<span class="function-bracket">)</span>';
        const name = `<code class="function-name">${fn.name}</code>`;
        let application;
        var parser = new Numbas.jme.Parser();
        if(parser.re.re_op.exec(fn.name)) {
            const prefix = Object.entries(Numbas.jme.prefixForm).find(([d,o])=>o==fn.name);
            if(prefix) {
                application = `${prefix[0]} ${intype[0]}`;
            } else {
                application = `${open}${intype[0]}${close} ${name} ${open}${intype[1]}${close}`;
            }
        } else {
            application = `${name} ${open}${intype.join(', ')}${close}`;
        }
        const outtype = desc_type(fn.outtype);
        return `<p class="signature">${application} → <code class="type">${outtype}</code></p>`;
    }
    return fns.map(fn=>{
        const description = fn.description ? `<p class="description">${fn.description}</p>` : '';
        return `<li>${describe_def(fn,fn.intype)}${description}</li>`;
    }).join('\n');
}

function arg_names(fn) {
    const s = fn+'';
    const m = /^function\(([^\)]*)\)/.exec(s);
    if(!m) {
        return;
    }
    const args = m[1].split(',');
    return args;
}

Numbas.queueScript('base',[], function() {});

Numbas.runImmediately(['jme'],function() {
});



Numbas.queueScript('base',[],function(){});

Numbas.queueScript('demo',['extensions/eukleides/eukleides.js'],function() {
    Numbas.activateExtension('eukleides');
    var euk = Numbas.extensions.eukleides;

    var s = window.s = new Numbas.jme.Scope([Numbas.jme.builtinScope, euk.scope]);

    let type_html = '';
    Object.keys(euk.types).map((name) => {
        type_html += `<dt id="type-${name}">${nice_type_name(name)}</dt><dd>${type_descriptions[name]}</dd>\n`;
    });
    document.getElementById('types').innerHTML = type_html;
    let fn_html = '';
    const fn_definitions = {};
    Object.entries(euk.scope.allFunctions()).sort().map(([name,fns])=>{
        name = nice_fn_name(name);
        fn_definitions[name] = fn_definitions[name] || [];
        fn_definitions[name].push(`<dd><ul>${describe_definitions(fns)}</ul></dd>`);
    })
    const fn_alphabet = document.getElementById('fn-alphabet');
    let last_letter = '';
    Object.entries(fn_definitions).sort().forEach(([name,defs])=>{
        const initial = name[0].toLowerCase();
        let anchor = '';
        if(initial!=last_letter) {
            fn_alphabet.innerHTML += `<a href="#fn-letter-${initial}">${initial.toUpperCase()}</a>`;
            last_letter = initial;
            anchor = `<a name="fn-letter-${initial}" class="anchor"></a>`;
        }
        fn_html += `<dt data-name="${name}">${anchor}${name}</dt>\n${defs.join('\n')}`;
    });
    document.getElementById('function-definitions').innerHTML = fn_html;

    let modifier_html = '';
    let color_htmls = [];
    Object.entries(euk.scope.allVariables()).sort().map(([name,value]) => {
        const description = modifier_descriptions[name];
        if(description) {
            modifier_html += `<dt data-name="${name}">${name}</dt><dd>${description}</dd>`;
        } else if(value.value.style.color!==undefined) {
            color_htmls.push(`<span data-name="${name}" class="color">${name}</span>`);
        }
    });
    modifier_html = `<p><strong>Colours:</strong> ${color_htmls.join(', ')}</p>` + modifier_html;
    document.getElementById('modifiers').innerHTML = modifier_html;

    const code = document.getElementById('code');
    const output = document.getElementById('output');
    const error_display = document.getElementById('error');

    function look_at_selection() {
        Array.prototype.map.call(document.querySelectorAll('dt.active'),function(e) {
            e.classList.remove('active');
        });
        const name = code.value.slice(code.selectionStart,code.selectionEnd);
        if(name) {
            try {
                const def = document.querySelector(`[data-name="${name}"]`);
                if(def) {
                    def.classList.add('active');
                    def.scrollIntoView({block: 'center'});
                }
            } catch(e) {
            }
        }
    }
    code.addEventListener('select',look_at_selection);

    let mx = 0, my = 0;
    let error = false;

    function show_diagram(script) {
        var svg_diagram = s.evaluate(script);
        var svg = svg_diagram.value[0];
        output.innerHTML = '';
        output.appendChild(svg);
        svg.addEventListener('mousemove',function(e) {
            const r = svg.getBoundingClientRect();
            const sx = e.clientX - r.x;
            const sy = e.clientY - r.y;
        });
    }

    var remake = window.remake = function() {
        console.clear();
        const script = code.value;
        try {
            error = false;
            document.body.classList.remove('error');
            show_diagram(script);
        } catch(e) {
            error = true;
            document.body.classList.add('error');
            error_display.innerHTML = e.message;
            console.error(e);
        }
    }

    code.addEventListener('input',remake);
    remake();

});

};
