import type { Rgba, SvgPoint } from '@pages/workspace/exported-svg-page';

// Contents of documents/test_exporter_file.penpot, the helper file of the Qase
// "Export (WebGL)" suites. Its "Export QA" page has one layer per export case.
// Sizes and points are in the coordinates of each exported SVG (1 unit = 1px).
export const EXPORTER_FILE = 'documents/test_exporter_file.penpot';
export const EXPORT_QA_PAGE = 'Export QA';

export const ExportQaLayer = {
  Basic: 'Basic',
  Rect: 'Rect',
  Fills: 'Fills',
  Shadow: 'Shadow',
  Masked: 'Masked',
  SoftMask: 'Soft mask',
  MaskedShadow: 'Masked shadow',
  Inner: 'Inner',
  Center: 'Center',
  Outer: 'Outer',
} as const;

export const RED: Rgba = { r: 255, g: 0, b: 0, a: 255 };
export const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 255 };
export const STROKE_BLUE: Rgba = { r: 0, g: 0, b: 255, a: 255 };

// "Basic" board, 400x300 with "Clip content" on, on a #F0F0F0 fill. A
// "Group 50%" of a blue and a red square, a #0080FF "Multiply" rectangle, and
// an "Overflow" red rectangle (x 350-450, y 200-300) that crosses its right edge.
export const BASIC_BOARD = {
  size: { width: 400, height: 300 },
  unclippedSize: { width: 450, height: 300 },
  overflowInsideBoard: { x: 390, y: 250 } as SvgPoint,
  overflowOutsideBoard: { x: 430, y: 250 } as SvgPoint,
  // Blue square of "Group 50%" at half opacity over #F0F0F0
  halfTransparentSquare: { x: 30, y: 170 } as SvgPoint,
  halfTransparentSquareColor: { r: 120, g: 120, b: 248, a: 255 } as Rgba,
  // #0080FF multiplied by #F0F0F0 (it would be #0080FF with a normal blend)
  multiplyRect: { x: 200, y: 210 } as SvgPoint,
  multiplyRectColor: { r: 0, g: 120, b: 240, a: 255 } as Rgba,
};

// "Shadow": red 100x80 rectangle with a drop shadow. Each renderer frames it
// differently, so its centre is at a different point of each export.
export const SHADOW_RECT_CENTER: Record<'webgl' | 'classic', SvgPoint> = {
  webgl: { x: 65, y: 55 },
  classic: { x: 98, y: 88 },
};

// "Masked", "Soft mask" and "Masked shadow": groups masked by a 120x80 ellipse
// with a #3D7BFF fill under the whole group and a photo over its right half.
export const MASK_FILL: Rgba = { r: 0x3d, g: 0x7b, b: 0xff, a: 255 };
export const MASKED = {
  insideEllipse: { x: 30, y: 40 } as SvgPoint,
  photoHalf: { x: 90, y: 40 } as SvgPoint,
  outsideEllipse: { x: 3, y: 3 } as SvgPoint,
};
// Same geometry as "Masked"; the mask ellipse has 40% fill opacity
export const SOFT_MASK = {
  center: { x: 60, y: 40 } as SvgPoint,
  maskOpacity: 0.4,
  outsideEllipse: { x: 3, y: 3 } as SvgPoint,
};
// The masked 120x80 ellipse (drawn around 63,45 of a 150.7x110.7 export) has
// an inner shadow and a drop shadow towards the lower right.
export const MASKED_SHADOW = {
  insideEllipse: { x: 63, y: 45 } as SvgPoint,
  shadowPastRightEdge: { x: 128, y: 60 } as SvgPoint,
  shadowBelowBottomEdge: { x: 75, y: 90 } as SvgPoint,
  emptyCorner: { x: 140, y: 100 } as SvgPoint,
};

// "Inner", "Center" and "Outer": white 100x80 rectangles with a 10px blue
// stroke of that alignment. Each point pair is the middle of the left stroke
// and the white fill next to it.
export const STROKES = {
  [ExportQaLayer.Inner]: {
    size: { width: 100, height: 80 },
    stroke: { x: 5, y: 40 } as SvgPoint,
    fill: { x: 20, y: 40 } as SvgPoint,
  },
  [ExportQaLayer.Center]: {
    size: { width: 110, height: 90 },
    stroke: { x: 5, y: 45 } as SvgPoint,
    fill: { x: 20, y: 45 } as SvgPoint,
  },
  [ExportQaLayer.Outer]: {
    size: { width: 120, height: 100 },
    stroke: { x: 5, y: 50 } as SvgPoint,
    fill: { x: 20, y: 50 } as SvgPoint,
  },
};

// "Outer" rotated 30°: the export grows to the bounding box of the rotated
// 120x100 stroke footprint. Points along y=68: outside the shape, on the left
// stroke and on the white fill.
export const ROTATED_OUTER_STROKE = {
  rotation: '30',
  size: { width: 153.92307, height: 146.60251 },
  outside: { x: 4, y: 68 } as SvgPoint,
  stroke: { x: 16, y: 68 } as SvgPoint,
  fill: { x: 40, y: 68 } as SvgPoint,
};
