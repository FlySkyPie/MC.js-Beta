import React, { useRef } from 'react'
import { BoxHelper, Mesh } from 'three';
import { useHelper } from '@react-three/drei';

type IProps = {
    x: number;
    y: number;
    z: number;
    color?: string;
};


export const DebugBlock: React.FC<IProps> = ({ x, y, z, color = "#ff0000" }) => {
    const ref = useRef<Mesh>(null);

    useHelper(ref, BoxHelper, color)

    return (
        <mesh
            ref={ref}
            position={
                [x + 0.5,
                y + 0.5,
                z + 0.5]} >
            <boxGeometry args={[1, 1, 1]} />
            <meshPhongMaterial color="#ff0000" opacity={0.0} transparent />
        </mesh >
    );
}