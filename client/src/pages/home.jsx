import Canvas from '../sketch/canvas';

const HomePage = () => {
  return (
    <div className='home'>
      <h1>it's a musical world</h1>
      <p>a small interactive music visualizer</p>
      <br/>
      <Canvas />
    </div>
  );
};

export default HomePage;