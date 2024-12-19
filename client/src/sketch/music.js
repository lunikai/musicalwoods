import * as Tone from "tone";
import Sound from "./sound";
import AUDIO_TRACKS from "../paths/audio-tracks";
import AUDIO_SOUNDS from "../paths/audio-sounds";

export default class Music {
  ////// TODO: refactor into separate class for track (like sound effects) and an overall audio class
  // tonejs loading functions are not guaranteed to finish during p5.preload; must check manually
  constructor() {

    // constants
    this.VOCALS = 'vocals';
    this.DRUMS = 'drums';
    this.BASS = 'bass';
    // this.GUITAR = 'guitar';
    // this.PIANO = 'piano';
    this.OTHER = 'other';
    this.LAYERS = [this.VOCALS, this.DRUMS, this.BASS, this.OTHER];
    this.MAX_VOLUME = this.decibelToLinear(-3);    // apparently -6 dB is a good level for foreground audio

    // current track volume
    this.volume = 0;

    // load preset music tracks
    this.tracks = [];
    const paths = ['strawberries&cigarettes/', 'sweetnothing/', 'christmassavestheyear/'];
    for (const path of paths) {
      this.tracks.push(this.loadTrack(AUDIO_TRACKS + path));
    }

    // sync tracks to transport
    for (const track of this.tracks) {
      this.syncTrack(track);
    }

    // initialize waveform analyzers (one for each layer)
    this.waveforms = this.initializeWaveforms();
    // connect tracks to waveforms
    for (const track of this.tracks) {
      this.waveformSetup(track);
    }

    // initialize effects
    this.panner = undefined;
    this.reverb = undefined;
    this.chorus = undefined;
    this.initializeEffects();

    // chain effects
    this.chainEffects();

    // track1 is active by default
    this.activeTrack = this.tracks[0];
    this.setVolume(this.activeTrack, 0.7);    // set default track output volume

    // load ambient sound effects
    this.water = new Sound(AUDIO_SOUNDS + 'river.wav');
    this.crackle = new Sound(AUDIO_SOUNDS + 'vinylcrackle.wav');

    // mute campfire (since nothing is playing initially)
    this.crackle.muteSound();
    // this.water.muteSound();

    // keep track of last paused timestamp of active track
    this.timestamp = 0;
  }


  // TRACK INITIALIZATION METHODS
  // start loading buffers for all layers of given track
  loadTrack = (folderPath) => {
    console.log('load music track');
    const track = new Tone.Players();

    // add track layers
    for (const layer of this.LAYERS) {
      track.add(layer, folderPath + layer + '.wav');
    }

    // loop track
    for (const layer of this.LAYERS) {
      track.player(layer).loop = true;
    }
  
    // mute track by default
    this.muteTrack(track);

    // wait until all buffers have finished loading; DOESN'T WORK SMH
    // ToneAudioBuffer.on('load', () => {
    // });

    return track;
  };

