import React from 'react'
import { Canvas, } from '@react-three/fiber';
import { MapControls, } from '@react-three/drei';

import { TimedSky, VoxelTerrain } from './components';
import { GameCore } from './core/GameCore';
import { Color } from 'three';



const App: React.FC = () => {
  return (
    <>
      <GameCore />
      <Canvas gl={{ preserveDrawingBuffer: true, antialias: false }}
        linear
        camera={{ position: [0, 100, 0] }}>
        {/* <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} /> */}
        <TimedSky />
        <ambientLight color={new Color(0xffffff)} intensity={0.5} />
        {/* <pointLight position={[10, 10, 10]} /> */}
        <directionalLight color={new Color(0xffffff)} intensity={0.5} />
        <VoxelTerrain />
        <MapControls />
      </Canvas>
    </>
  )
}

export default App
