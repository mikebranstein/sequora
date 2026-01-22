import { GameState, Card, TokenColor } from '../../shared/types';

/**
 * Game Logic - handles game state management and rule enforcement
 */
export class GameLogic {
    private static readonly MULTIPLIERS: number[] = [1, 2, 4, 8, 16];
    private static readonly BASE_POINTS: number = 1;

    /**
     * Generate a random color pattern
     */
    private static generateRandomPattern(): TokenColor[] {
        return Array.from({ length: 5 }, () => Math.random() > 0.5 ? 'B' : 'R');
    }

    /**
     * Check if two patterns are the same
     */
    private static arePatternsEqual(pattern1: TokenColor[], pattern2: TokenColor[]): boolean {
        return pattern1.every((color, index) => color === pattern2[index]);
    }

    /**
     * Generate starting and target patterns that are different
     */
    private static generatePatterns(): { starting: TokenColor[]; target: TokenColor[] } {
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
    static calculateScore(tokens: TokenColor[], targetColors: TokenColor[]): { score: number; breakdown: { slot: number; multiplier: number; points: number }[] } {
        let score = 0;
        const breakdown: { slot: number; multiplier: number; points: number }[] = [];

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === targetColors[i]) {
                const points = this.BASE_POINTS * this.MULTIPLIERS[i];
                score += points;
                breakdown.push({
                    slot: i + 1,
                    multiplier: this.MULTIPLIERS[i],
                    points
                });
            } else {
                // Stop when we encounter a token that doesn't match
                break;
            }
        }

        return { score, breakdown };
    }

    /**
     * Play a card and return the new game state
     */
    static playCard(
        currentState: GameState,
        card: Card,
        targetIndex?: number
    ): GameState {
        // Don't allow play if game is over
        if (currentState.isGameOver) {
            return currentState;
        }

        // Validate target index for cards that require it
        if (card.requiresTarget && (targetIndex === undefined || targetIndex < 0 || targetIndex >= currentState.tokens.length)) {
            return {
                ...currentState,
                message: 'Invalid target selection'
            };
        }

        // Execute card effect
        const newTokens = card.execute(currentState.tokens, targetIndex);

        // Remove card from hand
        const newHand = currentState.hand.filter(c => c.id !== card.id);

        // Calculate score and check if target is matched
        const { score, breakdown } = this.calculateScore(newTokens, currentState.targetColors);
        const isTargetMatched = this.arePatternsEqual(newTokens, currentState.targetColors);
        const isRoundOver = newHand.length === 0 || isTargetMatched;
        
        // Calculate new total score
        const newTotalScore = isRoundOver ? currentState.totalScore + score : currentState.totalScore;
        
        // Check if game is completely over
        const isGameOver = isRoundOver && (currentState.currentRound >= currentState.maxRounds || newTotalScore >= currentState.targetScore);

        let message = '';
        if (isTargetMatched) {
            message = `Perfect! Target matched!`;
        } else if (isRoundOver) {
            message = `Round ${currentState.currentRound} complete!`;
        } else {
            message = `Played ${card.name}`;
        }
        
        if (isGameOver) {
            if (newTotalScore >= currentState.targetScore) {
                message = `🎉 VICTORY! Final Score: ${newTotalScore}/${currentState.targetScore} - Target Achieved! 🎉`;
            } else {
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
            currentRound: currentState.currentRound,
            totalScore: newTotalScore,
            maxRounds: currentState.maxRounds,
            targetScore: currentState.targetScore,
            isRoundOver,
            isTargetMatched
        };
    }

    /**
     * Deal random cards from deck
     */
    private static dealCards(deck: Card[], count: number): { hand: Card[]; remainingDeck: Card[] } {
        // Shuffle deck
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        const hand = shuffled.slice(0, count);
        const remainingDeck = shuffled.slice(count);
        return { hand, remainingDeck };
    }

    /**
     * Create a new game state with initial configuration
     */
    static createInitialState(fullDeck: Card[]): GameState {
        const { starting, target } = this.generatePatterns();
        const { hand, remainingDeck } = this.dealCards(fullDeck, 5);
        
        return {
            tokens: starting,
            targetColors: target,
            hand,
            deck: fullDeck,
            isGameOver: false,
            score: 0,
            scoreBreakdown: [],
            message: 'Round 1 of 3 - Reach 90 points to win!',
            currentRound: 1,
            totalScore: 0,
            maxRounds: 3,
            targetScore: 90,
            isRoundOver: false,
            isTargetMatched: false
        };
    }

    /**
     * Get multipliers array for display
     */
    static getMultipliers(): number[] {
        return [...this.MULTIPLIERS];
    }

    /**
     * Reset the game with a new hand dealt from the deck
     */
    static resetGame(fullDeck: Card[]): GameState {
        return this.createInitialState(fullDeck);
    }
    
    /**
     * Start the next round with new patterns and cards
     */
    static startNextRound(currentState: GameState, fullDeck: Card[]): GameState {
        const { starting, target } = this.generatePatterns();
        const { hand, remainingDeck } = this.dealCards(fullDeck, 5);
        const nextRound = currentState.currentRound + 1;
        
        return {
            tokens: starting,
            targetColors: target,
            hand,
            deck: fullDeck,
            isGameOver: false,
            score: 0,
            scoreBreakdown: [],
            message: `Round ${nextRound} of ${currentState.maxRounds} - ${currentState.totalScore}/${currentState.targetScore} points`,
            currentRound: nextRound,
            totalScore: currentState.totalScore,
            maxRounds: currentState.maxRounds,
            targetScore: currentState.targetScore,
            isRoundOver: false,
            isTargetMatched: false
        };
    }
}
