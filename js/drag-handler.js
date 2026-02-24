// Drag Handler - Mouse and Touch Support

export class DragHandler {
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

        // Bind methods
        this.handlePointerStart = this.handlePointerStart.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerEnd = this.handlePointerEnd.bind(this);
    }

    // Attach event listeners
    attachEvents() {
        // Mouse events
        document.addEventListener('mousedown', this.handlePointerStart);
        document.addEventListener('mousemove', this.handlePointerMove);
        document.addEventListener('mouseup', this.handlePointerEnd);

        // Touch events
        document.addEventListener('touchstart', this.handlePointerStart, { passive: false });
        document.addEventListener('touchmove', this.handlePointerMove, { passive: false });
        document.addEventListener('touchend', this.handlePointerEnd);
        document.addEventListener('touchcancel', this.handlePointerEnd);
    }

    // Remove event listeners
    detachEvents() {
        document.removeEventListener('mousedown', this.handlePointerStart);
        document.removeEventListener('mousemove', this.handlePointerMove);
        document.removeEventListener('mouseup', this.handlePointerEnd);

        document.removeEventListener('touchstart', this.handlePointerStart);
        document.removeEventListener('touchmove', this.handlePointerMove);
        document.removeEventListener('touchend', this.handlePointerEnd);
        document.removeEventListener('touchcancel', this.handlePointerEnd);
    }

    // Get pointer position from event
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

    // Handle pointer start (mousedown/touchstart)
    handlePointerStart(event) {
        // Only allow dragging during playing state
        if (this.state.gameStatus !== 'playing') {
            return;
        }

        // Check if clicking on a disk
        const target = event.target;
        if (!target.classList.contains('disk')) {
            return;
        }

        // Get tower index
        const towerIndex = this.ui.getTowerIndexFromElement(target);
        if (towerIndex === null) {
            return;
        }

        // Check if this disk is the top disk (movable)
        const diskSize = parseInt(target.dataset.size);
        if (!this.logic.isDiskMovable(towerIndex, diskSize)) {
            return;
        }

        // Prevent default to avoid text selection and scrolling
        event.preventDefault();

        // Initialize drag
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

        // Add dragging class
        this.draggedElement.classList.add('dragging');
        this.draggedElement.style.position = 'fixed';
        this.draggedElement.style.zIndex = '1000';
        this.draggedElement.style.left = this.currentX + 'px';
        this.draggedElement.style.top = this.currentY + 'px';
        this.draggedElement.style.pointerEvents = 'none';

        // Play click sound
        this.audio.playClick();

        // Mark as dragging
        this.state.dragState.isDragging = true;
    }

    // Handle pointer move (mousemove/touchmove)
    handlePointerMove(event) {
        if (!this.state.dragState.isDragging || !this.draggedElement) {
            return;
        }

        event.preventDefault();

        const pos = this.getPointerPosition(event);

        // Update position
        this.currentX = pos.x - this.offsetX;
        this.currentY = pos.y - this.offsetY;

        this.draggedElement.style.left = this.currentX + 'px';
        this.draggedElement.style.top = this.currentY + 'px';

        // Highlight drop target
        this.updateDropTargetHighlight(pos.x);
    }

    // Handle pointer end (mouseup/touchend)
    async handlePointerEnd(event) {
        if (!this.state.dragState.isDragging || !this.draggedElement) {
            return;
        }

        event.preventDefault();

        const pos = this.getPointerPosition(event.changedTouches ? event.changedTouches[0] : event);

        // Determine target tower
        const towerCenters = this.ui.getTowerCenterPositions();
        const targetTower = this.logic.getTowerIndexFromPosition(pos.x, towerCenters);

        // Remove dragging state
        this.state.dragState.isDragging = false;

        // Clear highlights
        this.ui.removeAllDropTargetHighlights();

        // Try to move disk
        if (this.logic.canMoveDisk(this.sourceTower, targetTower)) {
            // Valid move
            const diskSize = parseInt(this.draggedElement.dataset.size);
            this.logic.moveDisk(this.sourceTower, targetTower);

            // Remove dragging element
            this.draggedElement.remove();
            this.draggedElement = null;

            // Re-render
            this.ui.renderDisks();
            this.ui.updateMoveCount();

            // Play drop sound
            this.audio.playDrop();

            // Check win condition
            if (this.logic.checkWin()) {
                this.ui.showVictory();
            }
        } else {
            // Invalid move - animate back to original position
            this.animateReturnToSource();

            // Play beep sound
            this.audio.playBeep();

            // Shake disk
            setTimeout(() => {
                this.ui.shakeDisk(this.draggedElement);
            }, 300);
        }
    }

    // Update drop target highlight
    updateDropTargetHighlight(x) {
        const towerCenters = this.ui.getTowerCenterPositions();
        const targetTower = this.logic.getTowerIndexFromPosition(x, towerCenters);

        // Clear previous highlights
        this.ui.removeAllDropTargetHighlights();

        // Check if move is valid
        const isValid = this.logic.canMoveDisk(this.sourceTower, targetTower);

        // Highlight target tower
        this.ui.addDropTargetHighlight(targetTower, isValid);
    }

    // Animate disk return to source
    animateReturnToSource() {
        if (!this.draggedElement) return;

        // Animate back to original position
        this.draggedElement.style.transition = 'all 0.3s ease-out';
        this.draggedElement.style.left = this.initialX + 'px';
        this.draggedElement.style.top = this.initialY + 'px';

        setTimeout(() => {
            if (!this.draggedElement) return;

            // Reset styles
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

    // Enable drag functionality
    enable() {
        this.attachEvents();
    }

    // Disable drag functionality
    disable() {
        this.detachEvents();

        // If currently dragging, cancel
        if (this.state.dragState.isDragging && this.draggedElement) {
            this.animateReturnToSource();
            this.state.dragState.isDragging = false;
        }
    }
}
