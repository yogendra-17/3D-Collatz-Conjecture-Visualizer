import { createIcons, icons } from 'lucide';
import { calculateCollatzSequence, PRESETS } from './src/math/collatz.js';
import { SceneManager } from './src/three/sceneManager.js';
import { OrbitVisualizer } from './src/three/orbitVisualizer.js';
import { TreeVisualizer } from './src/three/treeVisualizer.js';
import { LandscapeVisualizer } from './src/three/landscapeVisualizer.js';
import { soundEngine } from './src/utils/audio.js';

class App {
  constructor() {
    this.activeNumber = 27;
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1.0;
    this.viewMode = 'orbit';
    this.isLogScale = true;
    this.shortcutMode = false;
    this.playbackTimer = null;

    this.initDOM();
    this.initThree();
    this.initPresets();
    this.bindEvents();
    this.calculateAndRender();

    // Render icons
    createIcons({ icons });
  }

  initDOM() {
    this.dom = {
      canvasContainer: document.getElementById('canvas-container'),
      numberInput: document.getElementById('number-input'),
      calculateBtn: document.getElementById('calculate-btn'),
      randomBtn: document.getElementById('random-btn'),
      presetSelect: document.getElementById('preset-select'),

      statSteps: document.getElementById('stat-steps'),
      statPeak: document.getElementById('stat-peak'),
      statPeakRatio: document.getElementById('stat-peak-ratio'),
      statOdd: document.getElementById('stat-odd'),
      statOddPct: document.getElementById('stat-odd-pct'),
      statEven: document.getElementById('stat-even'),
      statEvenPct: document.getElementById('stat-even-pct'),

      ratioOddLbl: document.getElementById('ratio-odd-lbl'),
      ratioEvenLbl: document.getElementById('ratio-even-lbl'),
      ratioOddFill: document.getElementById('ratio-odd-fill'),
      ratioEvenFill: document.getElementById('ratio-even-fill'),

      currentStepNum: document.getElementById('current-step-num'),
      totalStepNum: document.getElementById('total-step-num'),

      playBtn: document.getElementById('play-btn'),
      playIcon: document.getElementById('play-icon'),
      stepPrevBtn: document.getElementById('step-prev-btn'),
      stepNextBtn: document.getElementById('step-next-btn'),
      resetCamBtn: document.getElementById('reset-cam-btn'),
      speedRange: document.getElementById('speed-range'),
      speedVal: document.getElementById('speed-val'),

      scaleToggleBtn: document.getElementById('scale-toggle-btn'),
      shortcutToggleBtn: document.getElementById('shortcut-toggle-btn'),

      openTableBtn: document.getElementById('open-table-btn'),
      closeDrawerBtn: document.getElementById('close-drawer-btn'),
      tableDrawer: document.getElementById('table-drawer'),
      tableBody: document.getElementById('table-body'),
      exportCsvBtn: document.getElementById('export-csv-btn'),

      openMathBtn: document.getElementById('open-math-btn'),
      closeModalBtn: document.getElementById('close-modal-btn'),
      mathModal: document.getElementById('math-modal'),

      modeBtns: document.querySelectorAll('.mode-btn'),
      pillBtns: document.querySelectorAll('.preset-pills .pill-btn')
    };
  }

  initThree() {
    this.sm = new SceneManager(this.dom.canvasContainer);
    this.orbitViz = new OrbitVisualizer(this.sm);
    this.treeViz = new TreeVisualizer(this.sm);
    this.landscapeViz = new LandscapeVisualizer(this.sm);
  }

