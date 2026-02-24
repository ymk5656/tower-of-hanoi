// Auto Solver with Hint Feature

export class AutoSolver {
    constructor(gameState, gameLogic, uiController) {
        this.state = gameState;
        this.logic = gameLogic;
        this.ui = uiController;
        this.moveQueue = [];
        this.currentMoveIndex = 0;
        this.isPaused = false;
        this.timeoutId = null;
    }

    // Generate solution moves using recursive algorithm
    generateSolution(n, source, target, auxiliary, moves = []) {
        if (n === 1) {
            moves.push({ from: source, to: target });
            return moves;
        }

        // Move n-1 disks from source to auxiliary
        this.generateSolution(n - 1, source, auxiliary, target, moves);

        // Move largest disk from source to target
        moves.push({ from: source, to: target });

        // Move n-1 disks from auxiliary to target
        this.generateSolution(n - 1, auxiliary, target, source, moves);

        return moves;
    }

    // Generate solution from current state
    generateSolutionFromCurrentState() {
        const moves = [];
        const currentState = this.state.getSnapshot();

        // Find where each disk is located
        const diskLocations = new Array(this.state.diskCount + 1).fill(-1);

        for (let tower = 0; tower < 3; tower++) {
            for (const disk of this.state.towers[tower]) {
                diskLocations[disk] = tower;
            }
        }

        // Strategy: Move all disks to target tower (tower 2)
        // We'll solve this by finding the optimal sequence from current state
        this.solvefromCurrentState(diskLocations, 2, moves);

        return moves;
    }

    // Solve Tower of Hanoi from current state to target tower
    solvefromCurrentState(diskLocations, targetTower, moves) {
        const n = this.state.diskCount;

        // Helper function to find available auxiliary tower
        const getAuxiliaryTower = (exclude1, exclude2) => {
            for (let i = 0; i < 3; i++) {
                if (i !== exclude1 && i !== exclude2) return i;
            }
            return 0;
        };

        // Recursive function to move disk n from current location to target
        const moveDiskToTarget = (disk, target) => {
            const currentLocation = diskLocations[disk];

            if (currentLocation === target) {
                return; // Already at target
            }

            // Move all smaller disks out of the way
            const auxiliary = getAuxiliaryTower(currentLocation, target);
            for (let smallerDisk = disk - 1; smallerDisk >= 1; smallerDisk--) {
                if (diskLocations[smallerDisk] === target) {
                    // Smaller disk is blocking target, move it to auxiliary
                    moveDiskToTarget(smallerDisk, auxiliary);
                } else if (diskLocations[smallerDisk] === currentLocation) {
                    // Smaller disk is on top of current disk, move it away
                    moveDiskToTarget(smallerDisk, auxiliary);
                }
            }

            // Now move the disk
            moves.push({ from: currentLocation, to: target });
            diskLocations[disk] = target;
        };

        // Move disks from largest to smallest
        for (let disk = n; disk >= 1; disk--) {
            moveDiskToTarget(disk, targetTower);
        }
    }

    // Get hint for next optimal move
    getHint() {
        const solution = this.generateSolutionFromCurrentState();

        if (solution.length === 0) {
            return null; // Already solved
        }

        return solution[0]; // Return first move as hint
    }

    // Start auto-solve
    async start() {
        if (this.state.gameStatus !== 'playing') {
            return;
        }

        this.state.gameStatus = 'auto-solving';
        this.state.isAutoSolving = true;
        this.isPaused = false;
        this.currentMoveIndex = 0;

        // Generate solution from current state
        this.moveQueue = this.generateSolutionFromCurrentState();

        // Start executing moves
        await this.executeNextMove();
    }

    // Execute next move in queue
    async executeNextMove() {
        if (this.isPaused || this.currentMoveIndex >= this.moveQueue.length) {
            this.stop();
            return;
        }

        const move = this.moveQueue[this.currentMoveIndex];

        // Validate move is still valid (in case user manually moved)
        if (this.logic.canMoveDisk(move.from, move.to)) {
            // Execute move
            const disk = this.state.getTopDisk(move.from);
            this.logic.moveDisk(move.from, move.to);

            // Update UI
            await this.ui.animateDiskMove(move.from, move.to, disk);

            // Check win condition
            if (this.logic.checkWin()) {
                this.ui.showVictory();
                this.stop();
                return;
            }

            this.currentMoveIndex++;

            // Schedule next move
            this.timeoutId = setTimeout(() => {
                this.executeNextMove();
            }, this.state.autoSolveSpeed);
        } else {
            // Move is no longer valid, regenerate solution
            this.currentMoveIndex = 0;
            this.moveQueue = this.generateSolutionFromCurrentState();
            this.executeNextMove();
        }
    }

    // Pause auto-solve
    pause() {
        this.isPaused = true;
        this.state.isAutoSolving = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    // Resume auto-solve
    resume() {
        if (this.currentMoveIndex < this.moveQueue.length) {
            this.isPaused = false;
            this.state.isAutoSolving = true;
            this.state.gameStatus = 'auto-solving';
            this.executeNextMove();
        }
    }

    // Stop auto-solve
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

    // Check if auto-solve is running
    isRunning() {
        return this.state.isAutoSolving && !this.isPaused;
    }
}
