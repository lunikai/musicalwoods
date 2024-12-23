import { useEffect, useRef, useState } from "react";
import sketch from "./sketch";
import "./canvas.css"
import * as p5 from "p5";    // p5 imports must be in this exact order to work properly
// window.p5 = p5;    // need to define p5 in global scope in order to use p5.sound addon
// await import("p5/lib/addons/p5.sound");    // idk why but it does not work without await so DO NOT TOUCH

const Canvas = () => {
  const [dialogue, setDialogue] = useState("");
  let intervalID;
  // type out dialogue word by word
  const showDialogue = (text) => {
    // add delay at beginning
    setTimeout(() => {
      const words = text.split(' ');
      let i = 0;
      let write = words[i];
      // stop previous typing interval
      clearInterval(intervalID);
      intervalID = setInterval(() => {
        // type current dialogue
        setDialogue(write);
        i += 1;
        if (i === words.length) {
          // all words have been written
          clearInterval(intervalID);
        } else {
          // add next word
          write += " " + words[i];
        }
      }, 70);
      // setDialogue(text);
    }, 200);
  };

  // hold a reference to DOM node where p5 instance will be placed
  let myRef = useRef();

  useEffect(() => {
    // create p5 instance with sketch as content and referenced node as parent
    let myP5 = new p5(sketch, myRef.current);
    myP5.showDialogue = showDialogue;    // allow access to showDialogue from within sketch

    // remove p5 instance when node is destroyed
    // doesn't fix canvas duplication issue due to double useeffect call in strictmode though... apparently deletes everything but the canvas???
    // update: it seems to be working now, but idk wtf i did; perhaps the problem was smth else after all
    // update2: it stopped working again; re-disabled strictmode :/
    return () => {
      myP5.remove();
    }
  }, []);

  return (
    <>
      <div className="canvas">
        {/* element w/ id p5_loading will replace default loading screen */}
        <div id="p5_loading">
          <div className="spirit" onContextMenu={(e)=> e.preventDefault()}>
            <img id="rm" src="spirit_normal/rightmove.png" alt="" draggable='false' />
            <img id="r" src="spirit_normal/right.png" alt="" draggable='false' />
            <img id="l" src="spirit_normal/left.png" alt="" draggable='false' />
            <img id="lm" src="spirit_normal/leftmove.png" alt="" draggable='false' />
          </div>
          <p className="loading">loading...</p>
        </div>
        {/* when DOM node for this div is created, myRef.current will hold a reference to this node */}
        <div ref={myRef} />
      </div>
      <div className="dialogue">
        <p>{dialogue}</p>
      </div>
    </>
  )
}

export default Canvas;