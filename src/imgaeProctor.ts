class ImageDetector {
  private interval: number = 1000;
  private videoElement: HTMLVideoElement;
  private canvasElement: HTMLCanvasElement;
  private localStorageKey: string = "Capture";
  private intervalId: number | any;
  private mediaStream: MediaStream | null;

  constructor() {
    this.videoElement = document.createElement("video");
    this.canvasElement = document.createElement("canvas");
    this.mediaStream = null;
  }

  startCapture(interval: number, key: string): void {
    this.interval = interval;
    this.localStorageKey = key;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.videoElement.srcObject = stream;
        // this.videoElement.addEventListener("loadedmetadata", () => {
          this.intervalId = setInterval(
            () => this.captureImage(),
            this.interval
          );
        // });
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }

  stopCapture(): void {
    clearInterval(this.intervalId);
    this.videoElement.srcObject = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  private captureImage(): void {
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    const context = this.canvasElement.getContext("2d");
    context?.drawImage(
      this.videoElement,
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );
    const imageDataURL = this.canvasElement.toDataURL("image/jpeg");
    console.log(imageDataURL);

    localStorage.setItem(this.localStorageKey, imageDataURL);
    console.log("Image captured and saved in localStorage.");
  }
}

export default ImageDetector;
