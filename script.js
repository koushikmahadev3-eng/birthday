const canvas = document.getElementById('heart-tree');
const ctx = canvas.getContext('2d');

let width, height;
// Richer palette with more depth
const colors = ['#ff0055', '#ff3385', '#ff66b2', '#ff99cc', '#ffccdd', '#ff0000', '#ff3333'];

function resize() {
    const section = document.querySelector('.canvas-section');
    width = canvas.width = section.clientWidth;
    height = canvas.height = section.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Configuration ---
const messages = [
    { text: "Hey you ❤️", type: "normal" },
    { text: "Happy Birthday 🎈", type: "title" },
    { text: "May God bless you 🌻", type: "normal" },
    { text: "And give u many happiness 🥂", type: "normal" },
    { text: "Just saying... you're pretty awesome ❤️", type: "normal" },
    { text: "Keep shining! ✨", type: "normal" }
];

// --- Utilities ---
function randomRange(min, max) { return Math.random() * (max - min) + min; }
function randomColor() { return colors[Math.floor(Math.random() * colors.length)]; }

// --- Classes ---

class BackgroundParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * height; // Start spread out
        this.fadeDelay = Math.random() * 100;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height + 10;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.alpha = 0;
        this.maxAlpha = Math.random() * 0.5 + 0.2;
        this.life = 0;
        this.duration = Math.random() * 300 + 200;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life++;

        // Fade in/out
        if (this.life < 50) this.alpha = (this.life / 50) * this.maxAlpha;
        else if (this.life > this.duration - 50) this.alpha = ((this.duration - this.life) / 50) * this.maxAlpha;

        if (this.life >= this.duration || this.y < 0) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FallingPetal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = randomColor();
        this.size = randomRange(3, 6);
        this.speedY = randomRange(0.5, 1.5);
        this.speedX = randomRange(-0.5, 0.5);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = randomRange(-0.05, 0.05);
        this.opacity = 1;
    }

    update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.01) * 0.5 + this.speedX; // Sway logic
        this.rotation += this.rotationSpeed;

        if (this.y > height) this.opacity -= 0.02;
    }

    draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        // Simple petal shape (oval)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Animation State ---
const bgParticles = Array.from({ length: 100 }, () => new BackgroundParticle());
let fallingPetals = [];
let treeGrowth = 0;
const maxDepth = 12;
let time = 0; // For swaying

// --- Heart Drawing Helper ---
function drawHeart(x, y, size, color, angle, glow = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;

    if (glow) {
        ctx.shadowBlur = size * 1.5;
        ctx.shadowColor = color;
    }

    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
    ctx.bezierCurveTo(-size / 2, size * 0.75, 0, size, 0, size * 1.3);
    ctx.bezierCurveTo(0, size, size / 2, size * 0.75, size / 2, topCurveHeight);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.fill();
    ctx.restore();
}

// --- Fractal Tree Logic with Sway ---
function drawBranch(x, y, len, angle, depth) {
    if (depth === 0) return;

    // Sway effect based on time and depth (tips sway more)
    const sway = Math.sin(time * 0.002 + depth) * 0.02 * (maxDepth - depth);
    const currentAngle = angle + sway;

    const currentGrowth = Math.min(1, Math.max(0, treeGrowth * (maxDepth + 3) - (maxDepth - depth)));

    if (currentGrowth <= 0) return;

    const drawnLen = len * currentGrowth;
    const endX = x + drawnLen * Math.cos(currentAngle);
    const endY = y + drawnLen * Math.sin(currentAngle);

    // Glowing Branches
    ctx.save();
    ctx.lineWidth = depth * 1.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255, 230, 230, ${0.3 + depth / maxDepth * 0.5})`;
    ctx.shadowBlur = depth; // Glow at base
    ctx.shadowColor = 'rgba(255, 200, 200, 0.5)';

    ctx.beginPath();
    ctx.moveTo(x, y);
    // Use quadratic curve for slightly curved organic look
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    drawBranch(endX, endY, len * 0.75, currentAngle - 0.35, depth - 1);
    drawBranch(endX, endY, len * 0.75, currentAngle + 0.35, depth - 1);

    // Leaves / Hearts
    if (depth < 6 && currentGrowth > 0.5) {
        const seed = (endX * endY * depth) % 1000;
        const color = colors[Math.floor(seed) % colors.length];
        const baseSize = 4 + (6 - depth) * 2;

        // Pulse Effect
        const pulse = Math.sin(time * 0.005 + seed) * 0.2 + 1; // 0.8 to 1.2 scale
        const size = baseSize * Math.min(1, (currentGrowth - 0.5) * 2) * pulse;

        // Draw the heart
        if (depth <= 2 || (depth < 5 && seed % 3 === 0)) {
            drawHeart(endX, endY, size, color, currentAngle - Math.PI / 2, true);
        }

        // Spawn falling petals occasionally (once full grown)
        if (treeGrowth >= 1 && Math.random() < 0.001) {
            fallingPetals.push(new FallingPetal(endX, endY));
        }
    }
}

// --- Main Loop ---
function animate() {
    ctx.clearRect(0, 0, width, height);

    time++;
    if (treeGrowth < 1) treeGrowth += 0.003;

    // Draw Background Particles
    bgParticles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Tree
    drawBranch(width / 2, height + 40, 150, -Math.PI / 2, maxDepth);

    // Draw Falling Petals
    fallingPetals = fallingPetals.filter(p => p.opacity > 0);
    fallingPetals.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

// --- Text Sequence ---
function startTextSequence() {
    const container = document.getElementById('messages-container');
    let delay = 1000;

    messages.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = `message-line ${msg.type}`;
        div.textContent = msg.text;
        container.appendChild(div);

        setTimeout(() => {
            div.classList.add('visible');
        }, delay);

        delay += 2500;
    });
}

// Start
animate();
setTimeout(startTextSequence, 1500);
