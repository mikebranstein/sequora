import { GameState, Card, TokenColor, CardPlayHistory } from '../../shared/types';

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
    static calculateScore(tokens: TokenColor[], targetColors: TokenColor[], movesPlayed: number, minMoves: number): { score: number; breakdown: { slot: number; multiplier: number; points: number }[]; bonusEarned: boolean } {
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
    static calculateMinimumMoves(startTokens: TokenColor[], targetTokens: TokenColor[], availableCards: Card[]): number {
        // If already solved
        if (this.arePatternsEqual(startTokens, targetTokens)) {
            return 0;
        }
        
        // BFS to find shortest path
        const queue: { tokens: TokenColor[]; moves: number }[] = [{ tokens: startTokens, moves: 0 }];
        const visited = new Set<string>();
        visited.add(startTokens.join(''));
        
        const maxMoves = 10; // Reasonable upper bound
        
        while (queue.length > 0) {
            const current = queue.shift()!;
            
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
                } else {
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

        // Capture before state for history
        const beforeTokens = [...currentState.tokens];

        // Execute card effect
        const newTokens = card.execute(currentState.tokens, targetIndex);

        // Create history entry
        const historyEntry: CardPlayHistory = {
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
        } else if (isTrialOver) {
            message = `Trial ${currentState.currentTrial} complete!`;
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
        
        // Calculate minimum moves needed with full deck
        const minMoves = this.calculateMinimumMoves(starting, target, fullDeck);
        
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
     * Start the next trial with new patterns and cards
     */
    static startNextTrial(currentState: GameState, fullDeck: Card[]): GameState {
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
        
        // Calculate minimum moves for new trial
        const minMoves = this.calculateMinimumMoves(starting, target, fullDeck);
        
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
