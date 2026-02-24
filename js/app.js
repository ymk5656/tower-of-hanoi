// Tower of Hanoi Game - Combined JavaScript

// ============================================================
// Game State Management
// ============================================================
class GameState {
    constructor() {
        this.diskCount = 3;
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.isAutoSolving = false;
        this.autoSolveSpeed = 500;
        this.gameStatus = 'setup';
        this.dragState = {
            isDragging: false,
            disk: null,
            diskElement: null,
            sourceTower: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
        };
    }

    initGame(diskCount) {
        this.diskCount = diskCount;
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.gameStatus = 'playing';
        this.isAutoSolving = false;

        for (let i = diskCount; i >= 1; i--) {
            this.towers[0].push(i);
        }
    }

    resetGame() {
        this.initGame(this.diskCount);
    }

    getTopDisk(towerIndex) {
        const tower = this.towers[towerIndex];
        return tower.length > 0 ? tower[tower.length - 1] : null;
    }

    getOptimalMoves() {
        return Math.pow(2, this.diskCount) - 1;
    }

    checkWinCondition() {
        return this.towers[2].length === this.diskCount;
    }

    setAutoSolveSpeed(speed) {
        this.autoSolveSpeed = speed;
    }

    getSnapshot() {
        return {
            diskCount: this.diskCount,
            towers: this.towers.map(tower => [...tower]),
            moveCount: this.moveCount,
            gameStatus: this.gameStatus
        };
    }
}

// ============================================================
// Game Logic
// ============================================================
class GameLogic {
    constructor(gameState) {
        this.state = gameState;
    }

    canMoveDisk(fromTower, toTower) {
        if (fromTower === toTower) return false;

        const movingDisk = this.state.getTopDisk(fromTower);
        if (movingDisk === null) return false;

        const targetDisk = this.state.getTopDisk(toTower);
        if (targetDisk === null) return true;

        return movingDisk < targetDisk;
    }

    moveDisk(fromTower, toTower) {
        if (!this.canMoveDisk(fromTower, toTower)) return false;

        const disk = this.state.towers[fromTower].pop();
        this.state.towers[toTower].push(disk);
        this.state.moveCount++;

        return true;
    }

    checkWin() {
        if (this.state.checkWinCondition()) {
            this.state.gameStatus = 'won';
            return true;
        }
        return false;
    }

    getMovableDisk(towerIndex) {
        return this.state.getTopDisk(towerIndex);
    }

    isDiskMovable(towerIndex, diskSize) {
        const topDisk = this.state.getTopDisk(towerIndex);
        return topDisk === diskSize;
    }

    getTowerIndexFromPosition(x, centerPositions) {
        let closestIndex = 0;
        let minDistance = Math.abs(x - centerPositions[0]);

        for (let i = 1; i < centerPositions.length; i++) {
            const distance = Math.abs(x - centerPositions[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }

        return closestIndex;
    }
}

// ============================================================
// Audio Manager
// ============================================================
class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    playNote(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const now = this.context.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (error) {
            console.warn('Error playing note:', error);
        }
    }

    playBeep() {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 440;

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            const now = this.context.currentTime;
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            oscillator.start(now);
            oscillator.stop(now + 0.15);
        } catch (error) {
            console.warn('Error playing beep:', error);
        }
    }

    async playFanfare() {
        if (!this.enabled || !this.initialized) return;

        const notes = [
            { freq: 523.25, duration: 0.2 },
            { freq: 659.25, duration: 0.2 },
            { freq: 783.99, duration: 0.2 },
            { freq: 1046.50, duration: 0.4 }
        ];

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            this.playNote(note.freq, note.duration, 'sine', 0.4);
            await this.delay(note.duration * 1000);
        }

