export type SizeInNumber = number;
export type SizeInPx = `${SizeInNumber}px`;
export type Size = SizeInNumber | SizeInPx | string;
export type RGBColor = `rgb(${string}, ${string}, ${string})`;
export type RGBAColor = `rgba(${string}, ${string}, ${string}, ${string})`;
export type HexColor = `#${string}`;
export type Color = RGBColor | RGBAColor | HexColor | string;

export class SampleData {
  color: ColorSampleData = new ColorSampleData();
}

export class ColorSampleData {
  redHexCode: HexColor = '#ff0000';
  greenHexCode: HexColor = '#00ff00';
  blueHexCode: HexColor = '#0000ff';
  blackHexCode: HexColor = '#000000';
  whiteHexCode: HexColor = '#ffffff';
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
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];
    let hexCode = '#';

    while (hexCode.length < 7) {
      hexCode += digits[Math.round(Math.random() * digits.length)];
    }
    return hexCode as HexColor;
  }
}
