// Orientation Manager - Screen Orientation Handling

export class OrientationManager {
    constructor(gameState) {
        this.state = gameState;
        this.rotatePromptEl = document.getElementById('rotatePrompt');

        // Bind methods
        this.handleOrientationChange = this.handleOrientationChange.bind(this);
    }

    // Initialize orientation handling
    init() {
        // Listen to orientation change
        window.addEventListener('orientationchange', this.handleOrientationChange);
        window.addEventListener('resize', this.handleOrientationChange);

        // Check initial orientation
        this.handleOrientationChange();
    }

    // Handle orientation change
    handleOrientationChange() {
        const isPortrait = window.innerHeight > window.innerWidth;

        // Show rotate prompt if in landscape mode during gameplay
        if (!isPortrait && this.state.gameStatus === 'playing') {
            this.showRotatePrompt();
        } else {
            this.hideRotatePrompt();
        }
    }

    // Show rotate prompt
    showRotatePrompt() {
        if (this.rotatePromptEl) {
            this.rotatePromptEl.style.display = 'flex';
        }
    }

    // Hide rotate prompt
    hideRotatePrompt() {
        if (this.rotatePromptEl) {
            this.rotatePromptEl.style.display = 'none';
        }
    }

    // Notify that game ended (allow landscape mode)
    onGameEnd() {
        this.hideRotatePrompt();
    }

    // Cleanup
    destroy() {
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleOrientationChange);
    }
}
