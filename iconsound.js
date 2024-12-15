var volumeicon = document.getElementById("volume_icon");
var muteicon = document.getElementById("mute_icon");
var audio = document.getElementById("audio");
var upicon = document.getElementById("upicon");
var downicon = document.getElementById("downicon");

// Al inicio del archivo, verificar si ya cargó antes
const hasLoaded = localStorage.getItem('gameLoaded');

// Función para mostrar el mensaje rápido
function showQuickStartOverlay() {
    // Verificar si ya existe un overlay
    if (document.querySelector('.quick-start-overlay')) return;

    const quickStartOverlay = document.createElement('div');
    quickStartOverlay.classList.add('quick-start-overlay');
    quickStartOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const quickStartText = document.createElement('div');
    quickStartText.textContent = 'Presiona cualquier tecla para continuar';
    quickStartText.style.cssText = `
        color: #fff;
        font-family: 'Press Start 2P', 'Courier New', monospace;
        text-shadow: 0 0 10px #4CAF50;
        animation: glowAnimation 2s ease-in-out infinite;
    `;

    quickStartOverlay.appendChild(quickStartText);
    document.body.appendChild(quickStartOverlay);

    const startGame = () => {
        audio.play();
        quickStartOverlay.style.opacity = '0';
        quickStartOverlay.style.transition = 'opacity 0.5s';
        setTimeout(() => quickStartOverlay.remove(), 500);
    };

    document.addEventListener('keydown', startGame, { once: true });
    document.addEventListener('click', startGame, { once: true });
}

