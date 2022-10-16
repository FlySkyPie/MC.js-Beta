import { NoiseFunction2D } from "simplex-noise";

import { BlockEnum } from '@/utils/BlockTable';
import {
    convertLocalPosition2ArrayIndex,
    CHUNK_SIZE, SAND_HEIGHT_DIFF, BEACH_HEIGHT, DEFAULT_FREQUENCY,
    AMPLITUDE, BASE_HEIGHT, OCTAVES, OCEAN_HEIGHT, DIRT_HEIGHT_DIFF
} from '@/utils/Chunk';

function calculateElevationIndex(x: number, z: number) {
    return x + z * CHUNK_SIZE;
}

function getBlockType(height: number, y: number) {
    if (y > height) {
        return BlockEnum.Air;
    }

    if (y >= height - SAND_HEIGHT_DIFF && y <= BEACH_HEIGHT) {
        return BlockEnum.Sand;
    } else if (y >= height - 1) {
        return BlockEnum.Grass;
    } else if (y > height - DIRT_HEIGHT_DIFF) {
        return BlockEnum.Dirt;
    }

    return BlockEnum.Rock;
};

export function createChunkData(cx: number, cy: number, cz: number, simplex: NoiseFunction2D) {
    const voxels = new Uint32Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
    const elevation = new Int32Array(CHUNK_SIZE * CHUNK_SIZE);

    for (let z = 0; z < CHUNK_SIZE; z++) {
        const vz = cz * CHUNK_SIZE + z;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            const vx = cx * CHUNK_SIZE + x;

            // get height from simplex noise heightmap
            var e = 0;

            for (const octave of OCTAVES) {
                e += (1 / octave) * simplex(octave * vx * DEFAULT_FREQUENCY * 1, octave * vz * DEFAULT_FREQUENCY * 1);
            }

            // TERRACES
            // e = Math.round(e * levels)/levels;

            // REDISTRIBUTION
            e = Math.exp(e);

            var altitude = Math.floor(e * AMPLITUDE) + BASE_HEIGHT;

            elevation[calculateElevationIndex(x, z)] = altitude;

            for (let y = 0; y < CHUNK_SIZE; y++) {
                const vy = cy * CHUNK_SIZE + y;
                voxels[convertLocalPosition2ArrayIndex(x, y, z)] = getBlockType(altitude, vy);
            }

            /**
             * @todo Add water
             */
            // add water on land
            if (altitude <= OCEAN_HEIGHT &&
                OCEAN_HEIGHT >= cy * CHUNK_SIZE &&
                OCEAN_HEIGHT < (cy + 1) * CHUNK_SIZE) {
                for (let y = altitude; y <= OCEAN_HEIGHT; y++) {
                    voxels[convertLocalPosition2ArrayIndex(x, y, z)] = BlockEnum.Water;
                }
            }
        }
    }

    return {
        position: { x: cx, y: cy, z: cz },
        voxels, elevation
    };
};
