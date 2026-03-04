import { getSettings } from './settings.js';

const PALETTES = {
  warm: [
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
  ],
  cool: [
    // Arctic morning
    "linear-gradient(150deg, #0b1628 0%, #132e4a 25%, #1a5276 50%, #5dade2 75%, #d6eaf8 100%)",
    // Frozen lake
    "linear-gradient(165deg, #0c1927 0%, #1b3b5a 30%, #2e86ab 55%, #7ec8e3 78%, #c8e6f5 100%)",
    // Deep twilight
    "linear-gradient(140deg, #0d0b2e 0%, #1a1850 25%, #2d3a8c 50%, #6574cd 75%, #b2b7f0 100%)",
    // Glacial pool
    "linear-gradient(155deg, #0a1a2a 0%, #0e3b43 28%, #14746f 52%, #48c9b0 76%, #a3e4d7 100%)",
    // Winter dusk
    "linear-gradient(135deg, #141122 0%, #2b1f4e 25%, #4a3f82 48%, #8e7cc3 72%, #d5cef0 100%)",
    // Ocean depths
    "linear-gradient(170deg, #020a18 0%, #071e3d 25%, #0d3b66 50%, #1282a2 75%, #6fccdd 100%)",
    // Icy summit
    "linear-gradient(145deg, #101820 0%, #1c3144 28%, #3a7ca5 52%, #81c3d7 76%, #d4ecf7 100%)",
    // Moonlit sea
    "linear-gradient(160deg, #0a0f1a 0%, #151e3f 25%, #293b6a 50%, #5b7db1 73%, #a8c6df 100%)",
    // Teal cavern
    "linear-gradient(150deg, #0b1a1e 0%, #0f3b3e 30%, #1a6b5a 52%, #40c0a0 76%, #95e0cc 100%)",
    // Cobalt horizon
    "linear-gradient(140deg, #0a0e27 0%, #132a52 25%, #1a4e8a 50%, #4a90d9 72%, #a0c4f0 100%)"
  ],
  muted: [
    // Morning fog
    "linear-gradient(155deg, #2c2c34 0%, #3e3e48 25%, #585866 50%, #8a8a94 75%, #b8b8bf 100%)",
    // Dusty rose
    "linear-gradient(145deg, #2e2228 0%, #4a3540 25%, #6e5060 50%, #9e7e8d 75%, #c9b1bb 100%)",
    // Overcast meadow
    "linear-gradient(160deg, #252a25 0%, #384038 28%, #566056 52%, #8a9a86 76%, #bcc9b7 100%)",
    // Slate afternoon
    "linear-gradient(135deg, #262830 0%, #38404a 25%, #516270 50%, #7e96a5 75%, #b0c4cc 100%)",
    // Sandstone dusk
    "linear-gradient(150deg, #2a2520 0%, #453d34 28%, #6b5f50 52%, #9e9180 76%, #c8c0b0 100%)",
    // Misty plum
    "linear-gradient(165deg, #28222e 0%, #3e3448 25%, #5a4d66 50%, #887a96 73%, #b5aabe 100%)",
    // Rainy window
    "linear-gradient(140deg, #222830 0%, #354050 25%, #4d6070 50%, #748898 75%, #a0b0ba 100%)",
    // Clay earth
    "linear-gradient(155deg, #2a2320 0%, #4a3c32 28%, #6e5a48 52%, #988068 76%, #c0a890 100%)",
    // Dried sage
    "linear-gradient(145deg, #24282a 0%, #3a4440 25%, #566860 50%, #7e9488 75%, #aec0b4 100%)",
    // Faded denim
    "linear-gradient(160deg, #242830 0%, #344050 25%, #4e6478 50%, #7090a6 73%, #a0b8c8 100%)"
  ],
  vibrant: [
    // Electric sunset
    "linear-gradient(150deg, #1a0a2e 0%, #4a0e6e 25%, #c02078 50%, #ff4e50 75%, #fcb045 100%)",
    // Neon reef
    "linear-gradient(140deg, #0a1628 0%, #0c3547 25%, #00838f 50%, #00e5a0 75%, #76ff8a 100%)",
    // Cosmic berry
    "linear-gradient(165deg, #140020 0%, #3a0060 25%, #7b1fa2 50%, #d81b60 75%, #ff6090 100%)",
    // Aurora borealis
    "linear-gradient(155deg, #0a0a2e 0%, #1a237e 25%, #006064 50%, #00e676 73%, #b2ff59 100%)",
    // Molten core
    "linear-gradient(135deg, #1a0000 0%, #5d0000 25%, #c62828 50%, #ff6f00 75%, #ffd600 100%)",
    // Electric ocean
    "linear-gradient(160deg, #0a0028 0%, #1a0060 25%, #304ffe 50%, #00b0ff 75%, #18ffff 100%)",
    // Jungle pulse
    "linear-gradient(145deg, #0a1a0a 0%, #1b5e20 25%, #2e7d32 48%, #00c853 72%, #69f0ae 100%)",
    // Plasma wave
    "linear-gradient(170deg, #1a002e 0%, #4a148c 25%, #aa00ff 50%, #e040fb 73%, #ea80fc 100%)",
    // Firefly night
    "linear-gradient(150deg, #0d1117 0%, #1a2744 25%, #1b5e20 50%, #c6ff00 75%, #eeff41 100%)",
    // Sapphire flame
    "linear-gradient(140deg, #0a0020 0%, #1a237e 25%, #283593 48%, #e65100 72%, #ff9100 100%)"
  ]
};

export function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function applyGradient(palette) {
  const gradients = PALETTES[palette] || PALETTES.warm;
  const index = getDayOfYear() % gradients.length;
  document.body.style.backgroundImage = gradients[index];
}

export async function init() {
  const settings = await getSettings();
  const palette = settings.palette || 'warm';
  applyGradient(palette);
}

window.addEventListener('inhale:setting-change', (e) => {
  if (e.detail && e.detail.key === 'palette') {
    applyGradient(e.detail.value);
  }
});
