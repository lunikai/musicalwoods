import Background from "./background";
import Foreground from "./foreground";
import Sprite from "./sprite";
import Music from "./music";
import uploadFile from "./upload";
import * as Dialogue from "./dialogue";

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

    p.showDialogue(Dialogue.INSTRUCTIONS);
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
        adjustMusicVolume(-volumeControlAmount);
        // change sprite
        sprite.interact();
      }
      // increase volume
      else if (p.key === 'k' || p.key === 'K') {
        adjustMusicVolume(volumeControlAmount);
        // change sprite
        sprite.interact();
      }
    }

    // draw elements
    //////////////////////////////////////////////////////////////////////TODO: MAP BASS TO SMTH ELSE?
    bg.draw(
      music.getAmplitude(music.OTHER) + music.getAmplitude(music.BASS)    // for stars
    );
    fg.draw(
      music.getVolumePlaying(),    // for campfire
      music.getAmplitude(music.VOCALS),    // for treehouse
      music.getAmplitude(music.DRUMS)    // for bunny
    );
    sprite.draw();

    // increment frame count (for animation purposes)
    frameCount = (frameCount + 1) % FRAME_LIMIT;
  };

  // called once at the start of a key press
  p.keyPressed = () => {
    console.log("key pressed:", p.key);
    let volumeControlAmount = 0.03;
    // interaction
    if (p.key === 'e' || p.key === 'E') {
      // interact w/ campfire to play/pause music
      if (atCampfire()) {
        if (music.playPause()) {
          p.showDialogue(Dialogue.START_CAMPFIRE);
        } else {
          p.showDialogue(Dialogue.STOP_CAMPFIRE);
        }
      }
      // interact w/ bunny => upload custom track (for now)
      else if (atBunny()) {
        // open upload window (only if nothing else is currently being uploaded/processed)
        if (!uploadRequested) {
          p.showDialogue(Dialogue.BUNNY_UPLOAD_PROMPT);
          uploadFile(onUploadRequest, onUploadSuccess, onProcessingSuccess, onUploadFailure);
        } else {
          // previous upload request is still ongoing
          p.showDialogue(Dialogue.BUNNY_PROCESSING);
        }
      }
      // interact w/ door to switch music tracks
      else if (atTreehouseDoor()) {
        music.switchTrack();
        p.showDialogue(Dialogue.DOOR_DIALOGUE);
      }
      // trigger dialogue
      else if (atTreehouseLeaves() || atTreehouseTrunk()) {
        p.showDialogue(Dialogue.TREEHOUSE_INTERACT);
      } else if (atMoon()) {
        p.showDialogue(Dialogue.MOON_INTERACT);
      } else if (atPond()) {
        p.showDialogue(Dialogue.POND_INTERACT);
      }
      else {
        p.showDialogue(Dialogue.INTERACT_NONE);
      }
    }
    // volume controls (initial press)
    // decrease volume
    else if (p.key === 'j' || p.key === 'J') {
      // adjustMusicVolume(-volumeControlAmount);
      
      // if interacting w/ campfire, adjust overall track volume
      if (atCampfire()) {
        music.adjustVolume(music.activeTrack, -volumeControlAmount);
        p.showDialogue(Dialogue.CAMPFIRE_VOLUME_DOWN);
      }
      // if interacting w/ treehouse, adjust vocals volume
      else if (atTreehouseLeaves() || atTreehouseTrunk()) {
        music.adjustLayerVolume(music.activeTrack, music.VOCALS, -volumeControlAmount);
        p.showDialogue(Dialogue.TREEHOUSE_VOLUME_DOWN);
      }
      // if interacting w/ bunny, adjust drums volume
      else if (atBunny()) {
        music.adjustLayerVolume(music.activeTrack, music.DRUMS, -volumeControlAmount);
        p.showDialogue(Dialogue.BUNNY_VOLUME_DOWN);
      }
      // if interacting w/ moon, adjust bass & other volume
      else if (atMoon()) {
        music.adjustLayerVolume(music.activeTrack, music.BASS, -volumeControlAmount);
        music.adjustLayerVolume(music.activeTrack, music.OTHER, -volumeControlAmount);
        p.showDialogue(Dialogue.MOON_VOLUME_DOWN);
      }
      else {
        p.showDialogue(Dialogue.INTERACT_NONE);
      }
    }
    // increase volume
    else if (p.key === 'k' || p.key === 'K') {
      // adjustMusicVolume(volumeControlAmount);
      
      // if interacting w/ campfire, adjust overall track volume
      if (atCampfire()) {
        music.adjustVolume(music.activeTrack, -volumeControlAmount);
        p.showDialogue(Dialogue.CAMPFIRE_VOLUME_UP);
      }
      // if interacting w/ treehouse, adjust vocals volume
      else if (atTreehouseLeaves() || atTreehouseTrunk()) {
        music.adjustLayerVolume(music.activeTrack, music.VOCALS, -volumeControlAmount);
        p.showDialogue(Dialogue.TREEHOUSE_VOLUME_UP);
      }
      // if interacting w/ bunny, adjust drums volume
      else if (atBunny()) {
        music.adjustLayerVolume(music.activeTrack, music.DRUMS, -volumeControlAmount);
        p.showDialogue(Dialogue.BUNNY_VOLUME_UP);
      }
      // if interacting w/ moon, adjust bass & other volume
      else if (atMoon()) {
        music.adjustLayerVolume(music.activeTrack, music.BASS, -volumeControlAmount);
        music.adjustLayerVolume(music.activeTrack, music.OTHER, -volumeControlAmount);
        p.showDialogue(Dialogue.MOON_VOLUME_UP);
      }
      else {
        p.showDialogue(Dialogue.INTERACT_NONE);
      }
    }
    // skip back and forth
    else if (p.key === '1') {
      music.jumpBack(5);
      p.showDialogue(Dialogue.TIME_TRAVEL_BACKWARD);
    } else if (p.key === '2') {
      music.jumpForward(5);
      p.showDialogue(Dialogue.TIME_TRAVEL_FORWARD);
    }
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
    // console.log(pondXDist)
    // console.log(volume);
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

  // check interactions
  const atCampfire = () => {
    if (sprite.checkInteractionFg(fg.getCampfireBounds(), fg.getX())) {
      console.log('campfire');
      return true;
    }
    return false;
  };
  const atTreehouseLeaves = () => {
    if (sprite.checkInteractionFg(fg.getTreehouseLeavesBounds(), fg.getX())) {
      console.log('leaves');
      return true;
    }
    return false;
  }
  const atTreehouseTrunk = () => {
    if (sprite.checkInteractionFg(fg.getTreehouseDoorBounds(), fg.getX())) {
      console.log('trunk');
      return true;
    }
    return false;
  };
  const atTreehouseDoor = () => {
    if (sprite.checkDoorInteraction(fg.getTreehouseDoorBounds(), fg.getX())) {
      console.log('door');
      return true;
    }
    return false;
  }
  const atBunny = () => {
    if (sprite.checkInteractionFg(fg.getBunnyBounds(), fg.getX())) {
      console.log('bunny');
      return true;
    }
    return false;
  };
  const atMoon = () => {
    if (sprite.checkInteractionBg(bg.getMoonBounds())) {
      console.log('moon');
      return true;
    }
    return false;
  };
  const atPond = () => {
    if (sprite.checkInteractionFg(fg.getPondBounds(), fg.getX())) {
      console.log('pond');
      return true;
    }
    return false;
  };

  // adjust volume based on sprite location in world
  const adjustMusicVolume = (volumeControlAmount) => {
    // if interacting w/ campfire, adjust overall track volume
    if (atCampfire()) {
      music.adjustVolume(music.activeTrack, volumeControlAmount);
    }
    // if interacting w/ treehouse, adjust vocals volume
    else if (atTreehouseLeaves() || atTreehouseTrunk()) {
      music.adjustLayerVolume(music.activeTrack, music.VOCALS, volumeControlAmount);
    }
    // if interacting w/ bunny, adjust drums volume
    else if (atBunny()) {
      music.adjustLayerVolume(music.activeTrack, music.DRUMS, volumeControlAmount);
    }
    // if interacting w/ moon, adjust bass & other volume
    else if (atMoon()) {
      music.adjustLayerVolume(music.activeTrack, music.BASS, volumeControlAmount);
      music.adjustLayerVolume(music.activeTrack, music.OTHER, volumeControlAmount);
    }
  };

  ////////////////// UPLOAD FILE CALLBACKS
  ////////////////// for now, make bunny's color reflect upload/processing status
  const onUploadRequest = () => {
    console.log('upload started');
    uploadRequested = true;
    fg.bunnyColor = fg.BUNNY_GREEN;
  };
  const onUploadSuccess = () => {
    // console.log('upload finished');
    p.showDialogue(Dialogue.BUNNY_PROCESSING);
  };
  // gets passed path to folder containing stems
  const onProcessingSuccess = async (folderPath) => {
    // console.log('upload processing finished');
    // load uploaded track before updating status
    await music.addNewTrack(folderPath);
    uploadRequested = false;
    fg.bunnyColor = fg.BUNNY_BLUE;
    p.showDialogue(Dialogue.BUNNY_SUCCESS);
  };
  const onUploadFailure = (errorType) => {
    console.log('upload failed');
    uploadRequested = false;
    fg.bunnyColor = fg.BUNNY_RED;
    if (errorType === 'filetype') {
      p.showDialogue(Dialogue.BUNNY_WRONG_FILETYPE);
    } else if (errorType === 'filesize') {
      p.showDialogue(Dialogue.BUNNY_FILE_TOO_BIG);
    } else if (errorType === 'timeout') {    // processing timeout
      p.showDialogue(Dialogue.BUNNY_TIMEOUT);
    } else {
      p.showDialogue(Dialogue.BUNNY_UNKNOWN_ERROR)
    }
  };
};

export default sketch;
