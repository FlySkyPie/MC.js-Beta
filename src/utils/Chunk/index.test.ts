import { convertLocalPosition2ChunkShiftAndArrayIndex, CHUNK_SIZE } from './index';


describe('16x Chunk tests', () => {
    test('Test chunk size definition is 16', () => {
        expect(CHUNK_SIZE).toBe(16);
    });

    test('Test (-1, 0 ,0)', () => {
        const { dir } = convertLocalPosition2ChunkShiftAndArrayIndex(-1, 0, 0);

        expect(dir.length).toBe(3);
        expect(dir[0]).toBe(-1);
        expect(dir[1]).toBe(0);
        expect(dir[1]).toBe(0);
    });

    test('Test (-1, 11 ,7)', () => {
        const { dir, _x, _y, _z, index } = convertLocalPosition2ChunkShiftAndArrayIndex(-1, 11, 7);

        expect(dir.length).toBe(3);

        expect(dir[0]).toBe(-1);
        expect(dir[1]).toBe(0);
        expect(dir[1]).toBe(0);

        expect(_x).toBe(15);
        expect(_y).toBe(11);
        expect(_z).toBe(7);

        expect(index).toBe(2943);
    });
});