  initPresets() {
    PRESETS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.value;
      opt.textContent = p.label;
      this.dom.presetSelect.appendChild(opt);
    });
  }

  bindEvents() {
    // Input calculation
    this.dom.calculateBtn.addEventListener('click', () => this.handleCalculate());
    this.dom.numberInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleCalculate();
    });

    // Random Number
    this.dom.randomBtn.addEventListener('click', () => {
      const rand = Math.floor(Math.random() * 999) + 2;
      this.dom.numberInput.value = rand;
      this.handleCalculate();
    });

    // Preset dropdown
    this.dom.presetSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        this.dom.numberInput.value = e.target.value;
        this.handleCalculate();
      }
    });

    // Pill preset buttons
    this.dom.pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        this.dom.numberInput.value = val;
        this.dom.pillBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.handleCalculate();
      });
    });

    // Mode Switcher
    this.dom.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.dataset.mode;
        this.updateViewMode();
      });
    });

    // Log / Linear scale toggle
    this.dom.scaleToggleBtn.addEventListener('click', () => {
      this.isLogScale = !this.isLogScale;
      this.dom.scaleToggleBtn.textContent = `Scale: ${this.isLogScale ? 'Logarithmic' : 'Linear'}`;
      this.orbitViz.build(this.seqData, this.isLogScale);
    });

    // Shortcut mode toggle
    this.dom.shortcutToggleBtn.addEventListener('click', () => {
      this.shortcutMode = !this.shortcutMode;
      this.dom.shortcutToggleBtn.textContent = `Mode: ${this.shortcutMode ? 'Shortcut (3n+1)/2' : 'Standard 3n+1'}`;
      this.handleCalculate();
    });

    // Playback Controls
    this.dom.playBtn.addEventListener('click', () => this.togglePlay());
    this.dom.stepPrevBtn.addEventListener('click', () => this.stepBack());
    this.dom.stepNextBtn.addEventListener('click', () => this.stepForward());
    this.dom.resetCamBtn.addEventListener('click', () => this.sm.resetCamera());

    this.dom.speedRange.addEventListener('input', (e) => {
      this.speed = parseFloat(e.target.value);
      this.dom.speedVal.textContent = `${this.speed}x`;
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    // Drawer Controls
    this.dom.openTableBtn.addEventListener('click', () => this.dom.tableDrawer.classList.add('open'));
    this.dom.closeDrawerBtn.addEventListener('click', () => this.dom.tableDrawer.classList.remove('open'));

    // Export CSV
    this.dom.exportCsvBtn.addEventListener('click', () => this.exportCSV());

    // Modal Controls
    this.dom.openMathBtn.addEventListener('click', () => this.dom.mathModal.classList.add('open'));
    this.dom.closeModalBtn.addEventListener('click', () => this.dom.mathModal.classList.remove('open'));
    this.dom.mathModal.addEventListener('click', (e) => {
      if (e.target === this.dom.mathModal) this.dom.mathModal.classList.remove('open');
    });
  }

  handleCalculate() {
    const rawVal = this.dom.numberInput.value;
    if (!rawVal || parseInt(rawVal) < 1) return;
    this.activeNumber = parseInt(rawVal);
    this.pause();
    this.currentStep = 0;
    this.calculateAndRender();
  }

  calculateAndRender() {
    this.seqData = calculateCollatzSequence(this.activeNumber, this.shortcutMode);

    // Update Stats Panel
    this.dom.statSteps.textContent = this.seqData.totalStoppingTime.toLocaleString();
    this.dom.statPeak.textContent = this.seqData.maxVal.toLocaleString();
    this.dom.statPeakRatio.textContent = `${this.seqData.peakRatio}x start value`;

    this.dom.statOdd.textContent = this.seqData.oddCount;
    this.dom.statOddPct.textContent = `${this.seqData.oddPercentage}% of total`;
    this.dom.statEven.textContent = this.seqData.evenCount;
    this.dom.statEvenPct.textContent = `${this.seqData.evenPercentage}% of total`;

    this.dom.ratioOddLbl.textContent = `${this.seqData.oddPercentage}%`;
    this.dom.ratioEvenLbl.textContent = `${this.seqData.evenPercentage}%`;
    this.dom.ratioOddFill.style.width = `${this.seqData.oddPercentage}%`;
    this.dom.ratioEvenFill.style.width = `${this.seqData.evenPercentage}%`;

    this.dom.totalStepNum.textContent = this.seqData.totalStoppingTime;
    this.updateStepUI();

    // Build 3D views
    this.orbitViz.build(this.seqData, this.isLogScale);
    this.treeViz.build(this.seqData.steps);
    this.landscapeViz.build(200, this.activeNumber);

    this.updateViewMode();
    this.populateTable();
  }

  updateViewMode() {
    this.orbitViz.setVisible(this.viewMode === 'orbit');
    this.treeViz.setVisible(this.viewMode === 'tree');
    this.landscapeViz.setVisible(this.viewMode === 'landscape');
  }

  updateStepUI() {
    this.dom.currentStepNum.textContent = this.currentStep;
    this.orbitViz.setStep(this.currentStep);

    if (this.seqData && this.seqData.steps[this.currentStep]) {
      const stepObj = this.seqData.steps[this.currentStep];
      soundEngine.playStepSound(stepObj.isOdd, stepObj.value);
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentStep >= this.seqData.totalStoppingTime) {
      this.currentStep = 0;
    }
    this.isPlaying = true;
    this.updatePlayButton();

    const interval = 1000 / (2 * this.speed);
    this.playbackTimer = setInterval(() => {
      if (this.currentStep < this.seqData.totalStoppingTime) {
        this.currentStep++;
        this.updateStepUI();
      } else {
        this.pause();
      }
    }, interval);
  }

  pause() {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    this.updatePlayButton();
  }

  updatePlayButton() {
    const iconName = this.isPlaying ? 'pause' : 'play';
    this.dom.playBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
    createIcons({ icons });
  }

  stepForward() {
    this.pause();
    if (this.currentStep < this.seqData.totalStoppingTime) {
      this.currentStep++;
      this.updateStepUI();
    }
  }

  stepBack() {
    this.pause();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateStepUI();
    }
  }

  populateTable() {
    if (!this.seqData) return;
    let html = '';
    this.seqData.steps.forEach(s => {
      const badgeClass = s.isOdd ? 'badge-odd' : 'badge-even';
      html += `
        <tr>
          <td class="mono">${s.step}</td>
          <td class="mono" style="font-weight:700;">${s.value.toLocaleString()}</td>
          <td><span class="${badgeClass}">${s.operation}</span></td>
          <td class="mono">${s.formula}</td>
        </tr>
      `;
    });
    this.dom.tableBody.innerHTML = html;
  }

  exportCSV() {
    if (!this.seqData) return;
    let csv = "Step,Value,Operation,Formula\n";
    this.seqData.steps.forEach(s => {
      csv += `${s.step},${s.value},"${s.operation}","${s.formula}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collatz_sequence_${this.activeNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Instantiate App when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
