/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/game/cards.ts"
/*!**********************************!*\
  !*** ./src/client/game/cards.ts ***!
  \**********************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createInitialDeck = exports.createRowFlipCard = exports.createAdjacentFlipCard = exports.createSingleFlipCard = void 0;
/**
 * Helper function to flip a token's color
 */
function flipToken(color) {
    return color === 'R' ? 'B' : 'R';
}
/**
 * Single Flip Card - Flips a specific token at the target index
 */
function createSingleFlipCard(cardId) {
    return {
        id: cardId,
        name: 'Single Flip',
        description: 'Flip one token',
        requiresTarget: true,
        execute: (tokens, targetIndex) => {
            if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
                return tokens;
            }
            const newTokens = [...tokens];
            newTokens[targetIndex] = flipToken(newTokens[targetIndex]);
            return newTokens;
        }
    };
}
exports.createSingleFlipCard = createSingleFlipCard;
/**
 * Adjacent Flip Card - Flips a token and its immediate neighbors
 */
function createAdjacentFlipCard(cardId) {
    return {
        id: cardId,
        name: 'Adjacent Flip',
        description: 'Flip a token and its neighbors',
        requiresTarget: true,
        execute: (tokens, targetIndex) => {
            if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
                return tokens;
            }
            const newTokens = [...tokens];
            // Flip left neighbor if exists
            if (targetIndex > 0) {
                newTokens[targetIndex - 1] = flipToken(newTokens[targetIndex - 1]);
            }
            // Flip target token
            newTokens[targetIndex] = flipToken(newTokens[targetIndex]);
            // Flip right neighbor if exists
            if (targetIndex < tokens.length - 1) {
                newTokens[targetIndex + 1] = flipToken(newTokens[targetIndex + 1]);
            }
            return newTokens;
        }
    };
}
exports.createAdjacentFlipCard = createAdjacentFlipCard;
/**
 * Row Flip Card - Flips all tokens in the row
 */
function createRowFlipCard(cardId) {
    return {
        id: cardId,
        name: 'Row Flip',
        description: 'Flip all tokens',
        requiresTarget: false,
        execute: (tokens) => {
            return tokens.map(flipToken);
        }
    };
}
exports.createRowFlipCard = createRowFlipCard;
/**
 * Create initial deck of cards
 */
function createInitialDeck() {
    return [
        createSingleFlipCard('single-1'),
        createSingleFlipCard('single-2'),
        createSingleFlipCard('single-3'),
        createSingleFlipCard('single-4'),
        createAdjacentFlipCard('adjacent-1'),
        createAdjacentFlipCard('adjacent-2'),
        createAdjacentFlipCard('adjacent-3'),
        createRowFlipCard('row-1'),
        createRowFlipCard('row-2'),
        createRowFlipCard('row-3')
    ];
}
exports.createInitialDeck = createInitialDeck;


/***/ },

/***/ "./src/client/game/engine.ts"
/*!***********************************!*\
  !*** ./src/client/game/engine.ts ***!
  \***********************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameEngine = void 0;
const gameLogic_1 = __webpack_require__(/*! ./gameLogic */ "./src/client/game/gameLogic.ts");
const cards_1 = __webpack_require__(/*! ./cards */ "./src/client/game/cards.ts");
const renderer_1 = __webpack_require__(/*! ./renderer */ "./src/client/game/renderer.ts");
class GameEngine {
    constructor() {
        this.selectedCard = null;
        this.gameState = gameLogic_1.GameLogic.createInitialState((0, cards_1.createInitialDeck)());
        this.renderer = new renderer_1.GameRenderer();
        this.initialize();
    }
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
    }
    start() {
        // Initial render
        this.render();
    }
    setupEventListeners() {
        // Delegate click handling to the renderer
        this.renderer.onCardClick = (cardId) => {
            this.handleCardClick(cardId);
        };
        this.renderer.onTokenClick = (tokenIndex) => {
            this.handleTokenClick(tokenIndex);
        };
        this.renderer.onRestartClick = () => {
            this.restart();
        };
    }
    handleCardClick(cardId) {
        if (this.gameState.isGameOver)
            return;
        const card = this.gameState.hand.find(c => c.id === cardId);
        if (!card)
            return;
        if (card.requiresTarget) {
            // Select this card and wait for token selection
            this.selectedCard = card;
            this.renderer.setSelectedCard(card);
            this.render();
        }
        else {
            // Execute card immediately (doesn't require target)
            this.playCard(card);
        }
    }
    handleTokenClick(tokenIndex) {
        if (this.gameState.isGameOver)
            return;
        if (this.selectedCard) {
            // Play the selected card with this token as target
            this.playCard(this.selectedCard, tokenIndex);
            this.selectedCard = null;
            this.renderer.setSelectedCard(null);
        }
    }
    playCard(card, targetIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameState = gameLogic_1.GameLogic.playCard(this.gameState, card, targetIndex);
            this.render();
            // Only animate score and show overlay when trial is over
            if (this.gameState.isTrialOver) {
                // Animate the score calculation after rendering and wait for it to complete
                yield this.renderer.animateScore(this.gameState);
                // Show appropriate overlay
                if (this.gameState.isGameOver) {
                    this.renderer.showGameOverOverlay(this.gameState);
                }
                else {
                    // Check if wave is complete (finished all trials in wave)
                    const isWaveComplete = this.gameState.currentTrial >= this.gameState.maxTrials;
                    if (isWaveComplete) {
                        this.renderer.showWaveCompleteOverlay(this.gameState, () => this.startNextTrial());
                    }
                    else {
                        this.renderer.showNextTrialButton(() => this.startNextTrial());
                    }
                }
            }
        });
    }
    restart() {
        this.gameState = gameLogic_1.GameLogic.resetGame((0, cards_1.createInitialDeck)());
        this.selectedCard = null;
        this.renderer.setSelectedCard(null);
        this.renderer.hideNextTrialButton();
        this.renderer.hideWaveCompleteOverlay();
        this.renderer.hideGameOverOverlay();
        this.render();
    }
    startNextTrial() {
        this.gameState = gameLogic_1.GameLogic.startNextTrial(this.gameState, (0, cards_1.createInitialDeck)());
        this.selectedCard = null;
        this.renderer.setSelectedCard(null);
        this.renderer.hideNextTrialButton();
        this.render();
    }
    render() {
        this.renderer.render(this.gameState);
    }
}
exports.GameEngine = GameEngine;
exports["default"] = GameEngine;


