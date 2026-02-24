// Game State Management

export class GameState {
    constructor() {
        this.diskCount = 3;
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.isAutoSolving = false;
        this.autoSolveSpeed = 500; // milliseconds
        this.gameStatus = 'setup'; // 'setup', 'playing', 'won', 'auto-solving'
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

    // Initialize new game
    initGame(diskCount) {
        this.diskCount = diskCount;
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.gameStatus = 'playing';
        this.isAutoSolving = false;

        // Create disks on first tower (largest to smallest)
        for (let i = diskCount; i >= 1; i--) {
            this.towers[0].push(i);
        }
    }

    // Reset game
    resetGame() {
        this.initGame(this.diskCount);
    }

    // Get top disk from tower
    getTopDisk(towerIndex) {
        const tower = this.towers[towerIndex];
        return tower.length > 0 ? tower[tower.length - 1] : null;
    }

    // Get optimal move count (2^n - 1)
    getOptimalMoves() {
        return Math.pow(2, this.diskCount) - 1;
    }

    // Check if game is won
    checkWinCondition() {
        // All disks must be on tower 2 (target)
        return this.towers[2].length === this.diskCount;
    }

    // Set auto-solve speed
    setAutoSolveSpeed(speed) {
        this.autoSolveSpeed = speed;
    }

    // Get current state snapshot
    getSnapshot() {
        return {
            diskCount: this.diskCount,
            towers: this.towers.map(tower => [...tower]),
            moveCount: this.moveCount,
            gameStatus: this.gameStatus
        };
    }

    // Restore from snapshot
    restoreSnapshot(snapshot) {
        this.diskCount = snapshot.diskCount;
        this.towers = snapshot.towers.map(tower => [...tower]);
        this.moveCount = snapshot.moveCount;
        this.gameStatus = snapshot.gameStatus;
    }
}
