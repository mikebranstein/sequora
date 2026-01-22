// Token state: Red or Blue
export type TokenColor = 'R' | 'B';

// Card play history entry
export interface CardPlayHistory {
    cardName: string;
    beforeTokens: TokenColor[];
    afterTokens: TokenColor[];
    targetIndex?: number;
}

// Card interface - defines a card's properties and behavior
export interface Card {
    id: string;
    name: string;
    description: string;
    requiresTarget: boolean;
    execute: (tokens: TokenColor[], targetIndex?: number) => TokenColor[];
}

// Game state representation
export interface GameState {
    tokens: TokenColor[];
    targetColors: TokenColor[];
    hand: Card[];
    deck: Card[];
    isGameOver: boolean;
    score: number;
    scoreBreakdown: { slot: number; multiplier: number; points: number }[];
    message: string;
    currentTrial: number;
    currentWave: number;
    totalScore: number;
    maxTrials: number;
    maxWaves: number;
    targetScore: number;
    isTrialOver: boolean;
    isTargetMatched: boolean;
    playHistory: CardPlayHistory[];
    trialScores: number[];
    bonusEarned: boolean;
    minMovesTarget: number;
}

// Card play action
export interface CardPlayAction {
    card: Card;
    targetIndex?: number;
}