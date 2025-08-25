class Player {
    constructor(x, y) {
        // Propiedades básicas
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 80;
        this.health = 100;
        this.maxHealth = 100;
        
        // Control de doble salto
        this.lastWPressTime = 0;
        this.isWKeyReleased = true;
        
        // Propiedades de ataque
        this.attackWidth = 40;  // Ancho de la hitbox de ataque
        this.attackHeight = 40; // Alto de la hitbox de ataque
        this.baseDamage = 20;   // Daño base
        this.damageMultiplier = 1.0; // Multiplicador de daño
        
        // Power-ups y habilidades
        this.activeBuffs = {
            damage: { active: false, endTime: 0 },
            speed: { active: false, endTime: 0 }
        };
        
        // Sistema de progresión
        this.unlockedAbilities = {
            doubleJump: false,    // Desbloqueable a 1000 puntos
            dashAttack: false,    // Desbloqueable a 2000 puntos
            airAttack: false      // Desbloqueable a 3000 puntos
        };
        
        // Estados de movimiento
        this.isMoving = false;
        this.isMovingLeft = false;
        this.isAttacking = false;
        this.isJumping = false;
        this.isOnGround = true;
        this.isDashing = false;
        
        // Física (valores originales del juego)
        this.velocityX = 0;
        this.velocityY = 0;
        this.maxVelocityX = 8;
        this.maxVelocityY = 15;
        
        // Constantes de movimiento (valores originales)
        this.MOVEMENT_SPEED = 5;
        this.RUN_SPEED = 8; // Velocidad de carrera
        this.JUMP_FORCE = -25;
        this.GRAVITY = 0.8;
        this.HORIZONTAL_BOOST = 1.8;
        this.isRunning = false;
        
        // Animación
        this.currentFrame = 0;
        this.frameCount = 0;
        this.staggerFrames = 5;
        this.attackFrame = 0;
        this.ATTACK_FRAMES = 6;
        this.isAttackAnimationComplete = true;
    }

    update(inputHandler, physics) {
        this.handleMovement(inputHandler);
        this.handleAttack(inputHandler);
        this.updateBuffs();
        this.checkProgression();
        
        // Actualizar posición y física
        if (!this.isOnGround) {
            physics.applyGravity(this);
        }
        
        // Guardar la posición anterior
        const oldX = this.x;
        
        // Aplicar velocidad (considerando buff de velocidad)
        const speedMultiplier = this.activeBuffs.speed.active ? 1.3 : 1.0;
        this.x += this.velocityX * speedMultiplier;
        this.y += this.velocityY;
        
        // Mantener al jugador dentro de los límites del mapa
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        } else if (this.x + this.width > window.innerWidth) {
            this.x = window.innerWidth - this.width;
            this.velocityX = 0;
        }
        
        this.updateAnimation();

        // Verificar si el jugador ha muerto
        if (this.health <= 0 && window.gameEngine) {
            window.gameEngine.isGameOver = true;
        }
    }

    handleMovement(inputHandler) {
        // Actualizar estado de carrera (Shift)
        this.isRunning = inputHandler.isKeyPressed('ShiftLeft');

        // Movimiento horizontal
        if (inputHandler.isKeyPressed('d') && !inputHandler.isKeyPressed('a')) {
            this.moveRight();
            // Dash Attack
            if (this.unlockedAbilities.dashAttack && this.isAttacking) {
                this.velocityX *= 2.5; // 150% más rápido durante dash attack
                if (!this.isDashing) {
                    this.velocityX *= 1.2; // 20% de impulso extra al inicio
                    this.isDashing = true;
                }
            }
        } else if (inputHandler.isKeyPressed('a') && !inputHandler.isKeyPressed('d')) {
            this.moveLeft();
            // Dash Attack
            if (this.unlockedAbilities.dashAttack && this.isAttacking) {
                this.velocityX *= 2.5; // 150% más rápido durante dash attack
                if (!this.isDashing) {
                    this.velocityX *= 1.2; // 20% de impulso extra al inicio
                    this.isDashing = true;
                }
            }
        } else {
            this.stop();
        }

        // Sistema de Salto y Doble Salto
        const now = Date.now();
        
        // Si se presiona W
        if (inputHandler.isKeyPressed('w')) {
            // Si es el primer salto (desde el suelo)
            if (this.isOnGround) {
                this.jump(false);
                this.hasUsedDoubleJump = false;
                this.lastWPressTime = now;
                this.isWKeyReleased = false;
            } 
            // Si es un intento de doble salto
            else if (!this.isOnGround && 
                     this.unlockedAbilities.doubleJump && 
                     !this.hasUsedDoubleJump &&
                     this.isWKeyReleased &&
                     now - this.lastWPressTime < 500) { // Ventana de 500ms para el doble salto
                this.jump(true);
                this.hasUsedDoubleJump = true;
                this.lastWPressTime = now;
            }
        } else {
            // Cuando se suelta W, marcar como liberada
            this.isWKeyReleased = true;
        }
        
        // Si soltamos W, permitir registrar la próxima pulsación
        if (!inputHandler.isKeyPressed('w')) {
            if (this.isOnGround) {
                this.hasUsedDoubleJump = false;
            }
            this.lastJumpTime = 0;
        }
        
        // Resetear estados cuando tocamos el suelo
        if (this.isOnGround) {
            this.hasUsedDoubleJump = false;
            this.isJumping = false;
        }
    }

    moveRight() {
        let speed = this.isRunning ? this.RUN_SPEED : this.MOVEMENT_SPEED;
        if (!this.isOnGround) {
            speed *= this.HORIZONTAL_BOOST;
        }
        this.velocityX = speed;
        this.isMoving = true;
        this.isMovingLeft = false;
    }

    moveLeft() {
        let speed = this.isRunning ? this.RUN_SPEED : this.MOVEMENT_SPEED;
        if (!this.isOnGround) {
            speed *= this.HORIZONTAL_BOOST;
        }
        this.velocityX = -speed;
        this.isMoving = true;
        this.isMovingLeft = true;
    }

    stop() {
        this.velocityX = 0;
        this.isMoving = false;
        this.isDashing = false;
    }

    jump(isDoubleJump = false) {
        // Si es un doble salto, hacer un salto más pequeño
        const jumpForce = isDoubleJump ? this.JUMP_FORCE * 0.8 : this.JUMP_FORCE;
        
        this.velocityY = jumpForce;
        this.isJumping = true;
        this.isOnGround = false;
        
        if (isDoubleJump) {
            this.hasUsedDoubleJump = true;
        }
    }

    handleAttack(inputHandler) {
        if (inputHandler.isKeyPressed('n') && this.isAttackAnimationComplete) {
            // Permitir ataque si:
            // 1. Estamos en el suelo, O
            // 2. Tenemos ataque aéreo desbloqueado, O
            // 3. Estamos haciendo un dash attack
            if (this.isOnGround || 
                this.unlockedAbilities.airAttack || 
                (this.unlockedAbilities.dashAttack && (this.velocityX !== 0))) {
                
                this.startAttack();
                
                // Si es un dash attack, aumentar el daño
                if (this.unlockedAbilities.dashAttack && this.velocityX !== 0) {
                    this.damageMultiplier = 1.5; // 50% más de daño durante dash
                    setTimeout(() => {
                        this.damageMultiplier = 1.0;
                    }, 500); // Volver al daño normal después de 500ms
                }
            }
        }
    }

    startAttack() {
        this.isAttacking = true;
        this.isAttackAnimationComplete = false;
        this.attackFrame = 0;
        this.currentFrame = 0;
    }

    updateAnimation() {
        this.frameCount++;
        if (this.frameCount >= this.staggerFrames) {
            this.frameCount = 0;
            this.currentFrame++;
            
            if (this.isAttacking) {
                this.attackFrame++;
                if (this.attackFrame >= this.ATTACK_FRAMES) {
                    this.isAttacking = false;
                    this.isAttackAnimationComplete = true;
                }
            }
        }
    }

    updateBuffs() {
        const now = Date.now();
        
        // Actualizar buff de daño
        if (this.activeBuffs.damage.active && now > this.activeBuffs.damage.endTime) {
            this.activeBuffs.damage.active = false;
            this.damageMultiplier = 1.0;
        }
        
        // Actualizar buff de velocidad
        if (this.activeBuffs.speed.active && now > this.activeBuffs.speed.endTime) {
            this.activeBuffs.speed.active = false;
        }
    }

    checkProgression() {
        if (!window.gameEngine) return;
        
        const score = window.gameEngine.score;
        
        // Desbloquear habilidades basadas en el score
        if (score >= 1000 && !this.unlockedAbilities.doubleJump) {
            this.unlockedAbilities.doubleJump = true;
            if (window.gameEngine && window.gameEngine.tooltip) {
                window.gameEngine.tooltip.showAbilityTooltip('doubleJump');
            }
        }
        
        if (score >= 2000 && !this.unlockedAbilities.dashAttack) {
            this.unlockedAbilities.dashAttack = true;
            if (window.gameEngine && window.gameEngine.tooltip) {
                window.gameEngine.tooltip.showAbilityTooltip('dashAttack');
            }
        }
        
        if (score >= 3000 && !this.unlockedAbilities.airAttack) {
            this.unlockedAbilities.airAttack = true;
            if (window.gameEngine && window.gameEngine.tooltip) {
                window.gameEngine.tooltip.showAbilityTooltip('airAttack');
            }
        }
    }

    showUnlockMessage(message, instructions) {
        if (!window.gameEngine || !window.gameEngine.ctx) return;
        
        // Crear un objeto de mensaje que durará 5 segundos
        this.unlockMessage = {
            text: message,
            instructions: instructions,
            endTime: Date.now() + 5000,
            y: 50,
            alpha: 1.0
        };
    }

    renderUnlockMessage(ctx) {
        if (!this.unlockMessage) return;
        
        const now = Date.now();
        if (now > this.unlockMessage.endTime) {
            this.unlockMessage = null;
            return;
        }
        
        // Calcular la opacidad basada en el tiempo restante
        const timeLeft = this.unlockMessage.endTime - now;
        if (timeLeft < 1000) {
            this.unlockMessage.alpha = timeLeft / 1000;
        }
        
        ctx.save();
        
        // Posicionar en el centro superior de la pantalla
        const x = ctx.canvas.width / 2;
        
        // Dibujar fondo semi-transparente
        const padding = 20;
        const boxWidth = 400;
        const boxHeight = this.unlockMessage.instructions ? 100 : 60;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${this.unlockMessage.alpha * 0.8})`;
        ctx.fillRect(
            x - boxWidth/2,
            this.unlockMessage.y - padding,
            boxWidth,
            boxHeight
        );
        
        // Dibujar borde
        ctx.strokeStyle = `rgba(255, 215, 0, ${this.unlockMessage.alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(
            x - boxWidth/2,
            this.unlockMessage.y - padding,
            boxWidth,
            boxHeight
        );
        
        // Dibujar título
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = `rgba(255, 215, 0, ${this.unlockMessage.alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(this.unlockMessage.text, x, this.unlockMessage.y + 20);
        
        // Dibujar instrucciones
        if (this.unlockMessage.instructions) {
            ctx.font = '16px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${this.unlockMessage.alpha})`;
            ctx.fillText(this.unlockMessage.instructions, x, this.unlockMessage.y + 50);
        }
        
        ctx.restore();
    }

    render(ctx, spriteLoader) {
        let currentAnimation;
        const direction = this.isMovingLeft ? 'left' : 'right';

        if (this.isAttacking) {
            currentAnimation = spriteLoader.getAnimation('attack', direction);
        } else if (!this.isOnGround) {
            currentAnimation = spriteLoader.getAnimation('jump', direction);
        } else if (this.isMoving) {
            currentAnimation = spriteLoader.getAnimation('walk', direction);
        } else {
            currentAnimation = spriteLoader.getAnimation('quiet', direction);
        }

        if (currentAnimation && currentAnimation.length > 0) {
            const currentSprite = currentAnimation[this.currentFrame % currentAnimation.length];
            if (currentSprite) {
                ctx.drawImage(
                    currentSprite,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            }
        }

        // Renderizar mensaje de desbloqueo si existe
        this.renderUnlockMessage(ctx);
    }

    applyPowerUp(powerUp) {
        switch(powerUp.type) {
            case 'health':
                this.health = Math.min(this.maxHealth, this.health + powerUp.healAmount);
                break;
                
            case 'damage':
                this.activeBuffs.damage.active = true;
                this.activeBuffs.damage.endTime = Date.now() + powerUp.duration;
                this.damageMultiplier = powerUp.damageBoost;
                break;
                
            case 'speed':
                this.activeBuffs.speed.active = true;
                this.activeBuffs.speed.endTime = Date.now() + powerUp.duration;
                break;
        }
    }

    getCurrentDamage() {
        return this.baseDamage * this.damageMultiplier;
    }

    takeDamage(amount) {
        // Verificar que gameEngine existe y que no estamos en modo invencible
        if (window.gameEngine && !window.gameEngine.isInvincible) {
            this.health = Math.max(0, this.health - amount);
            if (this.health <= 0) {
                window.gameEngine.isGameOver = true;
            }
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    reset() {
        this.health = this.maxHealth;
        this.x = 50;
        this.y = window.innerHeight - 100;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = true;
        this.isJumping = false;
        this.isAttacking = false;
        this.isAttackAnimationComplete = true;
        this.hasUsedDoubleJump = false;
        this.lastWPressTime = 0;
        this.isWKeyReleased = true;
        this.damageMultiplier = 1.0;
        this.activeBuffs = {
            damage: { active: false, endTime: 0 },
            speed: { active: false, endTime: 0 }
        };
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

window.Player = Player;