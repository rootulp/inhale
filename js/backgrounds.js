const GRADIENTS = [
  // Sunset over ocean
  "linear-gradient(135deg, #0f0c29 0%, #302b63 30%, #24243e 50%, #e65c00 75%, #f9d423 100%)",
  // Misty forest morning
  "linear-gradient(160deg, #1b2838 0%, #2d4739 30%, #4a7c59 55%, #8fb996 80%, #d4e7c5 100%)",
  // Mountain twilight
  "linear-gradient(145deg, #0f2027 0%, #203a43 25%, #2c5364 50%, #6b8f9e 75%, #c9b1ff 100%)",
  // Northern lights
  "linear-gradient(170deg, #0a0e27 0%, #1a3a4a 25%, #1b6b5a 50%, #3ec6a0 75%, #7bf4c8 100%)",
  // Desert dusk
  "linear-gradient(150deg, #1a1a2e 0%, #4a2545 25%, #c0392b 50%, #e67e22 75%, #f1c40f 100%)",
  // Deep ocean
  "linear-gradient(165deg, #000428 0%, #004e92 35%, #0077b6 55%, #00b4d8 75%, #90e0ef 100%)",
  // Autumn valley
  "linear-gradient(140deg, #1a120b 0%, #5c3317 25%, #b85c2e 50%, #d4a03c 75%, #e8d5a3 100%)",
  // Rainy meadow
  "linear-gradient(155deg, #16222a 0%, #3a6073 30%, #5a8f7b 55%, #7ec8a0 75%, #b8d9c8 100%)",
  // Lavender fields at dusk
  "linear-gradient(135deg, #1a1423 0%, #3d2c5e 25%, #7b4f9e 50%, #b388c9 70%, #e8c8ea 100%)",
  // Tropical dawn
  "linear-gradient(160deg, #0d1b2a 0%, #1b3a4b 20%, #3a7ca5 45%, #f4845f 70%, #ffd166 100%)"
];

export function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function init() {
  const index = getDayOfYear() % GRADIENTS.length;
  document.body.style.backgroundImage = GRADIENTS[index];
}
