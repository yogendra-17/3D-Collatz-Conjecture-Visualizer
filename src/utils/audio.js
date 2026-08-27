/**
 * Web Audio API synth for interactive playback feedback
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playStepSound(isOdd = false, stepValue = 1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isOdd ? 'triangle' : 'sine';
      
      // Pitch based on value height or parity
      const baseFreq = isOdd ? 440 : 330;
      const freqShift = Math.min(600, (Math.log2(Math.max(1, stepValue)) * 25));
      osc.frequency.setValueAtTime(baseFreq + freqShift, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      // Audio autoplay blocked or unsupported
    }
  }
}

export const soundEngine = new SoundEngine();
