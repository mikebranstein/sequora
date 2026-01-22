import { Card, TokenColor } from '../../shared/types';

/**
 * Helper function to flip a token's color
 */
function flipToken(color: TokenColor): TokenColor {
    return color === 'R' ? 'B' : 'R';
}

/**
 * Single Flip Card - Flips a specific token at the target index
 */
export function createSingleFlipCard(cardId: string): Card {
    return {
        id: cardId,
        name: 'Single Flip',
        description: 'Flip one token',
        requiresTarget: true,
        execute: (tokens: TokenColor[], targetIndex?: number): TokenColor[] => {
            if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
                return tokens;
            }
            
            const newTokens = [...tokens];
            newTokens[targetIndex] = flipToken(newTokens[targetIndex]);
            return newTokens;
        }
    };
}

/**
 * Adjacent Flip Card - Flips a token and its immediate neighbors
 */
export function createAdjacentFlipCard(cardId: string): Card {
    return {
        id: cardId,
        name: 'Adjacent Flip',
        description: 'Flip a token and its neighbors',
        requiresTarget: true,
        execute: (tokens: TokenColor[], targetIndex?: number): TokenColor[] => {
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

/**
 * Row Flip Card - Flips all tokens in the row
 */
export function createRowFlipCard(cardId: string): Card {
    return {
        id: cardId,
        name: 'Row Flip',
        description: 'Flip all tokens',
        requiresTarget: false,
        execute: (tokens: TokenColor[]): TokenColor[] => {
            return tokens.map(flipToken);
        }
    };
}

/**
 * Create initial deck of cards
 */
export function createInitialDeck(): Card[] {
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
