import { GameState, Card } from '../../shared/types';
import { GameLogic } from './gameLogic';
import { createInitialDeck } from './cards';
import { GameRenderer } from './renderer';

export class GameEngine {
    private gameState: GameState;
    private renderer: GameRenderer;
    private selectedCard: Card | null = null;

    constructor() {
        this.gameState = GameLogic.createInitialState(createInitialDeck());
        this.renderer = new GameRenderer();
        this.initialize();
    }

    private initialize(): void {
        // Set up event listeners
        this.setupEventListeners();
    }

    public start(): void {
        // Initial render
        this.render();
    }

    private setupEventListeners(): void {
        // Delegate click handling to the renderer
        this.renderer.onCardClick = (cardId: string) => {
            this.handleCardClick(cardId);
        };

        this.renderer.onTokenClick = (tokenIndex: number) => {
            this.handleTokenClick(tokenIndex);
        };

        this.renderer.onRestartClick = () => {
            this.restart();
        };
    }

    private handleCardClick(cardId: string): void {
        if (this.gameState.isGameOver) return;

        const card = this.gameState.hand.find(c => c.id === cardId);
        if (!card) return;

        if (card.requiresTarget) {
            // Select this card and wait for token selection
            this.selectedCard = card;
            this.renderer.setSelectedCard(card);
            this.render();
        } else {
            // Execute card immediately (doesn't require target)
            this.playCard(card);
        }
    }

    private handleTokenClick(tokenIndex: number): void {
        if (this.gameState.isGameOver) return;
        
        if (this.selectedCard) {
            // Play the selected card with this token as target
            this.playCard(this.selectedCard, tokenIndex);
            this.selectedCard = null;
            this.renderer.setSelectedCard(null);
        }
    }

    private playCard(card: Card, targetIndex?: number): void {
        this.gameState = GameLogic.playCard(this.gameState, card, targetIndex);
        this.render();
        
        // Animate the score calculation after rendering
        this.renderer.animateScore(this.gameState.tokens, this.gameState.scoreBreakdown, this.gameState.targetColors);
    }

    private restart(): void {
        this.gameState = GameLogic.resetGame(createInitialDeck());
        this.selectedCard = null;
        this.renderer.setSelectedCard(null);
        this.render();
    }

    private render(): void {
        this.renderer.render(this.gameState);
    }
}

export default GameEngine;