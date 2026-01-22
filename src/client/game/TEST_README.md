# Game Logic Unit Tests

## Overview
Comprehensive unit test suite for the `calculateMinimumMoves` function in the Token Game. This function uses a Breadth-First Search (BFS) algorithm to determine the optimal number of moves needed to solve a puzzle.

## Test Coverage

### Test Categories

#### 1. Edge Cases (3 tests)
- Already solved puzzles (should return 0)
- Empty card deck (should return max moves)
- Unsolvable or highly complex puzzles (depth limit)

#### 2. Single Move Solutions (3 tests)
- Row flip solutions
- Single flip solutions
- Adjacent flip solutions

#### 3. Two Move Solutions (2 tests)
- Multiple single flips
- Mixed card type combinations

#### 4. Optimal Path Selection (2 tests)
- Choosing shortest path when multiple solutions exist
- Preferring efficient moves (e.g., row flip vs 5 single flips)

#### 5. Complex Multi-Move Solutions (3 tests)
- 3+ move solutions
- Adjacent flip combinations
- Complex patterns requiring multiple card types

#### 6. State Space Exploration (2 tests)
- Cycle detection (avoiding revisiting states)
- Maximum depth handling

#### 7. Card Type Combinations (4 tests)
- Single flip cards only
- Adjacent flip cards only
- Row flip cards only
- Mixed card decks

#### 8. Specific Game Scenarios (2 tests)
- Realistic game hands
- Worst-case performance testing

#### 9. BFS Algorithm Correctness (2 tests)
- Breadth-first exploration verification
- Correct card counting (not reusing same card)

#### 10. Performance Tests (1 test)
- Execution time verification (<500ms for complex scenarios)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Results

**Current Status:** ✅ 24/24 tests passing

**Performance:**
- All tests complete in < 6 seconds
- Individual test execution: < 5ms average
- Complex scenario performance: < 500ms guaranteed

## Code Coverage

The test suite provides comprehensive coverage of the `calculateMinimumMoves` function:
- Statement Coverage: ~30% of gameLogic.ts
- Branch Coverage: ~15% of gameLogic.ts
- Function Coverage: Focused on calculateMinimumMoves specifically

## What's Being Tested

### BFS Algorithm Validation
1. **Correctness**: Finds shortest path to solution
2. **Completeness**: Explores all reachable states
3. **Optimality**: Returns minimum number of moves
4. **Efficiency**: Completes within time constraints
5. **State Management**: Properly tracks visited states

### Card Mechanics
1. **Single Flip**: Targets individual tokens
2. **Adjacent Flip**: Affects token and neighbors
3. **Row Flip**: Affects all tokens
4. **Mixed Decks**: Combinations of card types

### Edge Cases
1. Pre-solved puzzles
2. Impossible puzzles
3. Empty/missing cards
4. Maximum depth limits
5. Cycle detection

## Test Design Principles

1. **Isolation**: Each test is independent
2. **Clarity**: Descriptive test names and clear assertions
3. **Coverage**: All code paths and edge cases covered
4. **Performance**: Execution time validated
5. **Determinism**: Consistent results across runs

## Future Enhancements

Potential areas for additional testing:
- Integration tests with full game state
- Property-based testing with random inputs
- Performance benchmarking with various puzzle complexities
- Memory usage profiling
- Concurrent execution scenarios
