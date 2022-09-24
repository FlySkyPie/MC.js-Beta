import { useRef, useState } from 'react'
import { Canvas, MeshProps, useFrame } from '@react-three/fiber';
import { MapControls, Sky } from '@react-three/drei';

import { TimedSky } from './components';

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
    <Canvas gl={{ preserveDrawingBuffer: true }}>
      {/* <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} /> */}
      <TimedSky />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
      <gridHelper />
      <MapControls />
    </Canvas>
  )
}

export default App
