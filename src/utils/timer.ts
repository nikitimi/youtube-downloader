/** Get the elapsed time of process. */
export default class Timer {
  /** millisecond to second. */
  private MS = 1000;
  /** second to minute. */
  private MINUTE = 60;
  private difference = 0;

  constructor(start: Date, end: Date) {
    this.difference = end.getTime() - start.getTime();
  }

  getMinutesWithSeconds() {
    const seconds = Math.round(this.getSeconds() % this.MINUTE);
    const minutes = Math.floor(this.getSeconds() / this.MINUTE);
    return {
      minutes,
      seconds,
    };
  }
  getSeconds(rounded?: boolean) {
    const baseComputation = this.difference / this.MS;
    if (rounded) {
      return Math.round(baseComputation);
    }
    return baseComputation;
  }
  getMilliseconds(rounded?: boolean) {
    if (rounded) {
      return Math.round(this.difference);
    }
    return this.difference;
  }

  logElapsedTime() {
    const seconds = this.getSeconds();
    const { seconds: s, minutes } = this.getMinutesWithSeconds();
    if (seconds > this.MINUTE) {
      return console.info(
        `[ELAPSED TIME]: ${
          minutes > 1 ? `${minutes} minute` : `${minutes} minute(s)`
        } ${s > 0 ? `and ${s} second(s).` : ""}.`
      );
    }
    console.info(`[ELAPSED TIME]: ${seconds} second(s).`);
  }
}
