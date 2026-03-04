const PHASES = [
  { label: 'Inhale...', duration: 4000 },
  { label: 'Hold...', duration: 4000 },
  { label: 'Exhale...', duration: 6000 },
  { label: '', duration: 2000 }  // pause
];
const CYCLE_DURATION = 16000;
const TOTAL_CYCLES = 5;

let circle;
let label;
let counter;
let overlay;
let timeouts = [];
let cycleCount = 0;
let running = false;

function setLabel(text) {
  if (label) label.textContent = text;
}

function setCounter(count) {
  if (!counter) return;
  if (count <= 0) { counter.textContent = ''; return; }
  const dots = Array.from({ length: TOTAL_CYCLES }, (_, i) =>
    i < count ? '●' : '○'
  ).join(' ');
  counter.textContent = dots;
}

function runPhases() {
  let elapsed = 0;
  PHASES.forEach((phase, i) => {
    const id = setTimeout(() => {
      setLabel(phase.label);
      if (i === 0) {
        cycleCount++;
        setCounter(cycleCount);
      }
    }, elapsed);
    timeouts.push(id);
    elapsed += phase.duration;
  });

  // Schedule next cycle or finish
  const cycleId = setTimeout(() => {
    if (running && cycleCount < TOTAL_CYCLES) {
      runPhases();
    } else if (running) {
      setLabel('Well done');
      setTimeout(() => hide(), 1500);
    }
  }, CYCLE_DURATION);
  timeouts.push(cycleId);
}

function start() {
  running = true;
  cycleCount = 0;
  circle.classList.add('animate');
  runPhases();
}

function stop() {
  running = false;
  timeouts.forEach(clearTimeout);
  timeouts = [];
  circle.classList.remove('animate');
  setLabel('');
  setCounter(0);
}

function show() {
  overlay.classList.remove('hidden');
  start();
}

function hide() {
  stop();
  overlay.classList.add('hidden');
}

export function init() {
  const btn = document.getElementById('breathe-btn');
  const closeBtn = document.getElementById('breathing-close');
  overlay = document.getElementById('breathing-overlay');
  circle = document.getElementById('breathing-circle');
  label = document.getElementById('breathing-label');
  counter = document.getElementById('breathing-counter');

  if (!btn || !overlay) return;

  btn.addEventListener('click', show);

  closeBtn.addEventListener('click', hide);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hide();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      hide();
    }
  });
}
