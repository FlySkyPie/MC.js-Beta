import { BlockEnum, convertBlockType2TextureId } from '@/utils/BlockTable';
import {
    CHUNK_SIZE, VOXEL_FACES, convertLocalPosition2ChunkShiftAndArrayIndex,
    convertLocalPosition2ArrayIndex,
} from '@/utils/Chunk';
import { IChunkData } from '@/interface/chunks';

const TILE_SIZE = 16;
const TILE_TEXTURE_WIDTH = 256;
const TILE_TEXTURE_HEIGHT = 64;

type INeighborChunkData = Uint32Array | undefined;

// ⎛none none none⎞  ⎛none -y none⎞  ⎛none none none⎞
// ⎜              ⎟  ⎜            ⎟  ⎜              ⎟
// ⎜none  -x  none⎟  ⎜ -z   0  +z ⎟  ⎜none  +x  none⎟
// ⎜              ⎟  ⎜            ⎟  ⎜              ⎟
// ⎝none none none⎠  ⎝none +y none⎠  ⎝none none none⎠
type IMatrixData = [
    [
        [undefined, undefined, undefined],
        [undefined, INeighborChunkData, undefined],
        [undefined, undefined, undefined],
    ], [
        [undefined, INeighborChunkData, undefined],
        [INeighborChunkData, Uint32Array, INeighborChunkData],
        [undefined, INeighborChunkData, undefined],
    ], [
        [undefined, undefined, undefined],
        [undefined, INeighborChunkData, undefined],
        [undefined, undefined, undefined],
    ],
];

type IMatrixlizeDataParams = {
    data: IChunkData;

    north?: IChunkData;
    south?: IChunkData;
    west?: IChunkData;
    east?: IChunkData;
    up?: IChunkData;
    down?: IChunkData;
};

export const matrixlizeData = ({ data, down, east, north, south, up, west }: IMatrixlizeDataParams): IMatrixData => [
    [
        [undefined, undefined, undefined],
        [undefined, south?.voxels, undefined],
        [undefined, undefined, undefined],
    ], [
        [undefined, down?.voxels, undefined],
        [west?.voxels, data.voxels, east?.voxels],
        [undefined, up?.voxels, undefined],
    ], [
        [undefined, undefined, undefined],
        [undefined, north?.voxels, undefined],
        [undefined, undefined, undefined],
    ],
];

const createVoxelGetter =
    (matrix: IMatrixData, cx: number, cy: number, cz: number) => {
        const baseX = CHUNK_SIZE * cx;
        const baseY = CHUNK_SIZE * cy;
        const baseZ = CHUNK_SIZE * cz;

        return (vx: number, vy: number, vz: number, type: BlockEnum) => {
            const localX = vx - baseX;
            const localY = vy - baseY;
            const localZ = vz - baseZ;

            // return voxel value if voxel lies within chunk border
            if (localX >= 0 && localX < CHUNK_SIZE &&
                localY >= 0 && localY < CHUNK_SIZE &&
                localZ >= 0 && localZ < CHUNK_SIZE) {
                const voxel = matrix[1][1][1][convertLocalPosition2ArrayIndex(localX, localY, localZ)];
                if (type !== BlockEnum.Water && voxel === BlockEnum.Water)
                    return null;

                if (type !== BlockEnum.Leaves && voxel === BlockEnum.Leaves)
                    return null;
                return voxel;
            }

            const { dir, index } = convertLocalPosition2ChunkShiftAndArrayIndex(localX, localY, localZ);

            const neighborChunk = matrix[1 + dir[0]][1 + dir[1]][1 + dir[2]];
            if (neighborChunk === undefined) {
                return null;
            }

            const neighbor = neighborChunk[index];

            // check if voxel in chunk neighbor exists
            if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                return null;

            if (neighbor === BlockEnum.Leaves) return null;

            return neighbor;
        }
    }

const genGeometriesInfo = (params: IMatrixlizeDataParams) => {
    const matrix = matrixlizeData(params);
    const voxels = params.data.voxels;
    const { x: cx, y: cy, z: cz } = params.data.position;
    const getVoxel = createVoxelGetter(matrix, cx, cy, cz);

    const positions = [];
    const normals = [];
    const indices = [];
    const uvs = [];

    const t_positions: number[] = [];
    const t_normals: number[] = [];
    const t_indices: number[] = [];
    const t_uvs: number[] = [];

    for (let y = 0; y < CHUNK_SIZE; ++y) {
        const vy = cy * CHUNK_SIZE + y;
        for (let z = 0; z < CHUNK_SIZE; ++z) {
            const vz = cz * CHUNK_SIZE + z;
            for (let x = 0; x < CHUNK_SIZE; ++x) {
                const vx = cx * CHUNK_SIZE + x;
                const voxel = voxels[convertLocalPosition2ArrayIndex(x, y, z)];

                if (!voxel) {
                    continue;
                }

                /**
                    quad index, triangles created by connecting vertex index in clockwise order

                    triangle (0,1,2) forms first triangle
                    triangle (2,1,3) forms second triangle

                    ( 1 )-------( 3 )
                        |\          |
                        |  \        |
                        |    \      |
                        |      \    |
                        |        \  |
                        |          \|
                    ( 0 )-------( 2 )
                 */

                // iterate through every faces to get neighbors
                for (const { uvRow, dir, vertices } of VOXEL_FACES) {
                    const neighbor = getVoxel(vx + dir[0], vy + dir[1], vz + dir[2], voxel);

                    if (neighbor) {
                        continue;
                    }

                    // add face to geometry if there is no neighbor (i.e. visible to camera)

                    // divide index by three to get index of vertex
                    const ndx = positions.length / 3;
                    const t_ndx = t_positions.length / 3;

                    //add to arrays for BufferGeometry
                    if ((voxel & 0x000000ff) === 0x000000ff) {
                        for (const { pos, uv } of vertices) {
                            positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);

                            normals.push(...dir);
                            uvs.push(
                                ((convertBlockType2TextureId(voxel) + uv[0]) * TILE_SIZE) /
                                TILE_TEXTURE_WIDTH,
                                1 -
                                ((uvRow + 1 - uv[1]) * TILE_SIZE) /
                                TILE_TEXTURE_HEIGHT
                            );
                        }
                        indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                    }

                    if (voxel !== 0 && (voxel & 0x000000ff) !== 0x000000ff) {
                        for (const { pos, uv } of vertices) {
                            if (voxel === BlockEnum.Water) {
                                t_positions.push(vx + pos[0], vy + pos[1] - 0.1, vz + pos[2]);
                            } else {
                                t_positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);
                            }

                            t_normals.push(...dir);
                            t_uvs.push(
                                ((convertBlockType2TextureId(voxel) + uv[0]) * TILE_SIZE) /
                                TILE_TEXTURE_WIDTH,
                                1 -
                                ((uvRow + 1 - uv[1]) * TILE_SIZE) /
                                TILE_TEXTURE_HEIGHT
                            );

                        }
                        t_indices.push(t_ndx, t_ndx + 1, t_ndx + 2, t_ndx + 2, t_ndx + 1, t_ndx + 3);
                    }
                }
            }
        }
    }

    return {
        positions, normals, indices, uvs,
        t_positions, t_normals, t_indices, t_uvs
    };
}

type IPrams = { id: string } & IMatrixlizeDataParams;


// @ts-ignore
self.addEventListener('message', function (e) {
    const { id, ...params } = e.data as IPrams;
    const result = genGeometriesInfo(params);
    self.postMessage({ id, result });
}, false);