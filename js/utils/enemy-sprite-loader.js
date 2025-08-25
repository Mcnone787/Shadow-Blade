class EnemySpriteLoader {
    constructor() {
        this.sprites = {
            '2': {
                idle: [],
                walk: [],
                attack: [],
                hurt: [],
                death: [],
                run: [],
                jump: []
            },
            '3': {
                idle: [],
                walk: [],
                attack: [],
                hurt: [],
                death: [],
                run: [],
                jump: []
            }
        };

        // Configuración de los frames (escalados x2)
        this.frameDimensions = {
            idle: { width: 84, height: 126 },    // 28x42 * 3
            walk: { width: 126, height: 126 },   // 42x42 * 3
            run: { width: 126, height: 126 },    // 42x42 * 3
            attack: { width: 168, height: 126 }, // 56x42 * 3
            hurt: { width: 168, height: 126 },   // 56x42 * 3
            death: { width: 168, height: 126 },  // 56x42 * 3
            jump: { width: 168, height: 126 }    // 56x42 * 3
        };
        this.frameCount = {
            idle: 4,    // Reducido de 6 a 4 frames
            walk: 6,
            attack: 6,
            hurt: 3,
            death: 6,
            run: 6,
            jump: 6
        };
    }

    async loadSprites() {
        try {
            console.log('Iniciando carga de sprites enemigos...');
            
            // Cargar frames para el enemigo tipo 2
            for (const action of Object.keys(this.sprites['2'])) {
                this.sprites['2'][action] = await this.loadFrames('2', action);
            }

            // Cargar frames para el enemigo tipo 3
            for (const action of Object.keys(this.sprites['3'])) {
                this.sprites['3'][action] = await this.loadFrames('3', action);
            }

            return true;
        } catch (error) {
            console.error('Error crítico cargando sprites:', error);
            return false;
        }
    }

    async loadFrames(type, action) {
        const frames = [];
        const frameCount = this.frameCount[action];
        
        // Intentar cargar todos los frames
        const loadPromises = [];
        for (let i = 1; i <= frameCount; i++) {
            const path = `sprites/enemy${type}/${action}/frame${i}.png`;
            const loadPromise = this.loadImage(path)
                .then(frame => ({ index: i - 1, frame }))
                .catch(() => ({ index: i - 1, frame: null }));
            loadPromises.push(loadPromise);
        }
        
        // Esperar a que todos los frames se carguen o fallen
        const results = await Promise.all(loadPromises);
        
        // Ordenar los frames por índice y filtrar los nulos
        frames.length = frameCount;
        results.forEach(({ index, frame }) => {
            if (frame) frames[index] = frame;
        });
        
        // Verificar que todos los frames se cargaron correctamente
        const loadedFrames = frames.filter(f => f && f.complete && f.naturalWidth > 0);
        
        if (loadedFrames.length === 0) {
            console.error(`Error: No se cargó ningún frame para ${type}/${action}`);
            return [];
        }
        
        // Si faltan algunos frames pero tenemos otros, duplicar el último frame válido
        if (loadedFrames.length < frameCount) {
            const lastValidFrame = loadedFrames[loadedFrames.length - 1];
            for (let i = 0; i < frames.length; i++) {
                if (!frames[i] || !frames[i].complete || frames[i].naturalWidth === 0) {
                    frames[i] = lastValidFrame;
                }
            }
        }
        
        return frames;
    }

    async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Error cargando: ${src}`));
            img.src = src;
        });
    }

    getSprite(type, action, frameIndex) {
        // Verificar que tenemos el tipo de enemigo
        if (!this.sprites[type]) {
            console.warn(`Tipo de enemigo no encontrado: ${type}`);
            return null;
        }

        // Verificar que tenemos la acción
        if (!this.sprites[type][action]) {
            console.warn(`Acción no encontrada: ${action} para tipo ${type}`);
            return null;
        }

        const frames = this.sprites[type][action];
        
        // Verificar que tenemos frames
        if (!frames || frames.length === 0) {
            console.warn(`No hay frames para type: ${type}, action: ${action}`);
            return null;
        }

        // Asegurarnos de que el frameIndex es válido
        const safeIndex = Math.abs(Math.floor(frameIndex)) % frames.length;
        const frame = frames[safeIndex];

        // Verificar que el frame es válido
        if (!frame || !frame.complete || frame.naturalWidth === 0) {
            console.warn(`Frame inválido para type: ${type}, action: ${action}, index: ${safeIndex}`);
            return null;
        }

        return frame;
    }

    getRandomEnemyType() {
        return Math.random() < 0.5 ? '2' : '3';
    }

    getSpriteDimensions(type, action = 'idle') {
        return this.frameDimensions[action] || this.frameDimensions.idle;
    }

    // Método para obtener el número de frames en una animación
    getFrameCount(type, action) {
        const frames = this.sprites[type]?.[action];
        if (!frames) {
            console.warn(`No se puede obtener frameCount para type: ${type}, action: ${action}`);
            return 0;
        }
        return frames.length;
    }
}

window.EnemySpriteLoader = EnemySpriteLoader;