import { useRef, useState } from 'react'
import { Canvas, MeshProps, useFrame } from '@react-three/fiber';
import { MapControls, } from '@react-three/drei';

import { TimedSky, VoxelTerrain } from './components';
import { GameCore } from './core/GameCore';

function Box(props: MeshProps) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>()
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x += 0.01))
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <GameCore />
      <Canvas gl={{ preserveDrawingBuffer: true }}
      linear
        camera={{ position: [0, 100, 0] }}>
        {/* <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} /> */}
        <TimedSky />
        <ambientLight color={"0xffffff"} intensity={0.5} />
        {/* <pointLight position={[10, 10, 10]} /> */}
        <directionalLight color={"0xffffff"} intensity={0.5} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
        <VoxelTerrain />
        <gridHelper />
        <MapControls />
      </Canvas>
    </>
  )
}

export default App
