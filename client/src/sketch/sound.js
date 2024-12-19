import * as Tone from "tone";

export default class Sound {
  // separate class for ambient sound effects w/ its own panner and volume controls
  // tonejs loading functions are not guaranteed to finish during p5.preload; must check manually
  constructor(filePath) {
    // constants
    ///////////////////////////////////// ADJUSTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
    this.MAX_VOLUME = this.decibelToLinear(-2);    // apparently -6 dB is a good level for foreground audio

    // load ambient sound effect
    this.sound = this.loadSound(filePath);

    // add panner and connect to output
    this.panner = new Tone.Panner();
    this.sound.connect(this.panner);
    this.panner.toDestination();

    // sync to transport
    this.syncSound();
    
    // default volume zero
    this.volume = 0;
    this.setVolume(0);
  }


  // SOUND INITIALIZATION
  // start loading sound buffer
  loadSound = (filePath) => {
    console.log('load sound effect');
    const sound = new Tone.Player(filePath);
    sound.loop = true;    // loop sound

    return sound;
  };

  // check if sound buffer has loaded
  isLoaded = () => {
    console.log(`loaded: ${this.sound.loaded}`);
    if (this.sound.loaded) {
      return true;
    }
    return false;
  };
  // ensure given sound has finished loading
  waitUntilLoaded = () => new Promise((resolve, reject) => {
    const wait = () => {
      try {
        if (this.isLoaded()) {
          console.log(this.sound);
          console.log('sound loaded!');
          resolve();
        } else {
          setTimeout(wait, 100);
        }
      } catch(error) {
        reject(error);
      }
    };
    setTimeout(wait, 100);
  });

  // sync player to beginning of transport
  syncSound = () => {
    this.sound.sync().start(0);
  };


  // EFFECTS
  // pan should range from -1 (left) to 1 (right)
  panSound = (pan) => {
    this.panner.pan.value = pan;
  };


  // VOLUME METHODS
  // convert between decibel and linear (0 to 1) volume scales
  linearToDecibel = (volume_linear) => {
    return 10 * Math.log10(volume_linear);
  };
  decibelToLinear = (volume_db) => {
    return Math.pow(10, volume_db / 10);
  };

  // map range [0, maxvol] -> [0, 1]
  normalizeVolume = (raw_volume_linear) => {
    return raw_volume_linear / this.MAX_VOLUME;
  };
  // map range [0, 1] -> [0, maxvol]
  scaleVolume = (volume_linear) => {
    return volume_linear * this.MAX_VOLUME;
  };

  // return current volume in linear scale
  getVolume = () => {
    return this.normalizeVolume(this.decibelToLinear(this.sound.volume.value));
  };
  setVolume = (volume_linear = 1) => {
    this.volume = volume_linear;    // keep track of volume (even when muted!)
    // block volume changes when muted to prevent unintentional unmuting
    if (!this.isMuted()) {
      volume_linear = Math.max(volume_linear, 1e-6);    // workaround since zero volume sets muted to true
      console.log(`set sound volume: ${volume_linear}`);
      this.sound.volume.value = this.linearToDecibel(this.scaleVolume(volume_linear));
    }
  };
  // // adjust volume (amount given in linear scale)
  // adjustVolume = (amount) => {
  //   let new_volume_lin = Math.max(0, Math.min(1, this.getVolume() + amount));
  //   this.setVolume(new_volume_lin);
  // };


  // MUTE/UNMUTE
  muteSound = () => {
    this.sound.mute = true;
  };
  unmuteSound = () => {
    this.sound.mute = false;    // apparently unmuting automatically sets volume to maximum
    this.setVolume(this.volume);    // so need to reset to intended volume level
  };
  isMuted = () => {
    return this.sound.mute;
  };
}