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
    private trialInfoElement: HTMLElement;
    private nextTrialButton: HTMLElement;
    private trialCompleteOverlay: HTMLElement;
    private waveCompleteOverlay: HTMLElement;
    private historyPanel: HTMLElement;
    private hamburgerButton: HTMLElement;
    private menuDropdown: HTMLElement;
    private gameOverOverlay: HTMLElement;
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
        this.trialInfoElement = this.getOrCreateElement('trial-info');
        this.nextTrialButton = this.getOrCreateElement('next-trial-button', 'button');
        this.trialCompleteOverlay = this.getOrCreateElement('trial-complete-overlay');
        this.waveCompleteOverlay = this.getOrCreateElement('wave-complete-overlay');
        this.historyPanel = this.getOrCreateElement('history-panel');
        this.hamburgerButton = this.getOrCreateElement('hamburger-menu', 'button');
        this.menuDropdown = this.getOrCreateElement('menu-dropdown');
        this.gameOverOverlay = this.getOrCreateElement('game-over-overlay');
        this.multipliers = GameLogic.getMultipliers();
        
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
    
    private setupGameBoard(): void {
        // Create game board wrapper if it doesn't exist
        let gameBoard = document.querySelector('.game-board');
        if (!gameBoard) {
            gameBoard = document.createElement('div');
            gameBoard.className = 'game-board';
            
            // Create header for integrated info - single line: trial info | trial score | total score
            const header = document.createElement('div');
            header.className = 'game-board-header';
            
            header.appendChild(this.trialInfoElement);
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
    
    private playBonusSound(): void {
        if (!this.audioContext) return;
        
        const currentTime = this.audioContext.currentTime;
        const duration = 0.8;
        
        // Create magical sparkle sound with golden tone
        const frequencies = [800, 1000, 1200, 1600, 2000];
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext!.createOscillator();
            const gainNode = this.audioContext!.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext!.destination);
            
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
    
    private setupNextTrialButton(): void {
        this.nextTrialButton.textContent = 'Next Trial';
        this.nextTrialButton.classList.add('hidden');
    }
    
    private setupTrialCompleteOverlay(): void {
        this.trialCompleteOverlay.classList.add('hidden');
    }
    
    public showNextTrialButton(callback: () => void): void {
        // This method is kept for compatibility but now shows the overlay
        this.showTrialCompleteOverlay(callback);
    }
    
    public showTrialCompleteOverlay(callback: () => void): void {
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
                        <div class="stat-label">Points Earned</div>
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
    
    public hideNextTrialButton(): void {
        this.nextTrialButton.classList.add('hidden');
        this.hideTrialCompleteOverlay();
    }
    
    public hideTrialCompleteOverlay(): void {
        this.trialCompleteOverlay.classList.add('hidden');
    }
    
    private setupWaveCompleteOverlay(): void {
        this.waveCompleteOverlay.classList.add('hidden');
    }
    
    public showWaveCompleteOverlay(gameState: GameState, callback: () => void): void {
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
    
    public hideWaveCompleteOverlay(): void {
        this.waveCompleteOverlay.classList.add('hidden');
    }
    
    private setupGameOverOverlay(): void {
        this.gameOverOverlay.classList.add('hidden');
    }
    
    public showGameOverOverlay(gameState: GameState): void {
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
    
    public hideGameOverOverlay(): void {
        this.gameOverOverlay.classList.add('hidden');
    }
    
    private setupHamburgerMenu(): void {
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
        this.hamburgerButton.parentNode?.appendChild(this.menuDropdown);
        
        // Apply saved logo theme
        this.applyLogoTheme();
        
        // Toggle menu on hamburger click
        this.hamburgerButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuDropdown.classList.toggle('hidden');
        });
        
        // Handle menu item clicks
        this.menuDropdown.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('menu-item')) {
                const action = target.dataset.action;
                if (action === 'view-deck') {
                    this.showDeckModal();
                } else if (action === 'toggle-logo') {
                    this.toggleLogoTheme();
                } else if (action === 'quit') {
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

    private toggleLogoTheme(): void {
        const currentTheme = localStorage.getItem('logoTheme') || 'black';
        const newTheme = currentTheme === 'black' ? 'white' : 'black';
        localStorage.setItem('logoTheme', newTheme);
        this.applyLogoTheme();
    }

    private applyLogoTheme(): void {
        const theme = localStorage.getItem('logoTheme') || 'black';
        const gameLogo = document.querySelector('.game-logo') as HTMLImageElement;
        const gameHeader = document.querySelector('.game-header') as HTMLElement;
        
        if (gameLogo && gameHeader) {
            if (theme === 'white') {
                gameLogo.src = 'images/sequora_white.png';
                gameHeader.classList.add('white-theme');
                gameHeader.classList.remove('black-theme');
            } else {
                gameLogo.src = 'images/sequora_black.png';
                gameHeader.classList.add('black-theme');
                gameHeader.classList.remove('white-theme');
            }
        }
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

    private renderTargetColors(targetColors: TokenColor[], minMovesTarget?: number): void {
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

    public render(gameState: GameState): void {
        this.renderTargetColors(gameState.targetColors, gameState.minMovesTarget);
        this.renderTokens(gameState.tokens, gameState.playHistory.length);
        this.renderCards(gameState.hand);
        this.renderHistory(gameState.playHistory);
        
        // Only show score during trial end, otherwise show 0 or "-"
        if (gameState.isTrialOver) {
            this.renderScore(gameState.score);
        } else {
            this.renderScore(0);
        }
        
        // Always show wave score in score display area
        this.renderTotalScore(gameState.waveScore, gameState.waveTargetScore, false);
        
        this.renderTrialInfo(gameState.currentTrial, gameState.currentWave, gameState.maxTrials, gameState.waveScore, gameState.waveTargetScore);
        this.renderMessage(gameState.message, gameState.isGameOver);
        this.renderDeck(gameState.deck, gameState.hand);
    }
    
    public async animateScore(gameState: GameState): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;
        await this.animateScoreCalculation(gameState.tokens, gameState.scoreBreakdown, gameState.targetColors, gameState.bonusEarned);
        
        // After animation completes, if game is over, show final score
        if (gameState.isGameOver) {
            this.renderTotalScore(gameState.totalScore, gameState.targetScore, true);
        }
        
        this.isAnimating = false;
    }

    private renderTokens(tokens: TokenColor[], currentMoves?: number): void {
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
        this.scoreElement.textContent = `Trial: ${score}`;
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
            this.totalScoreElement.textContent = `Score: ${totalScore}/${targetScore}`;
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
    
    private renderTrialInfo(currentTrial: number, currentWave: number, maxTrials: number, waveScore: number, waveTargetScore: number): void {
        this.trialInfoElement.innerHTML = `
            <div class="wave-indicator">Wave ${currentWave}</div>
            <div class="trial-indicator">Trial ${currentTrial}/${maxTrials}</div>
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

    private async animateScoreCalculation(tokens: TokenColor[], breakdown: { slot: number; multiplier: number; points: number }[], targetColors: TokenColor[], bonusEarned: boolean): Promise<void> {
        // Wait a moment before starting animation
        await this.delay(150);
        
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
                this.removeTargetTokenHighlight(i);
            } else {
                // This token doesn't score - show skip
                this.playSkipSound();
                
                const currentColor = tokens[i] === 'R' ? 'red' : 'blue';
                const targetColor = targetColors[i] === 'R' ? 'red' : 'blue';
                this.messageElement.textContent = `Slot ${slot}: SKIP (${currentColor} token, need ${targetColor})`;
                this.showSkipIndicator(i);
                this.showTargetSkipIndicator(i);
                await this.delay(300);
                
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
            await this.animateScoreIncrement(runningTotal, runningTotal + 5, -1);
            runningTotal += 5;
            
            await this.delay(400);
            this.removeBonusHighlight();
            this.removeBonusTargetHighlight();
        } else {
            // Show bonus as missed
            this.showBonusSkipIndicator();
            this.showBonusTargetSkipIndicator();
            
            // Play skip sound
            this.playSkipSound();
            
            // Show missed bonus message
            this.messageElement.textContent = 'BONUS: MISSED (not all tokens match)';
            
            await this.delay(400);
            this.removeBonusSkipIndicator();
            this.removeBonusTargetSkipIndicator();
        }
        
        // Brief pause before returning to normal message
        await this.delay(150);
        
        if (breakdown.length === 5) {
            this.playPerfectSound();
            this.messageElement.textContent = bonusEarned ? '🎉 PERFECT! Bonus earned! 🎉' : '🎉 PERFECT! Target matched! 🎉';
        } else {
            this.messageElement.textContent = `Trial Score: ${runningTotal}`;
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
    
    private highlightBonusToken(): void {
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            bonusToken.parentElement?.classList.add('scoring');
        }
    }
    
    private removeBonusHighlight(): void {
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            bonusToken.parentElement?.classList.remove('scoring');
        }
    }
    
    private highlightTargetToken(index: number): void {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.add('scoring');
        }
    }
    
    private removeTargetTokenHighlight(index: number): void {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.remove('scoring');
            targetTokens[index].classList.remove('skipped');
        }
    }
    
    private showTargetSkipIndicator(index: number): void {
        const targetTokens = this.targetContainer.querySelectorAll('.target-token');
        if (targetTokens[index]) {
            targetTokens[index].classList.remove('scoring');
            targetTokens[index].classList.add('skipped');
        }
    }
    
    private highlightBonusTargetToken(): void {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.add('scoring');
        }
    }
    
    private removeBonusTargetHighlight(): void {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.remove('scoring');
        }
    }
    
    private showBonusSkipIndicator(): void {
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            bonusToken.parentElement?.classList.add('skipped');
        }
    }
    
    private removeBonusSkipIndicator(): void {
        const bonusToken = this.tokensContainer.querySelector('.token-bonus');
        if (bonusToken) {
            bonusToken.parentElement?.classList.remove('skipped');
        }
    }
    
    private showBonusTargetSkipIndicator(): void {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.add('skipped');
        }
    }
    
    private removeBonusTargetSkipIndicator(): void {
        const bonusTarget = this.targetContainer.querySelector('.target-bonus');
        if (bonusTarget) {
            bonusTarget.classList.remove('skipped');
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
