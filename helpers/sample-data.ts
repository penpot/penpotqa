export type SizeInNumber = number;
export type SizeInPx = `${SizeInNumber}px`;
export type Size = SizeInNumber | SizeInPx | string;

export type RGBColor = `rgb(${number}, ${number}, ${number})`;
export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HEXColor = `#${string}`;
export type Color = RGBColor | RGBAColor | HEXColor | string;

function getRandomHexColor(): number {
  return Math.floor(Math.random() * 256);
}

export function getRgbColor(): RGBColor {
  return `rgb(${getRandomHexColor()}, ${getRandomHexColor()}, ${getRandomHexColor()})`;
}
