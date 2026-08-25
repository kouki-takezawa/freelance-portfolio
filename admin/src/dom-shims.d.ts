// @jsquash/jpegの型定義がDOMのImageData型を前提にしているため、
// DOM libを持たないWorkers環境向けに最小限の形だけ宣言する
interface ImageData {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
}
