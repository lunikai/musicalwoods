import IMG_LAYERS from "../paths/img-layers";

export default class Sprite {
  // object should be created in preload function of p5 instance
  constructor(p) {
    this.p = p

    // constants
    // sprite direction codes
    this.LEFT = 0;
    this.RIGHT = 1;

    this.WIDTH = 32;
    this.HEIGHT = 32;

    this.FG_WIDTH = 320;

    // load images
    this.right = this.p.loadImage(IMG_LAYERS + 'sprite/right_HARD.png');    // use HARD_LIGHT layer blending mode
    this.left = this.p.loadImage(IMG_LAYERS + 'sprite/left_HARD.png');
    this.rightMove = this.p.loadImage(IMG_LAYERS + 'sprite/rightmove_HARD.png');
    this.leftMove = this.p.loadImage(IMG_LAYERS + 'sprite/leftmove_HARD.png');
    this.rightInteract = this.p.loadImage(IMG_LAYERS + 'sprite/rightinteract_HARD.png');
    this.leftInteract = this.p.loadImage(IMG_LAYERS + 'sprite/leftinteract_HARD.png');

    // variables
    this.x = 32 * 3.5;    // starting x position
    this.y = 24 * 6;
    this.minX = 1;
    this.minY = 2;    // match x and y paddings
    this.maxX = 32 * 7 - 1;
    this.maxY = 32 * 5 - 2;

    this.facing = this.RIGHT;    // either left or right for now
    this.isMoving = false;
    this.isInteracting = false;
  }

  draw = () => {
    // set layer blending mode to hard light
    this.p.blendMode(this.p.HARD_LIGHT);
    // draw sprite in correct position
    this.drawXY(this.x, this.y);
    // set blend mode back to normal
    this.p.blendMode(this.p.BLEND);
  };

  drawXY = (x, y) => {
    if (this.facing === this.RIGHT) {
      if (this.isMoving) {
        this.p.image(this.rightMove, x, y);
      } else if (this.isInteracting) {
        this.p.image(this.rightInteract, x, y);
      } else {
        this.p.image(this.right, x, y);
      }
    } else {
      if (this.isMoving) {
        this.p.image(this.leftMove, x, y);
      } else if (this.isInteracting) {
        this.p.image(this.leftInteract, x, y);
      } else {
        this.p.image(this.left, x, y);
      }
    }
    
    this.isMoving = false;    // assume no further movement
    this.isInteracting = false;    // and no further interaction
  };

  // sprite movement
  // scrollLeft should be a callback function that left-scrolls the foreground (i.e. moves the fg elements to the right)
  moveLeft = (scrollLeft) => {
    // show left-facing moving sprite
    this.facing = this.LEFT;
    this.isMoving = true;

    if (this.x > this.minX) {
      this.x -= 1;
    } else {
      // scroll foreground left
      scrollLeft();
    }
  };

  // scrollRight should be a callback function that right-scrolls the foreground (i.e. moves the fg elements to the left)
  moveRight = (scrollRight) => {
    // show right-facing moving sprite
    this.facing = this.RIGHT;
    this.isMoving = true;

    // return value of true means sprite moved; false means world should move
    if (this.x < this.maxX) {
      this.x += 1;
    } else {
      // scroll foreground right
      scrollRight();
    }
  };

  moveUp = () => {
    this.isMoving = true;

    if (this.y > this.minY) {
      this.y -= 1;
    }
  };
  
  moveDown = () => {
    this.isMoving = true;

    if (this.y < this.maxY) {
      this.y += 1;
    }
  };

  interact = () => {
    this.isInteracting = true;
  };


  // return absolute x coordinate normalized to range [-1, 1]
  getNormalizedAbsoluteXPos = () => {
    return (this.x - this.minX) / (this.maxX - this.minX) * 2 - 1;
  };
  // return y coordinate capped, inverted, and normalized to range [0, 1]
  // basically mapping sprite's height above ground level to range [0, 1]
  getNormalizedYPos = () => {
    let groundY = 100;
    if (this.y > groundY) {
      return 0;
    }
    return 1 - (this.y - this.minY) / (groundY - this.minY);
  };
  // figure out sprite position relative to foreground (in range [0, fg.WIDTH])
  // for reference, left edge of treehouse is 0
  getRelativeXPos = (fgXPos) => {
    let relX = this.x - fgXPos;
    if (relX < 0) {
      relX += this.FG_WIDTH;
    }
    return relX;
  };

