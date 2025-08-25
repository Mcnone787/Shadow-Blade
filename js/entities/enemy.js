class Enemy {
    constructor(x, y, spriteLoader) {
        if (!spriteLoader) {
            throw new Error('Enemy requires a spriteLoader');
        }
        
        // Propiedades básicas
        this.x = x;
        this.y = y;
        this.spriteLoader = spriteLoader;
        
        // Determinar el tipo de enemigo
        this.type = spriteLoader.getRandomEnemyType();
        
        // Obtener dimensiones iniciales del sprite
        const dimensions = spriteLoader.getSpriteDimensions(this.type, 'idle');
        this.width = dimensions.width;
        this.height = dimensions.height;
        
        // Guardar las dimensiones originales para poder ajustarlas según la acción
        this.originalWidth = this.width;
        this.originalHeight = this.height;
        
        // Propiedades de salud y daño
        this.health = Math.floor(80 + Math.random() * 40);
        this.maxHealth = this.health;
        
        // Propiedades de movimiento
        this.velocityX = 0;
        this.velocityY = 0;
        this.maxSpeed = 6 + Math.random() * 4; // Velocidad entre 6 y 10
        this.isMovingLeft = Math.random() > 0.5;
        this.gravity = 0.6;
        this.maxFallSpeed = 15; // Mayor velocidad de caída
        this.isOnGround = false;
        this.detectionRange = 500; // Rango de detección mucho mayor
        this.isPlayerDetected = false;
        this.jumpForce = -18; // Saltos más altos
        this.jumpProbability = 0.05; // 5% de probabilidad de saltar en cada frame
        
        // Propiedades de ataque
        this.isAttacking = false;
        this.attackDamage = 4; // Menos daño pero más frecuente
        this.attackRange = 150; // Mayor rango de ataque
        this.attackCooldown = 600; // Cooldown más corto (0.6 segundos)
        this.lastAttackTime = 0;
        this.attackHitbox = {
            width: 70,  // Hitbox más grande
            height: 60  // Hitbox más grande
        };
        
        // Estado y animación
        this.state = 'patrol';
        this.currentFrame = 0;
        this.frameCount = 0;
        this.animationSpeed = 8;
        this.turnCooldown = 0;
        this.isNearEdge = false;
        this.lastPlatformY = null;
        this.edgeDetectionRange = 40;
        this.timeOnPlatform = 0;
        this.maxTimeOnPlatform = 180; // 3 segundos a 60fps
        this.platformId = null; // Para rastrear en qué plataforma estamos
        this.shouldJump = false;
    }


    update(player, physics, enemies, platforms) {
        // Detectar al jugador
        const distanceToPlayer = this.getDistanceToPlayer(player);
        this.isPlayerDetected = distanceToPlayer < this.detectionRange;
        
        // Actualizar estado
        if (this.isPlayerDetected && !this.isAttacking) {
            this.state = 'chase';
            // Verificar si podemos atacar
            if (distanceToPlayer < this.attackRange && Date.now() - this.lastAttackTime > this.attackCooldown) {
                this.startAttack(player);
            }
        } else if (distanceToPlayer > this.detectionRange * 1.2) {
            this.state = 'patrol';
        }

        // Actualizar movimiento según el estado
        if (!this.isAttacking) {
            if (this.state === 'chase') {
                this.chasePlayer(player);
            } else {
                this.patrol();
            }
        }
        
        // Aplicar gravedad y colisiones
        if (!this.isOnGround) {
            this.velocityY += this.gravity;
            if (this.velocityY > this.maxFallSpeed) this.velocityY = this.maxFallSpeed;
        }
        
        // Actualizar posición
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Colisiones con plataformas
        this.checkPlatformCollisions(platforms);
        
        // Mantener dentro de los límites
        this.keepInBounds();
        
        // Actualizar animación
        this.updateAnimation();
    }

    startAttack(player) {
        this.isAttacking = true;
        this.lastAttackTime = Date.now();
        this.currentFrame = 0;
        
        // Crear hitbox de ataque
        const attackBox = {
            x: this.isMovingLeft ? this.x - this.attackHitbox.width : this.x + this.width,
            y: this.y + (this.height - this.attackHitbox.height) / 2,
            width: this.attackHitbox.width,
            height: this.attackHitbox.height
        };
        
        // Verificar si el jugador está en el hitbox
        if (this.checkCollision(attackBox, player)) {
            player.takeDamage(this.attackDamage);
        }
        
        // Terminar el ataque después de un tiempo
        setTimeout(() => {
            this.isAttacking = false;
        }, 500);
    }

    checkCollision(box1, box2) {
        return box1.x < box2.x + box2.width &&
               box1.x + box1.width > box2.x &&
               box1.y < box2.y + box2.height &&
               box1.y + box1.height > box2.y;
    }

    getDistanceToPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    canReachPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        // Si el jugador está por encima de nosotros, no podemos alcanzarlo
        if (dy < -this.height * 2) {
            return false;
        }
        
        // Si el jugador está muy por debajo, tampoco podemos alcanzarlo
        if (dy > this.height * 4) {
            return false;
        }
        
        // Si estamos cerca del borde y el jugador está al otro lado
        if (this.isNearEdge) {
            const isPlayerOnOtherSide = (this.isMovingLeft && dx < 0) || (!this.isMovingLeft && dx > 0);
            if (isPlayerOnOtherSide) {
                return false;
            }
        }
        
        return true;
    }

    chasePlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        
        // Actualizar la dirección solo si vamos a movernos
        const shouldMove = this.shouldMoveTowardsPlayer(player, dx, dy);
        if (shouldMove) {
            this.isMovingLeft = dx < 0;
            this.velocityX = this.isMovingLeft ? -this.maxSpeed : this.maxSpeed;
        } else {
            // Si no nos vamos a mover, mantener la dirección mirando al jugador
            // pero sin cambiarla constantemente
            if (Math.abs(dx) > 10) { // Pequeño umbral para evitar flickering
                this.isMovingLeft = dx < 0;
            }
            this.velocityX = 0;
        }
    }

    shouldMoveTowardsPlayer(player, dx, dy) {
        // Si el jugador está muy por encima o por debajo
        const heightDifference = Math.abs(dy);
        if (heightDifference > this.height * 1.5) {
            return false;
        }

        // Si estamos cerca del borde
        if (this.isNearEdge) {
            const distanceToPlayer = Math.abs(dx);
            // Solo movernos si el jugador está muy cerca
            return distanceToPlayer < 150 && heightDifference < this.height;
        }

        // Si estamos en la misma altura aproximada
        if (heightDifference < this.height) {
            return true;
        }

        return false;
    }

    patrol() {
        // Si estamos en el aire, intentar movernos hacia la plataforma más cercana
        if (!this.isOnGround) {
            // Mantener velocidad horizontal para movimiento más dinámico
            const airSpeed = this.maxSpeed * 0.8;
            this.velocityX = this.isMovingLeft ? -airSpeed : airSpeed;
            return;
        }

        // Probabilidad de salto aleatorio
        if (Math.random() < this.jumpProbability) {
            this.velocityY = this.jumpForce;
            return;
        }

        // Cerca del borde, saltar o cambiar dirección
        if (this.isNearEdge) {
            if (Math.random() < 0.4) { // 40% de probabilidad de saltar
                this.velocityY = this.jumpForce;
            } else {
                this.isMovingLeft = !this.isMovingLeft;
            }
        }

        // Decrementar el cooldown de giro
        if (this.turnCooldown > 0) {
            this.turnCooldown--;
        }
        
        // Cambiar dirección más frecuentemente
        if (this.turnCooldown <= 0 && Math.random() < 0.03) { // 3% de probabilidad
            this.isMovingLeft = !this.isMovingLeft;
            this.turnCooldown = 20; // Cooldown más corto
        }
        
        // Velocidad de patrulla más alta
        const patrolSpeed = this.maxSpeed * 0.6; // 60% de la velocidad máxima
        const targetVelocity = this.isMovingLeft ? -patrolSpeed : patrolSpeed;
        
        // Aceleración más rápida
        const acceleration = 0.2;
        const speedDiff = targetVelocity - this.velocityX;
        
        if (Math.abs(speedDiff) > acceleration) {
            this.velocityX += Math.sign(speedDiff) * acceleration;
        } else {
            this.velocityX = targetVelocity;
        }
    }

    checkPlatformCollisions(platforms) {
        this.isOnGround = false;
        let wasOnGround = false;
        
        // Usar las dimensiones originales para las colisiones
        const collisionWidth = this.originalWidth;
        const collisionHeight = this.originalHeight;
        
        // Calcular el offset para centrar el hitbox
        const xOffset = (this.width - collisionWidth) / 2;
        
        // Almacenar la plataforma actual
        let currentPlatform = null;
        
        // Encontrar la plataforma actual
        for (const platform of platforms) {
            // Verificar si estamos sobre esta plataforma
            const overlapX = this.x + xOffset + collisionWidth > platform.x &&
                           this.x + xOffset < platform.x + platform.width;
            
            if (overlapX) {
                const enemyBottom = this.y + collisionHeight;
                const platformTop = platform.y;
                
                // Mejorar la detección de colisión con plataforma
                const isAbovePlatform = enemyBottom <= platformTop + 10;
                const isCloseEnough = enemyBottom >= platformTop - 5;
                const isFalling = this.velocityY >= 0;
                
                if (isFalling && isAbovePlatform && isCloseEnough) {
                    
                    currentPlatform = platform;
                    
                    // Si es una plataforma diferente o acabamos de aterrizar
                    if (this.platformId !== platform) {
                        this.platformId = platform;
                        this.timeOnPlatform = 0;
                    }
                    
                    // Si deberíamos saltar, no nos quedamos en la plataforma
                    if (this.shouldJump) {
                        this.velocityY = -15; // Salto fuerte
                        this.shouldJump = false;
                        continue;
                    }
                    
                    this.y = platformTop - collisionHeight;
                    this.velocityY = 0;
                    this.isOnGround = true;
                    wasOnGround = true;
                    
                    // Actualizar la altura de la última plataforma
                    if (this.lastPlatformY === null) {
                        this.lastPlatformY = platformTop;
                    }
                    
                    // Incrementar el tiempo en la plataforma
                    this.timeOnPlatform++;
                    
                    // Si hemos estado demasiado tiempo en la plataforma
                    if (this.timeOnPlatform > this.maxTimeOnPlatform) {
                        // 50% de probabilidad de saltar vs caminar fuera
                        if (Math.random() < 0.5) {
                            this.shouldJump = true;
                        } else {
                            // Forzar movimiento hacia el borde más cercano
                            const distanceToLeftEdge = (this.x + xOffset) - platform.x;
                            const distanceToRightEdge = (platform.x + platform.width) - (this.x + xOffset + collisionWidth);
                            this.isMovingLeft = distanceToLeftEdge < distanceToRightEdge;
                            this.velocityX = this.isMovingLeft ? -this.maxSpeed : this.maxSpeed;
                        }
                        this.timeOnPlatform = 0;
                    }
                }
            }
        }
        
        // Si no estamos en la misma plataforma, resetear el contador
        if (!currentPlatform || currentPlatform !== this.platformId) {
            this.platformId = null;
            this.timeOnPlatform = 0;
        }
        
        // Verificar si estamos en el borde de una plataforma
        if (currentPlatform && this.isOnGround) {
            const distanceToLeftEdge = (this.x + xOffset) - currentPlatform.x;
            const distanceToRightEdge = (currentPlatform.x + currentPlatform.width) - (this.x + xOffset + collisionWidth);
            
            // Actualizar el estado de cercanía al borde
            this.isNearEdge = distanceToLeftEdge < this.edgeDetectionRange || distanceToRightEdge < this.edgeDetectionRange;
            
            // Si estamos muy cerca del borde, preparar para caer
            const isNearLeftEdge = distanceToLeftEdge < 5;
            const isNearRightEdge = distanceToRightEdge < 5;
            const isMovingTowardsEdge = (isNearLeftEdge && this.velocityX < 0) || 
                                      (isNearRightEdge && this.velocityX > 0);
            
            if (isMovingTowardsEdge) {
                // Solo iniciar caída si realmente nos movemos hacia el borde
                const edgePosition = isNearLeftEdge ? currentPlatform.x : currentPlatform.x + currentPlatform.width - collisionWidth;
                const distanceToEdge = Math.abs(this.x - edgePosition);
                
                if (distanceToEdge < 2) {
                    this.isOnGround = false;
                    this.velocityY = 0.1;
                    // Mantener el movimiento horizontal con velocidad máxima
                    this.velocityX = this.isMovingLeft ? -this.maxSpeed : this.maxSpeed;
                }
            }
        } else {
            this.isNearEdge = false;
        }
        
        // Si no está en ninguna plataforma, verificar si debería caer
        if (!wasOnGround) {
            this.isOnGround = false;
            if (this.velocityY === 0) {
                this.velocityY = 0.1;
            }
            // Mantener el movimiento horizontal mientras caemos
            if (this.velocityX !== 0) {
                const direction = this.velocityX > 0 ? 1 : -1;
                this.velocityX = direction * this.maxSpeed; // Velocidad completa en el aire
            }
            // Resetear la altura de la última plataforma si caemos demasiado
            if (this.lastPlatformY !== null && this.y > this.lastPlatformY + 200) {
                this.lastPlatformY = null;
            }
        }
    }

    // Método eliminado ya que no necesitamos colisiones entre enemigos

    keepInBounds() {
        if (this.x < 0) {
            this.x = 0;
            this.isMovingLeft = false;
        } else if (this.x + this.width > window.innerWidth) {
            this.x = window.innerWidth - this.width;
            this.isMovingLeft = true;
        }
    }

    updateAnimation() {
        // Asegurarnos de que frameCount y currentFrame son números enteros
        this.frameCount = Math.floor(this.frameCount);
        this.currentFrame = Math.floor(this.currentFrame);

        // Incrementar el contador de frames
        this.frameCount++;
        
        // Actualizar el frame actual cuando corresponda
        if (this.frameCount >= this.animationSpeed) {
            this.frameCount = 0;
            
            // Obtener el número total de frames para la animación actual
            let currentAction = this.getCurrentAction();
            const totalFrames = this.spriteLoader.getFrameCount(this.type, currentAction);
            
            // Avanzar al siguiente frame, volviendo al inicio si es necesario
            this.currentFrame = (this.currentFrame + 1) % totalFrames;
            
            // Terminar el ataque si la animación ha completado
            if (this.isAttacking && this.currentFrame >= totalFrames - 1) {
                this.isAttacking = false;
            }
        }
    }

    getCurrentAction() {
        // Prioridad 1: Estados especiales
        if (this.health <= 0) return 'death';
        if (this.isAttacking) return 'attack';
        
        // Prioridad 2: Salto/Caída
        if (!this.isOnGround && Math.abs(this.velocityY) > 2) {
            return 'jump';
        }
        
        // Prioridad 3: Movimiento basado en velocidad real
        const absVelocityX = Math.abs(this.velocityX);
        
        // Idle si no hay movimiento significativo
        if (absVelocityX < 0.1) {
            return 'idle';
        }
        
        // Correr si la velocidad es alta
        if (absVelocityX >= this.maxSpeed * 0.5) {
            return 'run';
        }
        
        // Caminar para velocidades intermedias
        return 'walk';
    }

    render(ctx) {
        try {
            // Obtener la acción actual y asegurarnos de que sea válida
            let currentAction = this.getCurrentAction();
            let frame = null;
            let dimensions = null;
            
            // Intentar obtener un frame válido
            const frameCount = this.spriteLoader.getFrameCount(this.type, currentAction);
            if (frameCount > 0) {
                const currentFrameIndex = Math.floor(this.currentFrame % frameCount);
                frame = this.spriteLoader.getSprite(this.type, currentAction, currentFrameIndex);
                dimensions = this.spriteLoader.getSpriteDimensions(this.type, currentAction);
            }
            
            // Si no tenemos un frame válido, no dibujar nada
            if (!frame || !dimensions || !frame.complete || frame.naturalWidth === 0 || dimensions.width <= 0 || dimensions.height <= 0) {
                return;
            }
            
            ctx.save();
            
            // Ajustar las dimensiones según la acción actual
            this.width = dimensions.width;
            this.height = dimensions.height;
            
            // Calcular el offset para centrar el sprite
            const xOffset = (this.width - this.originalWidth) / 2;
            
            // Voltear el sprite si mira a la izquierda
            if (this.isMovingLeft) {
                ctx.scale(-1, 1);
                ctx.translate(-(this.x - xOffset) - this.width, this.y);
            } else {
                ctx.translate(this.x - xOffset, this.y);
            }
            
            // Dibujar el frame actual
            ctx.drawImage(frame, 0, 0, this.width, this.height);
            
            ctx.restore();
            
            // Siempre restaurar las dimensiones originales para colisiones
            this.width = this.originalWidth;
            this.height = this.originalHeight;
            
        } catch (error) {
            // Si hay un error, no dibujar nada
            this.width = this.originalWidth;
            this.height = this.originalHeight;
            return;
        }

        // Eliminar completamente la visualización de hitboxes
        // Solo mantener la barra de vida cuando sea necesario
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }
}

window.Enemy = Enemy;