# Tower of Hanoi Game

A beautiful, interactive Tower of Hanoi puzzle game with drag-and-drop functionality, hint system, and auto-solver.

## Features

- 🎮 **Interactive Gameplay** - Drag and drop disks with mouse or touch
- 💡 **Hint System** - Get suggestions for the next optimal move
- 🤖 **Auto Solver** - Watch the puzzle solve itself with adjustable speed
- 🎨 **Colorful Design** - Each disk has a unique vibrant color
- 📱 **Mobile Optimized** - Works perfectly on mobile devices in portrait mode
- 🎉 **Victory Animation** - Confetti and fanfare on completion
- 🔊 **Sound Effects** - Generated using Web Audio API
- ⚡ **No Build Required** - Pure HTML, CSS, and JavaScript

## How to Play

1. **Select Number of Disks** - Choose 3, 4, or 5 disks
2. **Start Game** - Click the "Start Game" button
3. **Move Disks** - Drag disks from one tower to another
   - You can only place a smaller disk on top of a larger disk
   - Invalid moves will beep and return the disk to its original position
4. **Use Hints** - Click the 💡 Hint button to see the next optimal move
5. **Auto Solve** - Click 🤖 Auto Solve to watch the computer solve the puzzle
6. **Win** - Move all disks to the Target tower to win!

## Game Rules

- Only one disk can be moved at a time
- A disk can only be placed on top of a larger disk or on an empty tower
- The goal is to move all disks from the Source tower to the Target tower

## Disk Colors

- Disk 1 (smallest): Red 🔴
- Disk 2: Orange 🟠
- Disk 3: Yellow 🟡
- Disk 4: Green 🟢
- Disk 5 (largest): Blue 🔵

## Controls

- **💡 Hint** - Shows the next optimal move
- **🤖 Auto Solve** - Automatically solves the puzzle
  - Adjustable speed slider (0.1s - 2s per move)
  - Pause/Resume functionality
  - Can start from any intermediate state
- **🔄 Reset** - Restart the current puzzle

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid, Flexbox, and Animations
- **Vanilla JavaScript** - No frameworks or dependencies
- **Web Audio API** - Sound generation
- **Canvas Confetti** - Victory celebration effects

## Installation

Simply open `index.html` in a modern web browser. No installation or build process required!

## File Structure

```
hanoi/
├── index.html              # Main HTML file
├── css/
│   ├── reset.css          # CSS reset
│   ├── variables.css      # CSS custom properties
│   ├── layout.css         # Layout and responsive design
│   ├── game.css           # Game board styling
│   ├── controls.css       # Button and control styling
│   └── animations.css     # Animation effects
└── js/
    └── app.js             # All game logic (combined)
```

## Browser Support

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - Feel free to use and modify!

## Author

Created with Claude Code

---

Enjoy the game! 🎮