/***/ },

/***/ "./src/client/game/gameLogic.ts"
/*!**************************************!*\
  !*** ./src/client/game/gameLogic.ts ***!
  \**************************************/
(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameLogic = void 0;
/**
 * Game Logic - handles game state management and rule enforcement
 */
class GameLogic {
    /**
     * Generate a random color pattern
     */
    static generateRandomPattern() {
        return Array.from({ length: 5 }, () => Math.random() > 0.5 ? 'B' : 'R');
    }
    /**
     * Check if two patterns are the same
     */
    static arePatternsEqual(pattern1, pattern2) {
        return pattern1.every((color, index) => color === pattern2[index]);
    }
    /**
     * Generate starting and target patterns that are different
     */
    static generatePatterns() {
        const target = this.generateRandomPattern();
        let starting = this.generateRandomPattern();
        // Keep generating until we get different patterns
        while (this.arePatternsEqual(starting, target)) {
            starting = this.generateRandomPattern();
        }
        return { starting, target };
    }
    /**
     * Calculate score based on consecutive matching tokens from left to right
     */
    static calculateScore(tokens, targetColors, movesPlayed, minMoves) {
        let score = 0;
        const breakdown = [];
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === targetColors[i]) {
                const points = this.BASE_POINTS * this.MULTIPLIERS[i];
                score += points;
                breakdown.push({
                    slot: i + 1,
                    multiplier: this.MULTIPLIERS[i],
                    points
                });
            }
            else {
                // Stop when we encounter a token that doesn't match
                break;
            }
        }
        // Award bonus if all 5 tokens match AND moves played equals minimum moves
        const bonusEarned = breakdown.length === 5 && movesPlayed === minMoves;
        if (bonusEarned) {
            score += 5; // Bonus: 5 points × 1x multiplier
        }
        return { score, breakdown, bonusEarned };
    }
    /**
     * Calculate minimum number of moves to solve puzzle using BFS
     * This is an NP-complete problem, but with small state space we can brute force it
     */
    static calculateMinimumMoves(startTokens, targetTokens, availableCards) {
        // If already solved
        if (this.arePatternsEqual(startTokens, targetTokens)) {
            return 0;
        }
        // BFS to find shortest path
        const queue = [{ tokens: startTokens, moves: 0 }];
        const visited = new Set();
        visited.add(startTokens.join(''));
        const maxMoves = 10; // Reasonable upper bound
        while (queue.length > 0) {
            const current = queue.shift();
            // Don't explore beyond reasonable depth
            if (current.moves >= maxMoves) {
                continue;
            }
            // Try each available card
            for (const card of availableCards) {
                if (card.requiresTarget) {
                    // Try card on each position
                    for (let i = 0; i < current.tokens.length; i++) {
                        const newTokens = card.execute([...current.tokens], i);
                        const stateKey = newTokens.join('');
                        if (this.arePatternsEqual(newTokens, targetTokens)) {
                            return current.moves + 1;
                        }
                        if (!visited.has(stateKey)) {
                            visited.add(stateKey);
                            queue.push({ tokens: newTokens, moves: current.moves + 1 });
                        }
                    }
                }
                else {
                    // Card doesn't require target
                    const newTokens = card.execute([...current.tokens]);
                    const stateKey = newTokens.join('');
                    if (this.arePatternsEqual(newTokens, targetTokens)) {
                        return current.moves + 1;
                    }
                    if (!visited.has(stateKey)) {
                        visited.add(stateKey);
                        queue.push({ tokens: newTokens, moves: current.moves + 1 });
                    }
                }
            }
        }
        // If no solution found within max moves, return max
        return maxMoves;
    }
    /**
     * Play a card and return the new game state
     */
    static playCard(currentState, card, targetIndex) {
        // Don't allow play if game is over
        if (currentState.isGameOver) {
            return currentState;
        }
        // Validate target index for cards that require it
        if (card.requiresTarget && (targetIndex === undefined || targetIndex < 0 || targetIndex >= currentState.tokens.length)) {
            return Object.assign(Object.assign({}, currentState), { message: 'Invalid target selection' });
        }
        // Capture before state for history
        const beforeTokens = [...currentState.tokens];
        // Execute card effect
        const newTokens = card.execute(currentState.tokens, targetIndex);
        // Create history entry
        const historyEntry = {
            cardName: card.name,
            beforeTokens,
            afterTokens: [...newTokens],
            targetIndex
        };
        // Add to history
        const newHistory = [...currentState.playHistory, historyEntry];
        // Remove card from hand
        const newHand = currentState.hand.filter(c => c.id !== card.id);
        // Calculate score and check if target is matched
        const movesPlayed = newHistory.length;
        const { score, breakdown, bonusEarned } = this.calculateScore(newTokens, currentState.targetColors, movesPlayed, currentState.minMovesTarget);
        const isTargetMatched = this.arePatternsEqual(newTokens, currentState.targetColors);
        const isTrialOver = newHand.length === 0 || isTargetMatched;
        // Calculate new wave and total scores
        const newWaveScore = isTrialOver ? currentState.waveScore + score : currentState.waveScore;
        const newTotalScore = isTrialOver ? currentState.totalScore + score : currentState.totalScore;
        // Update trial scores array when trial ends
        const newTrialScores = isTrialOver ? [...currentState.trialScores, score] : currentState.trialScores;
        // Check if wave is complete
        const isWaveComplete = isTrialOver && currentState.currentTrial >= currentState.maxTrials;
        // Update wave scores when wave ends
        const newWaveScores = isWaveComplete ? [...currentState.waveScores, newWaveScore] : currentState.waveScores;
        // Check if game is completely over (all waves completed)
        const isGameOver = isWaveComplete && currentState.currentWave >= currentState.maxWaves;
        let message = '';
        if (isTargetMatched) {
            message = `Perfect! Target matched!`;
        }
        else if (isTrialOver) {
            message = `Trial ${currentState.currentTrial} complete!`;
        }
        else {
            message = `Played ${card.name}`;
        }
        if (isGameOver) {
            if (newTotalScore >= currentState.targetScore) {
                message = `🎉 VICTORY! Final Score: ${newTotalScore}/${currentState.targetScore} - Target Achieved! 🎉`;
            }
            else {
                message = `Game Over - Final Score: ${newTotalScore}/${currentState.targetScore} - Target Not Met`;
            }
        }
        return {
            tokens: newTokens,
            targetColors: currentState.targetColors,
            hand: newHand,
            deck: currentState.deck,
            isGameOver,
            score,
            scoreBreakdown: breakdown,
            message,
            currentTrial: currentState.currentTrial,
            currentWave: currentState.currentWave,
            totalScore: newTotalScore,
            waveScore: newWaveScore,
            maxTrials: currentState.maxTrials,
            maxWaves: currentState.maxWaves,
            targetScore: currentState.targetScore,
            waveTargetScore: currentState.waveTargetScore,
            isTrialOver,
            isTargetMatched,
            playHistory: newHistory,
            trialScores: newTrialScores,
            waveScores: newWaveScores,
            bonusEarned: isTrialOver ? bonusEarned : false,
            minMovesTarget: currentState.minMovesTarget
        };
    }
    /**
     * Deal random cards from deck
     */
    static dealCards(deck, count) {
        // Shuffle deck
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        const hand = shuffled.slice(0, count);
        const remainingDeck = shuffled.slice(count);
        return { hand, remainingDeck };
    }
    /**
     * Create a new game state with initial configuration
     */
    static createInitialState(fullDeck) {
        const { starting, target } = this.generatePatterns();
        const { hand, remainingDeck } = this.dealCards(fullDeck, 5);
        // Calculate minimum moves needed with the cards in hand
        const minMoves = this.calculateMinimumMoves(starting, target, hand);
        return {
            tokens: starting,
            targetColors: target,
            hand,
            deck: fullDeck,
            isGameOver: false,
            score: 0,
            scoreBreakdown: [],
            message: 'Wave 1, Trial 1 of 3 - Reach 90 points this wave!',
            currentTrial: 1,
            currentWave: 1,
            totalScore: 0,
            waveScore: 0,
            maxTrials: 3,
            maxWaves: 2,
            targetScore: 180,
            waveTargetScore: 90,
            isTrialOver: false,
            isTargetMatched: false,
            playHistory: [],
            trialScores: [],
            waveScores: [],
            bonusEarned: false,
            minMovesTarget: minMoves
        };
    }
    /**
     * Get multipliers array for display
     */
    static getMultipliers() {
        return [...this.MULTIPLIERS];
    }
    /**
     * Reset the game with a new hand dealt from the deck
     */
    static resetGame(fullDeck) {
        return this.createInitialState(fullDeck);
    }
    /**
     * Start the next trial with new patterns and cards
     */
    static startNextTrial(currentState, fullDeck) {
        const { starting, target } = this.generatePatterns();
        const { hand, remainingDeck } = this.dealCards(fullDeck, 5);
        // Determine next trial and wave
        let nextTrial = currentState.currentTrial + 1;
        let nextWave = currentState.currentWave;
        let newWaveScore = currentState.waveScore;
        let newTrialScores = currentState.trialScores;
        // Move to next wave if we've completed all trials in current wave
        if (nextTrial > currentState.maxTrials) {
            nextTrial = 1;
            nextWave++;
            newWaveScore = 0; // Reset wave score for new wave
            newTrialScores = []; // Reset trial scores for new wave
        }
        // Calculate minimum moves for new trial with the cards in hand
        const minMoves = this.calculateMinimumMoves(starting, target, hand);
        return {
            tokens: starting,
            targetColors: target,
            hand,
            deck: fullDeck,
            isGameOver: false,
            score: 0,
            scoreBreakdown: [],
            message: `Wave ${nextWave}, Trial ${nextTrial} of ${currentState.maxTrials} - ${newWaveScore}/${currentState.waveTargetScore} points`,
            currentTrial: nextTrial,
            currentWave: nextWave,
            totalScore: currentState.totalScore,
            waveScore: newWaveScore,
            maxTrials: currentState.maxTrials,
            maxWaves: currentState.maxWaves,
            targetScore: currentState.targetScore,
            waveTargetScore: currentState.waveTargetScore,
            isTrialOver: false,
            isTargetMatched: false,
            playHistory: [],
            trialScores: newTrialScores,
            waveScores: currentState.waveScores,
            bonusEarned: false,
            minMovesTarget: minMoves
        };
    }
}
exports.GameLogic = GameLogic;
GameLogic.MULTIPLIERS = [1, 2, 4, 8, 16];
GameLogic.BASE_POINTS = 1;


