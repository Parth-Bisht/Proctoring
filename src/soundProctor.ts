import ImageDetector from "./imgaeProctor";

class SoundDetector extends ImageDetector {
  private audioContext: AudioContext | undefined;
  private analyzer: AnalyserNode | undefined;
  private isAlerting: boolean = false;
  private alertTimeout: number | undefined;
  private threshold: number = 20;
  private alertDuration: number = 1000;

  constructor() {
    super();
    this.startAudioContext = this.startAudioContext.bind(this);
    this.processAudio = this.processAudio.bind(this);
    this.handleAlert = this.handleAlert.bind(this);
  }

  startAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = 1024;

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const source = this.audioContext!.createMediaStreamSource(stream);
          source.connect(this.analyzer!);

          this.processAudio();
        })
        .catch((error) => {
          console.error("Error accessing microphone:", error);
        });
    }
  }

  processAudio() {
    const bufferLength = this.analyzer!.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyzer!.getByteFrequencyData(dataArray);

    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const averageVolume = sum / bufferLength;

    if (averageVolume > this.threshold) {
      document.body.style.backgroundColor = "red";
      if (!this.isAlerting) {
        this.isAlerting = true;
        this.alertTimeout = window.setTimeout(
          this.handleAlert,
          this.alertDuration
        );
      }
    } else {
      document.body.style.backgroundColor = "green";
      if (this.isAlerting) {
        this.isAlerting = false;
        window.clearTimeout(this.alertTimeout);
      }
    }

    requestAnimationFrame(this.processAudio);
  }

  handleAlert() {
    alert(
      `Sound level exceeded the threshold for ${
        this.alertDuration / 1000
      } seconds!`
    );
  }

  initialize(threshold: number, alertDuration: number) {
    this.threshold = threshold;
    this.alertDuration = alertDuration;
    window.addEventListener("click", this.startAudioContext);
    window.addEventListener("keydown", this.startAudioContext);
  }

  destroy() {
    window.addEventListener("click", this.startAudioContext);
    window.addEventListener("keydown", this.startAudioContext);
    if (this.isAlerting) {
      window.clearTimeout(this.alertTimeout);
    }
  }
}

export default SoundDetector;
