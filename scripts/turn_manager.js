export class TurnManager {
  constructor(stageCount, wavesPerStage) {
    this.stageCount = stageCount;
    this.wavesPerStage = wavesPerStage;
    this.currentStage = 1;
    this.currentWave = 1; // wave number within stage
    this.phase = 'prepare';
  }

  nextPhase() {
    if (this.phase === 'prepare') {
      this.phase = 'wave';
    } else {
      this.phase = 'prepare';
      if (this.currentWave >= this.wavesPerStage) {
        this.currentWave = 1;
        this.currentStage += 1;
      } else {
        this.currentWave += 1;
      }
    }
  }

  isFinished() {
    return this.currentStage > this.stageCount;
  }

  getWaveIndex() {
    return (this.currentStage - 1) * this.wavesPerStage + (this.currentWave - 1);
  }
}

