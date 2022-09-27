import React from 'react'
import { DoubleSide } from 'three';

import { useBlockTexture } from '@/hooks/useBlockTexture';

import { useChunkData } from "./useChunkData";
import { useChunkMesh } from './useChunkMesh';



type IProps = {
    cx: number;
    cy?: number;
    cz: number;
};

const Chunk: React.FC<IProps> = ({ cx, cy = 0, cz }) => {
    const { elevation, voxels } = useChunkData({ cx, cy, cz });
    const { geometry, t_geometry } = useChunkMesh({ elevation, voxels, cx, cy, cz });
    const { blockTexture } = useBlockTexture();

    return (
        <>
            <mesh geometry={geometry} >
                <meshPhongMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    alphaTest={0.5}
                />
     
            </mesh>
            <mesh geometry={t_geometry} >
                <meshPhongMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    side={DoubleSide}
                    opacity={1}
                />
            </mesh>
        </>
    );;
}

export { Chunk };
