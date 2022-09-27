import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

// create a new random function based on the seed
const prng = alea('seed');
export const simplex = createNoise2D(prng);
