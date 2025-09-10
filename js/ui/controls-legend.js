class ControlsLegend {
    constructor(ctx) {
        this.ctx = ctx;
        this.visible = false;
        this.controls = [
            { key: 'W / ↑', description: 'Saltar' },
            { key: 'A / ←', description: 'Mover Izquierda' },
            { key: 'D / →', description: 'Mover Derecha' },
            { key: 'ESPACIO', description: 'Atacar' },
            { key: 'ESC', description: 'Pausar' }
        ];

        this.setupEventListeners();
        this.tooltipAlpha = 1;
        this.tooltipFading = false;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'p') {
                this.toggleVisibility();
            }
        });
    }

    toggleVisibility() {
        this.visible = !this.visible;
        
        // Usar una variable separada para pausar por los controles
        if (window.gameEngine) {
            if (this.visible) {
                window.gameEngine.pauseForControls();
            } else {
                window.gameEngine.resumeFromControls();
            }
        }
    }

    render() {
        // Renderizar el tooltip permanente si la leyenda no está visible
        if (!this.visible) {
            this.renderTooltip();
            return;
        }

        const padding = 20;
        const width = 300;
        const headerHeight = 60;
        const lineHeight = 40;
        const height = headerHeight + (this.controls.length * lineHeight) + (padding * 2);

        // Posición centrada en la pantalla
        const x = (this.ctx.canvas.width - width) / 2;
        const y = (this.ctx.canvas.height - height) / 2;

        // Fondo principal con degradado
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
        gradient.addColorStop(1, 'rgba(20, 20, 50, 0.95)');
        this.ctx.fillStyle = gradient;
        this.roundRect(x, y, width, height, 10);

        // Borde con brillo
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Título con efecto de texto
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText('CONTROLES', x + width/2, y + 45);

        // Línea separadora con degradado
        const lineGradient = this.ctx.createLinearGradient(x + padding, y + headerHeight, x + width - padding, y + headerHeight);
        lineGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
        lineGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
        lineGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        this.ctx.strokeStyle = lineGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x + padding, y + headerHeight);
        this.ctx.lineTo(x + width - padding, y + headerHeight);
        this.ctx.stroke();

        // Lista de controles
        this.ctx.textAlign = 'left';
        this.controls.forEach((control, index) => {
            const yPos = y + headerHeight + (index * lineHeight) + 35;
            
            // Tecla con fondo
            this.ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
            const keyWidth = this.ctx.measureText(control.key).width + 20;
            this.roundRect(x + padding, yPos - 20, keyWidth, 30, 5);
            
            // Texto de la tecla
            this.ctx.fillStyle = '#FFA500';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText(control.key, x + padding + 10, yPos);
            
            // Descripción
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '18px Arial';
            this.ctx.fillText(control.description, x + padding + keyWidth + 20, yPos);
        });

        // Texto para cerrar
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Presiona P para cerrar', x + width/2, y + height - 20);
    }

    renderTooltip() {
        if (this.tooltipFading) {
            this.tooltipAlpha = Math.max(0, this.tooltipAlpha - 0.02);
            if (this.tooltipAlpha <= 0) {
                this.tooltipFading = false;
                return;
            }
        }

        const text = 'Presiona P para ver los controles';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'right';
        
        // Fondo del tooltip
        const padding = 10;
        const metrics = this.ctx.measureText(text);
        const tooltipWidth = metrics.width + (padding * 2);
        const tooltipHeight = 30;
        const x = this.ctx.canvas.width - 20;
        const y = 20;

        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * this.tooltipAlpha})`;
        this.roundRect(x - tooltipWidth, y, tooltipWidth, tooltipHeight, 5);

        // Borde suave
        this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 * this.tooltipAlpha})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Texto del tooltip
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.tooltipAlpha})`;
        this.ctx.fillText(text, x - padding, y + 20);
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

window.ControlsLegend = ControlsLegend;
