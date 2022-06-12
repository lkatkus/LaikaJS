export interface IAudioElement {
  volume: number;
  loop: boolean;
  play: (...args: any) => any;
  pause: (...args: any) => any;
  onended?: (...args: any) => any;
  oncanplaythrough?: (...args: any) => any;
}

interface IAudioElementIsLoading {
  isLoaded: false;
  data: null;
}

interface IAudioElementLoaded {
  isLoaded: true;
  data: IAudioElement;
}

export interface IAudioElements {
  [key: string]: IAudioElementIsLoading | IAudioElementLoaded;
}

export interface IAudioElementOptions {
  volume?: number;
  loop?: boolean;
}

export interface IAudioPlayerOptions {
  music: { on: boolean };
  sfx: { on: boolean };
}

export interface IAudioPlayer {
  current: string | null;
  options: IAudioPlayerOptions;
  available: IAudioElements;

  // Options handlers
  updateOptions: (newOptions: IAudioPlayerOptions) => void;
  onOptionsUpdate: () => void;

  // Data handlers
  load: (
    name: string,
    src: string,
    options: IAudioElementOptions
  ) => Promise<void>;
  preload: (name: string, src: string, options: IAudioElementOptions) => void;
  setElementOptions: (
    audio: IAudioElement,
    options: IAudioElementOptions
  ) => void;

  // Actions handlers
  play: (
    name: string,
    onEnded?: () => void,
    skipFade?: boolean
  ) => Promise<void>;
  pause: () => void;
  resume: () => void;
  fadeIn: (audio: IAudioElement, onEnded: () => void) => Promise<void>;
  fadeOut: (audio: IAudioElement) => Promise<void>;
}
