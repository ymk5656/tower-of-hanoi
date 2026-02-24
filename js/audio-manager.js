// Audio Manager - Web Audio API Sound Generation

export class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.initialized = false;
    }

    // Initialize audio context (must be called after user interaction)
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

    // Play a note with given frequency and duration
    playNote(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            // Envelope (attack and release)
            const now = this.context.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (error) {
            console.warn('Error playing note:', error);
        }
    }

    // Play beep sound for invalid move
    playBeep() {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = 440; // A4 note

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

    // Play fanfare for victory
    async playFanfare() {
        if (!this.enabled || !this.initialized) return;

        // Victory melody: C5 - E5 - G5 - C6
        const notes = [
            { freq: 523.25, duration: 0.2 }, // C5
            { freq: 659.25, duration: 0.2 }, // E5
            { freq: 783.99, duration: 0.2 }, // G5
            { freq: 1046.50, duration: 0.4 } // C6
        ];

        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            this.playNote(note.freq, note.duration, 'sine', 0.4);
            await this.delay(note.duration * 1000);
        }

        // Add chord at the end
        setTimeout(() => {
            this.playNote(523.25, 0.8, 'sine', 0.2); // C5
            this.playNote(659.25, 0.8, 'sine', 0.2); // E5
            this.playNote(783.99, 0.8, 'sine', 0.2); // G5
        }, 0);
    }

    // Play click sound for disk pickup
    playClick() {
        if (!this.enabled || !this.initialized) return;

        this.playNote(800, 0.05, 'sine', 0.2);
    }

    // Play drop sound for successful disk placement
    playDrop() {
        if (!this.enabled || !this.initialized) return;

        this.playNote(400, 0.1, 'sine', 0.25);
    }

    // Helper function for delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Toggle audio on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Check if audio is enabled
    isEnabled() {
        return this.enabled && this.initialized;
    }
}
