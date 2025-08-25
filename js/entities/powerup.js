class PowerUp {
    constructor(x, y, type = 'health') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocityY = 2; // Velocidad de caída
        this.type = type;
        this.collected = false;
        this.oscillationOffset = Math.random() * Math.PI * 2;
        this.oscillationSpeed = 0.05;
        this.oscillationAmount = 20;

        // Configurar efectos según el tipo
        switch(type) {
            case 'health':
                this.healAmount = 30;
                this.color = '#FF3366'; // Rojo para vida
                break;
            case 'damage':
                this.damageBoost = 1.5; // 50% más de daño
                this.duration = 10000; // 10 segundos
                this.color = '#FFD700'; // Dorado para daño
                break;
            case 'speed':
                this.speedBoost = 1.3; // 30% más velocidad
                this.duration = 8000; // 8 segundos
                this.color = '#00FF00'; // Verde para velocidad
                break;
        }
    }

    update() {
        if (this.collected) return;

        // Movimiento de caída
        this.y += this.velocityY;

        // Movimiento de oscilación horizontal
        this.x = this.x + Math.sin(Date.now() * this.oscillationSpeed + this.oscillationOffset) * 0.5;
    }

    render(ctx) {
        if (this.collected) return;

        ctx.save();
        
        // Añadir brillo/resplandor
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Dibujar fondo circular
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Fondo circular negro semi-transparente
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fill();
        
        // Borde del círculo
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Configurar el texto
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = this.color;

        // Dibujar el icono correspondiente
        let icon;
        switch(this.type) {
            case 'health':
                icon = '♥';
                break;
            case 'damage':
                icon = '★';
                break;
            case 'speed':
                icon = '⚡';
                break;
        }
        
        ctx.fillText(icon, centerX, centerY);
        
        ctx.restore();
    }

    checkCollision(player) {
        if (this.collected) return false;

        return (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

window.PowerUp = PowerUp;
