import { GameAssets } from './assetLoader';

class AudioManager {
  private gameplay: HTMLAudioElement | null = null;
  private gameover: HTMLAudioElement | null = null;
  private bonusArgent: HTMLAudioElement | null = null;
  private bonusCgt: HTMLAudioElement | null = null;
  private muted: boolean = false;
  private volume: number = 0.5;

  init(assets: GameAssets) {
    this.gameplay = assets.audio.gameplay;
    this.gameover = assets.audio.gameover;
    this.bonusArgent = assets.audio.bonusArgent;
    this.bonusCgt = assets.audio.bonusCgt;

    if (this.gameplay) {
      this.gameplay.loop = true;
      this.gameplay.volume = this.volume;
    }
  }

  play(sound: 'gameplay' | 'gameover' | 'bonus-argent' | 'bonus-cgt') {
    if (this.muted) return;
    let audio: HTMLAudioElement | null = null;
    switch (sound) {
      case 'gameplay': audio = this.gameplay; break;
      case 'gameover': audio = this.gameover; break;
      case 'bonus-argent': audio = this.bonusArgent; break;
      case 'bonus-cgt': audio = this.bonusCgt; break;
    }
    if (!audio) return;
    if (sound !== 'gameplay') {
      audio.currentTime = 0;
    }
    audio.volume = this.volume;
    audio.play().catch(() => {});
  }

  stop(sound: 'gameplay' | 'gameover' | 'bonus-argent' | 'bonus-cgt') {
    let audio: HTMLAudioElement | null = null;
    switch (sound) {
      case 'gameplay': audio = this.gameplay; break;
      case 'gameover': audio = this.gameover; break;
      case 'bonus-argent': audio = this.bonusArgent; break;
      case 'bonus-cgt': audio = this.bonusCgt; break;
    }
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.gameplay?.pause();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gameplay) this.gameplay.volume = this.volume;
  }
}

export const audioManager = new AudioManager();
