const canvas = document.getElementById("curtain");
const ctx = canvas.getContext("2d");

const sim = {
  points: [],
  sticks: [],
  mouse: { x: 0, y: 0, active: false, lastX: 0, lastY: 0 },
  width: 0,
  height: 0,
  scale: 1,
};

const settings = {
  cols: 26,
  rows: 18,
  iterations: 5,
  gravity: 1600,
  damping: 0.02,
  spacing: 24,
  pinSpacing: 14,
  mouseRadius: 90,
  mouseForce: 0.35,
};

function createCurtain() {
  sim.points = [];
  sim.sticks = [];

  const cols = settings.cols;
  const rows = settings.rows;
  const spacing = Math.min(settings.spacing, (sim.width * 0.8) / (cols - 1));

  const offsetX = (sim.width - spacing * (cols - 1)) / 2;
  const offsetY = Math.max(40, (sim.height - spacing * (rows - 1)) * 0.1);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = offsetX + x * spacing;
      const py = offsetY + y * spacing;
      sim.points.push({
        x: px,
        y: py,
        oldX: px,
        oldY: py,
        pinned: y === 0 && (x % Math.max(1, settings.pinSpacing / 2) === 0),
      });
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = y * cols + x;
      if (x < cols - 1) addStick(idx, idx + 1, spacing);
      if (y < rows - 1) addStick(idx, idx + cols, spacing);
    }
  }
}

function addStick(i0, i1, length) {
  sim.sticks.push({ i0, i1, length });
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  sim.scale = window.devicePixelRatio || 1;
  canvas.width = rect.width * sim.scale;
  canvas.height = rect.height * sim.scale;
  ctx.setTransform(sim.scale, 0, 0, sim.scale, 0, 0);
  sim.width = rect.width;
  sim.height = rect.height;
  createCurtain();
}

function updatePoints(dt) {
  for (const p of sim.points) {
    if (p.pinned) {
      p.x = p.oldX;
      p.y = p.oldY;
      continue;
    }

    let vx = p.x - p.oldX;
    let vy = p.y - p.oldY;

    vx *= 1 - settings.damping;
    vy *= 1 - settings.damping;
    vy += settings.gravity * dt * dt;

    if (sim.mouse.active) {
      const dx = p.x - sim.mouse.x;
      const dy = p.y - sim.mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < settings.mouseRadius) {
        const falloff = 1 - dist / settings.mouseRadius;
        const mx = (sim.mouse.x - sim.mouse.lastX) * settings.mouseForce;
        const my = (sim.mouse.y - sim.mouse.lastY) * settings.mouseForce;
        vx += mx * falloff;
        vy += my * falloff;
      }
    }

    p.oldX = p.x;
    p.oldY = p.y;
    p.x += vx;
    p.y += vy;
  }
}

function satisfyConstraints() {
  for (let k = 0; k < settings.iterations; k++) {
    for (const stick of sim.sticks) {
      const p0 = sim.points[stick.i0];
      const p1 = sim.points[stick.i1];

      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - stick.length) / dist;

      const offsetX = dx * 0.5 * diff;
      const offsetY = dy * 0.5 * diff;

      if (!p0.pinned) {
        p0.x += offsetX;
        p0.y += offsetY;
      }
      if (!p1.pinned) {
        p1.x -= offsetX;
        p1.y -= offsetY;
      }
    }
  }
}

function drawCurtain() {
  ctx.setTransform(sim.scale, 0, 0, sim.scale, 0, 0);
  ctx.clearRect(0, 0, sim.width, sim.height);
  ctx.strokeStyle = "rgba(224,224,255,0.35)";
  ctx.lineWidth = 1.3;
  ctx.fillStyle = "yellow";
  ctx.beginPath();

  const cols = settings.cols;
  for (let y = 0; y < settings.rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const p0 = sim.points[y * cols + x];
      const p1 = sim.points[y * cols + x + 1];
      const p2 = sim.points[(y + 1) * cols + x + 1];
      const p3 = sim.points[(y + 1) * cols + x];

      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
    }
  }
  ctx.fill();

  ctx.beginPath();
  for (const stick of sim.sticks) {
    const p0 = sim.points[stick.i0];
    const p1 = sim.points[stick.i1];
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
  }
  ctx.stroke();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;

  updatePoints(dt);
  satisfyConstraints();
  drawCurtain();
  requestAnimationFrame(loop);
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  sim.mouse.lastX = sim.mouse.x;
  sim.mouse.lastY = sim.mouse.y;
  sim.mouse.x = e.clientX - rect.left;
  sim.mouse.y = e.clientY - rect.top;
  sim.mouse.active = true;
});

canvas.addEventListener("mouseleave", () => {
  sim.mouse.active = false;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
requestAnimationFrame(loop);