  // get x distance from element positioned within given bounds (leftX, rightX are in range [0, fg.WIDTH])
  getXDistanceFg = (leftX, rightX, fgXPos) => {
    // adjust right x bound to account for sprite anchor point (top left)
    rightX -= this.WIDTH;

    const relX = this.getRelativeXPos(fgXPos);

    // first check if sprite is within bounds (i.e. overlaps object)
    if (relX >= leftX && relX <=rightX) {
      return 0;
    } else if (leftX > rightX + this.WIDTH && relX + this.FG_WIDTH >= leftX && relX <= rightX) {    // bounds are split over right edge of fg
      return 0;
    }

    // then check left hand and right hand distance (distance on sprite's anchor point's left and right)
    let leftHandDist = Math.min(Math.abs(relX - rightX), Math.abs(relX + this.FG_WIDTH - rightX));
    let rightHandDist = Math.min(Math.abs(leftX - relX), Math.abs(leftX + this.FG_WIDTH - relX));
    return Math.min(leftHandDist, rightHandDist);
  };

  // get x distance from element positioned within given bounds (leftX, rightX are in range [0, fg.WIDTH])
  getXDistanceBg = (leftX, rightX) => {
    // adjust right x bound to account for sprite anchor point (top left)
    rightX -= this.WIDTH;

    // first check if sprite is within bounds (i.e. overlaps object)
    if (this.x >= leftX && this.x <=rightX) {
      return 0;
    }

    // then check left hand and right hand distance (distance on sprite's anchor point's left and right)
    return Math.min(Math.abs(this.x - rightX), Math.abs(leftX - this.x));
  };

  ///////////////////////////////// EVERYTHING FROM HERE ON DOWN IS A HUGE MESS (might be better off just hardcoding the ranges)
  // get y distance from element positioned within given bounds
  getYDistance = (topY, bottomY) => {
    topY += 24;
    // adjust bottom y bound to account for sprite anchor point (top left)
    bottomY -= this.HEIGHT + 8;    // subtract an additional 8 pixels to make it look more in line with perspective

    // first check if sprite overlaps object bounds
    if (this.y >= topY && this.y <= bottomY) {
      return 0;
    }
    return Math.min(Math.abs(topY - this.y), Math.abs(this.y - bottomY));
  };

  getEuclideanDistanceFg = (leftX, rightX, topY, bottomY, fgXPos) => {
    return Math.sqrt(this.getXDistanceFg(leftX, rightX, fgXPos) ** 2 + this.getYDistance(topY, bottomY) ** 2);
  };
  getEuclideanDistanceBg = (leftX, rightX, topY, bottomY) => {
    console.log(this.getXDistanceBg(leftX, rightX))
    console.log(this.getYDistance(topY, bottomY))
    return Math.sqrt(this.getXDistanceBg(leftX, rightX) ** 2 + this.getYDistance(topY, bottomY) ** 2);
  };

  // check if sprite is close enough to given element to interact w/ it
  ////////////////////////////////// use separate func for door
  checkInteractionFg = ([leftX, rightX, topY, bottomY], fgXPos) => {
    const xDist = this.getXDistanceFg(leftX, rightX, fgXPos);
    const yDist = this.getYDistance(topY, bottomY);
    if (xDist <= 32 && yDist <= 24 && this.getEuclideanDistanceFg(leftX, rightX, topY, bottomY, fgXPos) <= 32) {
      return true;
    }
    return false;
  };
  checkDoorInteraction = ([leftX, rightX, topY, bottomY], fgXPos) => {
    const xDist = this.getXDistanceFg(leftX, rightX, fgXPos);
    const yDist = this.getYDistance(topY, bottomY);
    if (xDist <= 12 && yDist <= 8) {
      return true;
    }
    return false;
  };
  checkInteractionBg = ([leftX, rightX, topY, bottomY]) => {
    console.log(this.getEuclideanDistanceBg(leftX, rightX, topY, bottomY));
    return this.getEuclideanDistanceBg(leftX, rightX, topY, bottomY) < this.WIDTH;
  };
}