        setTimeout(() => {
            this.playNote(523.25, 0.8, 'sine', 0.2);
            this.playNote(659.25, 0.8, 'sine', 0.2);
            this.playNote(783.99, 0.8, 'sine', 0.2);
        }, 0);
    }

    playClick() {
        if (!this.enabled || !this.initialized) return;
        this.playNote(800, 0.05, 'sine', 0.2);
    }

    playDrop() {
        if (!this.enabled || !this.initialized) return;
        this.playNote(400, 0.1, 'sine', 0.25);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================================
// UI Controller
// ============================================================
class UIController {
    constructor(gameState, audioManager) {
        this.state = gameState;
        this.audio = audioManager;

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

        this.towerContainers = [
            document.getElementById('tower0'),
            document.getElementById('tower1'),
            document.getElementById('tower2')
        ];
    }

    renderSetup(diskCount = 3) {
        this.setupControlsEl.style.display = 'flex';
        this.gameControlsEl.style.display = 'none';
        this.clearAllTowers();
        this.updateMoveCount();

        // Show preview disks on source tower
        this.renderPreviewDisks(diskCount);
    }

    renderPreviewDisks(diskCount) {
        this.clearAllTowers();

        const container = this.towerContainers[0]; // Source tower

        // Create disks from largest to smallest
        for (let i = diskCount; i >= 1; i--) {
            const diskEl = this.createDiskElement(i);
            diskEl.classList.add('appear');
            diskEl.style.animationDelay = `${(diskCount - i) * 0.1}s`;
            container.appendChild(diskEl);
        }
    }

    renderGameStart() {
        this.setupControlsEl.style.display = 'none';
        this.gameControlsEl.style.display = 'flex';
        this.speedControlEl.style.display = 'none';
        this.renderDisks();
        this.updateMoveCount();
    }

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

    createDiskElement(size) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.dataset.size = size;
        disk.textContent = size;
        return disk;
    }

    clearAllTowers() {
        this.towerContainers.forEach(container => {
            container.innerHTML = '';
        });
    }

    updateMoveCount() {
        this.moveCountEl.textContent = this.state.moveCount;
    }

    async animateDiskMove(fromTower, toTower, diskSize) {
        return new Promise((resolve) => {
            const sourceDiskEl = this.getDiskElement(fromTower, diskSize);
            if (!sourceDiskEl) {
                this.renderDisks();
                this.updateMoveCount();
                resolve();
                return;
            }

            this.audio.playDrop();
            sourceDiskEl.classList.add('moving');

            setTimeout(() => {
                this.renderDisks();
                this.updateMoveCount();
                resolve();
            }, 300);
        });
    }

    getDiskElement(towerIndex, diskSize) {
        const container = this.towerContainers[towerIndex];
        return container.querySelector(`[data-size="${diskSize}"]`);
    }

    showHint(hint) {
        if (!hint) {
            this.hintTextEl.textContent = 'Puzzle already solved!';
            this.hintDisplayEl.style.display = 'block';
            setTimeout(() => this.hideHint(), 2000);
            return;
        }

        const towerLabels = ['Source', 'Auxiliary', 'Target'];
        const disk = this.state.getTopDisk(hint.from);

        this.hintTextEl.textContent = `Move disk ${disk} from ${towerLabels[hint.from]} to ${towerLabels[hint.to]}`;
        this.hintDisplayEl.style.display = 'block';

        this.highlightHint(hint.from, hint.to);
        setTimeout(() => this.hideHint(), 3000);
    }

    hideHint() {
        this.hintDisplayEl.style.display = 'none';
        this.clearHintHighlights();
    }

    highlightHint(sourceTower, targetTower) {
        this.clearHintHighlights();

        const sourceDiskEl = this.towerContainers[sourceTower].lastElementChild;
        if (sourceDiskEl) {
            sourceDiskEl.classList.add('hint-source');
        }

        const targetTowerEl = this.towerContainers[targetTower].closest('.tower');
        if (targetTowerEl) {
            targetTowerEl.classList.add('hint-target');
        }
    }

    clearHintHighlights() {
        document.querySelectorAll('.hint-source').forEach(el => {
            el.classList.remove('hint-source');
        });
        document.querySelectorAll('.hint-target').forEach(el => {
            el.classList.remove('hint-target');
        });
    }

    showVictory() {
        this.finalMovesEl.textContent = this.state.moveCount;
        this.optimalMovesEl.textContent = this.state.getOptimalMoves();
        this.victoryModalEl.style.display = 'flex';

        this.audio.playFanfare();
        this.triggerConfetti();
    }

    hideVictory() {
        this.victoryModalEl.style.display = 'none';
    }

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

    updateSpeedValue(speed) {
        const seconds = (speed / 1000).toFixed(1);
        this.speedValueEl.textContent = `${seconds}s`;
    }

    showSpeedControl() {
        this.speedControlEl.style.display = 'flex';
    }

    hideSpeedControl() {
        this.speedControlEl.style.display = 'none';
    }

    updateAutoSolveButton(isRunning, isPaused) {
        if (isRunning) {
            this.autoSolveBtnEl.textContent = '⏸️ Pause';
        } else if (isPaused && this.state.gameStatus === 'auto-solving') {
            this.autoSolveBtnEl.textContent = '▶️ Resume';
        } else {
            this.autoSolveBtnEl.textContent = '🤖 Auto Solve';
        }
    }

    shakeDisk(diskElement) {
        diskElement.classList.add('invalid-move');
        setTimeout(() => diskElement.classList.remove('invalid-move'), 500);
    }

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

    removeAllDropTargetHighlights() {
        document.querySelectorAll('.tower').forEach(tower => {
            tower.classList.remove('drop-target', 'invalid-target');
        });
    }

    getTowerCenterPositions() {
        return this.towerContainers.map(container => {
            const rect = container.getBoundingClientRect();
            return rect.left + rect.width / 2;
        });
    }

    getTowerIndexFromElement(element) {
        const tower = element.closest('.tower');
        if (!tower) return null;
        return parseInt(tower.dataset.tower);
    }
}

