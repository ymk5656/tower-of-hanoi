// UI Controller - DOM Manipulation and Visual Updates

export class UIController {
    constructor(gameState, audioManager) {
        this.state = gameState;
        this.audio = audioManager;

        // DOM Elements
        this.moveCountEl = document.getElementById('moveCount');
        this.setupControlsEl = document.getElementById('setupControls');
        this.gameControlsEl = document.getElementById('gameControls');
        this.startBtnEl = document.getElementById('startBtn');
        this.hintBtnEl = document.getElementById('hintBtn');
        this.autoSolveBtnEl = document.getElementById('autoSolveBtn');
        this.resetBtnEl = document.getElementById('resetBtn');
        this.speedControlEl = document.getElementById('speedControl');
        this.speedSliderEl = document.getElementById('speedSlider');
        this.speedValueEl = document.getElementById('speedValue');
        this.hintDisplayEl = document.getElementById('hintDisplay');
        this.hintTextEl = document.getElementById('hintText');
        this.victoryModalEl = document.getElementById('victoryModal');
        this.finalMovesEl = document.getElementById('finalMoves');
        this.optimalMovesEl = document.getElementById('optimalMoves');
        this.playAgainBtnEl = document.getElementById('playAgainBtn');

        // Tower containers
        this.towerContainers = [
            document.getElementById('tower0'),
            document.getElementById('tower1'),
            document.getElementById('tower2')
        ];
    }

    // Render initial game setup
    renderSetup() {
        this.setupControlsEl.style.display = 'flex';
        this.gameControlsEl.style.display = 'none';
        this.clearAllTowers();
        this.updateMoveCount();
    }

    // Render game start
    renderGameStart() {
        this.setupControlsEl.style.display = 'none';
        this.gameControlsEl.style.display = 'flex';
        this.speedControlEl.style.display = 'none';
        this.renderDisks();
        this.updateMoveCount();
    }

    // Render all disks
    renderDisks() {
        this.clearAllTowers();

        for (let towerIndex = 0; towerIndex < 3; towerIndex++) {
            const disks = this.state.towers[towerIndex];
            const container = this.towerContainers[towerIndex];

            disks.forEach((diskSize, index) => {
                const diskEl = this.createDiskElement(diskSize);
                diskEl.classList.add('appear');
                diskEl.style.animationDelay = `${index * 0.1}s`;
                container.appendChild(diskEl);
            });
        }
    }

    // Create disk element
    createDiskElement(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = size;
        disk.textContent = size;
        return disk;
    }

    // Clear all towers
    clearAllTowers() {
        this.towerContainers.forEach(container => {
            container.innerHTML = '';
        });
    }

    // Update move count display
    updateMoveCount() {
        this.moveCountEl.textContent = this.state.moveCount;
    }

    // Animate disk move
    async animateDiskMove(fromTower, toTower, diskSize) {
        return new Promise((resolve) => {
            const sourceDiskEl = this.getDiskElement(fromTower, diskSize);
            if (!sourceDiskEl) {
                // Disk not found, just update state
                this.renderDisks();
                this.updateMoveCount();
                resolve();
                return;
            }

            // Play drop sound
            this.audio.playDrop();

            // Add moving class
            sourceDiskEl.classList.add('moving');

            // Wait for animation
            setTimeout(() => {
                // Re-render disks
                this.renderDisks();
                this.updateMoveCount();
                resolve();
            }, 300);
        });
    }

    // Get disk element from tower
    getDiskElement(towerIndex, diskSize) {
        const container = this.towerContainers[towerIndex];
        return container.querySelector(`[data-size="${diskSize}"]`);
    }

    // Show hint
    showHint(hint) {
        if (!hint) {
            this.hintTextEl.textContent = 'Puzzle already solved!';
            this.hintDisplayEl.style.display = 'block';

            setTimeout(() => {
                this.hideHint();
            }, 2000);
            return;
        }

        const towerLabels = ['Source', 'Auxiliary', 'Target'];
        const disk = this.state.getTopDisk(hint.from);

        this.hintTextEl.textContent = `Move disk ${disk} from ${towerLabels[hint.from]} to ${towerLabels[hint.to]}`;
        this.hintDisplayEl.style.display = 'block';

        // Highlight source disk and target tower
        this.highlightHint(hint.from, hint.to);

        // Hide hint after 3 seconds
        setTimeout(() => {
            this.hideHint();
        }, 3000);
    }

