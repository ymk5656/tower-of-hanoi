// Main Application Entry Point

import { GameState } from './game-state.js';
import { GameLogic } from './game-logic.js';
import { AutoSolver } from './auto-solver.js';
import { AudioManager } from './audio-manager.js';
import { UIController } from './ui-controller.js';
import { DragHandler } from './drag-handler.js';
import { OrientationManager } from './orientation.js';

class TowerOfHanoiGame {
    constructor() {
        // Initialize modules
        this.gameState = new GameState();
        this.audio = new AudioManager();
        this.ui = new UIController(this.gameState, this.audio);
        this.logic = new GameLogic(this.gameState);
        this.autoSolver = new AutoSolver(this.gameState, this.logic, this.ui);
        this.dragHandler = new DragHandler(this.gameState, this.logic, this.ui, this.audio);
        this.orientation = new OrientationManager(this.gameState);

        // DOM Elements
        this.startBtn = document.getElementById('startBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.diskRadios = document.querySelectorAll('input[name="diskCount"]');

        // Bind event handlers
        this.setupEventListeners();
    }

    // Setup event listeners
    setupEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', () => this.handleStartGame());

        // Hint button
        this.hintBtn.addEventListener('click', () => this.handleHint());

        // Auto-solve button
        this.autoSolveBtn.addEventListener('click', () => this.handleAutoSolve());

        // Reset button
        this.resetBtn.addEventListener('click', () => this.handleReset());

        // Speed slider
        this.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.gameState.setAutoSolveSpeed(speed);
            this.ui.updateSpeedValue(speed);
        });

        // Play again button
        this.playAgainBtn.addEventListener('click', () => this.handlePlayAgain());

        // Disk selection change (re-render preview)
        this.diskRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Could add preview here
            });
        });
    }

    // Handle start game
    async handleStartGame() {
        // Initialize audio (requires user interaction)
        await this.audio.init();

        // Get selected disk count
        const selectedRadio = document.querySelector('input[name="diskCount"]:checked');
        const diskCount = parseInt(selectedRadio.value);

        // Initialize game
        this.gameState.initGame(diskCount);

        // Render game
        this.ui.renderGameStart();

        // Enable drag
        this.dragHandler.enable();

        // Initialize orientation manager
        this.orientation.init();
    }

    // Handle hint
    handleHint() {
        if (this.gameState.gameStatus !== 'playing') {
            return;
        }

        // Get hint from auto-solver
        const hint = this.autoSolver.getHint();

        // Show hint
        this.ui.showHint(hint);
    }

    // Handle auto-solve
    handleAutoSolve() {
        if (this.autoSolver.isRunning()) {
            // Pause auto-solve
            this.autoSolver.pause();
            this.ui.updateAutoSolveButton(false, true);
            this.ui.hideSpeedControl();
        } else if (this.gameState.gameStatus === 'auto-solving') {
            // Resume auto-solve
            this.autoSolver.resume();
            this.ui.updateAutoSolveButton(true, false);
            this.ui.showSpeedControl();
        } else {
            // Start auto-solve
            this.autoSolver.start();
            this.ui.updateAutoSolveButton(true, false);
            this.ui.showSpeedControl();

            // Disable manual dragging during auto-solve
            this.dragHandler.disable();
        }
    }

    // Handle reset
    handleReset() {
        // Stop auto-solve if running
        if (this.autoSolver.isRunning()) {
            this.autoSolver.stop();
            this.ui.updateAutoSolveButton(false, false);
            this.ui.hideSpeedControl();
        }

        // Reset game state
        this.gameState.resetGame();

        // Re-render
        this.ui.renderDisks();
        this.ui.updateMoveCount();

        // Re-enable dragging
        this.dragHandler.enable();

        // Hide hint
        this.ui.hideHint();
    }

    // Handle play again
    handlePlayAgain() {
        // Hide victory modal
        this.ui.hideVictory();

        // Notify orientation manager
        this.orientation.onGameEnd();

        // Reset to setup
        this.gameState.gameStatus = 'setup';
        this.ui.renderSetup();

        // Disable dragging
        this.dragHandler.disable();
    }

    // Initialize application
    init() {
        // Render initial setup
        this.ui.renderSetup();

        // Initialize speed slider value
        this.ui.updateSpeedValue(this.gameState.autoSolveSpeed);

        console.log('Tower of Hanoi game initialized');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new TowerOfHanoiGame();
    game.init();
});
