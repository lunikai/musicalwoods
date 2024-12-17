import Canvas from '../sketch/canvas';

const HomePage = () => {
  return (
    <div className='home'>
      <h1>musical woods</h1>
      <p>(title tentative)</p>
      <Canvas />
      {/* <p>work in progress...</p> */}
      <p><em>*home under renovation</em></p>
      <p>this thing desperately needs a user's manual</p>
      <p>wasd/arrow keys to move, e to interact, j & k for volume, 1 & 2 to jump</p>
    </div>
  );
};

export default HomePage;