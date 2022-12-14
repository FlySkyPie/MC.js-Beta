import { useMemo } from "react";

import { useSimplexNoise } from "@/contexts/SimplexNoiseContext";
import { IChunkData, IPosition } from '@/interface/chunks';

import { createChunkData } from './createChunkData';
// import { genBlob } from "./genBlob";

const renderRange = 2;

function getSquaredDistance(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number) {
    if (y1 > y0) {
        return ((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1) + (z0 - z1) * (z0 - z1))
    }
    return ((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1) * 4 + (z0 - z1) * (z0 - z1))
}
type IProps = {
    cx: number;
    cy: number;
    cz: number;
};

export const useChunksData = ({ cx, cy, cz }: IProps) => {
    const { simplex } = useSimplexNoise();

    const chunkPositions = useMemo<IPosition[]>(() => {
        const positions: (IPosition & { squaredDistance: number })[] = [];
        const squaredRange = renderRange * renderRange;

        for (let x = cx - renderRange; x <= cx + renderRange; x++) {
            for (let y = cy - renderRange; y <= cy + renderRange; y++) {
                for (let z = cz - renderRange; z <= cz + renderRange; z++) {
                    const squaredDistance = getSquaredDistance(cx, cy, cz, x, y, z);
                    if (squaredDistance < squaredRange) {
                        positions.push({ x, y, z, squaredDistance });
                    }
                }
            }
        }

        positions.sort((a, b) => a.squaredDistance - b.squaredDistance)

        //debug
        // positions.length = 0;
        // positions.push({ x: 0, y: 0, z: 0, squaredDistance: 0 });

        return positions;
    }, [cx, cy, cz]);

    /**
     * @todo optimize algorithm
     */
    const chunksMapPayload = useMemo(() => {
        const chunksMap = new Map<string, IChunkData>();

        chunkPositions.forEach(({ x, y, z }) => {
            const data = createChunkData(x, y, z, simplex);

            // Debug
            // if (x === 0 && y === 0 && z === 0) {
            //     genBlob(data.voxels);
            // }

            chunksMap.set(`${x},${y},${z}`, data);
        })

        return { chunksMap };
    }, [chunkPositions, simplex]);

    return { chunksMapPayload };
}