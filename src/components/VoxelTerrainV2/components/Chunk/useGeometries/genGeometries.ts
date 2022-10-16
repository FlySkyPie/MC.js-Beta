import { BufferAttribute, BufferGeometry } from "three";
import { nanoid } from 'nanoid'

import { BlockEnum, convertBlockType2TextureId } from '@/utils/BlockTable';
import { convertLocalPosition2ArrayIndex, CHUNK_SIZE, VOXEL_FACES } from '@/utils/Chunk';
import { IChunkData } from '@/interface/chunks';

const TILE_SIZE = 16;
const TILE_TEXTURE_WIDTH = 256;
const TILE_TEXTURE_HEIGHT = 64;

type INeighborChunkData = Uint32Array | undefined;

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

type RelatedChunkDirection = [1 | 0 | -1, 1 | 0 | -1, 1 | 0 | -1];
const createRelatedChunkDirectionGetter = (baseX: number, baseY: number, baseZ: number,) =>
    (x: number, y: number, z: number) => {
        const value: RelatedChunkDirection = [0, 0, 0];
        if (x >= baseX + CHUNK_SIZE) {
            value[0] = 1;
        } else if (x < baseX) {
            value[0] = -1;
        }

        if (y >= baseY + CHUNK_SIZE) {
            value[1] = 1;
        } else if (y < baseY) {
            value[1] = -1;
        }

        if (z >= baseZ + CHUNK_SIZE) {
            value[2] = 1;
        } else if (z < baseZ) {
            value[2] = -1;
        }

        return value;
    }

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
                const neighbor = matrix[1][1][1][convertLocalPosition2ArrayIndex(localX, localY, localZ)];
                if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                    return null;

                if (type !== BlockEnum.Leaves && neighbor === BlockEnum.Leaves)
                    return null;
                return neighbor;
            }

            const getDir = createRelatedChunkDirectionGetter(baseX, baseY, baseZ);

            const dir = getDir(vx, vy, vz);
            const neighborChunk = matrix[1 + dir[0]][1 + dir[1]][1 + dir[2]];
            if (neighborChunk === undefined) {
                return null;
            }

            const neighbor = neighborChunk[convertLocalPosition2ArrayIndex(localX, localY, localZ)];

            // check if voxel in chunk neighbor exists
            if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                return null;

            if (neighbor === BlockEnum.Leaves) return null;

            return neighbor;
        }
    }

const genGeometriesInfo = (params: IMatrixlizeDataParams) => {
    const matrix = matrixlizeData(params);
    console.log(matrix, params);
    const voxels = params.data.voxels;
    const { x: cx, y: cy, z: cz } = params.data.position;
    const getVoxel = createVoxelGetter(matrix, cx, cy, cz);

    const positions = [];
    const normals = [];
    const indices = [];
    const uvs = [];

    const t_positions: number[] = [];
    const t_normals: number[] = [];
    const t_indices = [];
    const t_uvs: number[] = [];

    const taskId = nanoid();

    // console.log("BEGIN: " + cx + "," + cz + " " + performance.now())
    for (let y = 0; y < CHUNK_SIZE; ++y) {
        const vy = cy * CHUNK_SIZE + y;
        for (let z = 0; z < CHUNK_SIZE; ++z) {
            const vz = cz * CHUNK_SIZE + z;
            for (let x = 0; x < CHUNK_SIZE; ++x) {
                const vx = cx * CHUNK_SIZE + x;
                const voxel = voxels[convertLocalPosition2ArrayIndex(x, y, z)];

                // 
                if (!voxel) {
                    continue;
                }

                // get neighbors of current voxel if it exists

                // iterate through every faces to get neighbors
                for (const { uvRow, dir, vertices } of VOXEL_FACES) {
                    const neighbor = getVoxel(vx + dir[0], vy + dir[1], vz + dir[2], voxel);

                    if (neighbor) {
                        continue;
                    }

                    // add face to geometry if there is no neighbor (i.e. visible to camera)

                    // divide index by three to get index of vertex
                    const ndx = positions.length / 3;

                    //add to arrays for BufferGeometry
                    for (const { pos, uv } of vertices) {
                        if ((voxel & 0x000000ff) === 0x000000ff) {
                            positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);

                            normals.push(...dir);
                            uvs.push(
                                ((convertBlockType2TextureId(voxel) + uv[0]) * TILE_SIZE) /
                                TILE_TEXTURE_WIDTH,
                                1 -
                                ((uvRow + 1 - uv[1]) * TILE_SIZE) /
                                TILE_TEXTURE_HEIGHT
                            );
                            continue;
                        }

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
                    /*

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

                    if (voxel !== BlockEnum.Water &&
                        voxel !== BlockEnum.Leaves) {
                        indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                    }
                    t_indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                }
            }
        }
    }

    return {
        positions, normals, indices, uvs,
        t_positions, t_normals, t_indices, t_uvs
    };
}


export const genGeometries = (params: IMatrixlizeDataParams) => {
    const taskId = nanoid();
    console.time(`generate geometries-${params.data.position.x},${params.data.position.y},${params.data.position.z}`);

    const {
        positions, normals, indices, uvs,
        t_positions, t_normals, t_indices, t_uvs
    } = genGeometriesInfo(params);

    console.timeEnd(`generate geometries-${params.data.position.x},${params.data.position.y},${params.data.position.z}`);

    const geometry = new BufferGeometry();
    const t_geometry = new BufferGeometry();

    //set positions, normals, and indices into BufferGeometry
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(positions), positionNumComponents)
    );
    geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), normalNumComponents));
    geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), uvNumComponents));
    geometry.setIndex(indices);

    t_geometry.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(t_positions), positionNumComponents)
    );
    t_geometry.setAttribute("normal", new BufferAttribute(new Float32Array(t_normals), normalNumComponents));
    t_geometry.setAttribute("uv", new BufferAttribute(new Float32Array(t_uvs), uvNumComponents));
    const size = t_positions.length / 3;
    t_geometry.setIndex(t_indices.filter(v => v < size));

    return { geometry, t_geometry };
};
