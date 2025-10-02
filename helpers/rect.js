/**
 * Creates a DOMPoint.
 *
 * @param {number} [x=0]
 * @param {number} [y=0]
 * @param {number} [z=0]
 * @param {number} [w=1]
 * @returns {DOMPoint}
 */
export function createPoint(x = 0, y = 0, z = 0, w = 1) {
  if (!('DOMPoint' in globalThis)) {
    class DOMPoint {
      static fromPoint({ x = 0, y = 0, z = 0, w = 1 }) {
        return new DOMPoint(x, y, z, w);
      }

      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
      }
    }

    globalThis.DOMPoint = DOMPoint;
  }
  return new DOMPoint(x, y, z, w);
}

/**
 * Creates a DOMRect.
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {DOMRect}
 */
export function createRect(x = 0, y = 0, width = 0, height = 0) {
  if (!('DOMRect' in globalThis)) {
    class DOMRect {
      static fromRect({ x, y, width, height }) {
        return new DOMRect(x, y, width, height);
      }

      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }

      get top() {
        return this.y;
      }

      get left() {
        return this.x;
      }

      get bottom() {
        return this.y + this.height;
      }

      get right() {
        return this.x + this.width;
      }
    }

    globalThis.DOMRect = DOMRect;
  }
  return new DOMRect(x, y, width, height);
}

/**
 * Returns the center point of a DOMRect.
 *
 * @param {DOMRect} rect
 * @returns {DOMPoint}
 */
export function getCenterPoint(rect) {
  return createPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, 0, 1);
}

export default {
  createRect,
  createPoint,
  getCenterPoint,
};
