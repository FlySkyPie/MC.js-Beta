import { CHUNK_SIZE, } from '@/utils/Chunk';


export const genBlob = (voxels: Uint32Array) => new Promise((resolve) => {
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
                const value = voxels[index];
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

    c.toBlob((v) => {
        if (!v) {
            return;
        }

        console.log(URL.createObjectURL(v))
        resolve(v);
    }, 'png');
})