class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#3a5a40';  // Verde oscuro para las plataformas
        this.borderColor = '#588157';  // Verde más claro para el borde
    }

    render(ctx) {
        // Dibujar la plataforma con un estilo más elaborado
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Añadir borde superior más claro
        ctx.fillStyle = this.borderColor;
        ctx.fillRect(this.x, this.y, this.width, 4);
        
        // Si gameEngine tiene showHitboxes activado, mostrar el hitbox
        if (window.gameEngine && window.gameEngine.showHitboxes) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }

    handleCanvasResize(canvas) {
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }
}

class PlatformGenerator {
    constructor(canvas) {
        this.canvas = canvas;
    }

    generatePlatforms() {
        const platforms = [];
        
        // Plataforma base (suelo)
        platforms.push(new Platform(
            0,
            this.canvas.height - 15,  // Altura reducida del suelo
            this.canvas.width,
            15
        ));

        // Configuración de plataformas
        const minPlatformWidth = 80;  // Ancho mínimo más pequeño
        const maxPlatformWidth = 120; // Ancho máximo más pequeño
        const minRowHeight = 100;     // Altura mínima entre filas
        const maxRowHeight = 130;     // Altura máxima entre filas
        const numRows = 5;            // Más filas para mejor distribución
        const minPlatformsPerRow = 2;
        const maxPlatformsPerRow = 4;

        let currentHeight = this.canvas.height - 120;

        // Generar plataformas por filas
        for (let row = 0; row < numRows; row++) {
            // Variar la cantidad de plataformas por fila
            const platformsInThisRow = Math.floor(
                Math.random() * (maxPlatformsPerRow - minPlatformsPerRow + 1) + minPlatformsPerRow
            );

            // Calcular espaciado horizontal para esta fila
            const totalGapWidth = this.canvas.width * 0.2; // 20% del ancho para gaps
            const gapWidth = totalGapWidth / (platformsInThisRow + 1);
            
            // Distribuir plataformas en esta fila
            for (let i = 0; i < platformsInThisRow; i++) {
                // Variar el ancho de cada plataforma
                const platformWidth = Math.random() * (maxPlatformWidth - minPlatformWidth) + minPlatformWidth;
                
                // Calcular posición X con distribución más natural
                const sectionWidth = (this.canvas.width - totalGapWidth) / platformsInThisRow;
                const baseX = (i * sectionWidth) + gapWidth;
                const randomOffset = Math.random() * (gapWidth * 0.5) - (gapWidth * 0.25);
                
                // Añadir variación a la altura dentro de un rango razonable
                const heightVariation = Math.random() * 20 - 10;
                
                platforms.push(new Platform(
                    baseX + randomOffset,
                    currentHeight + heightVariation,
                    platformWidth,
                    10  // Altura reducida de las plataformas
                ));
            }

            // Incrementar altura para la siguiente fila
            currentHeight -= Math.random() * (maxRowHeight - minRowHeight) + minRowHeight;
        }

        // Añadir algunas plataformas extra para crear rutas alternativas
        const numExtraPlatforms = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numExtraPlatforms; i++) {
            const platformWidth = Math.random() * (maxPlatformWidth - minPlatformWidth) + minPlatformWidth;
            const x = Math.random() * (this.canvas.width - platformWidth);
            const y = Math.random() * (this.canvas.height * 0.6) + (this.canvas.height * 0.2);
            
            platforms.push(new Platform(
                x,
                y,
                platformWidth,
                10
            ));
        }

        return platforms;
    }
}

window.Platform = Platform;
window.PlatformGenerator = PlatformGenerator;