export class TurnManager {
  constructor(stageCount, wavesPerStage) {
    this.stageCount = stageCount;
    this.wavesPerStage = wavesPerStage;
    this.currentStage = 1;
    this.currentWave = 1; // wave number within stage

    this.phaseOrder = [
      'prepare',
      'placement',
      'waveStart',
      'heroTurn',
      'cleanup',
      'waveEnd',
      'transition'
    ];
    this.phaseIndex = 0;
    this.phase = this.phaseOrder[this.phaseIndex];

    this.handlers = {};
  }

  on(phase, handler) {
    if (!this.handlers[phase]) this.handlers[phase] = [];
    this.handlers[phase].push(handler);
  }

  async trigger() {
    const list = this.handlers[this.phase] || [];
    for (const h of list) {
      await h(this);
    }
  }

  async start() {
    this.phaseIndex = 0;
    this.phase = this.phaseOrder[this.phaseIndex];
    await this.trigger();
  }

  async nextPhase() {
    if (this.isFinished()) return;

    this.phaseIndex += 1;
    if (this.phaseIndex >= this.phaseOrder.length) {
      this.phaseIndex = 0;
      if (this.currentWave >= this.wavesPerStage) {
        this.currentWave = 1;
        this.currentStage += 1;
      } else {
        this.currentWave += 1;
      }
      if (this.isFinished()) return;
    }

    this.phase = this.phaseOrder[this.phaseIndex];
    await this.trigger();
  }

  isFinished() {
    return this.currentStage > this.stageCount;
  }

  getWaveIndex() {
    return (
      (this.currentStage - 1) * this.wavesPerStage +
      (this.currentWave - 1)
    );
  }
}