    // Hide hint
    hideHint() {
        this.hintDisplayEl.style.display = 'none';
        this.clearHintHighlights();
    }

    // Highlight hint (source disk and target tower)
    highlightHint(sourceTower, targetTower) {
        // Clear previous highlights
        this.clearHintHighlights();

        // Highlight source disk
        const sourceDiskEl = this.towerContainers[sourceTower].lastElementChild;
        if (sourceDiskEl) {
            sourceDiskEl.classList.add('hint-source');
        }

        // Highlight target tower
        const targetTowerEl = this.towerContainers[targetTower].closest('.tower');
        if (targetTowerEl) {
            targetTowerEl.classList.add('hint-target');
        }
    }

    // Clear hint highlights
    clearHintHighlights() {
        document.querySelectorAll('.hint-source').forEach(el => {
            el.classList.remove('hint-source');
        });
        document.querySelectorAll('.hint-target').forEach(el => {
            el.classList.remove('hint-target');
        });
    }

    // Show victory modal
    showVictory() {
        this.finalMovesEl.textContent = this.state.moveCount;
        this.optimalMovesEl.textContent = this.state.getOptimalMoves();
        this.victoryModalEl.style.display = 'flex';

        // Play fanfare
        this.audio.playFanfare();

        // Trigger confetti
        this.triggerConfetti();
    }

    // Hide victory modal
    hideVictory() {
        this.victoryModalEl.style.display = 'none';
    }

    // Trigger confetti animation
    triggerConfetti() {
        if (typeof confetti === 'undefined') return;

        const duration = 3000;
        const end = Date.now() + duration;

        const colors = ['#E74C3C', '#F39C12', '#F1C40F', '#2ECC71', '#3498DB'];

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: colors
            });

            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }

    // Update speed slider value display
    updateSpeedValue(speed) {
        const seconds = (speed / 1000).toFixed(1);
        this.speedValueEl.textContent = `${seconds}s`;
    }

    // Show speed control
    showSpeedControl() {
        this.speedControlEl.style.display = 'flex';
    }

    // Hide speed control
    hideSpeedControl() {
        this.speedControlEl.style.display = 'none';
    }

    // Update auto-solve button text
    updateAutoSolveButton(isRunning, isPaused) {
        if (isRunning) {
            this.autoSolveBtnEl.textContent = '⏸️ Pause';
        } else if (isPaused && this.state.gameStatus === 'auto-solving') {
            this.autoSolveBtnEl.textContent = '▶️ Resume';
        } else {
            this.autoSolveBtnEl.textContent = '🤖 Auto Solve';
        }
    }

    // Shake disk for invalid move
    shakeDisk(diskElement) {
        diskElement.classList.add('invalid-move');

        setTimeout(() => {
            diskElement.classList.remove('invalid-move');
        }, 500);
    }

    // Add drop target highlight
    addDropTargetHighlight(towerIndex, isValid) {
        const towerEl = this.towerContainers[towerIndex].closest('.tower');
        if (isValid) {
            towerEl.classList.add('drop-target');
            towerEl.classList.remove('invalid-target');
        } else {
            towerEl.classList.add('invalid-target');
            towerEl.classList.remove('drop-target');
        }
    }

    // Remove all drop target highlights
    removeAllDropTargetHighlights() {
        document.querySelectorAll('.tower').forEach(tower => {
            tower.classList.remove('drop-target', 'invalid-target');
        });
    }

    // Get tower center positions for drag detection
    getTowerCenterPositions() {
        return this.towerContainers.map(container => {
            const rect = container.getBoundingClientRect();
            return rect.left + rect.width / 2;
        });
    }

    // Get tower index from element
    getTowerIndexFromElement(element) {
        const tower = element.closest('.tower');
        if (!tower) return null;
        return parseInt(tower.dataset.tower);
    }
}
