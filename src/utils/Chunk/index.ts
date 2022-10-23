export const CHUNK_SIZE = 32;
const LAYER_SIZE = CHUNK_SIZE * CHUNK_SIZE;

export function convertLocalPosition2ArrayIndex(x: number, y: number, z: number) {
    return x + CHUNK_SIZE * z + LAYER_SIZE * y;
}

type RelatedChunkDirection = [1 | 0 | -1, 1 | 0 | -1, 1 | 0 | -1];
export function convertLocalPosition2ChunkShiftAndArrayIndex(localX: number, localY: number, localZ: number) {
    const dir: RelatedChunkDirection = [0, 0, 0];
    let _x = localX, _y = localY, _z = localZ;

    if (localX >= CHUNK_SIZE) {
        dir[0] = 1;
        _x = _x % CHUNK_SIZE;
    } else if (localX < 0) {
        dir[0] = -1;
        _x += CHUNK_SIZE;
    }

    if (localY >= CHUNK_SIZE) {
        dir[1] = 1;
        _y = _y % CHUNK_SIZE;
    } else if (localY < 0) {
        dir[1] = -1;
        _y += CHUNK_SIZE;
    }

    if (localZ >= CHUNK_SIZE) {
        dir[2] = 1;
        _z = _z % CHUNK_SIZE;
    } else if (localZ < 0) {
        dir[2] = -1;
        _z += CHUNK_SIZE;
    }

    if (dir[0] === 0 && dir[1] === 0 && dir[2] === 0) {
        throw new Error('This funtion should only used to find neighbor voxel.')
    }

    return {
        dir,
        index: _x + CHUNK_SIZE * _z + LAYER_SIZE * _y,
        // Debug
        _x, _y, _z,
    }
}

export const BEACH_HEIGHT = 52;
const TREE_MIN_HEIGHT = 4;
const TREE_MAX_HEIGHT = 6;


// NOISE VALUES
export const AMPLITUDE = 33;
export const DEFAULT_FREQUENCY = 1 / 255;
export const OCTAVES = [4, 2, 8];
const EXPONENT = 0.25;
const LEVELS = 12;

// TERRAIN VALUES
export const BASE_HEIGHT = 0;
export const OCEAN_HEIGHT = 50;

const TREE_Y_CUTOFF = BEACH_HEIGHT + 3;
const TREE_HEIGHT_DIFF = TREE_MAX_HEIGHT - TREE_MIN_HEIGHT;
export const SAND_HEIGHT_DIFF = BEACH_HEIGHT - OCEAN_HEIGHT;
export const DIRT_HEIGHT_DIFF = 4;
const DIRT_HEIGHT_VARIATION = 2;

export const VOXEL_FACES = [
    {
        //left
        uvRow: 0,
        dir: [-1, 0, 0],
        vertices: [
            { pos: [0, 1, 0], uv: [0, 1] },
            { pos: [0, 0, 0], uv: [0, 0] },
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [0, 0, 1], uv: [1, 0] },
        ],
    },
    {
        //right
        uvRow: 0,
        dir: [1, 0, 0],
        vertices: [
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [1, 0, 1], uv: [0, 0] },
            { pos: [1, 1, 0], uv: [1, 1] },
            { pos: [1, 0, 0], uv: [1, 0] },
        ],
    },
    {
        //bottom
        uvRow: 1,
        dir: [0, -1, 0],
        vertices: [
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 0], uv: [1, 1] },
            { pos: [0, 0, 0], uv: [0, 1] },
        ],
    },
    {
        //top
        uvRow: 2,
        dir: [0, 1, 0],
        vertices: [
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 0] },
        ],
    },
    {
        //back
        uvRow: 0,
        dir: [0, 0, -1],
        vertices: [
            { pos: [1, 0, 0], uv: [0, 0] },
            { pos: [0, 0, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 1] },
        ],
    },
    {
        //front
        uvRow: 0,
        dir: [0, 0, 1],
        vertices: [
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 1, 1], uv: [0, 1] },
            { pos: [1, 1, 1], uv: [1, 1] },
        ],
    },
];
