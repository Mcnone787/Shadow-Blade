class PauseMenu {
    constructor(ctx) {
        this.ctx = ctx;
        this.options = ['Continuar', 'Subir Volumen (+)', 'Bajar Volumen (-)', 'Menú Principal'];
        this.selectedOption = 0;
        this.buttonAreas = [];
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listener para clicks del ratón
        this.ctx.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Event listener para hover del ratón
        this.ctx.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Event listener para teclado
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleClick(e) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        this.buttonAreas.forEach(button => {
            if (this.isPointInButton(clickX, clickY, button)) {
                this.executeOption(button.index);
            }
        });
    }

    handleMouseMove(e) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let hoveredOption = -1;
        this.buttonAreas.forEach(button => {
            if (this.isPointInButton(mouseX, mouseY, button)) {
                hoveredOption = button.index;
            }
        });

        if (hoveredOption !== -1) {
            this.selectedOption = hoveredOption;
        }
    }

    handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowUp':
                this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
                break;
            case 'ArrowDown':
                this.selectedOption = (this.selectedOption + 1) % this.options.length;
                break;
            case 'Enter':
                this.executeOption(this.selectedOption);
                break;
            case '+':
            case 'ArrowRight':
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.increaseVolume();
                }
                break;
            case '-':
            case 'ArrowLeft':
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.decreaseVolume();
                }
                break;
            case 'm':
            case 'M':
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.toggleMute();
                }
                break;
        }
    }

    isPointInButton(x, y, button) {
        return x >= button.x &&
               x <= button.x + button.width &&
               y >= button.y &&
               y <= button.y + button.height;
    }

    executeOption(index) {
        switch(index) {
            case 0: // Continue
                window.gameEngine.togglePause();
                break;
            case 1: // Volume Up
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.increaseVolume();
                }
                break;
            case 2: // Volume Down
                if (window.gameEngine.audioManager) {
                    window.gameEngine.audioManager.decreaseVolume();
                }
                break;
            case 3: // Main Menu
                this.returnToMainMenu();
                break;
        }
    }

    saveGame() {
        const gameState = {
            score: window.gameEngine.score,
            playerHealth: window.gameEngine.player.health,
            playerPosition: {
                x: window.gameEngine.player.x,
                y: window.gameEngine.player.y
            },
            enemies: window.gameEngine.enemies.map(enemy => ({
                x: enemy.x,
                y: enemy.y,
                health: enemy.health
            })),
            platforms: window.gameEngine.platforms
        };
        
        localStorage.setItem('gameState', JSON.stringify(gameState));
        
        // Mostrar mensaje de guardado
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('¡Juego Guardado!', this.ctx.canvas.width/2 - 80, this.ctx.canvas.height - 50);
    }

    returnToMainMenu() {
        window.location.href = 'index.html';
    }

    render() {
        // Limpiar áreas de botones previas
        this.buttonAreas = [];

        // Fondo semitransparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Título "PAUSE" - centrado
        this.ctx.textAlign = 'center';
        this.drawTextWithOutline(
            'PAUSA',
            this.ctx.canvas.width/2,
            this.ctx.canvas.height/3,
            '#FFD700',
            48
        );

        // Opciones del menú - centradas
        this.options.forEach((option, index) => {
            const y = this.ctx.canvas.height/2 + (index * 50);
            const x = this.ctx.canvas.width/2;
            
            // Calcular el ancho del texto para centrar el área del botón
            this.ctx.font = 'bold 32px Arial';
            const textWidth = this.ctx.measureText(option).width;
            const buttonWidth = textWidth + 40;
            
            this.buttonAreas.push({
                x: x - (buttonWidth / 2),
                y: y - 30,
                width: buttonWidth,
                height: 40,
                index: index
            });

            if (index === this.selectedOption) {
                this.drawTextWithOutline(
                    '> ' + option,
                    x,
                    y,
                    '#FFA500',
                    32
                );
            } else {
                this.drawTextWithOutline(
                    option,
                    x,
                    y,
                    '#FFFFFF',
                    32
                );
            }
        });
    }

    drawTextWithOutline(text, x, y, fillColor, fontSize = 24) {
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(text, x, y);
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    isVisible() {
        return window.gameEngine && window.gameEngine.isPaused;
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

window.PauseMenu = PauseMenu;
