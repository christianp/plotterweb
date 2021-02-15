const go_button = document.getElementById('go');
const carryon_button = document.getElementById('carryon');
const cancel_button = document.getElementById('cancel');
const progress_bar = document.getElementById('progress');
const error_div = document.getElementById('plotter-error');

export class Controller {
    constructor(get_svg) {
        this.get_svg = get_svg;
        this.connect();

        go_button.addEventListener('click',e => this.go());

        cancel_button.addEventListener('click',e => this.cancel());
        carryon_button.addEventListener('click',e => this.carryon());
    }
    connect() {
        this.socket = new WebSocket('ws://'+window.location.host+'/ws/plotter/');
        this.socket.onopen = e => {
            console.info('Socket open');
        }

        this.socket.onmessage = e => {
            const d = JSON.parse(e.data).message;
            console.log(d);
            if(d.progress!==undefined) {
                this.progress(d.progress);
            }
            switch(d.type) {
                case 'pause':
                    this.pause(d.message);
                    break;
                case 'error':
                    this.plotter_error(d.error)
                    break;
                case 'cancelled':
                    this.progress(0);
                    break;
            }
        }

        this.socket.onclose = e => {
            console.info('Socket closed');
            this.connect();
        }
    }

    progress(amount) {
        progress_bar.value = amount;
    }

    pause(message) {
        if(confirm(message)) {
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
        drawing.setAttribute('xmlns','http://www.w3.org/2000/svg');
        const message = {
            'type': 'draw',
            'format': 'svg',
            'content': drawing.outerHTML
        };
        this.socket.send(JSON.stringify({type:'message',message:message}));
    }

    carryon() {
        const message = {
            'type': 'carryon',
        };
        this.socket.send(JSON.stringify({type:'message',message:message}));
    }

    cancel() {
        const message = {
            'type': 'cancel',
        };
        this.socket.send(JSON.stringify({type:'message',message:message}));
    }
}

