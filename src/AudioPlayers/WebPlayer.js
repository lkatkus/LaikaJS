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

  fadeIn = async (audio) => {
    let fadeInInterval;

    audio.volume = 0;
    audio.play();

    await new Promise((res) => {
      let volume = 0;

      fadeInInterval = setInterval(() => {
        if (volume >= 1) {
          clearInterval(fadeInInterval);
          res();
        } else {
          audio.volume = volume;

          volume += 0.1;
        }
      }, 50);
    });

    audio.volume = 1;
  };

  fadeOut = async (audio) => {
    let fadeOutInterval;

    await new Promise((res) => {
      let volume = 1;

      fadeOutInterval = setInterval(() => {
        if (volume <= 0) {
          clearInterval(fadeOutInterval);
          res();
        } else {
          audio.volume = volume;

          volume -= 0.1;
        }
      }, 50);
    });

    audio.pause();
    audio.volume = 1;
  };

  play = async (name) => {
    if (name === this.current) {
      return;
    }

    if (this.current) {
      this.fadeOut(this.available[this.current].data);
    }

    if (this.available[name].data && this.available[name].isLoaded) {
      this.current = name;

      if (this?.options?.music?.on) {
        this.fadeIn(this.available[name].data);
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

    this.available[this.current].data.pause();
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
