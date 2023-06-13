const { expect } = require("@playwright/test");
const { BasePage } = require("./base-page");
exports.PerformancePage = class PerformancePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.viewportControls = page.locator('.viewport-controls');
  }

  async waitForPageLoaded() {
    await this.page.waitForLoadState("networkidle");
  }

  async waitForViewportControls() {
    await this.viewportControls.click();
  }

  /**
   * Starts observing long tasks.
   */
  startObservingLongTasks() {
    return this.page.evaluate(() => {
      window.penpotPerformanceObserver = new PerformanceObserver((list) => {
        console.log(list.getEntries());
      });
      window.penpotPerformanceObserver.observe({
        entryTypes: ["longtask", "taskattribution"],
      });
    });
  }

  /**
   * Stops observing long tasks.
   *
   * @returns {Promise<PerformanceEntry[]>}
   */
  stopObservingLongTasks() {
    return this.page.evaluate(() => {
      window.penpotPerformanceObserver.disconnect();
      return window.penpotPerformanceObserver.takeRecords();
    });
  }

  /**
   * Injects a frame rate recorder into the page.
   *
   * @returns {Promise<void>}
   */
  injectFrameRateRecorder() {
    return this.page.evaluate(() => {
      /**
       * Why is all this code inside the evaluate function?
       *
       * The evaluate function is executed in the browser context, so
       * it has access to the DOM and the JavaScript runtime. This
       * means that we can use it to create helper classes and functions
       * that will be used to record the frame rate. If we define these
       * classes and functions outside of the evaluate function, they
       * will not be available in the browser context.
       */

      /**
       * This function _provides_ the helper classes and functions
       * that will be used to record the frame rate.
       *
       * @returns {FrameRateRecorder}
       */
      function provide() {
        /**
         * TimestampedDataRecorder is a helper class that records a
         * value and a timestamp.
         */
        class TimestampedDataRecorder {
          #index = 0;
          #values = null;
          #timestamps = null;

          constructor(maxRecords) {
            this.#index = 0;
            this.#values = new Uint32Array(maxRecords);
            this.#timestamps = new Float32Array(maxRecords);
          }

          reset(clearData = true) {
            this.#index = 0;
            if (clearData) {
              this.#values.fill(0);
              this.#timestamps.fill(0);
            }
          }

          record(value) {
            this.#values[this.#index] = value;
            this.#timestamps[this.#index] = performance.now();
            this.#index = (this.#index + 1) % this.#values.length;
            if (this.#index === 0) {
              return false;
            }
            return true;
          }

          takeRecords() {
            const records = [];
            for (let i = 0; i < this.#index; i++) {
              records.push({
                value: this.#values[i],
                timestamp: this.#timestamps[i],
              });
            }
            return records;
          }
        }

        /**
         * FrameRateRecorder is a helper class that records
         * the number of frames.
         */
        class FrameRateRecorder extends EventTarget {
          #recorder = null;
          #frameId = null;
          #frameCount = 0;
          #framesPerSecond = 0;
          #startTime = 0;
          #shouldStopWhenFull = true;

          constructor({ maxRecords = 60 * 60, shouldStopWhenFull = true }) {
            super();
            this.#frameId = null;
            this.#frameCount = 0;
            this.#startTime = 0;
            this.#shouldStopWhenFull = shouldStopWhenFull;
            this.#recorder = new TimestampedDataRecorder(maxRecords);
          }

          get framesPerSecond() {
            return this.#framesPerSecond;
          }

          #onFrame = (currentTime) => {
            this.#frameCount++;
            let shouldStop = false;
            if (currentTime - this.#startTime >= 1000) {
              this.#startTime = currentTime;
              this.#framesPerSecond = this.#frameCount;
              this.#frameCount = 0;

              const shouldContinue = this.#recorder.record(
                this.#framesPerSecond,
              );
              if (!shouldContinue && this.#shouldStopWhenFull) {
                shouldStop = true;
              }
            }
            if (shouldStop) {
              if (this.stop()) {
                this.dispatchEvent(new Event("ended"));
              }
              return;
            }
            this.#frameId = window.requestAnimationFrame(this.#onFrame);
          };

          takeRecords() {
            return this.#recorder.takeRecords();
          }

          start() {
            if (this.#frameId !== null) {
              return false;
            }
            this.#recorder.reset();
            this.#startTime = performance.now();
            this.#frameId = window.requestAnimationFrame(this.#onFrame);
            return true;
          }

          stop() {
            if (this.#frameId === null) {
              return false;
            }
            window.cancelAnimationFrame(this.#frameId);
            this.#frameId = null;
            return true;
          }
        }

        return FrameRateRecorder;
      }

      // If the FrameRateRecorder is already defined, do nothing.
      if (typeof window.FrameRateRecorder !== "function") {
        window.FrameRateRecorder = provide();
      }
    });
  }

  /**
   * Starts recording the frame rate.
   *
   * @returns {Promise<void>}
   */
  startRecordingFrameRate({
    maxRecords = 60 * 60,
    shouldStopWhenFull = true,
  } = {}) {
    return this.page.evaluate(
      ({ maxRecords, shouldStopWhenFull }) => {
        if (typeof window.FrameRateRecorder !== "function") {
          throw new Error(
            "FrameRateRecorder is not defined. Call `injectFrameRateRecorder` first.",
          );
        }

        window.penpotFrameRateRecorder_OnEnded = () => {
          throw new Error("Insufficient buffer size to record frame rate.");
        };
        window.penpotFrameRateRecorder = new FrameRateRecorder({
          maxRecords,
          shouldStopWhenFull,
        });
        window.penpotFrameRateRecorder.addEventListener(
          "ended",
          window.penpotFrameRateRecorder_OnEnded,
        );
        window.penpotFrameRateRecorder.start();
      },
      { maxRecords, shouldStopWhenFull },
    );
  }

  /**
   * Stops recording the frame rate.
   *
   * @returns {Promise<FrameRateEntry[]>}
   */
  stopRecordingFrameRate() {
    return this.page.evaluate(() => {
      if (typeof window.FrameRateRecorder !== "function") {
        throw new Error(
          "FrameRateRecorder is not defined. Call `injectFrameRateRecorder` first.",
        );
      }
      window.penpotFrameRateRecorder.removeEventListener(
        "ended",
        window.penpotFrameRateRecorder_OnEnded,
      );
      window.penpotFrameRateRecorder.stop();
      return window.penpotFrameRateRecorder.takeRecords();
    });
  }

  /**
   * Starts all the recorders.
   *
   * @returns {Promise<void>}
   */
  async startAll() {
    return Promise.all([
      this.startRecordingFrameRate(),
      this.startObservingLongTasks(),
    ]);
  }

  /**
   * Stops all the recorders.
   *
   * @returns {Promise<[FrameRateRecords, LongTasks]>}
   */
  stopAll() {
    return Promise.all([
      this.stopRecordingFrameRate(),
      this.stopObservingLongTasks(),
    ]);
  }

  /**
   * Calculates the average frame rate.
   *
   * @param {Array<FrameRateEntry>} frameRateRecords
   * @returns {number}
   */
  calculateAverageFrameRate(frameRateRecords) {
    if (frameRateRecords.length === 0)
      return 0

    return frameRateRecords.reduce((sum, record) => {
      return sum + record.value;
    }, 0) / frameRateRecords.length;
  }

  /**
   * Calculates the average long task duration.
   *
   * @param {Array<LongTaskEntry>} longTasks
   * @returns {number}
   */
  calculateAverageLongTaskDuration(longTasks) {
    if (longTasks.length === 0)
      return 0

    return longTasks.reduce((sum, record) => {
      return sum + record.duration;
    }, 0) / longTasks.length;
  }

  /**
   * Calculates the averages of the frame rate
   * and long task duration.
   *
   * @param {Array<FrameRateEntry>} frameRateRecords
   * @param {Array<LongTaskEntry>} longTasks
   * @returns {[number, number]}
   */
  calculateAverages(frameRateRecords, longTasks) {
    return [
      this.calculateAverageFrameRate(frameRateRecords),
      this.calculateAverageLongTaskDuration(longTasks),
    ];
  }

  /**
   * Performs pan operations on the document.
   *
   * @param {number} dx
   * @param {number} dy
   * @param {number} steps
   * @returns {Promise<void>}
   */
  async pan(dx, dy, steps) {
    await this.viewportControls.click();
    await this.page.mouse.down({ button: "middle" });
    for (let index = 0; index < steps; index++) {
      await this.page.mouse.move(dx, dy);
    }
    await this.page.mouse.up({ button: "middle" });
  }

  /**
   * Performs zoom operations on the document.
   *
   * @param {number} dy
   * @param {number} steps
   * @returns {Promise<void>}
   */
  async zoom(dy, steps) {
    await this.viewportControls.click();
    await this.page.keyboard.down("Control");
    for (let index = 0; index < steps; index++) {
      await this.page.mouse.wheel(0, dy);
    }
    await this.page.keyboard.up("Control");
  }
};
