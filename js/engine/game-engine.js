class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // Estado del juego
        this.isPaused = false;
        this.isPausedForControls = false; // Nueva variable para pausa por controles
        this.isGameOver = false;
        this.score = 0;
        this.isInvincible = false;
        this.noEnemies = false;
        this.showHitboxes = false; // Desactivar hitboxes por defecto
        
        // Sistemas
        this.inputHandler = new InputHandler();
        this.physics = new Physics();
        this.spriteLoader = new SpriteLoader();
        this.enemySpriteLoader = new EnemySpriteLoader();
        this.collisionSystem = new CollisionSystem();
        this.platformGenerator = new PlatformGenerator(canvas);
        this.audioManager = new AudioManager();
        
        // Entidades
        this.player = new Player(0, this.canvas.height - 100);
        this.enemies = [];
        this.platforms = [];
        this.powerUps = [];
        this.traps = [];
        
        // UI
        this.hud = new HUD(this.ctx);
        this.pauseMenu = new PauseMenu(this.ctx);
        this.tooltip = new Tooltip();
        this.controlsLegend = new ControlsLegend(this.ctx);

        // Temporizadores
        this.enemySpawnTimer = Date.now();
        this.powerUpSpawnTimer = Date.now();
        this.trapSpawnTimer = Date.now();
        this.ENEMY_SPAWN_INTERVAL = 1500; // 1.5 segundos - Spawn muy frecuente
        this.POWERUP_SPAWN_INTERVAL = 8000; // 8 segundos entre power-ups
        this.TRAP_SPAWN_INTERVAL = 3000; // 3 segundos entre trampas
        this.MAX_ENEMIES = 8; // Máximo de enemigos simultáneos
        this.MAX_TRAPS = 4; // Máximo de trampas simultáneas
    }

    async init() {
        try {
            // Cargar sprites del jugador y enemigos
            await this.spriteLoader.loadAllSprites();
            await this.enemySpriteLoader.loadSprites();
            
            // Generar plataformas y enemigos iniciales
            this.platforms = this.platformGenerator.generatePlatforms();
            this.createInitialEnemies();
            
            // Preparar la música (pero no reproducirla aún)
            this.audioManager.startMusic();
            
            // Añadir listener para iniciar música con interacción
            document.addEventListener('keydown', () => {
                if (this.audioManager) {
                    this.audioManager.userInteractionStartMusic();
                }
            }, { once: true });
            
            // Iniciar el bucle del juego
            this.startGameLoop();
            return true;
        } catch (error) {
            console.error('Error en la inicialización:', error);
            throw error;
        }
    }

    createInitialEnemies() {
        this.enemies = [];
        
        // Crear más enemigos iniciales
        const numEnemies = 6; // Aumentado a 6 enemigos iniciales
        const spacing = this.canvas.width / (numEnemies + 1);
        
        for (let i = 0; i < numEnemies; i++) {
            // Posición X espaciada uniformemente con más aleatoriedad
            const baseX = spacing * (i + 1);
            const randomOffset = (Math.random() - 0.5) * spacing;
            const x = Math.min(Math.max(baseX + randomOffset, 60), this.canvas.width - 60);
            
            // Distribuir enemigos en diferentes alturas
            const y = this.canvas.height * (0.1 + Math.random() * 0.4);
            
            // Crear el enemigo con un retraso muy corto entre cada uno
            setTimeout(() => {
                this.enemies.push(new Enemy(x, y, this.enemySpriteLoader));
            }, i * 200); // 200ms de retraso entre cada enemigo
        }
    }

    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    update() {
        if (this.isPaused || this.isPausedForControls) return;

        if (this.isGameOver) {
            if (this.inputHandler.isKeyPressed('r')) {
                this.reset();
            }
            return;
        }

        // Actualizar jugador
        this.player.update(this.inputHandler, this.physics);
        
        // Actualizar enemigos
        if (!this.noEnemies) {
            // Generar nuevos enemigos si no hay demasiados
            if (this.enemies.length < this.MAX_ENEMIES && 
                Date.now() - this.enemySpawnTimer > this.ENEMY_SPAWN_INTERVAL) {
                this.spawnEnemy();
                this.enemySpawnTimer = Date.now();
                
                // Reducir el intervalo de spawn conforme aumenta el score
                this.ENEMY_SPAWN_INTERVAL = Math.max(
                    800, // Mínimo 0.8 segundos
                    1500 - Math.floor(this.score / 500) * 100 // Reducir 0.1s cada 500 puntos
                );
            }

            // Actualizar enemigos existentes y eliminar los muertos
            this.enemies = this.enemies.filter(enemy => {
                if (enemy.health <= 0) {
                    this.score += 100;
                    return false;
                }
                // Ya no pasamos la lista de enemigos para evitar colisiones entre ellos
                enemy.update(this.player, this.physics, null, this.platforms);
                return true;
            });
        }

        // Actualizar y generar power-ups
        if (Date.now() - this.powerUpSpawnTimer > this.POWERUP_SPAWN_INTERVAL) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = Date.now();
        }

        // Actualizar power-ups existentes y comprobar colisiones
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update();

            // Comprobar si el jugador recoge el power-up
            if (powerUp.checkCollision(this.player)) {
                this.player.applyPowerUp(powerUp);
                return false;
            }

            // Eliminar power-ups que caen fuera de la pantalla
            return powerUp.y < this.canvas.height;
        });

        // Generar y actualizar trampas
        if (this.traps.length < this.MAX_TRAPS && 
            Date.now() - this.trapSpawnTimer > this.TRAP_SPAWN_INTERVAL) {
            const x = Math.random() * (this.canvas.width - 30);
            const trap = new Trap(x, -30);
            this.traps.push(trap);
            this.trapSpawnTimer = Date.now();
        }

        // Actualizar trampas y comprobar colisiones
        this.traps = this.traps.filter(trap => {
            trap.update();

            // Comprobar si el jugador colisiona con la trampa
            if (trap.checkCollision(this.player)) {
                this.player.takeDamage(trap.damage);
                return false;
            }

            // Eliminar trampas que caen fuera de la pantalla
            return trap.y < this.canvas.height;
        });

        // Comprobar colisiones
        this.collisionSystem.checkPlatformCollisions(this.player, this.platforms);
        this.collisionSystem.checkAttackCollisions(this.player, this.enemies);

        // Verificar game over
        if (this.player.health <= 0) {
            this.isGameOver = true;
        }
    }

    spawnPowerUp() {
        // Generar una posición X aleatoria dentro del canvas
        const x = Math.random() * (this.canvas.width - 30);
        // Empezar desde arriba del canvas
        const y = -30;
        
        // Elegir tipo de power-up basado en el score y probabilidad
        let type = 'health';
        const rand = Math.random();
        
        if (this.score >= 1000) {
            if (rand < 0.4) type = 'health';
            else if (rand < 0.7) type = 'damage';
            else type = 'speed';
        }
        
        const powerUp = new PowerUp(x, y, type);
        this.powerUps.push(powerUp);
        
        // Mostrar tooltip para el power-up
        this.tooltip.showPowerUpTooltip(type, x, y);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar plataformas
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Renderizar power-ups y trampas
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        this.traps.forEach(trap => trap.render(this.ctx));
        
        // Renderizar jugador
        this.player.render(this.ctx, this.spriteLoader);
        
        // Renderizar enemigos
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Renderizar UI
        this.hud.render(this.score, this.player.health, this.isInvincible, this.noEnemies);
        
        // Renderizar tooltips
        this.tooltip.render(this.ctx);
        
        // Renderizar leyenda de controles
        this.controlsLegend.render();
        
        // Eliminar completamente la visualización de hitboxes
        
        // Renderizar menú de pausa
        if (this.isPaused) {
            this.pauseMenu.render();
        }

        // Renderizar game over
        if (this.isGameOver) {
            this.showGameOver();
        }
    }

    showGameOver() {
        // Fondo semitransparente negro
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Configurar alineación de texto al centro
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // GAME OVER en rojo brillante con sombra
        this.ctx.font = 'bold 64px Arial';
        
        // Sombra exterior
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 4;
        this.ctx.shadowOffsetY = 4;
        
        // Texto principal
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 50);
        
        // Resetear sombra
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Puntuación final con brillo dorado
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 20);
        
        // Mensaje para reiniciar con efecto pulsante
        this.ctx.font = 'bold 24px Arial';
        const alpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillText('Press R to Restart', this.canvas.width/2, this.canvas.height/2 + 70);
    }

    spawnEnemy() {
        // Encontrar una posición X que esté lejos de otros enemigos
        let x;
        let attempts = 0;
        const minDistance = 150; // Distancia mínima entre enemigos
        
        do {
            x = Math.random() * (this.canvas.width - 60);
            attempts++;
            
            // Verificar si esta posición está lo suficientemente lejos de otros enemigos
            const isTooClose = this.enemies.some(enemy => 
                Math.abs(enemy.x - x) < minDistance
            );
            
            if (!isTooClose || attempts > 10) {
                break;
            }
        } while (true);
        
        // Altura aleatoria en el tercio superior de la pantalla
        const y = this.canvas.height * (0.2 + Math.random() * 0.2);
        
        // Crear el enemigo
        const enemy = new Enemy(x, y, this.enemySpriteLoader);
        this.enemies.push(enemy);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.audioManager.pauseMusic();
        } else {
            this.audioManager.resumeMusic();
        }
    }

    pauseForControls() {
        this.isPausedForControls = true;
        this.audioManager.pauseMusic();
    }

    resumeFromControls() {
        this.isPausedForControls = false;
        this.audioManager.resumeMusic();
    }

    toggleInvincible() {
        this.isInvincible = !this.isInvincible;
        console.log(`Modo invencible: ${this.isInvincible ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }

    toggleNoEnemies() {
        this.noEnemies = !this.noEnemies;
        if (this.noEnemies) {
            this.enemies = [];
        }
        console.log(`Modo sin enemigos: ${this.noEnemies ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }

    toggleHitboxes() {
        this.showHitboxes = !this.showHitboxes;
    }

    reset() {
        // Resetear estado del juego
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Resetear temporizadores
        this.enemySpawnTimer = Date.now();
        this.powerUpSpawnTimer = Date.now();
        
        // Limpiar entidades
        this.enemies = [];
        this.powerUps = [];
        this.traps = [];
        
        // Resetear canvas y dimensiones
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Regenerar plataformas
        this.platforms = this.platformGenerator.generatePlatforms();
        
        // Crear nuevo jugador y enemigos
        this.player = new Player(50, this.canvas.height - 100);
        this.createInitialEnemies();
    }

    handleResize() {
        this.platforms = this.platformGenerator.generatePlatforms();
        this.player.handleCanvasResize(this.canvas);
        this.enemies.forEach(enemy => enemy.handleCanvasResize(this.canvas));
    }
}

window.GameEngine = GameEngine;