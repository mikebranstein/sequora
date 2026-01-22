import { GameState, Card, TokenColor } from '../../shared/types';
import { GameLogic } from './gameLogic';

/**
 * GameRenderer - handles all DOM manipulation and visual updates
 */
export class GameRenderer {
    private tokensContainer: HTMLElement;
    private targetContainer: HTMLElement;
    private cardsContainer: HTMLElement;
    private messageElement: HTMLElement;
    private scoreElement: HTMLElement;
    private totalScoreElement: HTMLElement;
    private restartButton: HTMLElement;
    private viewDeckButton: HTMLElement;
    private deckModal: HTMLElement;
    private deckCardsContainer: HTMLElement;
    private closeDeckButton: HTMLElement;
    private roundInfoElement: HTMLElement;
    private nextRoundButton: HTMLElement;
    private roundCompleteOverlay: HTMLElement;
    private historyPanel: HTMLElement;
    private selectedCard: Card | null = null;
    private multipliers: number[];
    private isAnimating: boolean = false;
    private audioContext: AudioContext | null = null;

    // Event callbacks
    public onCardClick: (cardId: string) => void = () => {};
    public onTokenClick: (tokenIndex: number) => void = () => {};
    public onRestartClick: () => void = () => {};

    constructor() {
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
        this.roundInfoElement = this.getOrCreateElement('round-info');
        this.nextRoundButton = this.getOrCreateElement('next-round-button', 'button');
        this.roundCompleteOverlay = this.getOrCreateElement('round-complete-overlay');
        this.historyPanel = this.getOrCreateElement('history-panel');
        this.multipliers = GameLogic.getMultipliers();
        
        this.setupGameBoard();
        this.setupRestartButton();
        this.setupDeckView();
        this.setupNextRoundButton();
        this.setupRoundCompleteOverlay();
        this.initAudio();
    }
    
    private setupGameBoard(): void {
        // Create game board wrapper if it doesn't exist
        let gameBoard = document.querySelector('.game-board');
        if (!gameBoard) {
            gameBoard = document.createElement('div');
            gameBoard.className = 'game-board';
            
            // Create header for integrated info - single line: round info | round score | total score
            const header = document.createElement('div');
            header.className = 'game-board-header';
            
            header.appendChild(this.roundInfoElement);
            header.appendChild(this.scoreElement);
            header.appendChild(this.totalScoreElement);
            
            gameBoard.appendChild(header);
            
            // Insert before target container
            const container = document.getElementById('game-container');
            if (container && this.targetContainer.parentNode === container) {
                container.insertBefore(gameBoard, this.targetContainer);
            }
        }
    }
    
