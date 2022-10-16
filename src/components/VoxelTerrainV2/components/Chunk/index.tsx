import React, { useMemo, useRef } from 'react'
import { BoxHelper, DoubleSide, Mesh } from 'three';

import { useBlockTexture } from '@/hooks/useBlockTexture';
import { IChunkData } from '@/interface/chunks';
import { CHUNK_SIZE } from '@/utils/Chunk';

import { useGeometries } from './useGeometries';
import { useHelper } from '@react-three/drei';

type IDebugBorderProps = {
    cx: number;
    cy: number;
    cz: number;
};

const DebugBorder = ({ cx, cy, cz }: IDebugBorderProps) => {
    const ref = useRef<Mesh>(null);

    useHelper(ref, BoxHelper, "#00ff00")

    return (
        <mesh
            ref={ref}
            position={
                [cx * CHUNK_SIZE + 0.5 * CHUNK_SIZE,
                cy * CHUNK_SIZE + 0.5 * CHUNK_SIZE,
                cz * CHUNK_SIZE + 0.5 * CHUNK_SIZE]} >
            <boxGeometry args={[32, 32, 32]} />
            <meshPhongMaterial color="#ff0000" opacity={0.0} transparent />
        </mesh >
    );
}

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

const Chunk: React.FC<IProps> = ({ data, down, east, north, south, up, west }) => {
    const geometries = useGeometries({ data, down, east, north, south, up, west });
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
            <DebugBorder
                cx={data.position.x}
                cy={data.position.y}
                cz={data.position.z} />
        </>
    );
}

export { Chunk };
