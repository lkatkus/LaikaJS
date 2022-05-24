export class WebAudioPlayer {
  // current: string;
  // options: { music: { on: boolean }; sfx: { on: boolean } };
  // available: { [key: string]: { isLoaded: boolean; data: HTMLAudioElement } };

  constructor(options) {
    this.options = options;
    this.current = null;
    this.available = {};
  }

  load = async (name, src, options) => {
    if (this.available[name]) {
      return;
    }

    const data = await new Promise((res) => {
      const audio = new Audio(src);

      for (const key in options) {
        audio[key] = options[key];
      }

      audio.oncanplaythrough = () => {
        res(audio);
      };
    });

    this.available[name] = { isLoaded: true, data: data };
  };

  preload = (name, src, options) => {
    if (this.available[name]) {
      return;
    }

    const audio = new Audio(src);

    for (const key in options) {
      audio[key] = options[key];
    }

    this.available[name] = { isLoaded: false, data: null };

    audio.oncanplaythrough = () => {
      this.available[name] = { isLoaded: true, data: audio };
    };
  };

  fadeIn = async (audio, onended) => {
    let fadeInInterval;
    const maxVolume = audio.volume;

    audio.volume = 0;
    audio.onended = onended;
    audio.play();

    await new Promise((res) => {
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

  fadeOut = async (audio) => {
    let fadeOutInterval;
    const maxVolume = audio.volume;

    await new Promise((res) => {
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

  play = async (name, onended, skipFade) => {
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

  updateOptions = (newOptions) => {
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
