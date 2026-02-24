// Game Logic - Move Validation and Win Detection

export class GameLogic {
    constructor(gameState) {
        this.state = gameState;
    }

    // Check if a move is valid
    canMoveDisk(fromTower, toTower) {
        // Can't move from same tower to same tower
        if (fromTower === toTower) {
            return false;
        }

        // Can't move from empty tower
        const movingDisk = this.state.getTopDisk(fromTower);
        if (movingDisk === null) {
            return false;
        }

        // Get target tower's top disk
        const targetDisk = this.state.getTopDisk(toTower);

        // Can always move to empty tower
        if (targetDisk === null) {
            return true;
        }

        // Can only place smaller disk on larger disk
        return movingDisk < targetDisk;
    }

    // Execute a disk move
    moveDisk(fromTower, toTower) {
        if (!this.canMoveDisk(fromTower, toTower)) {
            return false;
        }

        // Remove disk from source tower
        const disk = this.state.towers[fromTower].pop();

        // Add disk to target tower
        this.state.towers[toTower].push(disk);

        // Increment move count
        this.state.moveCount++;

        return true;
    }

    // Check if player wins
    checkWin() {
        if (this.state.checkWinCondition()) {
            this.state.gameStatus = 'won';
            return true;
        }
        return false;
    }

    // Get which disk can be moved from a tower (only top disk)
    getMovableDisk(towerIndex) {
        return this.state.getTopDisk(towerIndex);
    }

    // Check if a disk is the top disk (movable)
    isDiskMovable(towerIndex, diskSize) {
        const topDisk = this.state.getTopDisk(towerIndex);
        return topDisk === diskSize;
    }

    // Get tower index by position (for drag detection)
    getTowerIndexFromPosition(x, centerPositions) {
        // Find closest tower center
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

    // Validate tower indices
    isValidTower(towerIndex) {
        return towerIndex >= 0 && towerIndex <= 2;
    }
}