// Modificar la detección de navegación
window.addEventListener('pageshow', function(event) {
    // Detectar si la página viene del cache de navegación
    if (event.persisted || (window.performance && 
        (window.performance.navigation.type === 2 || window.performance.getEntriesByType("navigation")[0]?.type === 'back_forward'))) {
        showQuickStartOverlay();
    } else if (hasLoaded) {
        showQuickStartOverlay();
    } else {
        // Primera visita - mostrar pantalla de carga completa
        const gameStartOverlay = document.createElement('div');
        gameStartOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            background-image: 
                linear-gradient(
                    0deg,
                    #000000 0%,
                    #111111 50%,
                    #222222 100%
                ),
                repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.05) 10px,
                    rgba(255,255,255,0.05) 20px
                ),
                repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 5px,
                    rgba(0,150,0,0.03) 5px,
                    rgba(0,150,0,0.03) 10px
                );
            background-blend-mode: multiply;
            image-rendering: pixelated;
            animation: backgroundScroll 20s linear infinite;
        `;

        const loadingText = document.createElement('div');
        loadingText.style.cssText = `
            color: #fff;
            font-size: 18px;
            margin-bottom: 20px;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            text-shadow: 2px 2px #000;
            letter-spacing: 1px;
            animation: glowAnimation 2s ease-in-out infinite;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 300px;
            height: 20px;
            background: rgba(0,0,0,0.5);
            border-radius: 0px;
            overflow: hidden;
            margin-bottom: 20px;
            border: 4px solid #4CAF50;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5),
                        0 0 15px rgba(76,175,80,0.3);
            image-rendering: pixelated;
        `;

        const progress = document.createElement('div');
        progress.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(
                45deg,
                #4CAF50 25%,
                #5CBA5C 25%,
                #5CBA5C 50%,
                #4CAF50 50%,
                #4CAF50 75%,
                #5CBA5C 75%,
                #5CBA5C 100%
            );
            background-size: 20px 20px;
            transition: width 0.5s;
            animation: progressAnimation 1s linear infinite;
            image-rendering: pixelated;
        `;

        const startButton = document.createElement('button');
        startButton.innerHTML = 'CARGAR';
        startButton.style.cssText = `
            padding: 15px 40px;
            font-size: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 0px;
            cursor: pointer;
            font-family: 'Press Start 2P', 'Courier New', monospace;
            text-transform: uppercase;
            border: 4px solid #4CAF50;
            transition: all 0.3s;
            box-shadow: 0 4px 0 #2E7D32,
                        0 0 15px rgba(76,175,80,0.3);
            image-rendering: pixelated;
            position: relative;
            top: 0;
            text-shadow: 2px 2px #000;
        `;

        // Añadir animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progressAnimation {
                0% {
                    background-position: 0 0;
                }
                100% {
                    background-position: 20px 0;
                }
            }

            @keyframes backgroundScroll {
                0% {
                    background-position: 0 0, 0 0, 0 0;
                }
                100% {
                    background-position: 0 100%, 100px 100px, -100px -100px;
                }
            }

            @keyframes glowAnimation {
                0% { text-shadow: 0 0 5px #4CAF50, 0 0 10px #4CAF50; }
                50% { text-shadow: 0 0 10px #4CAF50, 0 0 20px #4CAF50; }
                100% { text-shadow: 0 0 5px #4CAF50, 0 0 10px #4CAF50; }
            }
        `;
        document.head.appendChild(style);

        startButton.onmouseover = () => {
            startButton.style.background = '#2E7D32';
            startButton.style.borderColor = '#2E7D32';
            startButton.style.top = '2px';
            startButton.style.boxShadow = '0 2px 0 #1B5E20';
        };

        startButton.onmouseout = () => {
            startButton.style.background = '#4CAF50';
            startButton.style.borderColor = '#4CAF50';
            startButton.style.top = '0';
            startButton.style.boxShadow = '0 4px 0 #2E7D32';
        };

        progressBar.appendChild(progress);
        gameStartOverlay.appendChild(loadingText);
        gameStartOverlay.appendChild(progressBar);
        gameStartOverlay.appendChild(startButton);
        document.body.appendChild(gameStartOverlay);

        // Mensajes aleatorios de carga
        const loadingMessages = [
            "Cargando texturas del mundo...",
            "Inicializando físicas del juego...",
            "Configurando controles...",
            "Cargando efectos de sonido...",
            "Optimizando rendimiento...",
            "Preparando animaciones...",
            "Configurando colisiones...",
            "Cargando recursos gráficos...",
            "Inicializando sistema de partículas...",
            "Preparando interfaz de usuario..."
        ];

        startButton.addEventListener('click', () => {
            // Guardar en localStorage que ya cargó
            localStorage.setItem('gameLoaded', 'true');
            
            startButton.style.display = 'none';
            let progressValue = 0;
            let messageIndex = 0;

            audio.volume = 0;
            audio.play();
            
            const loadingInterval = setInterval(() => {
                progressValue += Math.random() * 15;
                if (progressValue > 100) progressValue = 100;
                
                progress.style.width = `${progressValue}%`;
                loadingText.textContent = loadingMessages[messageIndex];
                
                // Aumentar gradualmente el volumen hasta 0.8 (80%)
                if (audio.volume < 0.8) {
                    audio.volume = Math.min(0.8, audio.volume + 0.05);
                }
                
                messageIndex = (messageIndex + 1) % loadingMessages.length;

                if (progressValue === 100) {
                    clearInterval(loadingInterval);
                    setTimeout(() => {
                        gameStartOverlay.style.opacity = '0';
                        gameStartOverlay.style.transition = 'opacity 1s';
                        setTimeout(() => gameStartOverlay.remove(), 1000);
                    }, 500);
                }
            }, 500);
        });
    }
});

// Funciones para el control de audio
function saveAudioState() {
    sessionStorage.setItem('audioPlaying', !audio.paused);
    sessionStorage.setItem('audioVolume', audio.volume);
    sessionStorage.setItem('audioTime', audio.currentTime);
    sessionStorage.setItem('audioMuted', audio.muted);
}

function restoreAudioState() {
    const wasPlaying = sessionStorage.getItem('audioPlaying') === 'true';
    const savedVolume = parseFloat(sessionStorage.getItem('audioVolume'));
    const savedTime = parseFloat(sessionStorage.getItem('audioTime'));
    const wasMuted = sessionStorage.getItem('audioMuted') === 'true';

    if (!isNaN(savedVolume)) {
        audio.volume = savedVolume;
    }
    
    if (!isNaN(savedTime)) {
        audio.currentTime = savedTime;
    }

    audio.muted = wasMuted;
    if (wasMuted) {
        volumeicon.style.display = "none";
        muteicon.style.display = "block";
    }
}

// Event listeners
volumeicon.addEventListener("click", cambio);
muteicon.addEventListener("click", cambio2);
upicon.addEventListener("click", up);
downicon.addEventListener("click", down);

function cambio(){
    volumeicon.style.display = "none";
    muteicon.style.display = "block";
    audio.muted = true;
    saveAudioState();
}

function cambio2(){
    volumeicon.style.display = "block";
    muteicon.style.display = "none";
    audio.muted = false;
    saveAudioState();
}

function up(){
    const newVolume = audio.volume + 0.1;
    audio.volume = Math.min(1, newVolume);
    saveAudioState();
}

function down(){
    const newVolume = audio.volume - 0.1;
    audio.volume = Math.max(0, newVolume);
    saveAudioState();
}

// Event listeners para guardar/restaurar estado
window.addEventListener('beforeunload', saveAudioState);
document.addEventListener('DOMContentLoaded', restoreAudioState);

const audioPrompt = document.createElement('div');
audioPrompt.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    background: rgba(0,0,0,0.5);
    color: white;
    border-radius: 5px;
`;
document.body.appendChild(audioPrompt);

document.addEventListener('keydown', () => {
    audio.play();
    audioPrompt.remove();
}, { once: true });

document.addEventListener('click', () => {
    audio.volume = 0;
    audio.play();
    let vol = 0;
    const fadeIn = setInterval(() => {
        if (vol < 1) {
            vol += 0.1;
            audio.volume = vol;
        } else {
            clearInterval(fadeIn);
        }
    }, 100);
}, { once: true });

// Función para reiniciar el estado (útil para testing)
function resetGameState() {
    localStorage.removeItem('gameLoaded');
    location.reload();
}