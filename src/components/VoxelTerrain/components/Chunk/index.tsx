import React, { useRef } from 'react'
import { DoubleSide } from 'three';

import { useBlockTexture } from '@/hooks/useBlockTexture';

import { useChunkData } from "./useChunkData";
import { useGeometries } from './useGeometries';



type IProps = {
    cx: number;
    cy?: number;
    cz: number;
};

const Chunk: React.FC<IProps> = ({ cx, cy = 0, cz }) => {
    const { elevation, voxels } = useChunkData({ cx, cy, cz });
    const geometries = useGeometries({ voxels, cx, cy, cz });
    const { blockTexture } = useBlockTexture();

    const meshRef = useRef(null);

    if (geometries === undefined) {
        return null;
    }

    return (
        <>
            <mesh ref={meshRef} geometry={geometries.geometry} >
                {/* <meshPhongMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    alphaTest={0.5}
                /> */}
                <meshLambertMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    alphaTest={0.5}

                />

            </mesh>
            {/* <mesh geometry={t_geometry} >
                <meshLambertMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    side={DoubleSide}
                    opacity={1}
                />
            </mesh> */}
        </>
    );;
}

export { Chunk };