// ============================================================
// Auto Solver
// ============================================================
class AutoSolver {
    constructor(gameState, gameLogic, uiController) {
        this.state = gameState;
        this.logic = gameLogic;
        this.ui = uiController;
        this.moveQueue = [];
        this.currentMoveIndex = 0;
        this.isPaused = false;
        this.timeoutId = null;
    }

    generateSolution(n, source, target, auxiliary, moves = []) {
        if (n === 1) {
            moves.push({ from: source, to: target });
            return moves;
        }

        this.generateSolution(n - 1, source, auxiliary, target, moves);
        moves.push({ from: source, to: target });
        this.generateSolution(n - 1, auxiliary, target, source, moves);

        return moves;
    }

    generateSolutionFromCurrentState() {
        const moves = [];
        const diskLocations = new Array(this.state.diskCount + 1).fill(-1);

        for (let tower = 0; tower < 3; tower++) {
            for (const disk of this.state.towers[tower]) {
                diskLocations[disk] = tower;
            }
        }

        this.solveFromCurrentState(diskLocations, 2, moves);
        return moves;
    }

    solveFromCurrentState(diskLocations, targetTower, moves) {
        const n = this.state.diskCount;

        const getAuxiliaryTower = (exclude1, exclude2) => {
            for (let i = 0; i < 3; i++) {
                if (i !== exclude1 && i !== exclude2) return i;
            }
            return 0;
        };

        const moveDiskToTarget = (disk, target) => {
            const currentLocation = diskLocations[disk];
            if (currentLocation === target) return;

            const auxiliary = getAuxiliaryTower(currentLocation, target);
            for (let smallerDisk = disk - 1; smallerDisk >= 1; smallerDisk--) {
                if (diskLocations[smallerDisk] === target) {
                    moveDiskToTarget(smallerDisk, auxiliary);
                } else if (diskLocations[smallerDisk] === currentLocation) {
                    moveDiskToTarget(smallerDisk, auxiliary);
                }
            }

            moves.push({ from: currentLocation, to: target });
            diskLocations[disk] = target;
        };

        for (let disk = n; disk >= 1; disk--) {
            moveDiskToTarget(disk, targetTower);
        }
    }

    getHint() {
        const solution = this.generateSolutionFromCurrentState();
        if (solution.length === 0) return null;
        return solution[0];
    }

    async start() {
        if (this.state.gameStatus !== 'playing') return;

        this.state.gameStatus = 'auto-solving';
        this.state.isAutoSolving = true;
        this.isPaused = false;
        this.currentMoveIndex = 0;

        this.moveQueue = this.generateSolutionFromCurrentState();
        await this.executeNextMove();
    }

