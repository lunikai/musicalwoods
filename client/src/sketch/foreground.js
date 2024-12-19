import IMG_LAYERS from "../paths/img-layers";

export default class Foreground {
  // object should be created in preload function of p5 instance
  constructor(p) {
    this.p = p

    // constants
    this.WIDTH = 320    // width of foreground layer
    this.BLOCK_WIDTH = 32;    // grid units for convenience
    this.BLOCK_HEIGHT = 24;

    this.BUNNY_BLUE = 'blue';
    this.BUNNY_RED = 'red';
    this.BUNNY_GREEN = 'green';

    // load images
    this.ground = this.p.loadImage(IMG_LAYERS + 'fg/0_snowyground.png');

    this.pond = this.p.loadImage(IMG_LAYERS + 'fg/1_pond.png');
    this.pondReflection1 = this.p.loadImage(IMG_LAYERS + 'fg/2_pondreflections1.png');
    this.pondReflection2 = this.p.loadImage(IMG_LAYERS + 'fg/2_pondreflections2.png');
    this.trees = this.p.loadImage(IMG_LAYERS + 'fg/3_trees.png');

    this.treehouse = this.p.loadImage(IMG_LAYERS + 'fg/4_treehouse.png');
    this.treehouseGlowBig = this.p.loadImage(IMG_LAYERS + 'fg/5_treehouseglowbig.png');
    this.treehouseGlowMed = this.p.loadImage(IMG_LAYERS + 'fg/6_treehouseglowmed.png');
    this.treehouseGlowSmall = this.p.loadImage(IMG_LAYERS + 'fg/7_treehouseglowsmall.png');
    this.treehouseLights = this.p.loadImage(IMG_LAYERS + 'fg/8_treehouselights.png');

    this.bunnyBlueShadow = this.p.loadImage(IMG_LAYERS + 'fg/9_bunnyblueshadow.png');
    this.bunnyBlue = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnyblue.png');
    this.bunnyBlueTwitch = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnybluetwitch.png');
    this.bunnyBlueGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnyblueglow_ADD.png');    // use ADD layer blend mode
    this.bunnyBlueTwitchGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnybluetwitchglow_ADD.png');    // use ADD layer blend mode

    this.bunnyRedShadow = this.p.loadImage(IMG_LAYERS + 'fg/9_bunnyredshadow.png');
    this.bunnyRed = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnyred.png');
    this.bunnyRedTwitch = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnyredtwitch.png');
    this.bunnyRedGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnyredglow_ADD.png');    // use ADD layer blend mode
    this.bunnyRedTwitchGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnyredtwitchglow_ADD.png');    // use ADD layer blend mode

    this.bunnyGreenShadow = this.p.loadImage(IMG_LAYERS + 'fg/9_bunnygreenshadow.png');
    this.bunnyGreen = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnygreen.png');
    this.bunnyGreenTwitch = this.p.loadImage(IMG_LAYERS + 'fg/10_bunnygreentwitch.png');
    this.bunnyGreenGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnygreenglow_ADD.png');    // use ADD layer blend mode
    this.bunnyGreenTwitchGlow = this.p.loadImage(IMG_LAYERS + 'fg/11_bunnygreentwitchglow_ADD.png');    // use ADD layer blend mode

    this.campfireShadow = this.p.loadImage(IMG_LAYERS + 'fg/12_campfire_shadow_MULT.png');    // use MULTIPLY layer blend mode
    this.campfireGlow1Big = this.p.loadImage(IMG_LAYERS + 'fg/13_campfireglow1big.png');
    this.campfireGlow1Med = this.p.loadImage(IMG_LAYERS + 'fg/14_campfireglow1med.png');
    this.campfireGlow1Small = this.p.loadImage(IMG_LAYERS + 'fg/15_campfireglow1small_HARD.png');    // use HARD_LIGHT blend mode
    this.campfireGlow2Big = this.p.loadImage(IMG_LAYERS + 'fg/13_campfireglow2big.png');
    this.campfireGlow2Med = this.p.loadImage(IMG_LAYERS + 'fg/14_campfireglow2med.png');
    this.campfireGlow2Small = this.p.loadImage(IMG_LAYERS + 'fg/15_campfireglow2small_HARD.png');    // use HARD_LIGHT blend mode
    this.campfireGlow3Big = this.p.loadImage(IMG_LAYERS + 'fg/13_campfireglow3big.png');
    this.campfireGlow3Med = this.p.loadImage(IMG_LAYERS + 'fg/14_campfireglow3med.png');
    this.campfireGlow3Small = this.p.loadImage(IMG_LAYERS + 'fg/15_campfireglow3small_HARD.png');    // use HARD_LIGHT blend mode
    this.firewood = this.p.loadImage(IMG_LAYERS + 'fg/16_firewood.png');
    this.fire1 = this.p.loadImage(IMG_LAYERS + 'fg/17_fire1.png');
    this.fire2 = this.p.loadImage(IMG_LAYERS + 'fg/17_fire2.png');
    this.fire3 = this.p.loadImage(IMG_LAYERS + 'fg/17_fire3.png');
    this.fire4 = this.p.loadImage(IMG_LAYERS + 'fg/17_fire4.png');

    // variables
    this.x = this.WIDTH / 2;    // starting x position; only horizontal movement is allowed

    this.treehouseGlowOpacity = 0;    // treehouse light brightness
    this.campfireOpacity = 0;
    // this.bunnyHeight = 0;    // make bunny bounce!
    this.bunnyTwitch = false;
    this.bunnyColor = this.BUNNY_BLUE;
    ////////////////////////////////NEED ONE MOREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

    this.pondFrames = 20;    // switch pond reflection every 10 frames
    // this.bunnyFrames = 90;
    this.campfireFrames = 10;

    this.currPond = 0;    // 0 or 1 for pondReflection 1 and 2, respectively
    // this.currBunny = 0;
    this.currCampfire = 0;    // 0-3
    this.currCampfireGlow = 0;    // 0-2
  }


