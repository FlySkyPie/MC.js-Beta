export const CHUNK_SIZE = 32;
const LAYER_SIZE = CHUNK_SIZE * CHUNK_SIZE;

export function convertLocalPosition2ArrayIndex(x: number, y: number, z: number) {
    return x + CHUNK_SIZE * z + LAYER_SIZE * y;
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