/***/ },

/***/ "./src/client/game/renderer.ts"
/*!*************************************!*\
  !*** ./src/client/game/renderer.ts ***!
  \*************************************/
(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameRenderer = void 0;
const gameLogic_1 = __webpack_require__(/*! ./gameLogic */ "./src/client/game/gameLogic.ts");
/**
 * GameRenderer - handles all DOM manipulation and visual updates
 */
class GameRenderer {
    constructor() {
        this.selectedCard = null;
        this.isAnimating = false;
        this.audioContext = null;
        // Event callbacks
        this.onCardClick = () => { };
        this.onTokenClick = () => { };
        this.onRestartClick = () => { };
        this.tokensContainer = this.getOrCreateElement('tokens-container');
        this.targetContainer = this.getOrCreateElement('target-container');
        this.cardsContainer = this.getOrCreateElement('cards-container');
        this.messageElement = this.getOrCreateElement('message');
        this.scoreElement = this.getOrCreateElement('score-display');
        this.totalScoreElement = this.getOrCreateElement('total-score-display');
        this.restartButton = this.getOrCreateElement('restart-button', 'button');
        this.viewDeckButton = this.getOrCreateElement('view-deck-button', 'button');
        this.deckModal = this.getOrCreateElement('deck-modal');
        this.deckCardsContainer = this.getOrCreateElement('deck-cards-container');
        this.closeDeckButton = this.getOrCreateElement('close-deck-button', 'button');
        this.trialInfoElement = this.getOrCreateElement('trial-info');
        this.nextTrialButton = this.getOrCreateElement('next-trial-button', 'button');
        this.trialCompleteOverlay = this.getOrCreateElement('trial-complete-overlay');
        this.waveCompleteOverlay = this.getOrCreateElement('wave-complete-overlay');
        this.historyPanel = this.getOrCreateElement('history-panel');
        this.hamburgerButton = this.getOrCreateElement('hamburger-menu', 'button');
        this.menuDropdown = this.getOrCreateElement('menu-dropdown');
        this.gameOverOverlay = this.getOrCreateElement('game-over-overlay');
        this.multipliers = gameLogic_1.GameLogic.getMultipliers();
        this.setupGameBoard();
        this.setupRestartButton();
        this.setupHamburgerMenu();
        this.setupDeckView();
        this.setupNextTrialButton();
        this.setupTrialCompleteOverlay();
        this.setupWaveCompleteOverlay();
        this.setupGameOverOverlay();
        this.initAudio();
    }
    setupGameBoard() {
        // Create game board wrapper if it doesn't exist
        let gameBoard = document.querySelector('.game-board');
        if (!gameBoard) {
            gameBoard = document.createElement('div');
            gameBoard.className = 'game-board';
            // Create header for integrated info - wave/trial indicators and wave score
            const header = document.createElement('div');
            header.className = 'game-board-header';
            header.appendChild(this.trialInfoElement);
            header.appendChild(this.totalScoreElement);
            gameBoard.appendChild(header);
            // Insert before target container
            const container = document.getElementById('game-container');
            if (container && this.targetContainer.parentNode === container) {
                container.insertBefore(gameBoard, this.targetContainer);
            }
        }
        // Initially hide the score element
        this.scoreElement.style.display = 'none';
    }
    initAudio() {
        // Initialize AudioContext on first user interaction to comply with browser policies
        const initContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initContext);
        };
        document.addEventListener('click', initContext);
    }
    playScoreSound(frequency = 800, duration = 0.1) {
        if (!this.audioContext)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    playSkipSound() {
        if (!this.audioContext)
            return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    playPerfectSound() {
        if (!this.audioContext)
            return;
        const currentTime = this.audioContext.currentTime;
        const duration = 1.5;
        // Create bell-like sound with multiple harmonics at high pitch
        const frequencies = [1400, 1750, 2100, 2800]; // Harmonic series based on final token pitch
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            // Each harmonic gets quieter and decays faster
            const volume = 0.3 / (index + 1);
            const decay = duration / (index + 1);
            gainNode.gain.setValueAtTime(volume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + decay);
            oscillator.start(currentTime);
            oscillator.stop(currentTime + duration);
        });
    }
    playBonusSound() {
        if (!this.audioContext)
            return;
        const currentTime = this.audioContext.currentTime;
        const duration = 0.8;
        // Create magical sparkle sound with golden tone
        const frequencies = [800, 1000, 1200, 1600, 2000];
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            const delay = index * 0.05;
            const volume = 0.15;
            gainNode.gain.setValueAtTime(0, currentTime + delay);
            gainNode.gain.linearRampToValueAtTime(volume, currentTime + delay + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + delay + duration);
            oscillator.start(currentTime + delay);
            oscillator.stop(currentTime + delay + duration);
        });
    }
    getOrCreateElement(id, tagName = 'div') {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement(tagName);
            element.id = id;
            document.body.appendChild(element);
        }
        return element;
    }
    setupRestartButton() {
        this.restartButton.textContent = 'Restart Game';
        this.restartButton.addEventListener('click', () => {
            this.isAnimating = false;
            this.scoreElement.classList.remove('final-score');
            this.onRestartClick();
        });
    }
    setupNextTrialButton() {
        this.nextTrialButton.textContent = 'Next Trial';
        this.nextTrialButton.classList.add('hidden');
    }
    setupTrialCompleteOverlay() {
        this.trialCompleteOverlay.classList.add('hidden');
    }
    showNextTrialButton(callback) {
        // This method is kept for compatibility but now shows the overlay
        this.showTrialCompleteOverlay(callback);
    }
    showTrialCompleteOverlay(callback) {
        // Get current game state info from the DOM
        const trialScoreText = this.scoreElement.textContent || 'Trial: 0';
        const trialScore = parseInt(trialScoreText.split(':')[1]) || 0;
        const trialInfoText = this.trialInfoElement.textContent || 'W1 T1/3';
        const waveMatch = trialInfoText.match(/W(\d+)/);
        const currentWave = waveMatch ? parseInt(waveMatch[1]) : 1;
        const totalScoreText = this.totalScoreElement.textContent || 'Total: 0/180';
        const totalParts = totalScoreText.match(/\d+/g) || ['0', '180'];
        const totalScore = parseInt(totalParts[0]);
        const targetScore = parseInt(totalParts[1]);
        this.trialCompleteOverlay.innerHTML = `
            <div class="trial-complete-content">
                <h2>Trial Complete!</h2>
                <div class="trial-stats">
                    <div class="stat-item trial-earned">
                        <div class="stat-label">Score Earned</div>
                        <div class="stat-value">+${trialScore}</div>
                    </div>
                    <div class="stat-item total-progress">
                        <div class="stat-label">Wave ${currentWave} Progress</div>
                        <div class="stat-value">${totalScore} / ${targetScore}</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${Math.min(100, (totalScore / targetScore) * 100)}%"></div>
                        </div>
                    </div>
                </div>
                <button class="continue-button">Continue to Next Trial</button>
            </div>
        `;
        this.trialCompleteOverlay.classList.remove('hidden');
        // Add click handler to continue button
        const continueButton = this.trialCompleteOverlay.querySelector('.continue-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.hideTrialCompleteOverlay();
                callback();
            });
        }
    }
    hideNextTrialButton() {
        this.nextTrialButton.classList.add('hidden');
        this.hideTrialCompleteOverlay();
    }
    hideTrialCompleteOverlay() {
        this.trialCompleteOverlay.classList.add('hidden');
    }
    setupWaveCompleteOverlay() {
        this.waveCompleteOverlay.classList.add('hidden');
    }
    showWaveCompleteOverlay(gameState, callback) {
        const waveNumber = gameState.currentWave;
        const waveScore = gameState.waveScore;
        const waveTarget = gameState.waveTargetScore;
        const totalScore = gameState.totalScore;
        const overallTarget = gameState.targetScore;
        const progressPercent = Math.min(100, (totalScore / overallTarget) * 100);
        const waveMet = waveScore >= waveTarget;
        this.waveCompleteOverlay.innerHTML = `
            <div class="wave-complete-content">
                <h2>🌊 Wave ${waveNumber} Complete! 🌊</h2>
                <div class="wave-summary">
                    <div class="wave-score-display ${waveMet ? 'wave-success' : 'wave-partial'}">
                        <div class="wave-score-label">Wave Score</div>
                        <div class="wave-score-value">${waveScore}</div>
                        <div class="wave-score-target">Target: ${waveTarget}</div>
                        ${waveMet ? '<div class="wave-badge">✨ Target Met! ✨</div>' : '<div class="wave-badge-miss">Keep Going!</div>'}
                    </div>
                    
                    <div class="trial-results">
                        <div class="trial-results-header">Trial Results</div>
                        ${gameState.trialScores.map((score, index) => `
                            <div class="trial-result-item">
                                <span class="trial-result-label">Trial ${index + 1}</span>
                                <span class="trial-result-score">${score} pts</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="overall-progress">
                        <div class="overall-label">Overall Progress</div>
                        <div class="overall-value">${totalScore} / ${overallTarget}</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
                <button class="continue-button">${waveNumber < gameState.maxWaves ? 'Continue to Next Wave' : 'View Results'}</button>
            </div>
        `;
        this.waveCompleteOverlay.classList.remove('hidden');
        // Add click handler to continue button
        const continueButton = this.waveCompleteOverlay.querySelector('.continue-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.hideWaveCompleteOverlay();
                callback();
            });
        }
    }
    hideWaveCompleteOverlay() {
        this.waveCompleteOverlay.classList.add('hidden');
    }
    setupGameOverOverlay() {
        this.gameOverOverlay.classList.add('hidden');
    }
    showGameOverOverlay(gameState) {
        const won = gameState.totalScore >= gameState.targetScore;
        const totalCards = gameState.trialScores.length * 5; // 5 cards per trial
        const bestTrial = gameState.trialScores.length > 0 ? Math.max(...gameState.trialScores) : 0;
        const perfectTrials = gameState.trialScores.filter(score => score === 31).length; // Max score is 31 (1+2+4+8+16)
        this.gameOverOverlay.innerHTML = `
            <div class="game-over-content">
                <div class="game-over-header ${won ? 'victory' : 'defeat'}">
                    ${won ? '🏆 VICTORY! 🏆' : '💔 GAME OVER 💔'}
                </div>
                
                <div class="final-score-display">
                    <div class="final-score-label">Final Score</div>
                    <div class="final-score-value ${won ? 'success' : 'failure'}">${gameState.totalScore}</div>
                    <div class="final-score-target">Target: ${gameState.targetScore}</div>
                </div>
                
                <div class="game-stats">
                    <div class="stats-header">Game Summary</div>
                    
                    <div class="wave-summary-section">
                        ${gameState.waveScores.map((waveScore, waveIndex) => `
                            <div class="wave-summary-item">
                                <div class="wave-summary-header">Wave ${waveIndex + 1}: ${waveScore} pts</div>
                            </div>
                        `).join('')}
                        ${gameState.currentWave <= gameState.maxWaves && gameState.trialScores.length > 0 ? `
                            <div class="wave-summary-item current-wave">
                                <div class="wave-summary-header">Wave ${gameState.currentWave}: ${gameState.waveScore} pts</div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="additional-stats">
                        <div class="stat-box">
                            <div class="stat-box-value">${totalCards}</div>
                            <div class="stat-box-label">Cards Played</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-value">${perfectTrials}</div>
                            <div class="stat-box-label">Perfect Trials</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-value">${Math.round((gameState.totalScore / gameState.targetScore) * 100)}%</div>
                            <div class="stat-box-label">Target Reached</div>
                        </div>
                    </div>
                </div>
                
                <button class="play-again-button">Play Again</button>
            </div>
        `;
        this.gameOverOverlay.classList.remove('hidden');
        // Add click handler to play again button
        const playAgainButton = this.gameOverOverlay.querySelector('.play-again-button');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => {
                this.hideGameOverOverlay();
                this.onRestartClick();
            });
        }
    }
    hideGameOverOverlay() {
        this.gameOverOverlay.classList.add('hidden');
    }
    setupHamburgerMenu() {
        var _a;
        // Setup hamburger button
        this.hamburgerButton.innerHTML = '☰';
        this.hamburgerButton.className = 'hamburger-menu';
        // Position it inside the game header to the left of the logo
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.insertBefore(this.hamburgerButton, gameHeader.firstChild);
        }
        // Setup menu dropdown
        this.menuDropdown.className = 'menu-dropdown hidden';
        this.menuDropdown.innerHTML = `
            <div class="menu-item" data-action="view-deck">View Deck</div>
            <div class="menu-item" data-action="toggle-logo">Switch Logo Theme</div>
            <div class="menu-item" data-action="quit">Quit</div>
        `;
        // Insert menu dropdown after hamburger
        (_a = this.hamburgerButton.parentNode) === null || _a === void 0 ? void 0 : _a.appendChild(this.menuDropdown);
        // Apply saved logo theme
        this.applyLogoTheme();
        // Toggle menu on hamburger click
        this.hamburgerButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuDropdown.classList.toggle('hidden');
        });
        // Handle menu item clicks
        this.menuDropdown.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('menu-item')) {
                const action = target.dataset.action;
                if (action === 'view-deck') {
                    this.showDeckModal();
                }
                else if (action === 'toggle-logo') {
                    this.toggleLogoTheme();
                }
                else if (action === 'quit') {
                    // Return to start screen
                    const gameContainer = document.getElementById('game-container');
                    const startScreen = document.getElementById('start-screen');
                    if (gameContainer && startScreen) {
                        gameContainer.classList.add('hidden');
                        startScreen.classList.remove('hidden');
                        // Reload the page to reset game state
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    }
                }
                this.menuDropdown.classList.add('hidden');
            }
        });
        // Close menu when clicking outside
        document.addEventListener('click', () => {
            this.menuDropdown.classList.add('hidden');
        });
    }
    toggleLogoTheme() {
        const currentTheme = localStorage.getItem('logoTheme') || 'black';
        const newTheme = currentTheme === 'black' ? 'white' : 'black';
        localStorage.setItem('logoTheme', newTheme);
        this.applyLogoTheme();
    }
    applyLogoTheme() {
        const theme = localStorage.getItem('logoTheme') || 'black';
        const gameLogo = document.querySelector('.game-logo');
        const gameHeader = document.querySelector('.game-header');
        const gameBoardHeader = document.querySelector('.game-board-header');
        if (gameLogo && gameHeader) {
            if (theme === 'white') {
                gameLogo.src = 'images/sequora_white.png';
                gameHeader.classList.add('white-theme');
                gameHeader.classList.remove('black-theme');
                if (gameBoardHeader) {
                    gameBoardHeader.classList.add('white-theme');
                    gameBoardHeader.classList.remove('black-theme');
                }
            }
            else {
                gameLogo.src = 'images/sequora_black.png';
                gameHeader.classList.add('black-theme');
                gameHeader.classList.remove('white-theme');
                if (gameBoardHeader) {
                    gameBoardHeader.classList.add('black-theme');
                    gameBoardHeader.classList.remove('white-theme');
                }
            }
        }
    }
    setupDeckView() {
        this.viewDeckButton.textContent = 'View Deck';
        this.viewDeckButton.addEventListener('click', () => {
            this.showDeckModal();
        });
        this.closeDeckButton.addEventListener('click', () => {
            this.hideDeckModal();
        });
        // Close modal when clicking outside the content
        this.deckModal.addEventListener('click', (e) => {
            if (e.target === this.deckModal) {
                this.hideDeckModal();
            }
        });
    }
    showDeckModal() {
        this.deckModal.classList.remove('hidden');
    }
    hideDeckModal() {
        this.deckModal.classList.add('hidden');
    }
    renderDeck(deck, currentHand) {
        this.deckCardsContainer.innerHTML = '';
        deck.forEach((card) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'deck-card';
            // Mark cards that are currently in hand
            const isInHand = currentHand.some(c => c.id === card.id);
            if (isInHand) {
                cardElement.classList.add('in-hand');
            }
            const cardName = document.createElement('div');
            cardName.className = 'deck-card-name';
            cardName.textContent = card.name;
            const cardDescription = document.createElement('div');
            cardDescription.className = 'deck-card-description';
            cardDescription.textContent = card.description;
            cardElement.appendChild(cardName);
            cardElement.appendChild(cardDescription);
            this.deckCardsContainer.appendChild(cardElement);
        });
    }
    setSelectedCard(card) {
        this.selectedCard = card;
    }
    renderTargetColors(targetColors, minMovesTarget) {
        // Ensure target container is in game board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard && this.targetContainer.parentNode !== gameBoard) {
            gameBoard.appendChild(this.targetContainer);
        }
        this.targetContainer.innerHTML = '<div class="target-label">Target:</div>';
        targetColors.forEach((color, index) => {
            const targetToken = document.createElement('div');
            targetToken.className = `target-token ${color === 'R' ? 'target-red' : 'target-blue'}`;
            targetToken.textContent = `${this.multipliers[index]}x`;
            this.targetContainer.appendChild(targetToken);
        });
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'token-separator';
        this.targetContainer.appendChild(separator);
        // Add bonus target token (golden)
        const bonusTargetToken = document.createElement('div');
        bonusTargetToken.className = 'target-token target-bonus';
        bonusTargetToken.textContent = '1x';
        this.targetContainer.appendChild(bonusTargetToken);
        // Add separator
        const separator2 = document.createElement('div');
        separator2.className = 'token-separator';
        this.targetContainer.appendChild(separator2);
        // Add minimum moves target (card icon)
        const minMovesToken = document.createElement('div');
        minMovesToken.className = 'target-token target-moves';
        minMovesToken.innerHTML = `<div class="moves-icon">🎴</div><div class="moves-count">${minMovesTarget || '?'}</div>`;
        minMovesToken.title = `Minimum moves to solve: ${minMovesTarget}`;
        this.targetContainer.appendChild(minMovesToken);
    }
    render(gameState) {
        this.renderTargetColors(gameState.targetColors, gameState.minMovesTarget);
        this.renderTokens(gameState.tokens, gameState.playHistory.length);
        this.renderCards(gameState.hand);
        this.renderHistory(gameState.playHistory);
        // Only show score during trial end, otherwise show 0 or "-"
        if (gameState.isTrialOver) {
            this.renderScore(gameState.score);
        }
        else {
            this.renderScore(0);
        }
        // Always show wave score in score display area
        this.renderTotalScore(gameState.waveScore, gameState.waveTargetScore, false);
        this.renderTrialInfo(gameState.currentTrial, gameState.currentWave, gameState.maxTrials, gameState.waveScore, gameState.waveTargetScore);
        this.renderMessage(gameState.message, gameState.isGameOver);
        this.renderDeck(gameState.deck, gameState.hand);
    }
    animateScore(gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isAnimating)
                return;
            this.isAnimating = true;
            // Show trial score element and add it to header during animation
            const header = document.querySelector('.game-board-header');
            if (header && !header.contains(this.scoreElement)) {
                // Insert trial score between trial info and wave score
                header.insertBefore(this.scoreElement, this.totalScoreElement);
            }
            this.scoreElement.style.display = 'block';
            this.scoreElement.textContent = 'Score: 0';
            yield this.animateScoreCalculation(gameState.tokens, gameState.scoreBreakdown, gameState.targetColors, gameState.bonusEarned);
            // Hide trial score after animation
            yield this.delay(500);
            this.scoreElement.style.display = 'none';
            // After animation completes, if game is over, show final score
            if (gameState.isGameOver) {
                this.renderTotalScore(gameState.totalScore, gameState.targetScore, true);
            }
            this.isAnimating = false;
        });
    }
    renderTokens(tokens, currentMoves) {
        // Ensure tokens container is in game board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard && this.tokensContainer.parentNode !== gameBoard) {
            gameBoard.appendChild(this.tokensContainer);
        }
        this.tokensContainer.innerHTML = '';
        tokens.forEach((token, index) => {
            var _a;
            const tokenWrapper = document.createElement('div');
            tokenWrapper.className = 'token-wrapper';
            // Token element with point value in center
            const tokenElement = document.createElement('div');
            tokenElement.className = `token ${token === 'R' ? 'token-red' : 'token-blue'}`;
            tokenElement.dataset.index = index.toString();
            tokenElement.textContent = '1';
            // Add click handler
            tokenElement.addEventListener('click', () => {
                this.onTokenClick(index);
            });
            // Add hover effect if a card requiring target is selected
            if ((_a = this.selectedCard) === null || _a === void 0 ? void 0 : _a.requiresTarget) {
                tokenElement.classList.add('selectable');
            }
            tokenWrapper.appendChild(tokenElement);
            this.tokensContainer.appendChild(tokenWrapper);
        });
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'token-separator';
        this.tokensContainer.appendChild(separator);
        // Add bonus token (golden)
        const bonusWrapper = document.createElement('div');
        bonusWrapper.className = 'token-wrapper';
        const bonusToken = document.createElement('div');
        bonusToken.className = 'token token-bonus';
        bonusToken.textContent = '5';
        bonusToken.dataset.index = 'bonus';
        bonusWrapper.appendChild(bonusToken);
        this.tokensContainer.appendChild(bonusWrapper);
        // Add separator
        const separator2 = document.createElement('div');
        separator2.className = 'token-separator';
        this.tokensContainer.appendChild(separator2);
        // Add current moves counter (card icon)
        const movesWrapper = document.createElement('div');
        movesWrapper.className = 'token-wrapper';
        const movesToken = document.createElement('div');
        movesToken.className = 'token token-moves';
        movesToken.innerHTML = `<div class="moves-icon">🎴</div><div class="moves-count">${currentMoves !== undefined ? currentMoves : 0}</div>`;
        movesToken.title = `Cards played this trial: ${currentMoves !== undefined ? currentMoves : 0}`;
        movesWrapper.appendChild(movesToken);
        this.tokensContainer.appendChild(movesWrapper);
    }
    renderCards(hand) {
        this.cardsContainer.innerHTML = '';
        if (hand.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-hand-message';
            emptyMessage.textContent = 'No cards remaining';
            this.cardsContainer.appendChild(emptyMessage);
            return;
        }
        hand.forEach((card) => {
            var _a;
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            // Highlight selected card
            if (((_a = this.selectedCard) === null || _a === void 0 ? void 0 : _a.id) === card.id) {
                cardElement.classList.add('selected');
            }
            // Add icon based on card type
            const cardIcon = document.createElement('div');
            cardIcon.className = 'card-icon';
            if (card.name === 'Single Flip') {
                cardIcon.classList.add('icon-single-flip');
            }
            else if (card.name === 'Adjacent Flip') {
                cardIcon.classList.add('icon-adjacent-flip');
            }
            else if (card.name === 'Row Flip') {
                cardIcon.classList.add('icon-row-flip');
            }
            const cardName = document.createElement('div');
            cardName.className = 'card-name';
            cardName.textContent = card.name;
            const cardDescription = document.createElement('div');
            cardDescription.className = 'card-description';
            cardDescription.textContent = card.description;
            cardElement.appendChild(cardIcon);
            cardElement.appendChild(cardName);
            cardElement.appendChild(cardDescription);
            // Add click handler
            cardElement.addEventListener('click', () => {
                this.onCardClick(card.id);
            });
            this.cardsContainer.appendChild(cardElement);
        });
    }
    renderMessage(message, isGameOver) {
        this.messageElement.textContent = message;
        this.messageElement.className = 'message';
        if (isGameOver) {
            if (message.includes('VICTORY')) {
                this.messageElement.classList.add('victory');
            }
            else {
                this.messageElement.classList.add('game-over');
            }
        }
    }
    renderScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }
    renderTotalScore(totalScore, targetScore, isGameOver) {
        this.totalScoreElement.classList.remove('final-score', 'target-met', 'target-missed');
        if (isGameOver) {
            this.totalScoreElement.classList.add('final-score');
            const targetMet = totalScore >= targetScore;
            if (targetMet) {
                this.totalScoreElement.classList.add('target-met');
                this.totalScoreElement.textContent = `🏆 ${totalScore}/${targetScore} 🏆`;
            }
            else {
                this.totalScoreElement.classList.add('target-missed');
                this.totalScoreElement.textContent = `Final: ${totalScore}/${targetScore}`;
            }
        }
        else {
            this.totalScoreElement.textContent = `Score: ${totalScore}/${targetScore}`;
        }
    }
    renderFinalScore(totalScore, targetScore, targetMet) {
        this.totalScoreElement.classList.add('final-score');
        if (targetMet) {
            this.totalScoreElement.classList.add('target-met');
            this.totalScoreElement.textContent = `🏆 Final Score: ${totalScore}/${targetScore} 🏆`;
        }
        else {
            this.totalScoreElement.classList.add('target-missed');
            this.totalScoreElement.textContent = `Final Score: ${totalScore}/${targetScore}`;
        }
    }
    renderTrialInfo(currentTrial, currentWave, maxTrials, waveScore, waveTargetScore) {
        this.trialInfoElement.innerHTML = `
            <div class="wave-indicator">Wave ${currentWave}</div>
            <div class="trial-indicator">Trial ${currentTrial}/${maxTrials}</div>
        `;
    }
    renderHistory(playHistory) {
        this.historyPanel.innerHTML = '<div class="history-header">Play History</div>';
        if (playHistory.length === 0) {
            this.historyPanel.innerHTML += '<div class="history-empty">No cards played yet</div>';
            return;
        }
        // Render in chronological order (most recent last)
        playHistory.forEach((entry, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const cardName = document.createElement('div');
            cardName.className = 'history-card-name';
            cardName.textContent = `${index + 1}. ${entry.cardName}`;
            const tokensRow = document.createElement('div');
            tokensRow.className = 'history-tokens-row';
            // Before tokens
            const beforeDiv = document.createElement('div');
            beforeDiv.className = 'history-tokens';
            entry.beforeTokens.forEach(token => {
                const tokenSpan = document.createElement('span');
                tokenSpan.className = `history-token ${token === 'R' ? 'history-red' : 'history-blue'}`;
                beforeDiv.appendChild(tokenSpan);
            });
            // Arrow
            const arrow = document.createElement('div');
            arrow.className = 'history-arrow';
            arrow.textContent = '→';
            // After tokens
            const afterDiv = document.createElement('div');
            afterDiv.className = 'history-tokens';
            entry.afterTokens.forEach(token => {
                const tokenSpan = document.createElement('span');
                tokenSpan.className = `history-token ${token === 'R' ? 'history-red' : 'history-blue'}`;
                afterDiv.appendChild(tokenSpan);
            });
            tokensRow.appendChild(beforeDiv);
            tokensRow.appendChild(arrow);
            tokensRow.appendChild(afterDiv);
            historyItem.appendChild(cardName);
            historyItem.appendChild(tokensRow);
            this.historyPanel.appendChild(historyItem);
        });
    }
    animateScoreCalculation(tokens, breakdown, targetColors, bonusEarned) {
        return __awaiter(this, void 0, void 0, function* () {
            // Wait a moment before starting animation
            yield this.delay(150);
            let runningTotal = 0;
            const scoredSlots = new Set(breakdown.map(b => b.slot));
            let canScore = true; // Track if we can still score tokens
            // Go through each token slot
            for (let i = 0; i < tokens.length; i++) {
                const slot = i + 1;
                // Highlight the current token and target token
                this.highlightToken(i);
                this.highlightTargetToken(i);
                if (scoredSlots.has(slot) && canScore) {
                    // This token scored
                    const item = breakdown.find(b => b.slot === slot);
                    // Play scoring sound with dramatic pitch increase (250Hz jumps)
                    this.playScoreSound(400 + (i * 250), 0.15);
                    // Show calculation
                    this.messageElement.textContent = `Slot ${slot}: 1 pt × ${item.multiplier}x = ${item.points} pts`;
                    // Animate score increment with token-specific pitch
                    yield this.animateScoreIncrement(runningTotal, runningTotal + item.points, i);
                    runningTotal += item.points;
                    yield this.delay(300);
                    this.removeTokenHighlight(i);
                    this.removeTargetTokenHighlight(i);
                }
                else {
                    // This token doesn't score - show skip
                    this.playSkipSound();
                    const currentColor = tokens[i] === 'R' ? 'red' : 'blue';
                    const targetColor = targetColors[i] === 'R' ? 'red' : 'blue';
                    this.messageElement.textContent = `Slot ${slot}: SKIP (${currentColor} token, need ${targetColor})`;
                    this.showSkipIndicator(i);
                    this.showTargetSkipIndicator(i);
                    yield this.delay(300);
                    // Mark that we can't score any more tokens after this
                    canScore = false;
                    this.removeTokenHighlight(i);
                    this.removeTargetTokenHighlight(i);
                }
            }
            // Animate bonus if earned
            if (bonusEarned) {
                this.highlightBonusToken();
                this.highlightBonusTargetToken();
                // Play special bonus sound
                this.playBonusSound();
                // Show bonus calculation
                this.messageElement.textContent = '🌟 BONUS: 5 pts × 1x = 5 pts 🌟';
                // Animate bonus score increment
                yield this.animateScoreIncrement(runningTotal, runningTotal + 5, -1);
                runningTotal += 5;
                yield this.delay(400);
                this.removeBonusHighlight();
                this.removeBonusTargetHighlight();
            }
            else {
                // Show bonus as missed
                this.showBonusSkipIndicator();
                this.showBonusTargetSkipIndicator();
                // Play skip sound
                this.playSkipSound();
                // Show missed bonus message
                this.messageElement.textContent = 'BONUS: MISSED (not all tokens match)';
                yield this.delay(400);
                this.removeBonusSkipIndicator();
                this.removeBonusTargetSkipIndicator();
            }
            // Brief pause before returning to normal message
            yield this.delay(150);
            if (breakdown.length === 5) {
                this.playPerfectSound();
                this.messageElement.textContent = bonusEarned ? '🎉 PERFECT! Bonus earned! 🎉' : '🎉 PERFECT! Target matched! 🎉';
            }
            else {
                this.messageElement.textContent = `Trial Score: ${runningTotal}`;
            }
        });
    }
    highlightToken(index) {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.add('scoring');
        }
    }
    removeTokenHighlight(index) {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.remove('scoring');
            tokenWrappers[index].classList.remove('skipped');
        }
    }
    highlightBonusToken() {
        var _a;
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            (_a = bonusToken.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('scoring');
        }
    }
    removeBonusHighlight() {
        var _a;
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            (_a = bonusToken.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove('scoring');
        }
    }
    highlightTargetToken(index) {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.add('scoring');
        }
    }
    removeTargetTokenHighlight(index) {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.remove('scoring');
            targetTokens[index].classList.remove('skipped');
        }
    }
    showTargetSkipIndicator(index) {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.remove('scoring');
            targetTokens[index].classList.add('skipped');
        }
    }
    highlightBonusTargetToken() {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.add('scoring');
        }
    }
    removeBonusTargetHighlight() {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.remove('scoring');
        }
    }
    showBonusSkipIndicator() {
        var _a;
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            (_a = bonusToken.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('skipped');
        }
    }
    removeBonusSkipIndicator() {
        var _a;
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            (_a = bonusToken.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove('skipped');
        }
    }
    showBonusTargetSkipIndicator() {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.add('skipped');
        }
    }
    removeBonusTargetSkipIndicator() {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.remove('skipped');
        }
    }
    showSkipIndicator(index) {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.remove('scoring');
            tokenWrappers[index].classList.add('skipped');
        }
    }
    animateScoreIncrement(from, to, tokenIndex = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const duration = 600;
            const steps = 20;
            const increment = (to - from) / steps;
            const stepDuration = duration / steps;
            // Base pitch increases with token index
            const basePitch = 800 + (tokenIndex * 250);
            for (let i = 0; i <= steps; i++) {
                const currentScore = Math.round(from + (increment * i));
                this.scoreElement.textContent = `Score: ${currentScore}`;
                this.scoreElement.classList.add('score-pulse');
                // Play a quick tick sound every few steps, with pitch matching the token's pitch
                if (i % 4 === 0 && i < steps) {
                    this.playScoreSound(basePitch + (i * 20), 0.03);
                }
                yield this.delay(stepDuration);
                this.scoreElement.classList.remove('score-pulse');
            }
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.GameRenderer = GameRenderer;


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*****************************!*\
  !*** ./src/client/index.ts ***!
  \*****************************/

// This file serves as the entry point for the client-side application. It initializes the game engine and starts the game.
Object.defineProperty(exports, "__esModule", ({ value: true }));
const engine_1 = __webpack_require__(/*! ./game/engine */ "./src/client/game/engine.ts");
// Handle start screen and game initialization
function initializeGame() {
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameContainer = document.getElementById('game-container');
    if (!startButton || !startScreen || !gameContainer) {
        // If elements not found, start game immediately
        const game = new engine_1.GameEngine();
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
        const game = new engine_1.GameEngine();
        game.start();
    });
}
// Initialize when DOM is ready
initializeGame();

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map