  draw = (volume, vocalsAmplitude, drumsAmplitude) => {
    // update animation frames first
    this.updateFrames();

    // map volume to campfire opacity
    this.setCampfireOpacity(volume);

    // map amplitude of vocals layer to treehouse light opacity
    this.setTreehouseGlowOpacity(vocalsAmplitude);

    // map amplitude of drums to bunny
    this.setBunnyTwitch(drumsAmplitude);

    this.drawX(this.x - this.WIDTH);    // draw left side of x
    this.drawX(this.x);    // draw right side of x
  };

  drawX = (x) => {
    // ground
    this.p.image(this.ground, x, 0);
  
    // pond in woods
    this.drawPond(x);

    // treehouse
    this.drawTreehouse(x);

    // bunny
    this.drawBunny(x, 0);

    // campfire
    this.drawCampfire(x);
  };

  drawPond = (x) => {
    this.p.image(this.pond, x, 0);
    if (this.currPond === 0) {
      this.p.image(this.pondReflection1, x, 0);
    } else {
      this.p.image(this.pondReflection2, x, 0);
    }
    this.p.image(this.trees, x, 0);
  };

  drawTreehouse = (x) => {
    this.p.image(this.treehouse, x, 0);
    this.p.tint(255, 255 * this.treehouseGlowOpacity);
    this.p.image(this.treehouseGlowBig, x, 0);
    this.p.image(this.treehouseGlowMed, x, 0);
    this.p.image(this.treehouseGlowSmall, x, 0);
    this.p.tint(255, 255);
    this.p.image(this.treehouseLights, x, 0);
  };

  drawBunny = (x, y) => {
    if (this.bunnyColor === this.BUNNY_BLUE) {
      this.p.image(this.bunnyBlueShadow, x, y);
      if (this.bunnyTwitch === true) {
        this.p.image(this.bunnyBlueTwitch, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyBlueTwitchGlow, x, y);
      } else {
        this.p.image(this.bunnyBlue, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyBlueGlow, x, y);
      }
    } else if (this.bunnyColor === this.BUNNY_RED) {
      this.p.image(this.bunnyRedShadow, x, y);
      if (this.bunnyTwitch === true) {
        this.p.image(this.bunnyRedTwitch, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyRedTwitchGlow, x, y);
      } else {
        this.p.image(this.bunnyRed, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyRedGlow, x, y);
      }
    } else if (this.bunnyColor === this.BUNNY_GREEN) {
      this.p.image(this.bunnyGreenShadow, x, y);
      if (this.bunnyTwitch === true) {
        this.p.image(this.bunnyGreenTwitch, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyGreenTwitchGlow, x, y);
      } else {
        this.p.image(this.bunnyGreen, x, y);
        this.p.blendMode(this.p.ADD);
        this.p.image(this.bunnyGreenGlow, x, y);
      }
    }
    this.p.blendMode(this.p.BLEND);    // reset layer blend mode to normal
  };

  drawCampfire = (x) => {
    // firewood shadow
    this.p.blendMode(this.p.MULTIPLY);
    this.p.image(this.campfireShadow, x, 0);
    // campfire glow
    this.p.blendMode(this.p.BLEND);
    this.p.tint(255, 255 * this.campfireOpacity * 0.7);    //////////////////////////// ADJUST
    switch (this.currCampfireGlow) {
      case 0:
        this.p.image(this.campfireGlow1Big, x, 0);
        this.p.image(this.campfireGlow1Med, x, 0);
        this.p.blendMode(this.p.HARD_LIGHT);
        this.p.image(this.campfireGlow1Small, x, 0);
        break;
      case 1:
        this.p.image(this.campfireGlow2Big, x, 0);
        this.p.image(this.campfireGlow2Med, x, 0);
        this.p.blendMode(this.p.HARD_LIGHT);
        this.p.image(this.campfireGlow2Small, x, 0);
        break;
      default:
        this.p.image(this.campfireGlow3Big, x, 0);
        this.p.image(this.campfireGlow3Med, x, 0);
        this.p.blendMode(this.p.HARD_LIGHT);
        this.p.image(this.campfireGlow3Small, x, 0);
    }
    // firewood
    this.p.blendMode(this.p.BLEND);
    this.p.tint(255, 255);
    this.p.image(this.firewood, x, 0);
    // campfire
    this.p.tint(255, 255 * this.campfireOpacity);
    switch (this.currCampfire) {
      case 0: 
        this.p.image(this.fire1, x, 0);
        break;
      case 1:
        this.p.image(this.fire2, x, 0);
        break;
      case 2:
        this.p.image(this.fire3, x, 0);
        break;
      default:
        this.p.image(this.fire4, x, 0);
    }
    this.p.tint(255, 255);    // restore full layer opacity
  };


