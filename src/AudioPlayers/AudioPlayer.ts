import {
  IAudioElement,
  IAudioElementOptions,
  IAudioElements,
  IAudioPlayer,
  IAudioPlayerOptions,
} from './AudioPlayer.model';

interface AudioElementConstructable<T> {
  new (src: string): T;
}

export class AudioPlayer implements IAudioPlayer {
  AudioElement: AudioElementConstructable<IAudioElement>;
  current: string | null;
  options: IAudioPlayerOptions;
  available: IAudioElements;

  constructor(
    AudioElement: AudioElementConstructable<IAudioElement>,
    options: IAudioPlayerOptions
  ) {
    this.options = options;
    this.current = null;
    this.available = {};

    this.AudioElement = AudioElement;
  }

  updateOptions = (newOptions: IAudioPlayerOptions) => {
    this.options = newOptions;

    this.onOptionsUpdate();
  };

  onOptionsUpdate = () => {
    const {
      music,
      // sfx
    } = this.options;

    if (!music.on) {
      this.pause();
    } else if (music.on) {
      this.resume();
    }
  };

  load = async (name: string, src: string, options: IAudioElementOptions) => {
    if (this.available[name]) {
      return;
    }

    const data = await new Promise<IAudioElement>((res) => {
      const audio = new this.AudioElement(src);

      this.setElementOptions(audio, options);

      audio.oncanplaythrough = () => {
        res(audio);
      };
    });

    this.available[name] = { isLoaded: true, data: data };
  };

  preload = (name: string, src: string, options: IAudioElementOptions) => {
    if (this.available[name]) {
      return;
    }

    const audio = new this.AudioElement(src);

    this.setElementOptions(audio, options);

    this.available[name] = { isLoaded: false, data: null };

    audio.oncanplaythrough = () => {
      this.available[name] = {
        isLoaded: true,
        data: audio,
      };
    };
  };

  setElementOptions = (audio: IAudioElement, options: IAudioElementOptions) => {
    (Object.keys(options) as Array<keyof typeof options>).forEach((key) => {
      if (key === 'loop') {
        audio[key] = options[key] || false;
      } else if (key === 'volume') {
        audio[key] = options[key] || 1;
      }
    });
  };

  play = async (name: string, onEnded?: () => void, skipFade?: boolean) => {
    if (name === this.current) {
      return;
    }

    if (this.current) {
      const currentElement = this.available[this.current];

      if (currentElement.isLoaded) {
        this.fadeOut(currentElement.data);
      }
    }

    if (this.available[name].data && this.available[name].isLoaded) {
      this.current = name;
      const audioElement = this.available[name];

      if (audioElement.isLoaded && this?.options?.music?.on) {
        if (skipFade) {
          audioElement.data.onended = onEnded;
          audioElement.data.play();
        } else {
          this.fadeIn(audioElement.data, onEnded);
        }
      }
    } else {
      const checker = setInterval(() => {
        if (this.available[name].data && this.available[name].isLoaded) {
          clearInterval(checker);

          this.play(name);
        }
      }, 500);
    }
  };

  pause = () => {
    if (!this.current) {
      return;
    }

    const currentElement = this.available[this.current];

    if (currentElement.isLoaded) {
      this.fadeOut(currentElement.data);
    }
  };

  resume = () => {
    if (!this.current) {
      return;
    }

    const currentElement = this.available[this.current];

    if (currentElement.isLoaded) {
      currentElement.data.play();
    }
  };

  fadeIn = async (audio: IAudioElement, onEnded?: () => void) => {
    const maxVolume = audio.volume;
    let fadeInInterval: ReturnType<typeof setInterval>;

    audio.volume = 0;
    audio.onended = onEnded;
    audio.play();

    await new Promise<void>((res) => {
      let volume = 0;

      fadeInInterval = setInterval(() => {
        if (volume >= maxVolume) {
          clearInterval(fadeInInterval);
          res();
        } else {
          audio.volume = volume;

          volume += 0.1;
        }
      }, 20);
    });

    audio.volume = maxVolume;
  };

  fadeOut = async (audio: IAudioElement) => {
    const maxVolume = audio.volume;
    let fadeOutInterval: ReturnType<typeof setInterval>;

    await new Promise<void>((res) => {
      let volume = maxVolume;

      fadeOutInterval = setInterval(() => {
        if (volume <= 0) {
          clearInterval(fadeOutInterval);
          res();
        } else {
          audio.volume = volume;

          volume -= 0.1;
        }
      }, 20);
    });

    audio.pause();
    audio.volume = maxVolume;
  };
}
