// This file serves as the entry point for the client-side application. It initializes the game engine and starts the game.

import { GameEngine } from './game/engine';

const game = new GameEngine();
game.start();