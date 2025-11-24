export type SizeInNumber = number;
export type SizeInPx = `${SizeInNumber}px`;
export type Size = SizeInNumber | SizeInPx | string;
export type RGBColor = `rgb(${string}, ${string}, ${string})`;
export type RGBAColor = `rgba(${string}, ${string}, ${string}, ${string})`;
export type HexColor = `#${string}`;
export type Color = RGBColor | RGBAColor | HexColor | string;

export class SampleData {
  color: ColorSampleData = new ColorSampleData();
  size: SizeInNumber | SizeInPx = 16;
}

export class ColorSampleData {
  redHexCode: HexColor = '#ff0000';
  greenHexCode: HexColor = '#00ff00';
  greenHexCode1: HexColor = '#0F602A';
  greenHexCode2: HexColor = '#83B092';
  greenHexCode3: HexColor = '#326F46';
  blueHexCode: HexColor = '#0000ff';
  blackHexCode: HexColor = '#000000';
  whiteHexCode: HexColor = '#ffffff';
  pinkHexCode: HexColor = '#C41ABC';
  purpleHexCode: HexColor = '#660E62';
  grayHexCode: HexColor = '#B1B2B5';
  transparentHexCode: HexColor = '#00000000';

  private getRandomRGBColor(): string {
    return Math.floor(Math.random() * 256).toString();
  }

  getRgbColor(): RGBColor {
    return `rgb(${this.getRandomRGBColor()}, ${this.getRandomRGBColor()}, ${this.getRandomRGBColor()})` as RGBColor;
  }

  getRgbaColor(): RGBAColor {
    return `rgba(${this.getRandomRGBColor()}, ${this.getRandomRGBColor()}, ${this.getRandomRGBColor()}, ${Math.random().toFixed(2)})` as RGBAColor;
  }

  getRandomHexCode(): HexColor {
    let letters: string = '0123456789abcdef';
    let hexColor = '#';
    for (let i = 0; i < 6; i++) {
      hexColor += letters[Math.floor(Math.random() * 16)];
    }
    return hexColor as HexColor;
  }
}
