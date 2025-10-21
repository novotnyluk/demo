```markdown
# Simple Pong (HTML/CSS/JS)

A small, self-contained Pong game using HTML canvas.

Features:
- Player controls left paddle via mouse movement or Arrow Up / Arrow Down keys.
- Computer controls right paddle with a simple tracking AI.
- Bouncing ball with variable bounce angle based on where it hits the paddle.
- Scoreboard that updates when a player or the computer scores.
- Click the canvas to (re)start; initial serve has a short pause.
- Difficulty options for the computer: Easy, Medium, Hard (selectable in the HUD).

How to run:
1. Place `index.html`, `style.css` and `script.js` in the same folder.
2. Open `index.html` in your browser.
3. Use the Difficulty dropdown in the HUD to choose the AI difficulty. The choice is saved to localStorage.

Notes on difficulty:
- Easy: the computer is slower and introduces larger aiming error (good for learning).
- Medium: balanced speed and accuracy.
- Hard: fast and very accurate.

Possible next improvements:
- Add sound effects for paddle hits and scores.
- Add mobile-friendly/touch controls and responsive canvas resizing.
- Add an options menu for match length or serve rules.

Enjoy!
```