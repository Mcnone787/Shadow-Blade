// Inicialización del juego
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Crear instancia del motor del juego y hacerla globalmente accesible
    window.gameEngine = new GameEngine(canvas);

    // Iniciar el juego
    window.gameEngine.init().catch(error => {
        console.error('Error iniciando el juego:', error);
    });

    // Event listeners globales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'p') {
            window.gameEngine.toggleInvincible();
        }
        if (e.key === 'i') {
            window.gameEngine.toggleNoEnemies();
        }
        if (e.key === 'h') {
            window.gameEngine.toggleHitboxes();
        }
        if (e.key === 'Escape') {
            window.gameEngine.togglePause();
        }
        if (e.key.toLowerCase() === 'r' && window.gameEngine.isGameOver) {
            window.gameEngine.reset();
        }
    });

    // Ajustar tamaño del canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.gameEngine.handleResize();
    });
});