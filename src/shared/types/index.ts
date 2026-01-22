// Token state: Red or Blue
export type TokenColor = 'R' | 'B';

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
    currentRound: number;
    totalScore: number;
    maxRounds: number;
    targetScore: number;
    isRoundOver: boolean;
    isTargetMatched: boolean;
}

// Card play action
export interface CardPlayAction {
    card: Card;
    targetIndex?: number;
}