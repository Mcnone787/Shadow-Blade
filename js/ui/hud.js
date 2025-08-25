class HUD {
    constructor(ctx) {
        this.ctx = ctx;
        this.MAX_PLAYER_HEALTH = 100;
    }

    drawTextWithOutline(text, x, y, fillColor) {
        this.ctx.font = 'bold 24px Arial';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 4;
        this.ctx.strokeText(text, x, y);
        this.ctx.fillStyle = fillColor;
        this.ctx.fillText(text, x, y);
    }

    render(score, playerHealth, isInvincible = false, noEnemies = false) {
        // Score (centrado en la parte superior)
        this.drawTextWithOutline(`Score: ${score}`, this.ctx.canvas.width / 2 - 50, 30, '#FFA500');

        // Barra de vida
        this.drawHealthBar(playerHealth);
        
        // Indicadores de modos especiales
        this.drawModeIndicators(isInvincible, noEnemies);
    }

    drawHealthBar(playerHealth) {
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const startX = 70;
        const startY = 40;
        const cornerRadius = 10; // Radio para las esquinas redondeadas
        
        this.ctx.save();
        
        // Sombra para toda la barra
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // Dibujar fondo con gradiente y esquinas redondeadas
        const bgGradient = this.ctx.createLinearGradient(startX, startY, startX, startY + healthBarHeight);
        bgGradient.addColorStop(0, '#600000');
        bgGradient.addColorStop(1, '#400000');
        
        this.ctx.beginPath();
        this.ctx.roundRect(startX, startY, healthBarWidth, healthBarHeight, cornerRadius);
        this.ctx.fillStyle = bgGradient;
        this.ctx.fill();
        
        // Dibujar barra de vida actual con gradiente
        const healthPercent = playerHealth / this.MAX_PLAYER_HEALTH;
        const currentHealthWidth = healthBarWidth * healthPercent;
        
        const healthGradient = this.ctx.createLinearGradient(startX, startY, startX, startY + healthBarHeight);
        if (healthPercent > 0.6) {
            healthGradient.addColorStop(0, '#00FF00');
            healthGradient.addColorStop(1, '#00CC00');
        } else if (healthPercent > 0.3) {
            healthGradient.addColorStop(0, '#FFFF00');
            healthGradient.addColorStop(1, '#CCCC00');
        } else {
            healthGradient.addColorStop(0, '#FF3300');
            healthGradient.addColorStop(1, '#CC2200');
        }
        
        this.ctx.beginPath();
        this.ctx.roundRect(startX, startY, currentHealthWidth, healthBarHeight, cornerRadius);
        this.ctx.fillStyle = healthGradient;
        this.ctx.fill();
        
        // Efecto de brillo en la parte superior
        const shineGradient = this.ctx.createLinearGradient(startX, startY, startX, startY + healthBarHeight/2);
        shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.roundRect(startX, startY, currentHealthWidth, healthBarHeight/2, cornerRadius);
        this.ctx.fillStyle = shineGradient;
        this.ctx.fill();
        
        // Borde suave
        this.ctx.beginPath();
        this.ctx.roundRect(startX, startY, healthBarWidth, healthBarHeight, cornerRadius);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Segmentos en la barra
        const segmentWidth = healthBarWidth / 10;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 1; i < 10; i++) {
            const x = startX + i * segmentWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, startY + healthBarHeight);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        
        // Texto de HP con sombra y brillo
        const hpText = `HP: ${playerHealth}/${this.MAX_PLAYER_HEALTH}`;
        this.ctx.font = 'bold 16px Arial';
        
        // Sombra del texto
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillText(hpText, startX + healthBarWidth + 11, startY + 15);
        
        // Texto principal
        this.ctx.fillStyle = healthPercent > 0.3 ? '#FFFFFF' : '#FF9999';
        this.ctx.fillText(hpText, startX + healthBarWidth + 10, startY + 14);
    }

    drawModeIndicators(isInvincible, noEnemies) {
        let x = this.ctx.canvas.width / 2 + 100; // A la derecha del score
        let y = 30; // Alineado con el score
        
        if (isInvincible) {
            this.drawTextWithOutline('INVENCIBLE', x, y, '#FFD700');
            x += 150; // Mover el siguiente indicador a la derecha
        }
        
        if (noEnemies) {
            this.drawTextWithOutline('SIN ENEMIGOS', x, y, '#FF4500');
        }
    }

    showDamageNumber(damage, x, y) {
        this.ctx.font = 'bold 24px Arial';
        
        // Contorno negro
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`-${damage}`, x, y - 20);
        
        // Texto en rojo brillante
        this.ctx.fillStyle = '#FF3030';
        this.ctx.fillText(`-${damage}`, x, y - 20);
    }
}

window.HUD = HUD;
