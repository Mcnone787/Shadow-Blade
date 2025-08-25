class Physics {
    constructor() {
        // Valores originales del juego
        this.gravity = 0.8;
        this.maxFallSpeed = 20;
        
        // Constantes de física originales
        this.GRAVITY_UP = 1.2;
        this.GRAVITY_DOWN = 1.2;
        this.INITIAL_JUMP_VELOCITY = -25;
        this.HORIZONTAL_BOOST = 1.8;
    }

    applyGravity(entity) {
        if (!entity.isOnGround) {
            // Aplicar gravedad con los valores originales
            if (entity.velocityY < 0) {
                // Subida
                entity.velocityY += this.GRAVITY_UP * 0.8;
            } else {
                // Caída
                if (entity.velocityY < 10) {
                    entity.velocityY += this.GRAVITY_DOWN * 0.9;
                } else {
                    entity.velocityY += this.GRAVITY_DOWN * 1.2;
                }
            }

            // Limitar velocidad de caída al valor original
            if (entity.velocityY > this.maxFallSpeed) {
                entity.velocityY = this.maxFallSpeed;
            }
        }
    }

    keepInBounds(entity) {
        // Límites horizontales
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX = 0;
        } else if (entity.x + entity.width > window.innerWidth) {
            entity.x = window.innerWidth - entity.width;
            entity.velocityX = 0;
        }

        // Límites verticales
        if (entity.y < 0) {
            entity.y = 0;
            entity.velocityY = 0;
        } else if (entity.y + entity.height > window.innerHeight) {
            entity.y = window.innerHeight - entity.height;
            entity.velocityY = 0;
            entity.isOnGround = true;
            entity.isJumping = false;
        }
    }

    checkCollision(entity1, entity2) {
        return entity1.x < entity2.x + entity2.width &&
               entity1.x + entity1.width > entity2.x &&
               entity1.y < entity2.y + entity2.height &&
               entity1.y + entity1.height > entity2.y;
    }

    resolveCollision(entity1, entity2) {
        // Verificar si alguna de las entidades es null o undefined
        if (!entity1 || !entity2) return;

        const overlapX = Math.min(
            entity1.x + entity1.width - entity2.x,
            entity2.x + entity2.width - entity1.x
        );
        const overlapY = Math.min(
            entity1.y + entity1.height - entity2.y,
            entity2.y + entity2.height - entity1.y
        );

        if (overlapX < overlapY) {
            // Colisión horizontal
            if (entity1.x < entity2.x) {
                entity1.x -= overlapX;
            } else {
                entity1.x += overlapX;
            }
            entity1.velocityX = 0;
        } else {
            // Colisión vertical
            if (entity1.y < entity2.y) {
                entity1.y -= overlapY;
                entity1.velocityY = 0;
                entity1.isOnGround = true;
                entity1.isJumping = false;
            } else {
                entity1.y += overlapY;
                entity1.velocityY = 0;
            }
        }
    }
}

window.Physics = Physics;