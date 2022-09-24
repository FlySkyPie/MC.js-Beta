import * as React from 'react'
import { useFrame } from '@react-three/fiber'
import { Sky, } from '@react-three/drei';
import { Vector3 } from 'three';


const TimedSky = () => {
    const [sunVec, setSunVec] = React.useState(new Vector3(1, 0, 0))
    useFrame(() => {
        setSunVec((prev) => {
            var axis = new Vector3(0, 0, 1);
            var angle = Math.PI * 0.01;

            return prev.clone().applyAxisAngle(axis, angle);
        })
    })

    return (
        <Sky
            distance={8000}
            turbidity={0.3}
            rayleigh={0.1}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            sunPosition={sunVec} />
    )
}
export { TimedSky };