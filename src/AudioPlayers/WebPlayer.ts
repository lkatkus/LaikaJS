interface IWebAudioPlayerOptions {
  music: { on: boolean };
  sfx: { on: boolean };
}

interface IWebAudioPlayOptions {
  volume?: number;
  loop?: boolean;
}

export class WebAudioPlayer {
  current: string;
  options: IWebAudioPlayerOptions;
  available: { [key: string]: { isLoaded: boolean; data: HTMLAudioElement } };

  constructor(options: IWebAudioPlayerOptions) {
    this.options = options;
    this.current = null;
    this.available = {};
  }

  setOptions = (audio: HTMLAudioElement, options: IWebAudioPlayOptions) => {
    (Object.keys(options) as Array<keyof typeof options>).forEach((key) => {
      if (key === 'loop') {
        audio[key] = options[key];
      } else if (key === 'volume') {
        audio[key] = options[key];
      }
    });
  };

  load = async (name: string, src: string, options: IWebAudioPlayOptions) => {
    if (this.available[name]) {
      return;
    }

    const data = await new Promise<HTMLAudioElement>((res) => {
      const audio = new Audio(src);

      this.setOptions(audio, options);

      audio.oncanplaythrough = () => {
        res(audio);
      };
    });

    this.available[name] = { isLoaded: true, data: data };
  };

  preload = (name: string, src: string, options: IWebAudioPlayOptions) => {
    if (this.available[name]) {
      return;
    }

    const audio = new Audio(src);

    this.setOptions(audio, options);

    this.available[name] = { isLoaded: false, data: null };

    audio.oncanplaythrough = () => {
      this.available[name] = { isLoaded: true, data: audio };
    };
  };

  fadeIn = async (audio: HTMLAudioElement, onended: () => void) => {
    let fadeInInterval: ReturnType<typeof setInterval>;
    const maxVolume = audio.volume;

    audio.volume = 0;
    audio.onended = onended;
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

  fadeOut = async (audio: HTMLAudioElement) => {
    let fadeOutInterval: ReturnType<typeof setInterval>;
    const maxVolume = audio.volume;

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

  play = async (name: string, onended?: () => void, skipFade?: boolean) => {
    if (name === this.current) {
      return;
    }

    if (this.current) {
      this.fadeOut(this.available[this.current].data);
    }

    if (this.available[name].data && this.available[name].isLoaded) {
      this.current = name;
      const audioData = this.available[name].data;

      if (this?.options?.music?.on) {
        if (skipFade) {
          audioData.onended = onended;
          audioData.play();
        } else {
          this.fadeIn(audioData, onended);
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

    this.fadeOut(this.available[this.current].data);
  };

  resume = () => {
    if (!this.current) {
      return;
    }

    this.available[this.current].data.play();
  };

  updateOptions = (newOptions: IWebAudioPlayerOptions) => {
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
}
