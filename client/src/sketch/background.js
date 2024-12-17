import IMG_LAYERS from "../paths/img-layers";

export default class Background {
  // object should be created in preload function of p5 instance
  constructor(p) {
    this.p = p

    // load images
    this.sky = this.p.loadImage(IMG_LAYERS + 'bg/0_sky.png');
    
    this.twinkleGlowOuter = this.p.loadImage(IMG_LAYERS + 'bg/1_bigstarouter.png');
    this.twinkleGlowInner = this.p.loadImage(IMG_LAYERS + 'bg/2_bigstarinner.png');
    this.roundGlowOuter = this.p.loadImage(IMG_LAYERS + 'bg/1_smallstarouter.png');
    this.roundGlowInner = this.p.loadImage(IMG_LAYERS + 'bg/2_smallstarinner.png');

    this.stars = this.p.loadImage(IMG_LAYERS + 'bg/3_stars.png');
    this.clouds = this.p.loadImage(IMG_LAYERS + 'bg/4_clouds.png');

    // variables?
    this.twinkleGlowOpacity = 0;
    this.roundGlowInnerOpacity = 0;
    this.roundGlowOuterOpacity = 0;
  }


  draw = (otherAmplitude) => {
    // map amplitude to twinkle glow
    this.setTwinkleGlowOpacity(otherAmplitude);
    this.setRoundGlowOpacity(otherAmplitude);

    this.p.image(this.sky, 0, 0);
    this.drawStars();
    this.p.image(this.clouds, 0, 0);
  };

  drawStars = () => {
    // let frameCount = this.p.getFrameCount();
    // this.setTwinkleGlowOpacity((frameCount % 45) / 45 + 0.3);
    // this.setRoundGlowOpacity((frameCount % 56) / 56 + 0.5);

    // set opacity of twinkle glow
    this.p.tint(255, 255 * this.twinkleGlowOpacity);
    this.p.image(this.twinkleGlowOuter, 0, 0);
    this.p.image(this.twinkleGlowInner, 0, 0);
    // set opacity of round glow
    this.p.tint(255, 255 * this.roundGlowOuterOpacity);
    this.p.image(this.roundGlowOuter, 0, 0);
    this.p.tint(255, 255 * this.roundGlowInnerOpacity);
    this.p.image(this.roundGlowInner, 0, 0);

    // set opacity back to 100%
    this.p.tint(255, 255);
    this.p.image(this.stars, 0, 0);
  };


  getMoonBounds = () => {
    const leftX = 32 * 3 + 8;
    const rightX = 32 * 4;
    const topY = 24 * 0;
    const bottomY = 24 * 0;
    return [leftX, rightX, topY, bottomY];
  };


  setTwinkleGlowOpacity = (amplitude) => {
    let scaled_amp = amplitude * 5;
    if (scaled_amp > 0.5) {
      this.twinkleGlowOpacity = 0.7 + (scaled_amp - 0.5) * 3/5;
    } else if (scaled_amp > 0.01) {
      this.twinkleGlowOpacity = 0.1 + scaled_amp * 6/5;
    } else {
      this.twinkleGlowOpacity = 0;
    }
  };
  
  setRoundGlowOpacity = (amplitude) => {
    let scaled_amp = amplitude * 5;
    if (scaled_amp > 0.5) {
      this.roundGlowInnerOpacity = scaled_amp - 0.1;
      this.roundGlowOuterOpacity = (scaled_amp - 0.5) * 10/5;
    } else if (scaled_amp > 0.3) {
      this.roundGlowInnerOpacity = scaled_amp - 0.1;
      this.roundGlowOuterOpacity = 0;
    } else {
      this.roundGlowInnerOpacity = 0;
      this.roundGlowOuterOpacity = 0;
    }
  };
}