    async executeNextMove() {
        if (this.isPaused || this.currentMoveIndex >= this.moveQueue.length) {
            this.stop();
            return;
        }

        const move = this.moveQueue[this.currentMoveIndex];

        if (this.logic.canMoveDisk(move.from, move.to)) {
            const disk = this.state.getTopDisk(move.from);
            this.logic.moveDisk(move.from, move.to);

            await this.ui.animateDiskMove(move.from, move.to, disk);

            if (this.logic.checkWin()) {
                this.ui.showVictory();
                this.stop();
                return;
            }

            this.currentMoveIndex++;

            this.timeoutId = setTimeout(() => {
                this.executeNextMove();
            }, this.state.autoSolveSpeed);
        } else {
            this.currentMoveIndex = 0;
            this.moveQueue = this.generateSolutionFromCurrentState();
            this.executeNextMove();
        }
    }

    pause() {
        this.isPaused = true;
        this.state.isAutoSolving = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    resume() {
        if (this.currentMoveIndex < this.moveQueue.length) {
            this.isPaused = false;
            this.state.isAutoSolving = true;
            this.state.gameStatus = 'auto-solving';
            this.executeNextMove();
        }
    }

    stop() {
        this.isPaused = true;
        this.state.isAutoSolving = false;
        if (this.state.gameStatus === 'auto-solving') {
            this.state.gameStatus = 'playing';
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.moveQueue = [];
        this.currentMoveIndex = 0;
    }

    isRunning() {
        return this.state.isAutoSolving && !this.isPaused;
    }
}

// ============================================================
// Drag Handler
// ============================================================
class DragHandler {
    constructor(gameState, gameLogic, uiController, audioManager) {
        this.state = gameState;
        this.logic = gameLogic;
        this.ui = uiController;
        this.audio = audioManager;

        this.draggedElement = null;
        this.sourceTower = null;
        this.initialX = 0;
        this.initialY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.offsetX = 0;
        this.offsetY = 0;

        this.handlePointerStart = this.handlePointerStart.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerEnd = this.handlePointerEnd.bind(this);
    }

    attachEvents() {
        document.addEventListener('mousedown', this.handlePointerStart);
        document.addEventListener('mousemove', this.handlePointerMove);
        document.addEventListener('mouseup', this.handlePointerEnd);

        document.addEventListener('touchstart', this.handlePointerStart, { passive: false });
        document.addEventListener('touchmove', this.handlePointerMove, { passive: false });
        document.addEventListener('touchend', this.handlePointerEnd);
        document.addEventListener('touchcancel', this.handlePointerEnd);
    }

    detachEvents() {
        document.removeEventListener('mousedown', this.handlePointerStart);
        document.removeEventListener('mousemove', this.handlePointerMove);
        document.removeEventListener('mouseup', this.handlePointerEnd);

        document.removeEventListener('touchstart', this.handlePointerStart);
        document.removeEventListener('touchmove', this.handlePointerMove);
        document.removeEventListener('touchend', this.handlePointerEnd);
        document.removeEventListener('touchcancel', this.handlePointerEnd);
    }

    getPointerPosition(event) {
        if (event.touches && event.touches.length > 0) {
            return {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
        return {
            x: event.clientX,
            y: event.clientY
        };
    }

    handlePointerStart(event) {
        if (this.state.gameStatus !== 'playing') return;

        const target = event.target;
        if (!target.classList.contains('disk')) return;

        const towerIndex = this.ui.getTowerIndexFromElement(target);
        if (towerIndex === null) return;

        const diskSize = parseInt(target.dataset.size);
        if (!this.logic.isDiskMovable(towerIndex, diskSize)) return;

        event.preventDefault();

        const pos = this.getPointerPosition(event);
        const rect = target.getBoundingClientRect();

        this.draggedElement = target;
        this.sourceTower = towerIndex;
        this.initialX = rect.left;
        this.initialY = rect.top;
        this.currentX = rect.left;
        this.currentY = rect.top;
        this.offsetX = pos.x - rect.left;
        this.offsetY = pos.y - rect.top;

        this.draggedElement.classList.add('dragging');
        this.draggedElement.style.position = 'fixed';
        this.draggedElement.style.zIndex = '1000';
        this.draggedElement.style.left = this.currentX + 'px';
        this.draggedElement.style.top = this.currentY + 'px';
        this.draggedElement.style.pointerEvents = 'none';

        this.audio.playClick();
        this.state.dragState.isDragging = true;
    }

    handlePointerMove(event) {
        if (!this.state.dragState.isDragging || !this.draggedElement) return;

        event.preventDefault();

        const pos = this.getPointerPosition(event);

        this.currentX = pos.x - this.offsetX;
        this.currentY = pos.y - this.offsetY;

        this.draggedElement.style.left = this.currentX + 'px';
        this.draggedElement.style.top = this.currentY + 'px';

        this.updateDropTargetHighlight(pos.x);
    }

    async handlePointerEnd(event) {
        if (!this.state.dragState.isDragging || !this.draggedElement) return;

        event.preventDefault();

        const pos = this.getPointerPosition(event.changedTouches ? event.changedTouches[0] : event);

        this.state.dragState.isDragging = false;

        this.ui.removeAllDropTargetHighlights();

        const towerCenters = this.ui.getTowerCenterPositions();
        const targetTower = this.logic.getTowerIndexFromPosition(pos.x, towerCenters);

        if (this.logic.canMoveDisk(this.sourceTower, targetTower)) {
            const diskSize = parseInt(this.draggedElement.dataset.size);
            this.logic.moveDisk(this.sourceTower, targetTower);

            this.draggedElement.remove();
            this.draggedElement = null;

            this.ui.renderDisks();
            this.ui.updateMoveCount();

            this.audio.playDrop();

            if (this.logic.checkWin()) {
                this.ui.showVictory();
            }
        } else {
            this.animateReturnToSource();
            this.audio.playBeep();

            setTimeout(() => {
                this.ui.shakeDisk(this.draggedElement);
            }, 300);
        }
    }

    updateDropTargetHighlight(x) {
        const towerCenters = this.ui.getTowerCenterPositions();
        const targetTower = this.logic.getTowerIndexFromPosition(x, towerCenters);

        this.ui.removeAllDropTargetHighlights();

        const isValid = this.logic.canMoveDisk(this.sourceTower, targetTower);
        this.ui.addDropTargetHighlight(targetTower, isValid);
    }

    animateReturnToSource() {
        if (!this.draggedElement) return;

        this.draggedElement.style.transition = 'all 0.3s ease-out';
        this.draggedElement.style.left = this.initialX + 'px';
        this.draggedElement.style.top = this.initialY + 'px';

        setTimeout(() => {
            if (!this.draggedElement) return;

            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.position = '';
            this.draggedElement.style.zIndex = '';
            this.draggedElement.style.left = '';
            this.draggedElement.style.top = '';
            this.draggedElement.style.transition = '';
            this.draggedElement.style.pointerEvents = '';

            this.draggedElement = null;
        }, 300);
    }

    enable() {
        this.attachEvents();
    }

    disable() {
        this.detachEvents();

        if (this.state.dragState.isDragging && this.draggedElement) {
            this.animateReturnToSource();
            this.state.dragState.isDragging = false;
        }
    }
}

// ============================================================
// Orientation Manager
// ============================================================
class OrientationManager {
    constructor(gameState) {
        this.state = gameState;
        this.rotatePromptEl = document.getElementById('rotatePrompt');
        this.isMobile = this.detectMobile();

        this.handleOrientationChange = this.handleOrientationChange.bind(this);
    }

    detectMobile() {
        // Detect if device is mobile
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    init() {
        // Only enable orientation checking on mobile devices
        if (!this.isMobile) {
            this.hideRotatePrompt();
            return;
        }

        window.addEventListener('orientationchange', this.handleOrientationChange);
        window.addEventListener('resize', this.handleOrientationChange);
    }

    handleOrientationChange() {
        if (!this.isMobile) {
            this.hideRotatePrompt();
            return;
        }

        const isPortrait = window.innerHeight > window.innerWidth;

        if (!isPortrait && this.state.gameStatus === 'playing') {
            this.showRotatePrompt();
        } else {
            this.hideRotatePrompt();
        }
    }

    showRotatePrompt() {
        if (this.rotatePromptEl && this.isMobile) {
            this.rotatePromptEl.style.display = 'flex';
        }
    }

    hideRotatePrompt() {
        if (this.rotatePromptEl) {
            this.rotatePromptEl.style.display = 'none';
        }
    }

    onGameEnd() {
        this.hideRotatePrompt();
    }

    destroy() {
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        window.removeEventListener('resize', this.handleOrientationChange);
    }
}

// ============================================================
// Main Application
// ============================================================
class TowerOfHanoiGame {
    constructor() {
        this.gameState = new GameState();
        this.audio = new AudioManager();
        this.ui = new UIController(this.gameState, this.audio);
        this.logic = new GameLogic(this.gameState);
        this.autoSolver = new AutoSolver(this.gameState, this.logic, this.ui);
        this.dragHandler = new DragHandler(this.gameState, this.logic, this.ui, this.audio);
        this.orientation = new OrientationManager(this.gameState);

        this.startBtn = document.getElementById('startBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.autoSolveBtn = document.getElementById('autoSolveBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.diskRadios = document.querySelectorAll('input[name="diskCount"]');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.handleStartGame());
        this.hintBtn.addEventListener('click', () => this.handleHint());
        this.autoSolveBtn.addEventListener('click', () => this.handleAutoSolve());
        this.resetBtn.addEventListener('click', () => this.handleReset());

        this.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.gameState.setAutoSolveSpeed(speed);
            this.ui.updateSpeedValue(speed);
        });

        this.playAgainBtn.addEventListener('click', () => this.handlePlayAgain());

        // Disk count selection change - update preview
        this.diskRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const diskCount = parseInt(e.target.value);
                this.ui.renderPreviewDisks(diskCount);
            });
        });
    }

    async handleStartGame() {
        await this.audio.init();

        const selectedRadio = document.querySelector('input[name="diskCount"]:checked');
        const diskCount = parseInt(selectedRadio.value);

        this.gameState.initGame(diskCount);
        this.ui.renderGameStart();
        this.dragHandler.enable();
        this.orientation.init();
    }

    handleHint() {
        if (this.gameState.gameStatus !== 'playing') return;

        const hint = this.autoSolver.getHint();
        this.ui.showHint(hint);
    }

    handleAutoSolve() {
        if (this.autoSolver.isRunning()) {
            this.autoSolver.pause();
            this.ui.updateAutoSolveButton(false, true);
            this.ui.hideSpeedControl();
        } else if (this.gameState.gameStatus === 'auto-solving') {
            this.autoSolver.resume();
            this.ui.updateAutoSolveButton(true, false);
            this.ui.showSpeedControl();
        } else {
            this.autoSolver.start();
            this.ui.updateAutoSolveButton(true, false);
            this.ui.showSpeedControl();
            this.dragHandler.disable();
        }
    }

    handleReset() {
        if (this.autoSolver.isRunning()) {
            this.autoSolver.stop();
            this.ui.updateAutoSolveButton(false, false);
            this.ui.hideSpeedControl();
        }

        this.gameState.resetGame();
        this.ui.renderDisks();
        this.ui.updateMoveCount();
        this.dragHandler.enable();
        this.ui.hideHint();
    }

    handlePlayAgain() {
        this.ui.hideVictory();
        this.orientation.onGameEnd();
        this.gameState.gameStatus = 'setup';

        // Get currently selected disk count
        const selectedRadio = document.querySelector('input[name="diskCount"]:checked');
        const diskCount = selectedRadio ? parseInt(selectedRadio.value) : 3;

        this.ui.renderSetup(diskCount);
        this.dragHandler.disable();
    }

    init() {
        this.ui.renderSetup(3);
        this.ui.updateSpeedValue(this.gameState.autoSolveSpeed);
        console.log('Tower of Hanoi game initialized');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new TowerOfHanoiGame();
    game.init();
});
