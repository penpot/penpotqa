import { expect } from "@playwright/test";
import { BasePage } from "./base-page";
import { createPoint, createRect, getCenterPoint } from "../helpers/rect";
import { degreesToRadians } from "../helpers/angle";

exports.PerformancePage = class PerformancePage extends BasePage {
  /**
   * Constructor
   *
   * @param {import("@playwright/test").Page} page
   */
  constructor(page) {
    super(page);

    this.viewportControls = page.locator(".viewport-controls");
    this.selectionHandlers = page.locator(".selection-handlers");
  }

  /**
   * Wait for the page to be loaded.
   *
   * @returns {Promise<void>}
   */
  async waitForPageLoaded() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for the viewport controls to be visible.
   *
   * @returns {Promise<void>}
   */
  async waitForViewportControls() {
    await this.viewportControls.click();
  }

  /**
   * Wait for the selection handlers to be visible.
   *
   * @returns {Promise<void>}
   */
  async waitForSelectionHandlers() {
    await this.page.waitForSelector(".selection-handlers", { delay: 100 });
  }

  /**
   * Starts observing long tasks.
   *
   * @returns {Promise<void>}
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
    if (frameRateRecords.length === 0) return 0;

    return (
      frameRateRecords.reduce((sum, record) => {
        return sum + record.value;
      }, 0) / frameRateRecords.length
    );
  }

  /**
   * Calculates the average long task duration.
   *
   * @param {Array<LongTaskEntry>} longTasks
   * @returns {number}
   */
  calculateAverageLongTaskDuration(longTasks) {
    if (longTasks.length === 0) return 0;

    return (
      longTasks.reduce((sum, record) => {
        return sum + record.duration;
      }, 0) / longTasks.length
    );
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
   * Returns the locator of the element.
   *
   * @param {string|Locator} selectorOrLocator
   * @returns {Promise<Locator>}
   */
  async getSelectorOrLocator(selectorOrLocator) {
    if (typeof selectorOrLocator === "string") {
      return this.page.locator(selectorOrLocator);
    }
    return selectorOrLocator;
  }

  /**
   * Returns the bounding client rect of the element.
   *
   * @param {string|Locator} selector
   * @returns {Promise<DOMRect>}
   */
  async getBoundingClientRect(selectorOrLocator) {
    const locator = await this.getSelectorOrLocator(selectorOrLocator);
    return locator.boundingBox();
  }

  /**
   * Returns the aggregated bounding client rect of the elements.
   *
   * @param {Array<string|Locator>} selectorsOrLocators
   * @returns {Promise<DOMRect>}
   */
  async getAggregatedBoundingClientRect(selectorsOrLocators) {
    const boundingBoxes = await Promise.all(
      selectorsOrLocators.map((selectorOrLocator) =>
        this.getBoundingClientRect(selectorOrLocator),
      ),
    );

    const boundingClientRect = await Promise.all(
      boundingBoxes.reduce((rect, boundingBox) => {
        const { top, left, bottom, right } = boundingBox;
        rect.top = Math.min(top, rect.top);
        rect.left = Math.min(left, rect.left);
        rect.bottom = Math.max(bottom, rect.bottom);
        rect.right = Math.max(right, rect.right);
        return rect;
      }, createRect(Infinity, Infinity, -Infinity, -Infinity)),
    );

    return boundingClientRect
  }

  /**
   * Undo the last action.
   */
  async undo() {
    await this.page.keyboard.down("Control");
    await this.page.keyboard.press("KeyZ");
    await this.page.keyboard.up("Control");
  }

  /**
   * Redoes the last action.
   */
  async redo() {
    await this.page.keyboard.down("Control");
    await this.page.keyboard.press("KeyY");
    await this.page.keyboard.up("Control");
  }

  /**
   * Waits for the page to be loaded.
   */
  async setup() {
    await this.waitForPageLoaded();
    await this.injectFrameRateRecorder();
    await this.waitForViewportControls();
    await this.startAll();
  }

  /**
   * Measures the frame rate and long task duration.
   *
   * @returns {Promise<[number, number]>}
   */
  async measure() {
    const [frameRateRecords, longTasksRecords] = await this.stopAll();
    const averageFrameRate = this.calculateAverageFrameRate(frameRateRecords);
    console.log("FPS", averageFrameRate);
    expect(averageFrameRate).toBeGreaterThan(30);
    const averageLongTaskDuration =
      this.calculateAverageLongTaskDuration(longTasksRecords);
    console.log("LTS", averageLongTaskDuration);
    expect(averageLongTaskDuration).toBeLessThan(100);
    return [averageFrameRate, averageLongTaskDuration];
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
    await this.waitForViewportControls();
    await this.page.mouse.down({ button: "middle" });
    await this.page.mouse.move(dx, dy, { steps });
    await this.page.mouse.up({ button: "middle" });
  }

  /**
   * Performs pan operations on the document.
   *
   * @param {number} fx
   * @param {number} fy
   * @param {number} tx
   * @param {number} ty
   * @param {number} steps
   * @returns {Promise<void>}
   */
  async panFromTo(fx, fy, tx, ty, steps) {
    await this.waitForViewportControls();
    await this.page.mouse.move(tx, ty);
    await this.page.mouse.down({ button: "middle" });
    await this.page.mouse.move(fx, fy, { steps });
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
    await this.waitForViewportControls();
    await this.page.keyboard.down("Control");
    for (let index = 0; index < steps; index++) {
      await this.page.mouse.wheel(0, dy);
    }
    await this.page.keyboard.up("Control");
  }

  /**
   * Centers an element in the viewport.
   *
   * @param {string} selector
   * @returns {Promise<ElementHandle>}
   */
  async centerInView(selectorOrLocator) {
    await this.waitForViewportControls();
    const viewportRect = await this.getBoundingClientRect(
      this.viewportControls,
    );
    const centerPoint = getCenterPoint(viewportRect);
    const element = await this.getSelectorOrLocator(selectorOrLocator);
    const elementRect = await this.getBoundingClientRect(element);
    const elementCenterPoint = getCenterPoint(elementRect);
    await this.panFromTo(
      centerPoint.x,
      centerPoint.y,
      elementCenterPoint.y,
      elementCenterPoint.x,
      10,
    );
    return element;
  }

  async centerSelectedInView() {
    const viewportRect = await this.getBoundingClientRect(
      this.viewportControls,
    );
    const centerPoint = getCenterPoint(viewportRect);
    const elementRect = await this.getBoundingClientRect(this.selectionHandlers);
    const elementCenterPoint = getCenterPoint(elementRect);
    await this.panFromTo(
      centerPoint.x,
      centerPoint.y,
      elementCenterPoint.y,
      elementCenterPoint.x,
      10,
    );
  }

  /**
   * Selects a document page.
   *
   * @param {string} pageId
   * @returns {Promise<void>}
   */
  async selectPage(pageId) {
    const pageItem = await this.page.locator(`[data-test="page-${pageId}"]`);
    await pageItem.scrollIntoViewIfNeeded();
    await pageItem.click();
  }

  async selectFrame(frameId) {
    const locator = await this.page.locator(frameId);
    await this.centerInView(this.selectionHandlers);
    await locator.click();
  }

  /**
   * Selects a document shape.
   *
   * @param {string} shapeId
   * @param {number} x
   * @param {number} y
   * @returns {Promise<DOMRect>}
   */
  async selectShape(shapeId, { x: dx = 2, y: dy = 2 } = {}) {
    const shape = await this.centerInView(shapeId);
    const { x, y } = await this.getBoundingClientRect(shape);
    await this.page.mouse.click(x + dx, y + dy);
    return shape;
  }

  /**
   * Selects multiple document shapes.
   *
   * @param {Array<string>} shapeIds
   * @returns {Promise<void>}
   */
  async selectShapes(shapeIds) {
    await this.page.keyboard.down("Shift");
    for (const shapeId of shapeIds) {
      const locator = await this.page.locator(shapeId);
      const { x, y, width, height } = await locator.boundingBox();
      console.log(x, y, width, height);
      await this.page.mouse.click(x + width / 2, y + height / 2);
      await this.page.waitForTimeout(100);
    }
    await this.page.keyboard.up("Shift");
    await this.page.waitForTimeout(100);
  }

  /**
   * Selects
   *
   * @param {Array<string>} shapeIds
   * @returns {Promise<DOMRect>}
   */
  async selectShapesWithRect(shapeIds) {
    // TODO: We should select the shapes with a rectangle.
    const boundingClientRect = await this.page.evaluate((shapeIds) => {
      const shapes = shapeIds.map((shapeId) => document.querySelector(shapeId));
      if (shapes.some((shape) => !shape)) {
        throw new Error(`Shape "shape-${shapeId}" not found.`);
      }
      const boundingClientRect = shapes.reduce((rect, shape) => {
        const { top, left, bottom, right } = shape.getBoundingClientRect();
        rect.top = Math.min(top, rect.top);
        rect.left = Math.min(left, rect.left);
        rect.bottom = Math.max(bottom, rect.bottom);
        rect.right = Math.max(right, rect.right);
        return rect;
      }, new DOMRect(Infinity, Infinity, -Infinity, -Infinity));
      return boundingClientRect;
    }, shapeIds);
  }

  /**
   * Returns a resize handler by its name.
   *
   * @param {string} name
   * @returns {Promise<ElementHandle>}
   */
  async getResizeHandler(name = "bottom-right") {
    const names = [
      "top",
      "bottom",
      "right",
      "left",
      "top-left",
      "top-right",
      "bottom-right",
      "bottom-left",
    ];

    // -}~:Ztva;:E]gU8u$[Vf

    const handlers = await this.page.$$("g.resize-handler");
    if (handlers.length < names.length) {
      throw new Error(`Invalid amount of resize handlers.`);
    }
    const index = names.indexOf(name);
    if (index === -1) {
      throw new Error(`Invalid resize handler name "${name}".`);
    }
    const handler = handlers[index];
    return handler;
  }

  /**
   * Returns a rotate handler by its position.
   *
   * @param {string} position
   * @returns {Promise<ElementHandle>}
   */
  async getRotateHandler(position = "top-left") {
    const positions = new Map([
      ["top-left", "0"],
      ["top-right", "90"],
      ["bottom-right", "180"],
      ["bottom-left", "270"],
    ]);
    return this.page.$(`rect.cursor-rotate-${positions.get(position)}`);
  }

  /**
   * Moves the passed selector or locator to the given coordinates.
   *
   * @param {string|Locator} selectorOrLocator
   * @param {number} x
   * @param {number} y
   * @param {number} [steps=10]
   * @returns {Promise<Locator>}
   */
  async moveShapeBy(
    selectorOrLocator,
    x,
    y,
    { x: dx = 2, y: dy = 2, steps = 10 } = {},
  ) {
    const { x: ex, y: ey } = await this.getBoundingClientRect(
      selectorOrLocator,
    );
    await this.page.mouse.click(ex + dx, ey + dy);
    await this.page.waitForTimeout(100);
    await this.page.mouse.click(ex + dx, ey + dy);
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(ex + x, ey + y, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }

  /**
   * Moves the selected shape by the given coordinates.
   *
   * @param {number} x
   * @param {number} y
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async moveSelectedBy(x, y, { x: dx = 2, y: dy = 2, steps = 10 } = {}) {
    await this.waitForSelectionHandlers();
    const { x: ex, y: ey, width, height } = await this.getBoundingClientRect(this.selectionHandlers);
    console.log(x, y, width, height)
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(ex + x, ey + y, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }

  /**
   * Rotates the passed selector or locator to the given coordinates.
   *
   * @param {string|Locator} selectorOrLocator
   * @param {number} degrees
   * @param {number} [steps=10]
   * @returns {Promise<Locator>}
   */
  async rotateShapeBy(selectorOrLocator, degrees, { steps = 10 } = {}) {
    const boundingBox = await this.getBoundingClientRect(selectorOrLocator);
    const { x: centerX, y: centerY } = getCenterPoint(boundingBox);
    const rotateHandler = await this.getRotateHandler("top-left");
    const { x: rx, y: ry } = await this.getBoundingClientRect(rotateHandler);
    const radians = degreesToRadians(degrees);
    const dx = Math.cos(radians);
    const dy = Math.sin(radians);
    const d = Math.hypot(centerX - rx, centerY - ry);
    const x = centerX + dx * d;
    const y = centerY + dy * d;
    await rotateHandler.click();
    await this.page.waitForTimeout(100);
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(x, y, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }

  /**
   * Rotates the selected shape by the given degrees.
   *
   * @param {number} degrees
   * @param {object} [options={}]
   * @returns {Promise<void>}
   */
  async rotateSelectedBy(degrees, { steps = 10 } = {}) {
    await this.waitForSelectionHandlers();
    const { x: ex, y: ey } = await this.getBoundingClientRect(
      this.selectionHandlers,
    );
    const { x: centerX, y: centerY } = getCenterPoint(boundingBox);
    const rotateHandler = await this.getRotateHandler("top-left");
    const { x: rx, y: ry } = await this.getBoundingClientRect(rotateHandler);
    const radians = degreesToRadians(degrees);
    const dx = Math.cos(radians);
    const dy = Math.sin(radians);
    const d = Math.hypot(centerX - rx, centerY - ry);
    const x = centerX + dx * d;
    const y = centerY + dy * d;
    await rotateHandler.click();
    await this.page.waitForTimeout(100);
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(x, y, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }

  /**
   * Resizes the selected shapes by the given delta.
   *
   * @param {number} x
   * @param {number} y
   * @param {"top"|"bottom"|"right"|"left"|"top-left"|"top-right"|"bottom-right"|"bottom-left"} handler
   * @returns {Promise<void>}
   */
  async scaleShapeBy(
    selectorOrLocator,
    sx,
    sy,
    { x: dx = 2, y: dy = 2, steps = 10, handler = "bottom-right" } = {},
  ) {
    // Clicks on the element to select it.
    const { x: ex, y: ey } = await this.getBoundingClientRect(selectorOrLocator);
    await this.page.mouse.click(ex + dx, ey + dy);
    await this.waitForSelectionHandlers();

    const resizeHandler = await this.getResizeHandler(handler);
    const { x, y } = await this.getBoundingClientRect(resizeHandler);
    console.log(x, y, x + sx, y + sy);
    await resizeHandler.click();
    await this.page.waitForTimeout(100);
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(x + sx, y + sy, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }

  /**
   * Resizes the selected shapes by the given delta.
   *
   * @param {number} sx
   * @param {number} sy
   * @param {object} [options]
   * @returns {Promise<void>}
   */
  async scaleSelectedBy(sx, sy, { x: dx = 2, y: dy = 2, steps = 10, handler = "bottom-right" } = {}) {
    // Clicks on the element to select it.
    await this.waitForSelectionHandlers();
    const resizeHandler = await this.getResizeHandler(handler);
    const { x, y } = await this.getBoundingClientRect(resizeHandler);
    await resizeHandler.click();
    await this.page.waitForTimeout(100);
    await this.page.mouse.down({ button: "left" });
    await this.page.waitForTimeout(100);
    await this.page.mouse.move(x + sx, y + sy, { steps });
    await this.page.waitForTimeout(100);
    await this.page.mouse.up({ button: "left" });
  }
};
