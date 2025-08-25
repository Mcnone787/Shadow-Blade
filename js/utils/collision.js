class CollisionSystem {
    constructor() {
        this.COLLISION_MARGIN = 2;
    }

    checkCollision(entity1, entity2) {
        return entity1.x < entity2.x + entity2.width &&
               entity1.x + entity1.width > entity2.x &&
               entity1.y < entity2.y + entity2.height &&
               entity1.y + entity1.height > entity2.y;
    }

    checkPlatformCollisions(player, platforms) {
        let isOnAnyPlatform = false;
        let currentPlatformY = window.innerHeight;

        platforms.forEach(platform => {
            const wasAbove = player.y + player.height <= platform.y + this.COLLISION_MARGIN;
            const willCollide = player.y + player.height + player.velocityY >= platform.y;
            
            if (player.x + player.width > platform.x && 
                player.x < platform.x + platform.width &&
                ((wasAbove && willCollide) || 
                 (player.y + player.height >= platform.y - this.COLLISION_MARGIN && 
                  player.y + player.height <= platform.y + this.COLLISION_MARGIN))) {
                
                isOnAnyPlatform = true;
                if (platform.y < currentPlatformY) {
                    currentPlatformY = platform.y;
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                }
            }
        });

        player.isOnGround = isOnAnyPlatform;
        
        // Colisión con el suelo
        if (!isOnAnyPlatform && player.y + player.height > window.innerHeight) {
            player.y = window.innerHeight - player.height;
            player.isOnGround = true;
            player.velocityY = 0;
            player.isJumping = false;
        }
    }

    checkEnemyCollisions(enemies) {
        for (let i = 0; i < enemies.length; i++) {
            for (let j = i + 1; j < enemies.length; j++) {
                const enemy1 = enemies[i];
                const enemy2 = enemies[j];
                
                if (this.checkCollision(enemy1, enemy2)) {
                    this.resolveEnemyCollision(enemy1, enemy2);
                }
            }
        }
    }

    resolveEnemyCollision(enemy1, enemy2) {
        // Separar horizontalmente
        if (enemy1.x < enemy2.x) {
            enemy1.x = enemy2.x - enemy1.width - 1;
        } else {
            enemy1.x = enemy2.x + enemy2.width + 1;
        }
    }

    checkAttackCollisions(player, enemies, attackRange = 20) {
        if (!player.isAttacking) return;

        const attackX = player.isMovingLeft ? 
            player.x - attackRange : 
            player.x + player.width;

        enemies.forEach(enemy => {
            const enemyInRange = player.isMovingLeft ?
                (enemy.x + enemy.width > attackX && 
                 enemy.x < attackX + attackRange &&
                 enemy.y < player.y + player.height &&
                 enemy.y + enemy.height > player.y) :
                (enemy.x < attackX + attackRange &&
                 enemy.x + enemy.width > attackX &&
                 enemy.y < player.y + player.height &&
                 enemy.y + enemy.height > player.y);

            if (enemyInRange) {
                enemy.takeDamage(20);
            }
        });
    }

    drawCollisionBoxes(ctx, entities) {
        // No dibujar nada
        return;
    }
}

window.CollisionSystem = CollisionSystem;
