export class TurnManager {
  constructor(maxWave) {
    this.maxWave = maxWave;
    this.currentWave = 1;
    this.phase = 'prepare';
  }

  nextPhase() {
    if (this.phase === 'prepare') {
      this.phase = 'wave';
    } else {
      this.phase = 'prepare';
      this.currentWave += 1;
    }
  }

  isFinished() {
    return this.currentWave > this.maxWave;
  }
}

