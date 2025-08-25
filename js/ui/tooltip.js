class Tooltip {
    constructor() {
        this.tooltips = {
            powerups: {
                health: {
                    icon: '♥',
                    color: '#FF3366',
                    title: 'Corazón de Vida',
                    description: 'Restaura 30 puntos de vida',
                    key: 'Automático'
                },
                damage: {
                    icon: '★',
                    color: '#FFD700',
                    title: 'Estrella de Poder',
                    description: '+50% de daño por 10 segundos',
                    key: 'Automático'
                },
                speed: {
                    icon: '⚡',
                    color: '#00FF00',
                    title: 'Rayo de Velocidad',
                    description: '+30% de velocidad por 8 segundos',
                    key: 'Automático'
                }
            },
            abilities: {
                doubleJump: {
                    icon: '↑↑',
                    key: 'W (x2)',
                    title: 'Doble Salto',
                    description: 'Pulsa W dos veces para hacer un salto doble',
                    unlockScore: 1000,
                    color: '#87CEEB'
                },
                dashAttack: {
                    icon: '⇒',
                    key: 'N + A/D',
                    title: 'Ataque Dash',
                    description: 'Ataca mientras te mueves para hacer un dash',
                    unlockScore: 2000,
                    color: '#FF6B6B'
                },
                airAttack: {
                    icon: '⚔',
                    key: 'N (en aire)',
                    title: 'Ataque Aéreo',
                    description: 'Puedes atacar mientras estás en el aire',
                    unlockScore: 3000,
                    color: '#FFD700'
                }
            }
        };

        this.activeTooltip = null;
        this.tooltipDuration = 3000; // 3 segundos
        this.showingUnlock = false; // Para evitar mensajes duplicados
    }

    showPowerUpTooltip(type, x, y) {
        const powerUp = this.tooltips.powerups[type];
        if (!powerUp) return;

        this.activeTooltip = {
            ...powerUp,
            x: x,
            y: y - 40, // Mostrar arriba del power-up
            endTime: Date.now() + this.tooltipDuration,
            alpha: 1.0
        };
    }

    showAbilityTooltip(ability) {
        const abilityInfo = this.tooltips.abilities[ability];
        if (!abilityInfo || this.showingUnlock) return;

        this.showingUnlock = true;
        this.activeTooltip = {
            ...abilityInfo,
            x: window.innerWidth / 2,
            y: 100,
            endTime: Date.now() + this.tooltipDuration * 2, // Duración más larga para habilidades
            alpha: 1.0
        };

        // Resetear el flag después de que el tooltip desaparezca
        setTimeout(() => {
            this.showingUnlock = false;
        }, this.tooltipDuration * 2);
    }

    renderPowerUpGuide(ctx) {
        const powerUps = Object.entries(this.tooltips.powerups);
        const boxSize = 50;
        const spacing = 10;
        const startY = 100;
        const leftMargin = 10;
        const textWidth = 150;
        
        powerUps.forEach(([key, powerUp], index) => {
            const x = leftMargin;
            const y = startY + (boxSize + spacing) * index;
            
            // Dibujar fondo del icono
            ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
            ctx.fillRect(x, y, boxSize, boxSize);
            
            // Dibujar borde del icono
            ctx.strokeStyle = powerUp.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, boxSize, boxSize);
            
            // Dibujar icono
            ctx.font = '24px Arial';
            ctx.fillStyle = powerUp.color;
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.icon, x + boxSize/2, y + 35);
            
            // Dibujar fondo para el texto
            ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
            ctx.fillRect(x + boxSize + 5, y, textWidth, boxSize);
            ctx.strokeStyle = powerUp.color;
            ctx.strokeRect(x + boxSize + 5, y, textWidth, boxSize);
            
            // Dibujar título
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = powerUp.color;
            ctx.textAlign = 'left';
            ctx.fillText(powerUp.title, x + boxSize + 15, y + 20);
            
            // Dibujar descripción
            ctx.font = '12px Arial';
            ctx.fillStyle = '#FFFFFF';
            const lines = this.wrapText(ctx, powerUp.description, textWidth - 20);
            lines.forEach((line, i) => {
                ctx.fillText(line, x + boxSize + 15, y + 35 + (i * 15));
            });
        });
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    renderAbilityProgress(ctx) {
        const abilities = Object.entries(this.tooltips.abilities);
        const boxSize = 70; // Reducido
        const spacing = 15; // Reducido
        const startY = 100; // Movido más abajo
        const rightMargin = 10; // Más cerca del borde
        
        abilities.forEach(([key, ability], index) => {
            const x = ctx.canvas.width - boxSize - rightMargin;
            const y = startY + (boxSize + spacing) * index;
            
            // Verificar si la habilidad está desbloqueada
            const isUnlocked = window.gameEngine && 
                             window.gameEngine.player && 
                             window.gameEngine.player.unlockedAbilities[key];
            
            // Dibujar fondo
            ctx.fillStyle = isUnlocked ? 
                          `${ability.color}66` : // Color con 40% de opacidad
                          'rgba(50, 50, 50, 0.5)';
            ctx.fillRect(x, y, boxSize, boxSize);
            
            // Dibujar borde
            ctx.strokeStyle = isUnlocked ? ability.color : '#666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, boxSize, boxSize);
            
            // Dibujar icono
            ctx.font = '24px Arial';
            ctx.fillStyle = isUnlocked ? '#FFF' : '#888';
            ctx.textAlign = 'center';
            ctx.fillText(ability.icon, x + boxSize/2, y + 30);
            
            // Dibujar score requerido
            ctx.font = '12px Arial';
            ctx.fillStyle = isUnlocked ? '#FFF' : '#888';
            ctx.fillText(ability.unlockScore + ' pts', x + boxSize/2, y + 50);
            
            // Dibujar teclas
            ctx.font = '14px Arial';
            ctx.fillStyle = isUnlocked ? '#FFF' : '#666';
            ctx.fillText(ability.key, x + boxSize/2, y + 70);
        });
    }

    render(ctx) {
        // Siempre renderizar las guías
        this.renderPowerUpGuide(ctx);
        this.renderAbilityProgress(ctx);

        // Renderizar tooltip activo si existe
        if (!this.activeTooltip) return;

        const now = Date.now();
        if (now > this.activeTooltip.endTime) {
            this.activeTooltip = null;
            return;
        }

        // Calcular fade out
        const timeLeft = this.activeTooltip.endTime - now;
        if (timeLeft < 1000) {
            this.activeTooltip.alpha = timeLeft / 1000;
        }

        ctx.save();

        // Configurar estilo
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dibujar fondo semi-transparente
        const padding = 15;
        const boxWidth = 300; // Aumentado para más espacio
        const boxHeight = this.activeTooltip.description ? 100 : 50; // Aumentado para más espacio
        
        ctx.fillStyle = `rgba(0, 0, 0, ${this.activeTooltip.alpha * 0.8})`;
        ctx.fillRect(
            this.activeTooltip.x - boxWidth/2,
            this.activeTooltip.y - boxHeight/2,
            boxWidth,
            boxHeight
        );

        // Dibujar borde
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.activeTooltip.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.activeTooltip.x - boxWidth/2,
            this.activeTooltip.y - boxHeight/2,
            boxWidth,
            boxHeight
        );

        // Dibujar título
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${this.activeTooltip.alpha})`;
        
        if (this.activeTooltip.icon) {
            ctx.fillText(
                `${this.activeTooltip.icon} ${this.activeTooltip.title}`,
                this.activeTooltip.x,
                this.activeTooltip.y - 25
            );
        } else {
            ctx.fillText(
                `[${this.activeTooltip.key}] ${this.activeTooltip.title}`,
                this.activeTooltip.x,
                this.activeTooltip.y - 25
            );
        }

        // Dibujar descripción
        if (this.activeTooltip.description) {
            ctx.font = '16px Arial';
            ctx.fillStyle = `rgba(200, 200, 200, ${this.activeTooltip.alpha})`;
            
            // Dividir la descripción en líneas si es necesario
            const lines = this.wrapText(ctx, this.activeTooltip.description, boxWidth - padding * 4);
            lines.forEach((line, i) => {
                ctx.fillText(
                    line,
                    this.activeTooltip.x,
                    this.activeTooltip.y + 5 + (i * 25)
                );
            });
        }

        ctx.restore();
    }
}

window.Tooltip = Tooltip;