  // update which layers to show based on current frame count
  updateFrames = () => {
    let frameCount = this.p.getFrameCount();    // frame count goes up to 120 then circles back to zero

    // update pond reflection if enough frames have passed
    if (frameCount % this.pondFrames === 0) {
      this.currPond = (this.currPond + 1) % 2;
    }

    // // update bunny
    // if (frameCount % this.bunnyFrames === 0) {
    //   this.currBunny = (this.currBunny + 1) % 2;
    // }

    // update campfire
    if (frameCount % this.campfireFrames === 0) {
      this.currCampfire = (this.currCampfire + 1) % 4;
      this.currCampfireGlow = (this.currCampfireGlow + 1) % 3;
    }
  }


  scrollLeft = () => {
    this.x = (this.x + 1) % this.WIDTH;
  };

  scrollRight = () => {
    this.x = (this.x - 1 + this.WIDTH) % this.WIDTH;
  };

  getX = () => {
    return this.x;
  };

  // return x coordinates of left and right edge of campfire & y coordinates of top and bottom edge
  getCampfireBounds = () => {
    const leftX = this.BLOCK_WIDTH * 7.5 - 4;
    const rightX = this.BLOCK_WIDTH * 8.5 + 4;
    const topY = this.BLOCK_HEIGHT * 6 + 8;
    const bottomY = this.BLOCK_HEIGHT * 7;
    return [leftX, rightX, topY, bottomY];
  };

  getPondBounds = () => {
    const leftX = this.BLOCK_WIDTH * 4;
    const rightX = this.BLOCK_WIDTH * 6;
    const topY = this.BLOCK_HEIGHT * 6;
    const bottomY = this.BLOCK_HEIGHT * 7;
    return [leftX, rightX, topY, bottomY];
  };

  getBunnyBounds = () => {
    const leftX = this.BLOCK_WIDTH * 3 + 8;
    const rightX = this.BLOCK_WIDTH * 4;
    const topY = this.BLOCK_HEIGHT * 6 - 8;
    const bottomY = this.BLOCK_HEIGHT * 7 - 8;
    return [leftX, rightX, topY, bottomY];
  };

  getTreehouseLeavesBounds = () => {
    const leftX = 8;
    const rightX = this.BLOCK_WIDTH * 3 - 8;
    const topY = this.BLOCK_HEIGHT * 3;
    const bottomY = this.BLOCK_HEIGHT * 4 + 8;
    return [leftX, rightX, topY, bottomY];
  };
  getTreehouseDoorBounds = () => {
    const leftX = this.BLOCK_WIDTH * 1;
    const rightX = this.BLOCK_WIDTH * 2;
    const topY = this.BLOCK_HEIGHT * 7 - 12;
    const bottomY = this.BLOCK_HEIGHT * 8 - 8;
    return [leftX, rightX, topY, bottomY];
  };


  setTreehouseGlowOpacity = (amplitude) => {
    // since this is rms amplitude, the absolute maximum possible value is 0.7071
    let scaled_amp = amplitude * 3;    // for better visibility
    if (scaled_amp > 0.5) {
      this.treehouseGlowOpacity = 0.9 + (scaled_amp - 0.5) * 1/5;
    } else if (scaled_amp > 0.01) {
      this.treehouseGlowOpacity = 0.1 + scaled_amp * 8/5;
    } else {
      this.treehouseGlowOpacity = 0;
    }
  };

  setCampfireOpacity = (volume) => {
    ////////////////////////////////////////////////////////// might look better if u add some random variations since fires flicker
    if (volume > 0.7) {
      this.campfireOpacity = 0.9 + (volume - 0.7) * 1/3;
    } else if (volume > 1e-6) {
      this.campfireOpacity = 0.2 + volume;
    } else {
      this.campfireOpacity = 0;
    }
  };

  setBunnyTwitch = (amplitude) => {
    /////////////////////////////////////////////////////try keeping twitch active for like 5 frames or smth
    if (amplitude > 0.10) {
      this.bunnyTwitch = true;
    } else {
      this.bunnyTwitch = false;
    }
  };
}