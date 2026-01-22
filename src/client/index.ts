// This file serves as the entry point for the client-side application. It initializes the game engine and starts the game.

import { GameEngine } from './game/engine';

// Handle start screen and game initialization
function initializeGame() {
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');

    if (!startButton || !startScreen || !gameContainer) {
        // If elements not found, start game immediately
        const game = new GameEngine();
        game.start();
        return;
    }

    // Start button click handler
    startButton.addEventListener('click', () => {
        // Hide start screen
        startScreen.classList.add('hidden');
        
        // Show game container
        gameContainer.classList.remove('hidden');
        
        // Initialize and start the game
        const game = new GameEngine();
        game.start();
    });
}

// Initialize when DOM is ready
initializeGame();
