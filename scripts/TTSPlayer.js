
export class TTSPlayer {

  /**
   * 
   * @param {*} audioId - the <audio> element id that is for reading the text.
   * @param {*} getNextText - function from the caller to read the next text
   * @param {*} fetchAudioForText - function from the caller to use TTS API to convert the text to audio
   * @param {*} onDone - function from the called for the end of the of the call
   */
  constructor(audioId, getNextText, fetchAudioForText, onDone = () => { }) {
    this.getNextText = getNextText; // Function: () => string | null
    this.fetchAudioForText = fetchAudioForText; // Function: (text) => Promise<HTMLAudioElement>
    this.onDone = onDone;

    // audio sources buffer <aodio src=''> [current, next]
    this.buffer = [null, null];
    this.audioId = audioId;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.stopped = false;
  }

  /**
   * Starts reading the text that is supplied by the call's function getNextText();
   * @returns 
   */
  async start() {
    this.stopped = false;
    if (this.isPlaying) return;

    // Fetch initial buffer
    const firstText = this.getNextText();
    if (!firstText) return;
    this.buffer[0] = await this.fetchAudioForText(firstText);

    // Start playing
    this.playLoop();
  }

  /**
   * Reads and preload the text parallelly. (Reads the current, preload the next while reading)
   */
  async playLoop() {
    this.isPlaying = true;

    while (this.buffer[0] && !this.stopped) {
      const currentAudioSrc = this.buffer[0];

      // Begin fetching the next audio in parallel
      const fetchNext = (async () => {
        const nextText = this.getNextText();
        if (nextText) {
          try {
            this.buffer[1] = await this.fetchAudioForText(nextText);
          } catch (err) {
            console.error("Error fetching next audio:", err);
            this.buffer[1] = null;
          }
        }
      })();

      // Play the current audio while the next is being fetched
      await this.playAudio(currentAudioSrc);

      // Wait for the fetch to complete before looping
      await fetchNext;

      // Shift buffer
      this.buffer[0] = this.buffer[1];
      this.buffer[1] = null;
    }

    this.isPlaying = false;
    this.onDone();
  }

  async playAudio(audioSrc) {
    return new Promise((resolve) => {
      const audio = document.getElementById(this.audioId);
      audio.src = audioSrc;
      audio.play();
      audio.onended = resolve;
    });
  }

  stop() {
    this.stopped = true;
    if (this.buffer[0]) {
      const audio = document.getElementById(this.audioId);
      audio.src = this.buffer[0];
      audio.pause();
      audio.currentTime = 0;
    }
  }
}
window.TTSPlayer = TTSPlayer;
