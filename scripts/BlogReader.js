
import { TTSPlayer } from './TTSPlayer.js';

export class BlogReader {

  constructor() {

    // the parsed reading elements from the current HTML page.
    this.readingElements = [];
    this.index = 0;
    this.audioId = 'text-reader';

    // proxy configuration of a TTS service (Google TTS)
    this.ttsUrl = 'https://learner-gateway.uc.r.appspot.com/tts';
    this.requestBody = {
      input: {
        text: ''
      },
      voice: {
        languageCode: 'cmn-CN',
        name: 'cmn-CN-Chirp3-HD-Charon'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0
      }
    };

    // TTS player that plays the current reading element and fetches the next one in parallel.
    const fetchWithRetry = this.withRetry(this.fetchAudioForText.bind(this));
    this.player = new TTSPlayer(
      this.audioId,
      this.getNextText.bind(this),
      fetchWithRetry,
      this.resetReader.bind(this)
    );

  }

  static getInstance() {
    if (!BlogReader._instance) {
      BlogReader._instance = new BlogReader();
    }
    return BlogReader._instance;
  }

  /**
   * Reads the current blog page.
   */
  static readBlog() {
    const reader = this.getInstance();
    reader.createReadingElements();
    reader.start();
  }

  resetReader() {
    this.readingElements = [];
    this.index = 0;
    console.log("Done reading");
  }

  /**
   * Parses the blog element to split it into an array of text segments
   */
  createReadingElements() {
    const blogs = document.getElementsByClassName('blog');
    if (!blogs || blogs.length == 0) {
      console.log('No blog element');
      return;
    }
    const blog = blogs[0];
    this.readingElements.length = 0; // empty the array

    // Select all paragraph-like containers <p> <li>
    const elements = blog.querySelectorAll('p, li');

    elements.forEach(el => {
      // Split by <br> tags inside this element
      const htmlParts = el.innerHTML.split(/<br\s*\/?>/i);

      htmlParts.forEach(part => {
        // Convert any HTML entities and remove tags
        const text = part
          .replace(/<[^>]+>/g, '')     // Remove any remaining tags
          .replace(/&nbsp;/g, ' ')     // Convert &nbsp; to space
          .trim();

        // Skip empty lines
        if (!text) return;

        // Split by Chinese punctuation marks used as sentence delimiters
        const subparts = text.split(/[：。？！；.]/).map(s => s.trim()).filter(Boolean);

        // Add back the punctuation that was used as a delimiter
        let lastIndex = 0;
        for (const sub of subparts) {
          const original = text.slice(lastIndex);
          const match = original.match(/[：。？！；.]/);
          const punctuation = match ? match[0] : '';
          const sentence = sub + punctuation;
          if (sentence.length > 60) {
            const parts = sentence.split('，');
            for (const part of parts) {
              this.readingElements.push(part + '，')
              console.log('part len:', part.length, part + '，');
            }
          } else {
            this.readingElements.push(sentence);
            console.log('sentence len:', sentence.length, sentence);
          }
          lastIndex += original.indexOf(punctuation) + 1;
        }
      });
    });
  }

  /**
   * Gets the next reading element to read.
   * @returns 
   */
  getNextText() {
    return this.index < this.readingElements.length ? this.readingElements[this.index++] : null;
  }

  /**
   * Wraps the TTS function with retries (3 times)
   * @param {*} ttsFunc 
   * @param {*} maxRetries 
   * @param {*} baseDelay 
   * @returns 
   */
  withRetry(ttsFunc, maxRetries = 3, baseDelay = 500) {
    return async function (text) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await ttsFunc(text);
        } catch (err) {
          console.warn(`Attempt ${attempt} failed: ${err.message || err}`);
          if (attempt === maxRetries) throw err;
          await new Promise(res => setTimeout(res, baseDelay * attempt));
        }
      }
    };
  }

  /**
   * Calls to the TTS API to convert the text to an audio element.
   * The withRetry() function retries this 3 times if an error is thrown
   * @param {*} text 
   * @returns 
   */
  async fetchAudioForText(text) {
    this.requestBody.input.text = text;
    let errorMessage = '';
    console.log('text to convert:', text);

    try {
      const response = await fetch(this.ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.requestBody)
      });

      const data = await response.json();
      const audioContent = data.audioContent;
      if (audioContent) {
        const src = `data:audio/mp3;base64,${audioContent}`;
        return src;
        // const audio = new Audio();
        // audio.src = `data:audio/mp3;base64,${audioContent}`;
        // return audio;
      } else {
        errorMessage = 'empty audio content';
        console.error('Error: empty audio content');
      }
    } catch (error) {
      errorMessage = error.message;
      console.error("Error: " + error.message);
    }
    throw new Error(errorMessage);
  }

  // Start reading
  start() {
    this.player.start();
  }

  // Stop reading
  stop() {
    //this.player.stop();
  }
}

window.BlogReader = BlogReader;
