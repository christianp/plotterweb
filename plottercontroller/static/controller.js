import {replace_text} from './page.js';
import ntc from './ntc.js';

const go_button = document.getElementById('go');
const cancel_button = document.getElementById('cancel');
const progress_bar = document.getElementById('progress');
const error_div = document.getElementById('plotter-error');
const preview_button = document.getElementById('preview');
const preview_div = document.getElementById('plotter-preview');

window.ntc = ntc;

export class Controller {
    constructor(get_svg) {
        this.base_get_svg = get_svg;
        this.connect();

        go_button.addEventListener('click',e => this.go());

        cancel_button.addEventListener('click',e => this.cancel());
        preview_button.addEventListener('click',e => this.preview());
    }
    connect() {
        this.socket = new WebSocket('ws://'+window.location.host+'/ws/plotter/');
        this.socket.onopen = e => {
            console.info('Socket open');
        }

        this.socket.onmessage = e => {
            const m = JSON.parse(e.data);
            switch(m.type) {
                case 'status':
                    this.handle_message(m.message);
                    break;
                case 'preview':
                    this.show_preview(m.svg);
                    break;
                default:
                    console.error("unhandled message type",m.type);
            }
        }

        this.socket.onclose = e => {
            console.info('Socket closed');
            this.connect();
        }
    }

    handle_message(d) {
        console.log(d);
        if(d.progress!==undefined) {
            this.progress(d.progress);
        }
        switch(d.type) {
            case 'pause':
                this.pause(d.reason);
                break;
            case 'error':
                this.plotter_error(d.error)
                break;
            case 'cancelled':
                this.progress(0);
                break;
        }
    }

    show_preview(svg) {
        preview_div.innerHTML = svg;
    }

    send_message(message) {
        this.socket.send(JSON.stringify({type:'message',message:message}));
    }

    progress(amount) {
        progress_bar.value = amount;
    }

    pause(reason) {
        let message = reason.message;
        if(reason.colour !== undefined) {
            document.body.style.setProperty('--pen-colour',reason.colour);
            message += ` (${ntc.name(reason.colour)[1]})`;
        }
        const res = confirm(message)
        if(res) {
            this.carryon();
        } else {
            this.cancel();
        }
    }

    plotter_error(message) {
        error_div.textContent = message;
        if(message) {
            console.error(message);
        }
    }

    go() {
        this.plotter_error('');
        const drawing = this.get_svg();
        const message = {
            'type': 'draw',
            'format': 'svg',
            'content': drawing.outerHTML,
            'location': window.location.href
        };
        this.send_message(message);
    }

    get_svg() {
        const drawing = this.base_get_svg();
        replace_text(drawing);
        drawing.setAttribute('xmlns','http://www.w3.org/2000/svg');
        return drawing;
    }

    preview() {
        preview_div.innerHTML = '';
        const drawing = this.get_svg();
        this.send_message({
            'type': 'preview',
            'content': drawing.outerHTML
        });
    }

    carryon() {
        const message = {
            'type': 'carryon',
        };
        this.send_message(message);
    }

    cancel() {
        const message = {
            'type': 'cancel',
        };
        this.send_message(message);
    }
}

