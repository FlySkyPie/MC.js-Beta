import { useMemo } from "react";

import { useSimplexNoise } from "@/contexts/SimplexNoiseContext";
import { IChunkData, IPosition } from '@/interface/chunks';
import { CHUNK_SIZE, } from '@/utils/Chunk';

import { createChunkData } from './createChunkData';


const renderRange = 3;

function isInDistance(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    range: number) {
    return ((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1) + (z0 - z1) * (z0 - z1)) < range * range
}

type IProps = {
    cx: number;
    cy: number;
    cz: number;
};

export const useChunksData = ({ cx, cy, cz }: IProps) => {
    const { simplex } = useSimplexNoise();

    const chunkPositions = useMemo(() => {
        const positions: IPosition[] = [];

        for (let x = cx - renderRange; x <= cx + renderRange; x++) {
            for (let y = cy - renderRange; y <= cy + renderRange; y++) {
                for (let z = cz - renderRange; z <= cz + renderRange; z++) {
                    if (isInDistance(cx, cy, cz, x, y, z, renderRange)) {
                        positions.push({ x, y, z });
                    }
                }
            }
        }

        //debug
        // positions.length = 0;
        // positions.push({ x: 0, y: 0, z: 0 });

        return positions;
    }, [cx, cy, cz]);

    /**
     * @todo optimize algorithm
     */
    const chunksMapPayload = useMemo(() => {
        const chunksMap = new Map<string, IChunkData>();

        chunkPositions.forEach(({ x, y, z }) => {
            const data = createChunkData(x, y, z, simplex);
            chunksMap.set(`${x},${y},${z}`, data);

            // Debug
            const c = document.createElement('canvas');
            c.width = CHUNK_SIZE;
            c.height = CHUNK_SIZE * CHUNK_SIZE;

            const ctx = c.getContext('2d');
            if (ctx === null) {
                return;
            }

            ctx.clearRect(0, 0, c.width, c.height);

            let index = 0;
            for (let y = 0; y < CHUNK_SIZE; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    for (let x = 0; x < CHUNK_SIZE; x++) {
                        //console.log(index, x, z + y * CHUNK_SIZE);
                        const value = data.voxels[index];
                        const r = (value & 0xff000000) >> 24;
                        const g = (value & 0x00ff0000) >> 16;
                        const b = (value & 0x0000ff00) >> 8;
                        const a = (value & 0x000000ff);

                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                        ctx.fillRect(x, z + y * CHUNK_SIZE, 1, 1);

                        index++;
                    }
                }
            }

            // Debug
            // c.toBlob((v) => {
            //     if (!v) {
            //         return;
            //     }
            //     
            //     (data as any).url = URL.createObjectURL(v);
            //     console.log(URL.createObjectURL(v))
            // }, 'png');

        })

        return { chunksMap };
    }, [chunkPositions, simplex]);

    return { chunksMapPayload };
}