const OCEAN_HEIGHT = 50;
const BEACH_HEIGHT = 52;
const TREE_MIN_HEIGHT = 4;
const TREE_MAX_HEIGHT = 6;

export const WorldConstants = {
    WORLD_HEIGHT: 256,
    CHUNK_WORLD_HEIGHT: 10,
    CHUNK_SIZE: 16,

    // NOISE VALUES
    AMPLITUDE: 33,
    DEFAULT_FREQUENCY: 1 / 255,
    OCTAVES: [4, 2, 8],
    EXPONENT: 0.25,
    LEVELS: 12,

    // TERRAIN VALUES
    BASE_HEIGHT: 0,
    OCEAN_HEIGHT,
    BEACH_HEIGHT: 52,

    TREE_Y_CUTOFF: BEACH_HEIGHT + 3,
    TREE_MIN_HEIGHT,
    TREE_MAX_HEIGHT,
    TREE_HEIGHT_DIFF: TREE_MAX_HEIGHT - TREE_MIN_HEIGHT,

    SAND_HEIGHT_DIFF: BEACH_HEIGHT - OCEAN_HEIGHT,
    DIRT_HEIGHT_DIFF: 4,
    DIRT_HEIGHT_VARIATION: 2,
};

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


export type CubeType = {
    id: number;
    isTransparent: boolean;
};

export type VoxelType = CubeType | 0;

export const BLOCK_TYPES: { [key: string]: VoxelType } = {
    AIR: 0,
    GRASS: { id: 0, isTransparent: false },
    DIRT: { id: 1, isTransparent: false },
    SAND: { id: 2, isTransparent: false },
    STONE: { id: 3, isTransparent: false },
    LOG: { id: 4, isTransparent: false },
    LEAVES: { id: 5, isTransparent: true },
    BRICK: { id: 6, isTransparent: true },
    PLANKS: { id: 7, isTransparent: true },
    WATER: { id: 12, isTransparent: true },
};
