import { GameLogic } from './gameLogic';
import { Card, TokenColor } from '../../shared/types';

/**
 * Test helpers for creating mock cards
 */

// Create a single flip card for testing
function createSingleFlipCard(id: string): Card {
    return {
        id,
        name: 'Single Flip',
        description: 'Flip one token',
        requiresTarget: true,
        execute: (tokens: TokenColor[], targetIndex?: number): TokenColor[] => {
            if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
                return tokens;
            }
            const newTokens = [...tokens];
            newTokens[targetIndex] = newTokens[targetIndex] === 'R' ? 'B' : 'R';
            return newTokens;
        }
    };
}

// Create an adjacent flip card for testing
function createAdjacentFlipCard(id: string): Card {
    return {
        id,
        name: 'Adjacent Flip',
        description: 'Flip a token and its neighbors',
        requiresTarget: true,
        execute: (tokens: TokenColor[], targetIndex?: number): TokenColor[] => {
            if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
                return tokens;
            }
            const newTokens = [...tokens];
            const flip = (color: TokenColor) => color === 'R' ? 'B' : 'R';
            
            if (targetIndex > 0) {
                newTokens[targetIndex - 1] = flip(newTokens[targetIndex - 1]);
            }
            newTokens[targetIndex] = flip(newTokens[targetIndex]);
            if (targetIndex < tokens.length - 1) {
                newTokens[targetIndex + 1] = flip(newTokens[targetIndex + 1]);
            }
            return newTokens;
        }
    };
}

// Create a row flip card for testing
function createRowFlipCard(id: string): Card {
    return {
        id,
        name: 'Row Flip',
        description: 'Flip all tokens',
        requiresTarget: false,
        execute: (tokens: TokenColor[]): TokenColor[] => {
            return tokens.map(color => color === 'R' ? 'B' : 'R');
        }
    };
}

describe('GameLogic.calculateMinimumMoves', () => {
    describe('Edge Cases', () => {
        test('should return 0 when tokens already match target', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const cards = [createSingleFlipCard('card1')];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(0);
        });

        test('should handle empty card array', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'R', 'B'];
            const cards: Card[] = [];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(10); // Should return max moves when no solution
        });

        test('should return max moves when puzzle is unsolvable', () => {
            // Create a scenario where single flips can't solve it
            // But actually any flip pattern can be solved, so this tests the depth limit
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [createAdjacentFlipCard('adj1')]; // Only adjacent flips, complex path

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            // Should find a solution or return max if too complex
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(10);
        });
    });

    describe('Single Move Solutions', () => {
        test('should find 1-move solution with row flip', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [createRowFlipCard('row1')];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1);
        });

        test('should find 1-move solution with single flip', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'B', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [createSingleFlipCard('single1')];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1);
        });

        test('should find 1-move solution with adjacent flip', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [createAdjacentFlipCard('adj1')];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1); // Flip index 1 affects 0, 1, 2
        });
    });

    describe('Two Move Solutions', () => {
        test('should find 2-move solution with single flips', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [createSingleFlipCard('s1'), createSingleFlipCard('s2')];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(2); // Flip position 0 and 2
        });

        test('should find 2-move solution with mixed cards', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'B', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createAdjacentFlipCard('adj1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeLessThanOrEqual(2);
        });
    });

    describe('Optimal Path Selection', () => {
        test('should find shortest path when multiple solutions exist', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'B', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createRowFlipCard('row1') // Row flip would need 2 moves (flip all, then flip 4)
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1); // Single flip at position 0 is optimal
        });

        test('should prefer row flip when it is optimal', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createSingleFlipCard('s3'),
                createSingleFlipCard('s4'),
                createSingleFlipCard('s5'),
                createRowFlipCard('row1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1); // Row flip is better than 5 single flips
        });
    });

    describe('Complex Multi-Move Solutions', () => {
        test('should find 3-move solution', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createSingleFlipCard('s3')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(3); // Flip positions 0, 2, 4
        });

        test('should find solution with adjacent flips efficiently', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'B', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createAdjacentFlipCard('adj1'),
                createAdjacentFlipCard('adj2')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeLessThanOrEqual(3);
            expect(result).toBeGreaterThan(0);
        });

        test('should handle complex pattern requiring multiple card types', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'B', 'R'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createAdjacentFlipCard('adj1'),
                createRowFlipCard('row1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(10);
        });
    });

    describe('State Space Exploration', () => {
        test('should avoid revisiting same state', () => {
            // Test that BFS doesn't get stuck in cycles
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'R', 'B'];
            const cards = [
                createRowFlipCard('row1'),
                createRowFlipCard('row2') // Duplicate row flip
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1); // Should efficiently find row flip solution
        });

        test('should handle maximum depth limit', () => {
            // Create a complex scenario
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'R', 'B'];
            const cards = [
                createSingleFlipCard('s1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            // Should either find solution or return max depth (10)
            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(10);
        });
    });

    describe('Card Type Combinations', () => {
        test('should handle only single flip cards', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'B', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createSingleFlipCard('s3')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(2);
        });

        test('should handle only adjacent flip cards', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createAdjacentFlipCard('adj1'),
                createAdjacentFlipCard('adj2')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(10);
        });

        test('should handle only row flip cards', () => {
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createRowFlipCard('row1'),
                createRowFlipCard('row2')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1);
        });

        test('should handle mixed card deck efficiently', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'R', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createAdjacentFlipCard('adj1'),
                createRowFlipCard('row1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(4);
        });
    });

    describe('Specific Game Scenarios', () => {
        test('should calculate correct minimum for typical game hand', () => {
            // Simulate a realistic game scenario
            const startTokens: TokenColor[] = ['R', 'B', 'B', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'B', 'R', 'R', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createAdjacentFlipCard('adj1'),
                createRowFlipCard('row1'),
                createSingleFlipCard('s3')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(5);
        });

        test('should handle worst case efficiently', () => {
            // Pattern requiring maximum complexity
            const startTokens: TokenColor[] = ['R', 'R', 'R', 'R', 'R'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'R', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createAdjacentFlipCard('adj1')
            ];

            const startTime = Date.now();
            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            const endTime = Date.now();

            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(10);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
        });
    });

    describe('BFS Algorithm Correctness', () => {
        test('should explore breadth-first (shortest path first)', () => {
            // Scenario where depth-first would find longer path
            const startTokens: TokenColor[] = ['R', 'B', 'B', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createRowFlipCard('row1'),
                createAdjacentFlipCard('adj1')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(1); // BFS should find single flip first
        });

        test('should not count same card multiple times incorrectly', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'B'];
            const targetTokens: TokenColor[] = ['B', 'B', 'B', 'B', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2')
            ];

            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            expect(result).toBe(2); // Should use 2 different cards, not same card twice
        });
    });

    describe('Performance Tests', () => {
        test('should complete within reasonable time for complex scenario', () => {
            const startTokens: TokenColor[] = ['R', 'B', 'R', 'B', 'R'];
            const targetTokens: TokenColor[] = ['B', 'R', 'B', 'R', 'B'];
            const cards = [
                createSingleFlipCard('s1'),
                createSingleFlipCard('s2'),
                createSingleFlipCard('s3'),
                createAdjacentFlipCard('adj1'),
                createAdjacentFlipCard('adj2'),
                createRowFlipCard('row1')
            ];

            const startTime = Date.now();
            const result = GameLogic.calculateMinimumMoves(startTokens, targetTokens, cards);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(500); // Should be fast
            expect(result).toBeGreaterThanOrEqual(1);
        });
    });
});
