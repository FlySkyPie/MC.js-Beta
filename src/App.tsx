import React from 'react'
import { Canvas, } from '@react-three/fiber';
import { MapControls, } from '@react-three/drei';
import { Color } from 'three';

import { TimedSky, } from './components';
import { VoxelTerrain } from './components/VoxelTerrainV2';
import { DebugBlock } from './components/DebugBlock';
import { GameCore } from './core/GameCore';
import { useSystems } from './systems';

const App: React.FC = () => {
  const { systems } = useSystems();

  return (
    <>
      <GameCore systems={systems} />
      <Canvas gl={{ preserveDrawingBuffer: true, antialias: false }}
        linear
        camera={{ position: [0, 100, 0] }}>
        {/* <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} /> */}
        <TimedSky />
        <ambientLight color={new Color(0xffffff)} intensity={0.5} />
        {/* <pointLight position={[10, 10, 10]} /> */}
        <directionalLight color={new Color(0xffffff)} intensity={0.5} />
        <VoxelTerrain />
        <DebugBlock x={16} y={27} z={-9} />
        <DebugBlock x={15} y={27} z={-9} color="#00ffff" />
        <axesHelper args={[64]} />
        <MapControls />
      </Canvas>
    </>
  )
}

export default App
