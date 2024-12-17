import Background from "./background";
import Foreground from "./foreground";
import Sprite from "./sprite";
import Music from "./music";
import uploadFile from "./upload";

const sketch = (p) => {
  // p is a reference to the p5 instance this sketch is attached to

  // global(??) variables
  const WIDTH_PIXELS = 256;    // original image width is 256 pixels
  const HEIGHT_PIXELS = 192;    // original image is 192 pixels tall
  const ASPECT_RATIO = WIDTH_PIXELS / HEIGHT_PIXELS;
  const CANVAS_SIZE_RATIO = 0.6    // canvas size in proportion to window size
  let scale = 2.5;    // will be set during setup based on window size

  const FRAME_LIMIT = 120;    // number of frames to count to before wrapping around to zero

  // variable declarations
  let bg;
  let fg;
  let sprite;
  let music;

  let frameCount = 0;    // keep track of frame count (% FRAME_LIMIT)

  /////// CHECK UPLOAD STATUS??
  let uploadRequested = false;
  let uploadFinished = false;
  let uploadError = false;

  p.preload = () => {
    // load image elements
    bg = new Background(p);
    fg = new Foreground(p);
    sprite = new Sprite(p);

    // load audio elements
    music = new Music();
  };

  p.setup = () => {
    // set audio effects according to initial sprite position
    music.panMusic(sprite.getNormalizedAbsoluteXPos());
    music.setReverb(sprite.getNormalizedYPos());
    setWaterVolume();
    setCrackleVolume();

    // set canvas size based on window size
    if (p.windowWidth / p.windowHeight > ASPECT_RATIO) {
      // window is wider than aspect ratio
      let canvasHeight = p.windowHeight * CANVAS_SIZE_RATIO;
      scale = canvasHeight / HEIGHT_PIXELS;
    } else {
      let canvasWidth = p.windowWidth * CANVAS_SIZE_RATIO;
      scale = canvasWidth / WIDTH_PIXELS;
    }

    p.createCanvas(WIDTH_PIXELS * scale, HEIGHT_PIXELS * scale);
    p.background(0);
  };

  p.draw = () => {
    // scale drawing up to fit canvas
    p.noSmooth();
    p.scale(scale);

    // respond to relevant key presses (key/keyCode gives code of last key pressed)
    // keyPressed is called once when a key is pressed, keyIsPressed is true if a key is currently pressed
    if (p.keyIsPressed === true) {
      let volumeControlAmount = 0.01;

      // sprite/foreground movement using wasd and arrow keys
      if (p.key === 'a' || p.key === 'A' || p.keyCode === p.LEFT_ARROW) {
        sprite.moveLeft(fg.scrollLeft);
        // adjust panning based on sprite's x position
        music.panMusic(sprite.getNormalizedAbsoluteXPos());
        // adjust ambient sound
        setWaterVolume();
        setCrackleVolume();
      } 
      else if (p.key === 'd' || p.key === 'D' || p.keyCode === p.RIGHT_ARROW) {
        sprite.moveRight(fg.scrollRight);
        // adjust panning based on sprite's x position
        music.panMusic(sprite.getNormalizedAbsoluteXPos());
        // adjust ambient sound
        setWaterVolume();
        setCrackleVolume();
      } 
      else if (p.key === 'w' || p.key === 'W' || p.keyCode === p.UP_ARROW) {
        sprite.moveUp();
        // adjust reverb based on sprite's y position
        music.setReverb(sprite.getNormalizedYPos());
      } 
      else if (p.key === 's' || p.key === 'S' || p.keyCode === p.DOWN_ARROW) {
        sprite.moveDown();
        // adjust reverb based on sprite's y position
        music.setReverb(sprite.getNormalizedYPos());
      }

      // interaction with objects
      else if (p.key === 'e' || p.key === 'E') {
        // change sprite
        sprite.interact();
      }

      // volume controls (continued press)
      // decrease volume
      else if (p.key === 'j' || p.key === 'J') {
        adjustVolume(-volumeControlAmount);
      }
      // increase volume
      else if (p.key === 'k' || p.key === 'K') {
        adjustVolume(volumeControlAmount);
      }
    }

    // draw elements
    //////////////////////////////////////////////////////////////////////TODO: MAP BASS TO SMTH ELSE?
    bg.draw(
      music.getAmplitude(music.activeTrack, music.OTHER) + music.getAmplitude(music.activeTrack, music.BASS)    // for stars
    );
    fg.draw(
      music.getVolumePlaying(),    // for campfire
      music.getAmplitude(music.activeTrack, music.VOCALS),    // for treehouse
      music.getAmplitude(music.activeTrack, music.DRUMS)    // for bunny
    );
    sprite.draw();

    // increment frame count (for animation purposes)
    frameCount = (frameCount + 1) % FRAME_LIMIT;
  };

  p.keyPressed = () => {
    console.log(p.key);
    let volumeControlAmount = 0.04;
    // interaction
    if (p.key === 'e' || p.key === 'E') {
      let fgXPos = fg.getX()
      // interact w/ campfire to play/pause music
      if (sprite.checkInteractionFg(fg.getCampfireBounds(), fgXPos)) {
        console.log('campfire');
        music.playPause();
        setWaterVolume();
        setCrackleVolume();
      }
      // interact w/ bunny => upload custom track (for now)
      else if (sprite.checkInteractionFg(fg.getBunnyBounds(), fgXPos)) {
        console.log('bunny');
        // open upload window (only if nothing else is currently being uploaded/processed)
        if (!uploadRequested) {
          uploadFile(onUploadRequest, onUploadProcessingSuccess, onUploadFailure);
        }
      }
      // interact w/ door to switch music tracks
      else if (sprite.checkDoorInteraction(fg.getTreehouseDoorBounds(), fgXPos)) {
        console.log('door');
        music.switchTrack();
      }
    }
    // volume controls (initial press)
    // decrease volume
    else if (p.key === 'j' || p.key === 'J') {
      adjustVolume(-volumeControlAmount);
    }
    // increase volume
    else if (p.key === 'k' || p.key === 'K') {
      adjustVolume(volumeControlAmount);
    }
    // skip back and forth
    else if (p.key === '1') {
      music.jumpBack(5);
    } else if (p.key === '2') {
      music.jumpForward(5);
    }
    //////////////////////////////////////////////////////////////////// TESTINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
    // // play/pause current music track
    // if (p.key === 'p') {
    //   console.log(music.activeTrack);
    //   music.playPause();
    //   setWaterVolume();
    //   setCrackleVolume();
    // }
    // // switch music tracks
    // else if (p.key === 'o') {
    //   music.switchTrack();
    // }
    // // volume controls (adjust by a larger chunk when first pressed)
    // let amount = 0.04
    // if (p.key === 'u') {
    //   music.adjustLayerVolume(music.activeTrack, music.VOCALS, -amount);
    // } else if (p.key === 'i') {
    //   music.adjustLayerVolume(music.activeTrack, music.VOCALS, amount);
    // }
    // else if (p.key === 'j') {
    //   music.adjustVolume(music.activeTrack, -amount);
    // } else if (p.key === 'k') {
    //   music.adjustVolume(music.activeTrack, amount);
    // }
    // ////// sound effect volume
    // if (p.key === '1') {
    //   music.water.adjustVolume(-amount);
    // } else if (p.key === '2') {
    //   music.water.adjustVolume(amount);
    // } else if (p.key === '3') {
    //   music.crackle.adjustVolume(-amount);
    // } else if (p.key === '4') {
    //   music.crackle.adjustVolume(amount);
    // }
    // // amplitude??
    // if (p.key === 'l') {
    //   console.log(music.waveform1[music.VOCALS].getValue());
    //   console.log(music.getAmplitude(music.activeTrack, music.VOCALS));
    // }
    // panning
    // if (p.key === '9') {
    //   music.panMusic(-1);
    // } else if (p.key === '0') {
    //   music.panMusic(1);
    // }
    // // chorus (I HEAR NO DIFFERENCE LMAO)
    // if (p.key === '1') {
    //   // music.setChorus(Math.max(0, music.chorus.wet.value - 0.1));
    //   music.setChorus(0);
    // } else if (p.key === '2') {
    //   // music.setChorus(Math.min(1, music.chorus.wet.value + 0.1));
    //   music.setChorus(1);
    // }
  };

  // return current frame count modulo designated limit; note: by default, p5 tries to run at 60 fps
  p.getFrameCount = () => {
    return frameCount;
  }

  // ambient sound settings
  const setWaterVolume = () => {
    let maxDist = 60;
    let [leftX, rightX, topY, bottomY] = fg.getPondBounds();
    // volume
    let pondXDist = sprite.getXDistanceFg(leftX, rightX, fg.getX());
    let volume = Math.max(0, maxDist - pondXDist) / maxDist;
    console.log(pondXDist)
    console.log(volume);
    music.water.setVolume(volume);
    // panning
    let centerX = (leftX + rightX) / 2;
    let halfRange = centerX - leftX + maxDist;
    let distFromCenter = sprite.getRelativeXPos(fg.getX()) - centerX;
    let pan = -distFromCenter / halfRange;
    if (pan < -1) pan = -1;
    if (pan > 1) pan = 1;
    music.water.panSound(pan);
  };
  const setCrackleVolume = () => {
    let maxDist = 60;
    let [leftX, rightX, topY, bottomY] = fg.getCampfireBounds();
    // volume
    let fireXDist = sprite.getXDistanceFg(leftX, rightX, fg.getX());
    let volume = Math.max(0, maxDist - fireXDist) / maxDist;
    music.crackle.setVolume(volume);
    // panning
    let centerX = (leftX + rightX) / 2;
    let halfRange = centerX - leftX + maxDist;
    let distFromCenter = sprite.getRelativeXPos(fg.getX()) - centerX;
    let pan = -distFromCenter / halfRange;
    if (pan < -1) pan = -1;
    if (pan > 1) pan = 1;
    music.crackle.panSound(pan);
  }

  // adjust volume based on sprite location in world
  const adjustVolume = (volumeControlAmount) => {
    let fgXPos = fg.getX();
    // if interacting w/ campfire, adjust overall track volume
    if (sprite.checkInteractionFg(fg.getCampfireBounds(), fgXPos)) {
      console.log('campfire');
      music.adjustVolume(music.activeTrack, volumeControlAmount);
    }
    // if interacting w/ treehouse, adjust vocals volume
    else if (sprite.checkInteractionFg(fg.getTreehouseLeavesBounds(), fgXPos)) {
      console.log('leaves');
      music.adjustLayerVolume(music.activeTrack, music.VOCALS, volumeControlAmount);
    } else if (sprite.checkInteractionFg(fg.getTreehouseDoorBounds(), fgXPos)) {
      console.log('door');
      music.adjustLayerVolume(music.activeTrack, music.VOCALS, volumeControlAmount);
    }
    // if interacting w/ bunny, adjust drums volume
    else if (sprite.checkInteractionFg(fg.getBunnyBounds(), fgXPos)) {
      console.log('bunny');
      music.adjustLayerVolume(music.activeTrack, music.DRUMS, volumeControlAmount);
    }
    // if interacting w/ moon, adjust bass & other volume
    else if (sprite.checkInteractionBg(bg.getMoonBounds())) {
      console.log('moon');
      music.adjustLayerVolume(music.activeTrack, music.BASS, volumeControlAmount);
      music.adjustLayerVolume(music.activeTrack, music.OTHER, volumeControlAmount);
    }
  };

  ////////////////// UPLOAD FILE CALLBACKS
  ////////////////// for now, make bunny's color reflect upload/processing status
  const onUploadRequest = () => {
    console.log('upload started');
    uploadRequested = true;
    uploadFinished = false;
    uploadError = false;
    fg.bunnyColor = fg.BUNNY_GREEN;
  };
  // gets passed path to folder containing stems
  const onUploadProcessingSuccess = async (folderPath) => {
    console.log('upload and processing finished');
    // load uploaded track before updating status
    await music.addNewTrack(folderPath);
    uploadFinished = true;
    uploadRequested = false;
    fg.bunnyColor = fg.BUNNY_BLUE;
  };
  const onUploadFailure = () => {
    console.log('upload failed');
    uploadError = true;
    uploadRequested = false;
    fg.bunnyColor = fg.BUNNY_RED;
  };
};

export default sketch;
