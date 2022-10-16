import { useMemo } from "react";

import { useSimplexNoise } from "@/contexts/SimplexNoiseContext";
import { BLOCK_TYPES, VoxelType, WorldConstants } from "@/utils/worldConstants";
import { nanoid } from "nanoid";


const freq = WorldConstants.DEFAULT_FREQUENCY;
const amp = WorldConstants.AMPLITUDE;
const base = WorldConstants.BASE_HEIGHT;

const calculateElevationIndex = (x: number, z: number) => {

    var index = x + z * WorldConstants.CHUNK_SIZE;
    return index;
}

const getBlockType = (height: number, y: number) => {
    var type = BLOCK_TYPES.STONE;

    // check which block type to set the voxel in chunk
    if (y >= height - WorldConstants.SAND_HEIGHT_DIFF && y <= WorldConstants.BEACH_HEIGHT) {
        type = BLOCK_TYPES.SAND;
    } else if (y >= height - 1) {
        type = BLOCK_TYPES.GRASS;
    } else if (y > height - WorldConstants.DIRT_HEIGHT_DIFF) {
        type = BLOCK_TYPES.DIRT;
    }

    return type;
}

const calculateVoxelIndex = (cx: number, cz: number) => (x: number, y: number, z: number) => {
    var vx = x - WorldConstants.CHUNK_SIZE * cx;
    var vy = y;
    var vz = z - WorldConstants.CHUNK_SIZE * cz;

    if (vx < 0 || vy < 0 || vz < 0 || vx >= WorldConstants.CHUNK_SIZE || vz >= WorldConstants.CHUNK_SIZE) {
        return null;
    }

    var index = vx + vz * WorldConstants.CHUNK_SIZE + vy * WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE;
    return index;
}

type IProps = {
    cx: number;
    cy: number;
    cz: number;
};

const useChunkData = ({ cx, cy, cz }: IProps) => {
    const { simplex } = useSimplexNoise();
    const { elevation, voxels } = useMemo(() => {
        const taskId = nanoid();
        const voxels: VoxelType[] = new Array(WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE * WorldConstants.WORLD_HEIGHT);
        const elevation: number[] = new Array(WorldConstants.CHUNK_SIZE * WorldConstants.CHUNK_SIZE);

        const setVoxel = (x: number, y: number, z: number, type: VoxelType) => {
            var index = calculateVoxelIndex(cx, cz)(x, y, z);

            if (index == null) return;

            voxels[index] = type;
        }

        //console.time(`useChunkData()-${taskId}`);
        for (let x = 0; x < WorldConstants.CHUNK_SIZE; x++) {
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; z++) {

            }
        }
        // https://www.redblobgames.com/maps/terrain-from-noise/
        for (let x = 0; x < WorldConstants.CHUNK_SIZE; x++) {
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; z++) {
                const vx = cx * WorldConstants.CHUNK_SIZE + x;
                const vz = cz * WorldConstants.CHUNK_SIZE + z;

                // get height from simplex noise heightmap
                var e = 0;

                for (const octave of WorldConstants.OCTAVES) {
                    //e += (1 / octave) * noise.simplex2(octave * vx * freq, octave * vz * freq);
                    e += (1 / octave) * simplex(octave * vx * freq * 1, octave * vz * freq * 1);
                }

                // TERRACES
                // e = Math.round(e * levels)/levels;

                // REDISTRIBUTION
                e = Math.exp(e);

                var height = Math.floor(e * amp) + base;

                elevation[calculateElevationIndex(x, z)] = height;

                if (height > 0) {
                    for (let y = 0; y < height; y++) {
                        // set block types for texture loading
                        var type = getBlockType(height, y);
                        setVoxel(vx, y, vz, type);
                    }
                }

                // add water on land
                if (height <= WorldConstants.OCEAN_HEIGHT) {
                    for (let y = height; y <= WorldConstants.OCEAN_HEIGHT; y++) {
                        // set block types for texture loading
                        var type = BLOCK_TYPES.WATER;
                        setVoxel(vx, y, vz, type);
                    }
                }
            }
        }

        //console.timeEnd(`useChunkData()-${taskId}`);
        return { voxels, elevation };
    }, [cx, cy, cz]);

    return { elevation, voxels };
};

export { useChunkData };