    private initAudio(): void {
        // Initialize AudioContext on first user interaction to comply with browser policies
        const initContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            document.removeEventListener('click', initContext);
        };
        document.addEventListener('click', initContext);
    }
    
    private playScoreSound(frequency: number = 800, duration: number = 0.1): void {
        if (!this.audioContext) return;
        
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
    
    private playSkipSound(): void {
        if (!this.audioContext) return;
        
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
    
    private playPerfectSound(): void {
        if (!this.audioContext) return;
        
        const currentTime = this.audioContext.currentTime;
        const duration = 1.5;
        
        // Create bell-like sound with multiple harmonics at high pitch
        const frequencies = [1400, 1750, 2100, 2800]; // Harmonic series based on final token pitch
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext!.createOscillator();
            const gainNode = this.audioContext!.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext!.destination);
            
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

    private getOrCreateElement(id: string, tagName: string = 'div'): HTMLElement {
        let element = document.getElementById(id);
        if (!element) {
            element = document.createElement(tagName);
            element.id = id;
            document.body.appendChild(element);
        }
        return element;
    }

    private setupRestartButton(): void {
        this.restartButton.textContent = 'Restart Game';
        this.restartButton.addEventListener('click', () => {
            this.isAnimating = false;
            this.scoreElement.classList.remove('final-score');
            this.onRestartClick();
        });
    }
    
    private setupNextRoundButton(): void {
        this.nextRoundButton.textContent = 'Next Round';
        this.nextRoundButton.classList.add('hidden');
    }
    
    private setupRoundCompleteOverlay(): void {
        this.roundCompleteOverlay.classList.add('hidden');
    }
    
    public showNextRoundButton(callback: () => void): void {
        // This method is kept for compatibility but now shows the overlay
        this.showRoundCompleteOverlay(callback);
    }
    
    public showRoundCompleteOverlay(callback: () => void): void {
        // Get current game state info from the DOM
        const roundScoreText = this.scoreElement.textContent || 'Round: 0';
        const roundScore = parseInt(roundScoreText.split(':')[1]) || 0;
        const totalScoreText = this.totalScoreElement.textContent || 'Total: 0/90';
        const totalParts = totalScoreText.match(/\d+/g) || ['0', '90'];
        const totalScore = parseInt(totalParts[0]);
        const targetScore = parseInt(totalParts[1]);
        const progressPercent = Math.min(100, (totalScore / targetScore) * 100);
        
        this.roundCompleteOverlay.innerHTML = `
            <div class="round-complete-content">
                <h2>Round Complete!</h2>
                <div class="round-stats">
                    <div class="stat-item round-earned">
                        <div class="stat-label">Points Earned</div>
                        <div class="stat-value">+${roundScore}</div>
                    </div>
                    <div class="stat-item total-progress">
                        <div class="stat-label">Total Progress</div>
                        <div class="stat-value">${totalScore} / ${targetScore}</div>
                        <div class="progress-bar-large">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
                <button class="continue-button">Continue to Next Round</button>
            </div>
        `;
        
        this.roundCompleteOverlay.classList.remove('hidden');
        
        // Add click handler to continue button
        const continueButton = this.roundCompleteOverlay.querySelector('.continue-button');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.hideRoundCompleteOverlay();
                callback();
            });
        }
    }
    
    public hideNextRoundButton(): void {
        this.nextRoundButton.classList.add('hidden');
        this.hideRoundCompleteOverlay();
    }
    
    public hideRoundCompleteOverlay(): void {
        this.roundCompleteOverlay.classList.add('hidden');
    }

    private setupDeckView(): void {
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

    private showDeckModal(): void {
        this.deckModal.classList.remove('hidden');
    }

    private hideDeckModal(): void {
        this.deckModal.classList.add('hidden');
    }

    private renderDeck(deck: Card[], currentHand: Card[]): void {
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

    public setSelectedCard(card: Card | null): void {
        this.selectedCard = card;
    }

    private renderTargetColors(targetColors: TokenColor[]): void {
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
    }

    public render(gameState: GameState): void {
        this.renderTargetColors(gameState.targetColors);
        this.renderTokens(gameState.tokens);
        this.renderCards(gameState.hand);
        this.renderHistory(gameState.playHistory);
        
        // Only show score during round end, otherwise show 0 or "-"
        if (gameState.isRoundOver) {
            this.renderScore(gameState.score);
        } else {
            this.renderScore(0);
        }
        
        // Always show total score in separate area
        this.renderTotalScore(gameState.totalScore, gameState.targetScore, false);
        
        this.renderRoundInfo(gameState.currentRound, gameState.maxRounds, gameState.totalScore, gameState.targetScore);
        this.renderMessage(gameState.message, gameState.isGameOver);
        this.renderDeck(gameState.deck, gameState.hand);
    }
    
    public async animateScore(gameState: GameState): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;
        await this.animateScoreCalculation(gameState.tokens, gameState.scoreBreakdown, gameState.targetColors);
        
        // After animation completes, if game is over, show final score
        if (gameState.isGameOver) {
            this.renderTotalScore(gameState.totalScore, gameState.targetScore, true);
        }
        
        this.isAnimating = false;
    }

    private renderTokens(tokens: TokenColor[]): void {
        // Ensure tokens container is in game board
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard && this.tokensContainer.parentNode !== gameBoard) {
            gameBoard.appendChild(this.tokensContainer);
        }
        
        this.tokensContainer.innerHTML = '';
        
        tokens.forEach((token, index) => {
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
            if (this.selectedCard?.requiresTarget) {
                tokenElement.classList.add('selectable');
            }
            
            tokenWrapper.appendChild(tokenElement);
            this.tokensContainer.appendChild(tokenWrapper);
        });
    }

    private renderCards(hand: Card[]): void {
        this.cardsContainer.innerHTML = '';

        if (hand.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-hand-message';
            emptyMessage.textContent = 'No cards remaining';
            this.cardsContainer.appendChild(emptyMessage);
            return;
        }

        hand.forEach((card) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;

            // Highlight selected card
            if (this.selectedCard?.id === card.id) {
                cardElement.classList.add('selected');
            }

            // Add icon based on card type
            const cardIcon = document.createElement('div');
            cardIcon.className = 'card-icon';
            if (card.name === 'Single Flip') {
                cardIcon.classList.add('icon-single-flip');
            } else if (card.name === 'Adjacent Flip') {
                cardIcon.classList.add('icon-adjacent-flip');
            } else if (card.name === 'Row Flip') {
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

    private renderMessage(message: string, isGameOver: boolean): void {
        this.messageElement.textContent = message;
        this.messageElement.className = 'message';

        if (isGameOver) {
            if (message.includes('VICTORY')) {
                this.messageElement.classList.add('victory');
            } else {
                this.messageElement.classList.add('game-over');
            }
        }
    }

    private renderScore(score: number): void {
        this.scoreElement.textContent = `Round: ${score}`;
    }
    
    private renderTotalScore(totalScore: number, targetScore: number, isGameOver: boolean): void {
        this.totalScoreElement.classList.remove('final-score', 'target-met', 'target-missed');
        
        if (isGameOver) {
            this.totalScoreElement.classList.add('final-score');
            const targetMet = totalScore >= targetScore;
            if (targetMet) {
                this.totalScoreElement.classList.add('target-met');
                this.totalScoreElement.textContent = `🏆 ${totalScore}/${targetScore} 🏆`;
            } else {
                this.totalScoreElement.classList.add('target-missed');
                this.totalScoreElement.textContent = `Final: ${totalScore}/${targetScore}`;
            }
        } else {
            this.totalScoreElement.textContent = `Total: ${totalScore}/${targetScore}`;
        }
    }
    
    private renderFinalScore(totalScore: number, targetScore: number, targetMet: boolean): void {
        this.totalScoreElement.classList.add('final-score');
        if (targetMet) {
            this.totalScoreElement.classList.add('target-met');
            this.totalScoreElement.textContent = `🏆 Final Score: ${totalScore}/${targetScore} 🏆`;
        } else {
            this.totalScoreElement.classList.add('target-missed');
            this.totalScoreElement.textContent = `Final Score: ${totalScore}/${targetScore}`;
        }
    }
    
    private renderRoundInfo(currentRound: number, maxRounds: number, totalScore: number, targetScore: number): void {
        this.roundInfoElement.innerHTML = `
            <div class="round-number">R${currentRound}/${maxRounds}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(100, (totalScore / targetScore) * 100)}%"></div>
            </div>
        `;
    }
    
    private renderHistory(playHistory: Array<{ cardName: string; beforeTokens: TokenColor[]; afterTokens: TokenColor[]; targetIndex?: number }>): void {
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

    private async animateScoreCalculation(tokens: TokenColor[], breakdown: { slot: number; multiplier: number; points: number }[], targetColors: TokenColor[]): Promise<void> {
        // Wait a moment before starting animation
        await this.delay(150);
        
        let runningTotal = 0;
        const scoredSlots = new Set(breakdown.map(b => b.slot));
        let canScore = true; // Track if we can still score tokens
        
        // Go through each token slot
        for (let i = 0; i < tokens.length; i++) {
            const slot = i + 1;
            
            // Highlight the current token
            this.highlightToken(i);
            
            if (scoredSlots.has(slot) && canScore) {
                // This token scored
                const item = breakdown.find(b => b.slot === slot)!;
                
                // Play scoring sound with dramatic pitch increase (250Hz jumps)
                this.playScoreSound(400 + (i * 250), 0.15);
                
                // Show calculation
                this.messageElement.textContent = `Slot ${slot}: 1 pt × ${item.multiplier}x = ${item.points} pts`;
                
                // Animate score increment with token-specific pitch
                await this.animateScoreIncrement(runningTotal, runningTotal + item.points, i);
                runningTotal += item.points;
                
                await this.delay(300);
                this.removeTokenHighlight(i);
            } else {
                // This token doesn't score - show skip
                this.playSkipSound();
                
                const currentColor = tokens[i] === 'R' ? 'red' : 'blue';
                const targetColor = targetColors[i] === 'R' ? 'red' : 'blue';
                this.messageElement.textContent = `Slot ${slot}: SKIP (${currentColor} token, need ${targetColor})`;
                this.showSkipIndicator(i);
                await this.delay(300);
                
                // Mark that we can't score any more tokens after this
                canScore = false;
                
                this.removeTokenHighlight(i);
            }
        }
        
        // Brief pause before returning to normal message
        await this.delay(150);
        
        if (breakdown.length === 5) {
            this.playPerfectSound();
            this.messageElement.textContent = '🎉 PERFECT! All tokens blue! 🎉';
        } else {
            this.messageElement.textContent = `Current Score: ${runningTotal}`;
        }
    }
    
    private highlightToken(index: number): void {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.add('scoring');
        }
    }
    
    private removeTokenHighlight(index: number): void {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.remove('scoring');
            tokenWrappers[index].classList.remove('skipped');
        }
    }
    
    private showSkipIndicator(index: number): void {
        const tokenWrappers = this.tokensContainer.querySelectorAll('.token-wrapper');
        if (tokenWrappers[index]) {
            tokenWrappers[index].classList.remove('scoring');
            tokenWrappers[index].classList.add('skipped');
        }
    }
    
    private async animateScoreIncrement(from: number, to: number, tokenIndex: number = 0): Promise<void> {
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
            
            await this.delay(stepDuration);
            this.scoreElement.classList.remove('score-pulse');
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
