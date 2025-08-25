class InputHandler {
    constructor() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            n: false,
            h: false,
            p: false,
            i: false,
            r: false,
            Escape: false,
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Enter: false,
            Space: false,
            ShiftLeft: false
        };
        
        // Para el doble salto
        this.lastWPress = 0;
        this.wReleased = true;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Evento keydown
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                // Manejo especial para la tecla W (salto)
                if (key === 'w' && this.wReleased) {
                    this.lastWPress = Date.now();
                    this.wReleased = false;
                }
                
                this.keys[key] = true;
                e.preventDefault(); // Prevenir comportamiento por defecto
            }
            // Manejar teclas especiales
            if (e.key === 'Escape') this.keys.Escape = true;
            if (e.key === 'ArrowUp') this.keys.ArrowUp = true;
            if (e.key === 'ArrowDown') this.keys.ArrowDown = true;
            if (e.key === 'ArrowLeft') this.keys.ArrowLeft = true;
            if (e.key === 'ArrowRight') this.keys.ArrowRight = true;
            if (e.key === 'Enter') this.keys.Enter = true;
            if (e.key === ' ') this.keys.Space = true;
        });

        // Evento keyup
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in this.keys) {
                // Manejo especial para la tecla W (salto)
                if (key === 'w') {
                    this.wReleased = true;
                }
                
                this.keys[key] = false;
                e.preventDefault(); // Prevenir comportamiento por defecto
            }
            // Manejar teclas especiales
            if (e.key === 'Escape') this.keys.Escape = false;
            if (e.key === 'ArrowUp') this.keys.ArrowUp = false;
            if (e.key === 'ArrowDown') this.keys.ArrowDown = false;
            if (e.key === 'ArrowLeft') this.keys.ArrowLeft = false;
            if (e.key === 'ArrowRight') this.keys.ArrowRight = false;
            if (e.key === 'Enter') this.keys.Enter = false;
            if (e.key === ' ') this.keys.Space = false;
        });

        // Prevenir comportamientos por defecto del navegador para ciertas teclas
        window.addEventListener('keydown', (e) => {
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }

    // Método específico para el doble salto
    canDoubleJump() {
        return this.wReleased && Date.now() - this.lastWPress < 300;
    }

    reset() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }
}

window.InputHandler = InputHandler;