  // check if all buffers for given track have loaded
  isLoaded = (track) => {
    console.log(`loaded: ${track.loaded}`);
    if (track.loaded) {
      return true;
    }
    return false;
  };
  // ensure all buffers for given track have finished loading
  waitUntilLoaded = (track) => new Promise((resolve, reject) => {
    const wait = () => {
      try {
        if (this.isLoaded(track)) {
          console.log(track);
          console.log('track loaded!');
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

  // sync players to beginning of transport
  syncTrack = (track) => {
    for (const layer of this.LAYERS) {
      track.player(layer).sync().start(0);
    }
  };


  // ANALYSIS METHODS
  // initialize a waveform analyzer for each layer
  // waveform values are affected by individual layer (player) volume but not by overall track (players) volume
  initializeWaveforms = () => {
    let waveforms = {};
    for (const layer of this.LAYERS) {
      let toneWaveform;
      if (layer === this.DRUMS) {
        toneWaveform = new Tone.Analyser({
          type: 'waveform',
          size: 64,
          smoothing: 0.3,
        });
      } else {
        // const toneWaveform = new Tone.Waveform(256);    // smaller size => less visible lag i think (but more shaky)
        toneWaveform = new Tone.Analyser({
          type: 'waveform',
          size: 256,
          smoothing: 0.8,
        });
      }
      waveforms[layer] = toneWaveform;
    }
    return waveforms;
  };
  // connect track to waveform analyzers
  waveformSetup = (track) => {
    for (const layer of this.LAYERS) {
      track.player(layer).connect(this.waveforms[layer]);
    }
  }
  // get root mean square of all elements in given array
  getRootMeanSquare = (values) => {
    let sum_squares = 0;
    for (const value of values) {
      sum_squares += value ** 2;
    }
    let mean_squares = sum_squares / values.length;
    let rms = mean_squares ** 0.5;
    return rms;
  };
  getAmplitude = (layer) => {
    let values = this.waveforms[layer].getValue();
    return this.getRootMeanSquare(values);
  }


  // EFFECTS
  // panning
  initializePanner = () => {
    const panner = new Tone.Panner();
    this.panner = panner;
  };
  // pan should range from -1 (left) to 1 (right)
  panMusic = (pan) => {
    this.panner.pan.value = pan;
  };

  // reverb
  /////////////////////////////////////////////////// maybe replace w/ convolve and impulse response files
  initializeReverb = () => {
    const reverb = new Tone.JCReverb({ roomSize: 0.6 });    // 0-1
    reverb.wet.value = 0;
    this.reverb = reverb;
  };
  // 0 (none) to 1 (full)
  setReverb = (wet) => {
    this.reverb.wet.value = wet;
  };

  // chorus
  initializeChorus = () => {
    const chorus = new Tone.Chorus({
      frequency: 2,
      delayTime: 20,
      depth: 0.7,
    });
    chorus.wet.value = 0;
    this.chorus = chorus;
  };
  setChorus = (wet) => {
    this.chorus.wet.value = wet;
  };

  // initialize all effects
  initializeEffects = () => {
    this.initializePanner();
    this.initializeReverb();
    // this.initializeChorus();
  };

  // chain effects in series to each track
  chainEffects = () => {
    for (const track of this.tracks) {
      track.connect(this.panner);
    }
    this.panner.connect(this.reverb);
    // this.reverb.connect(this.chorus);
    // this.chorus.toDestination();
    this.reverb.toDestination();
  };


  // ADD NEW TRACK
  // ensure everything is loaded and ready to go before adding to tracks array (to prevent bugs related to track switching)
  // resolves only after new track is set up and ready to be played
  addNewTrack = async (folderPath) => new Promise(async (resolve, reject) => {
    // start loading track
    const track = this.loadTrack(folderPath);

    // connect new track to waveform analyzers
    this.waveformSetup(track);

    // chain effects to track (only need to connect to immediate next node in series)
    track.connect(this.panner);

    // after track finishes loading, add to list of tracks
    await this.waitUntilLoaded(track);
    // sync to transport (since transport has already been started at this point, track must be fully loaded before syncing)
    this.syncTrack(track);
    this.tracks.push(track);
    resolve();
  });


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

  // return volume of active track if it's playing, 0 if not
  getVolumePlaying = () => {
    // if loading not done or track muted return 0
    if (Tone.Transport.state === 'paused' || Tone.Transport.state === 'stopped') {
      return 0;
    } else if (this.isMuted(this.activeTrack)) {
      return 0;
    } else {
      return this.volume;    // should be equivalent to getVolume(activeTrack)
    }
  };
  // return current volume in linear scale
  getVolume = (track) => {
    // should be equivalent to this.volume as long as you're only modifying the currently active track
    return this.normalizeVolume(this.decibelToLinear(track.volume.value));
  };
  getLayerVolume = (track, layer) => {
    return this.decibelToLinear(track.player(layer).volume.value);
  };

  setVolume = (track, volume_linear = 1) => {
    console.log(`set track volume: ${volume_linear}`);
    this.volume = volume_linear;
    track.volume.value = this.linearToDecibel(this.scaleVolume(volume_linear));
  };
  // layer should be one of the strings defined in constructor
  // does not block volume changes when muted b/c this is used to reset volumes during switchtrack
  // if u need to preserve muted state, use adjustlayervolume
  setLayerVolume = (track, layer, volume_linear = 1) => {
    volume_linear = Math.max(volume_linear, 1e-6);    // workaround since zero volume sets muted to true
    console.log(`set ${layer} volume: ${volume_linear}`);
    track.player(layer).volume.value = this.linearToDecibel(volume_linear);
  };

  // adjust volume (amount given in linear scale)
  adjustVolume = (track, amount) => {
    let new_volume_lin = Math.max(0, Math.min(1, this.getVolume(track) + amount));
    this.setVolume(track, new_volume_lin);
  };
  // blocks volume changes when muted
  adjustLayerVolume = (track, layer, amount) => {
    // changing layer volume unmutes layer
    if (!this.isMuted(track)) {
      let new_volume_lin = Math.max(0, Math.min(1, this.getLayerVolume(track, layer) + amount));
      this.setLayerVolume(track, layer, new_volume_lin);
    }
  };


  // MUTE/UNMUTE
  muteTrack = (track) => {
    for (const layer of this.LAYERS) {
      track.player(layer).mute = true;
    }
  };
  unmuteTrack = (track) => {
    for (const layer of this.LAYERS) {
      track.player(layer).mute = false;
    }
  };
  isMuted = (track) => {
    return track.player(this.VOCALS).mute;
  };


  // switch between preset tracks
  ///////////////////////////////////// FOUND AN OCCASIONAL BUG WHERE SWITCHING TRACKS DOES NOT AUTOMATICALLY START PLAYING THE NEXT ONE EVEN THOUGH THE FIRE REMAINS ALIVE; NO IDEA WHERE AND WHY, CANNOT REPRODUCE CONSISTENTLY
  ////////////////////////////////////////////// seems to be happening after a new track is added??? but not always... idk FIX IT
  switchTrack = async () => {
    console.log('switch track');
    // get new track
    let oldTrackIndex = this.tracks.indexOf(this.activeTrack);
    let newTrackIndex = (oldTrackIndex + 1) % this.tracks.length;

    // mute current track (if playing)
    this.pause();

    // update active track
    this.activeTrack = this.tracks[newTrackIndex];

    // match volume with previous track
    this.setVolume(this.activeTrack, this.volume);
    // reset individual layer volumes to full
    for (const layer of this.LAYERS) {
      this.setLayerVolume(this.activeTrack, layer, 1);
    }

    // play new track from beginning
    this.timestamp = 0;
    this.play();
  };


  // PLAYBACK FUNCTIONS
  playbackWait = () => new Promise(async (resolve, reject) => {
    await Tone.start();    // idk if i really need this; seems to work fine without
    // await this.waitUntilLoaded(this.activeTrack);    // make sure active track has loaded
    for (const track of this.tracks) {
      await this.waitUntilLoaded(track);
    }
    await this.water.waitUntilLoaded();    // highly unlikely these haven't loaded by this point though
    await this.crackle.waitUntilLoaded();
    resolve();
  });
  // start the transport
  start = async () => {
    await this.playbackWait();

    console.log('start transport');
    Tone.Transport.start();
  }

  // unmute active track and fireplace sound effect
  play = () => {
    if (Tone.Transport.state !== 'started') {
      this.start();
    }
    console.log('play')
    this.jumpTo(this.timestamp);    // jump back to proper place
    this.unmuteTrack(this.activeTrack);
    this.crackle.unmuteSound();
  };
  // mute active track and fireplace sound effect
  pause = () => {
    console.log('pause')
    this.timestamp = Tone.Transport.seconds;    // mark where track was paused
    this.muteTrack(this.activeTrack);
    this.crackle.muteSound();
  };
  // play/pause toggle
  playPause = () => {
    if (this.isMuted(this.activeTrack)) {
      this.play();
    } else {
      this.pause();
    }
  };
  // jump to beginning of track
  jumpTo = (time) => {
    Tone.Transport.seconds = time;
  };
  //
  jumpBack = (amount) => {
    if (amount > Tone.Transport.seconds) {
      Tone.Transport.seconds = 0;
    } else {
      Tone.Transport.seconds -= amount;
    }
  };
  jumpForward = (amount) => {
    Tone.Transport.seconds += amount;
  };
}