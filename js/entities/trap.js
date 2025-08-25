class Trap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocityY = 3 + Math.random() * 2; // Velocidad de caída aleatoria
        this.damage = 15; // Daño al jugador
        this.collected = false;
        this.oscillationOffset = Math.random() * Math.PI * 2;
        this.oscillationSpeed = 0.05;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.1;
    }

    update() {
        if (this.collected) return;

        // Movimiento de caída
        this.y += this.velocityY;

        // Movimiento de oscilación horizontal
        this.x = this.x + Math.sin(Date.now() * this.oscillationSpeed + this.oscillationOffset) * 0.5;

        // Rotación
        this.rotationAngle += this.rotationSpeed;
    }

    render(ctx) {
        if (this.collected) return;

        ctx.save();
        
        // Configurar sombra
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Trasladar al centro para la rotación
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotationAngle);

        // Dibujar fondo circular
        ctx.beginPath();
        ctx.arc(0, 0, this.width * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fill();

        // Dibujar borde
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dibujar símbolo de peligro (⚠)
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠', 0, 0);

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

window.Trap = Trap;
