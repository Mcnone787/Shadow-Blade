class SpriteLoader {
    constructor() {
        this.loadedImages = {
            quiet: {
                left: [],
                right: []
            },
            walk: {
                left: [],
                right: []
            },
            jump: {
                left: [],
                right: []
            },
            attack: {
                left: [],
                right: []
            }
        };
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async loadAllSprites() {
        const spritePaths = {
            quiet: {
                right: [
                    'spirtessepardes/spritequieto/quieto1.png',
                    'spirtessepardes/spritequieto/quieto2.png',
                    'spirtessepardes/spritequieto/quieto3.png',
                    'spirtessepardes/spritequieto/quieto4.png'
                ],
                left: [
                    'spirtessepardes/spritequieto/quietoizquierdaa1.png',
                    'spirtessepardes/spritequieto/quietoizquierdaa2.png',
                    'spirtessepardes/spritequieto/quietoizquierdaa3.png',
                    'spirtessepardes/spritequieto/quietoizquierdaa4.png'
                ]
            },
            walk: {
                right: [
                    'spirtessepardes/spriteCaminar/caminar1.png',
                    'spirtessepardes/spriteCaminar/caminar2.png',
                    'spirtessepardes/spriteCaminar/caminar3.png',
                    'spirtessepardes/spriteCaminar/caminar4.png',
                    'spirtessepardes/spriteCaminar/caminar5.png',
                    'spirtessepardes/spriteCaminar/caminar6.png'
                ],
                left: [
                    'spirtessepardes/spriteCaminar/caminarIzquierda1.png',
                    'spirtessepardes/spriteCaminar/caminarIzquierda2.png',
                    'spirtessepardes/spriteCaminar/caminarIzquierda3.png',
                    'spirtessepardes/spriteCaminar/caminarIzquierda4.png',
                    'spirtessepardes/spriteCaminar/caminarIzquierda5.png',
                    'spirtessepardes/spriteCaminar/caminarIzquierda6.png'
                ]
            },
            jump: {
                right: [
                    'spirtessepardes/spritesalto/saltoderecha1.png',
                    'spirtessepardes/spritesalto/saltoderecha2.png',
                    'spirtessepardes/spritesalto/saltoderecha3.png',
                    'spirtessepardes/spritesalto/saltoderecha4.png',
                    'spirtessepardes/spritesalto/saltoderecha5.png',
                    'spirtessepardes/spritesalto/saltoderecha6.png',
                    'spirtessepardes/spritesalto/saltoderecha7.png',
                    'spirtessepardes/spritesalto/saltoderecha8.png'
                ],
                left: [
                    'spirtessepardes/spritesalto/saltoizquierda1.png',
                    'spirtessepardes/spritesalto/saltoizquierda2.png',
                    'spirtessepardes/spritesalto/saltoizquierda3.png',
                    'spirtessepardes/spritesalto/saltoizquierda4.png',
                    'spirtessepardes/spritesalto/saltoizquierda5.png',
                    'spirtessepardes/spritesalto/saltoizquierda6.png',
                    'spirtessepardes/spritesalto/saltoizquierda7.png',
                    'spirtessepardes/spritesalto/saltoizquierda8.png'
                ]
            },
            attack: {
                right: [
                    'spirtessepardes/spriteAtacar/atacarderecha1.png',
                    'spirtessepardes/spriteAtacar/atacarderecha2.png',
                    'spirtessepardes/spriteAtacar/atacarderecha3.png',
                    'spirtessepardes/spriteAtacar/atacarderecha4.png',
                    'spirtessepardes/spriteAtacar/atacarderecha5.png',
                    'spirtessepardes/spriteAtacar/atacarderecha6.png'
                ],
                left: [
                    'spirtessepardes/spriteAtacar/atacarizquierda1.png',
                    'spirtessepardes/spriteAtacar/atacarizquierda2.png',
                    'spirtessepardes/spriteAtacar/atacarizquierda3.png',
                    'spirtessepardes/spriteAtacar/atacarizquierda4.png',
                    'spirtessepardes/spriteAtacar/atacarizquierda5.png',
                    'spirtessepardes/spriteAtacar/atacarizquierda6.png'
                ]
            }
        };

        try {
            for (const [animationType, directions] of Object.entries(spritePaths)) {
                for (const [direction, paths] of Object.entries(directions)) {
                    for (const path of paths) {
                        const img = await this.loadImage(path);
                        this.loadedImages[animationType][direction].push(img);
                    }
                }
            }
        } catch (error) {
            console.error('Error cargando sprites:', error);
            throw error;
        }
    }

    getAnimation(type, direction) {
        return this.loadedImages[type][direction];
    }
}

window.SpriteLoader = SpriteLoader;
