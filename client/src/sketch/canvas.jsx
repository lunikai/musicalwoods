import { useEffect, useRef } from "react";
import sketch from "./sketch";
import "./canvas.css"
import API_BASE from "../paths/api";
import * as p5 from "p5";    // p5 imports must be in this exact order to work properly
// window.p5 = p5;    // need to define p5 in global scope in order to use p5.sound addon
// await import("p5/lib/addons/p5.sound");    // idk why but it does not work without await so DO NOT TOUCH

const Canvas = () => {

  // hold a reference to DOM node where p5 instance will be placed
  let myRef = useRef();

  useEffect(() => {
    // create p5 instance with sketch as content and referenced node as parent
    let myP5 = new p5(sketch, myRef.current);

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
        <img id="p5_loading" src={API_BASE + 'images/treehouse.png'} alt="loadinggg..." width="230px" />
        {/* when DOM node for this div is created, myRef.current will hold a reference to this node */}
        <div ref={myRef} />
      </div>
    </>
  )
}

export default Canvas;