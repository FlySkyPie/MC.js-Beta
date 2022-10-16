import React, { useRef } from 'react'
import { DoubleSide } from 'three';

import { useBlockTexture } from '@/hooks/useBlockTexture';
import { IChunkData } from '@/interface/chunks';

import { useGeometries } from './useGeometries';

type IProps = {
    data: IChunkData;

    // x+1
    north?: IChunkData;

    // x-1
    south?: IChunkData;

    // z-1
    west?: IChunkData;

    // z+1
    east?: IChunkData;

    // y+1
    up?: IChunkData;

    // y-1
    down?: IChunkData;
};

const Chunk: React.FC<IProps> = ({ data }) => {
    const geometries = useGeometries({ data });
    const { blockTexture } = useBlockTexture();

    const meshRef = useRef(null);

    if (geometries === undefined) {
        return null;
    }

    return (
        <>
            <mesh ref={meshRef} geometry={geometries.geometry} >
                <meshPhongMaterial
                    map={blockTexture}
                    transparent={false}
                    depthTest
                    needsUpdate
                    alphaTest={0.5}
                />
            </mesh>
            <mesh geometry={geometries.t_geometry} >
                <meshPhongMaterial
                    map={blockTexture}
                    transparent
                    needsUpdate
                    side={DoubleSide}
                    opacity={1}
                />
            </mesh>
        </>
    );
}

export { Chunk };
