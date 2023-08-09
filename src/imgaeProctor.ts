class ImageDetector {
  private shutterTimer: number = 3000;
  private videoElement: any;
  private modal: HTMLDivElement;
  private timer: HTMLParagraphElement;
  private box: HTMLDivElement;
  private canvasElement: HTMLCanvasElement;
  private localStorageKey: string = "Capture";
  private intervalId: number | any;
  private mediaStream: MediaStream | null;

  constructor() {
    this.videoElement = document.createElement("video");
    this.modal = document.createElement("div");
    this.box = document.createElement("div");
    this.timer = document.createElement("p");
    this.canvasElement = document.createElement("canvas");
    this.mediaStream = null;
  }

  startCapture(key: string, shutterTime: number): void {
    this.shutterTimer = shutterTime;
    this.localStorageKey = key;
    this.createVideoBox();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.mediaStream = stream;
        this.videoElement.srcObject = this.mediaStream;
        document.body.appendChild(this.modal);
        this.videoElement.play();
        this.videoElement.addEventListener("loadedmetadata", () => {
          this.captureImage();
        });
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
    clearInterval(this.intervalId);
    this.timer.innerText = this.shutterTimer.toString();
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    this.intervalId = setInterval(() => {
      this.shutterTimer -= 1;
      this.timer.innerText = this.shutterTimer.toString();
      if (this.shutterTimer < 0) {
        this.timer.innerText = "";
        clearInterval(this.intervalId);
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
        this.modal.style.display = "none";

        try {
          localStorage.setItem(this.localStorageKey, imageDataURL);
          console.log("Image captured and saved in localStorage.");
          this.stopCapture();
        } catch (error) {
          console.log("Error storing the image in localstorage", error);
          this.stopCapture();
        }
      }
    }, 1000);
  }

  private createVideoBox(): void {
    this.videoElement.width = "320";
    this.videoElement.height = "240";
    this.box.style.width = "320px";
    this.box.style.height = "240px";
    this.box.style.position = "relative";
    this.box.style.border = "1px solid black";
    this.box.appendChild(this.videoElement);
    this.box.appendChild(this.timer);
    this.timer.style.position = "absolute";
    this.timer.style.fontSize = "20px";
    this.timer.style.top = "13px";
    this.timer.style.left = "125px";
    this.timer.style.color = "white";
    this.timer.style.fontSize = "69px";

    this.modal.style.border = "1px solid";
    this.modal.style.position = "absolute";
    this.modal.style.width = "100vw";
    this.modal.style.height = "100vh";
    this.modal.style.top = "0";
    this.modal.style.left = "0";
    this.modal.style.display = "flex";
    this.modal.style.justifyContent = "center";
    this.modal.style.background = "#9494947a";
    this.modal.appendChild(this.box);
  }
}

export default ImageDetector;
