import { BufferAttribute, BufferGeometry } from "three";
import { nanoid } from 'nanoid'

import { BlockEnum, convertBlockType2TextureId } from '@/utils/BlockTable';
import { convertLocalPosition2ArrayIndex, CHUNK_SIZE, VOXEL_FACES } from '@/utils/Chunk';
import { IChunkData } from '@/interface/chunks';

const TILE_SIZE = 16;
const TILE_TEXTURE_WIDTH = 256;
const TILE_TEXTURE_HEIGHT = 64;

type INeighborChunkData = Uint32Array | undefined;

type IData = [
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

export const matrixlizeData = ({ data, down, east, north, south, up, west }: IMatrixlizeDataParams) => [
    [
        [undefined, undefined, undefined],
        [undefined, north, undefined],
        [undefined, undefined, undefined],
    ], [
        [undefined, down, undefined],
        [west, data.voxels, east],
        [undefined, up, undefined],
    ], [
        [undefined, undefined, undefined],
        [undefined, south, undefined],
        [undefined, undefined, undefined],
    ],
];

function getRelatedChunkDirection(cx: number, cy: number, cz: number, x: number, y: number, z: number) {
    const value: [number, number, number] = [0, 0, 0];
    if (x >= cx * CHUNK_SIZE) {
        value[0] = 1;
    } else if (x < cx * CHUNK_SIZE) {
        value[0] = -1;
    }

    if (y >= cy * CHUNK_SIZE) {
        value[1] = 1;
    } else if (y < cy * CHUNK_SIZE) {
        value[1] = -1;
    }

    if (z >= cz * CHUNK_SIZE) {
        value[2] = 1;
    } else if (z < cz * CHUNK_SIZE) {
        value[2] = -1;
    }

    return value;
}

const getVoxel = (
    cx: number, cy: number, cz: number,
    x: number, y: number, z: number,
    data: IData) => {
    const dir = getRelatedChunkDirection(cx, cy, cz, x, y, z);
    return data[dir[0]][dir[1]][dir[2]];
};

export const genGeometriesV2 =
    async (data: IData, cx: number, cy: number, cz: number) => {
        const voxels = data[1][1][1];
        const taskId = nanoid();
        console.time(`genGeometries()-${taskId}`);



        const doesNeighborVoxelExist = (x: number, y: number, z: number, type: BlockEnum) => {
            var localX = x - CHUNK_SIZE * cx;
            var localY = y - CHUNK_SIZE * cy;
            var localZ = z - CHUNK_SIZE * cz;

            // return voxel value if voxel lies within chunk border
            if (localX >= 0 && localX < CHUNK_SIZE && localY >= 0 && localZ >= 0 && localZ < CHUNK_SIZE) {
                const neighbor = voxels[convertLocalPosition2ArrayIndex(localX, localY, localZ)];
                if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                    return null;

                if (type !== BlockEnum.Leaves && neighbor === BlockEnum.Leaves)
                    return null;
                return neighbor;
            }

            // return bottom voxel negative y
            if (localY < 0) {
                return voxels[convertLocalPosition2ArrayIndex(localX, 0, localZ)];;
            }

            if (localY > CHUNK_SIZE) return null;

            // chunk neighbor checking
            var neighbor = null;

            // check if voxel in chunk neighbor exists
            if (neighbor != null) {
                if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                    return null;

                if (neighbor === BlockEnum.Leaves) return null;

                return neighbor;
            }

            return true;
        }

        const positions = [];
        const normals = [];
        const indices = [];
        const uvs = [];

        const t_positions: number[] = [];
        const t_normals: number[] = [];
        const t_indices = [];
        const t_uvs: number[] = [];

        const geometry = new BufferGeometry();
        const t_geometry = new BufferGeometry();

        console.time(`generate geometries-${taskId}`);

        // console.log("BEGIN: " + cx + "," + cz + " " + performance.now())
        for (let y = 0; y < CHUNK_SIZE; ++y) {
            var vy = cy * CHUNK_SIZE + y;
            for (let z = 0; z < CHUNK_SIZE; ++z) {
                var vz = cz * CHUNK_SIZE + z;
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    var vx = cx * CHUNK_SIZE + x;
                    const voxel = voxels[convertLocalPosition2ArrayIndex(x, y, z)];

                    // get neighbors of current voxel if it exists
                    if (voxel) {
                        // iterate through every faces to get neighbors
                        for (const { uvRow, dir, vertices } of VOXEL_FACES) {
                            const neighbor =
                                doesNeighborVoxelExist(vx + dir[0], vy + dir[1], vz + dir[2], voxel);

                            // add face to geometry if there is no neighbor (i.e. visible to camera)
                            if (!neighbor) {
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

                                if (
                                    voxel !== BlockEnum.Water &&
                                    voxel !== BlockEnum.Leaves
                                ) {
                                    indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                                }
                                t_indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }

        console.timeEnd(`generate geometries-${taskId}`);

        // console.log("END: " + cx + "," + cz + " " + performance.now())

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

        console.timeEnd(`genGeometries()-${taskId}`);

        return { geometry, t_geometry };
    };

export const genGeometries =
    async (voxels: Uint32Array, cx: number, cy: number, cz: number) => {
        const taskId = nanoid();
        console.time(`genGeometries()-${taskId}`);

        const doesNeighborVoxelExist = (x: number, y: number, z: number, type: BlockEnum) => {
            var localX = x - CHUNK_SIZE * cx;
            var localY = y - CHUNK_SIZE * cy;
            var localZ = z - CHUNK_SIZE * cz;

            // return voxel value if voxel lies within chunk border
            if (localX >= 0 && localX < CHUNK_SIZE && localY >= 0 && localZ >= 0 && localZ < CHUNK_SIZE) {
                const neighbor = voxels[convertLocalPosition2ArrayIndex(localX, localY, localZ)];
                if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                    return null;

                if (type !== BlockEnum.Leaves && neighbor === BlockEnum.Leaves)
                    return null;
                return neighbor;
            }

            // return bottom voxel negative y
            if (localY < 0) {
                return voxels[convertLocalPosition2ArrayIndex(localX, 0, localZ)];;
            }

            if (localY > CHUNK_SIZE) return null;

            // chunk neighbor checking
            var neighbor = null;

            // check if voxel in chunk neighbor exists
            if (neighbor != null) {
                if (type !== BlockEnum.Water && neighbor === BlockEnum.Water)
                    return null;

                if (neighbor === BlockEnum.Leaves) return null;

                return neighbor;
            }

            return true;
        }

        const positions = [];
        const normals = [];
        const indices = [];
        const uvs = [];

        const t_positions: number[] = [];
        const t_normals: number[] = [];
        const t_indices = [];
        const t_uvs: number[] = [];

        const geometry = new BufferGeometry();
        const t_geometry = new BufferGeometry();

        console.time(`generate geometries-${taskId}`);

        // console.log("BEGIN: " + cx + "," + cz + " " + performance.now())
        for (let y = 0; y < CHUNK_SIZE; ++y) {
            var vy = cy * CHUNK_SIZE + y;
            for (let z = 0; z < CHUNK_SIZE; ++z) {
                var vz = cz * CHUNK_SIZE + z;
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    var vx = cx * CHUNK_SIZE + x;
                    const voxel = voxels[convertLocalPosition2ArrayIndex(x, y, z)];

                    // get neighbors of current voxel if it exists
                    if (voxel) {
                        // iterate through every faces to get neighbors
                        for (const { uvRow, dir, vertices } of VOXEL_FACES) {
                            const neighbor = doesNeighborVoxelExist(vx + dir[0], vy + dir[1], vz + dir[2], voxel);

                            // add face to geometry if there is no neighbor (i.e. visible to camera)
                            if (!neighbor) {
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

                                if (
                                    voxel !== BlockEnum.Water &&
                                    voxel !== BlockEnum.Leaves
                                ) {
                                    indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                                }
                                t_indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                    }
                }
            }
        }

        console.timeEnd(`generate geometries-${taskId}`);

        // console.log("END: " + cx + "," + cz + " " + performance.now())

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

        console.timeEnd(`genGeometries()-${taskId}`);

        return { geometry, t_geometry };
    };