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

interface IAudioElementLoaded<T> {
  isLoaded: true;
  data: T;
}

export interface IAudioElements<T> {
  [key: string]: IAudioElementIsLoading | IAudioElementLoaded<T>;
}

export interface IAudioElementOptions {
  volume?: number;
  loop?: boolean;
}

export interface IAudioPlayerOptions {
  music: { on: boolean };
  sfx: { on: boolean };
}

export interface IAudioPlayer<T extends IAudioElement> {
  current: string | null;
  options: IAudioPlayerOptions;
  available: IAudioElements<T>;

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
  setElementOptions: (audio: T, options: IAudioElementOptions) => void;

  // Actions handlers
  play: (
    name: string,
    onEnded?: () => void,
    skipFade?: boolean
  ) => Promise<void>;
  pause: () => void;
  resume: () => void;
  fadeIn: (audio: T, onEnded: () => void) => Promise<void>;
  fadeOut: (audio: T) => Promise<void>;
}
