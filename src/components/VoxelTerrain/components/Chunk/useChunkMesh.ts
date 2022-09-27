import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";

import { BLOCK_TYPES, VoxelType, VOXEL_FACES, WorldConstants, } from "@/utils/worldConstants";

const TILE_SIZE = 16;
const TILE_TEXTURE_WIDTH = 256;
const TILE_TEXTURE_HEIGHT = 64;

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
    elevation: number[],
    voxels: VoxelType[],
    cx: number,
    cy: number,
    cz: number
};

export const useChunkMesh = ({ elevation, voxels, cx, cy, cz, }: IProps) => {
    const { geometry, t_geometry } = useMemo(() => {
        const getVoxel = (x: number, y: number, z: number) => {
            const index = calculateVoxelIndex(cx, cz)(x, y, z);
            if (index === null) {
                return undefined;
            }
            return voxels[index];
        };


        const doesNeighborVoxelExist = (x: number, y: number, z: number, voxel: VoxelType) => {
            var vx = x - WorldConstants.CHUNK_SIZE * cx;
            var vy = y % WorldConstants.WORLD_HEIGHT;
            var vz = z - WorldConstants.CHUNK_SIZE * cz;

            // return voxel value if voxel lies within chunk border
            if (vx >= 0 && vx < WorldConstants.CHUNK_SIZE && vy >= 0 && vz >= 0 && vz < WorldConstants.CHUNK_SIZE) {
                const neighbor = getVoxel(x, y, z);
                if (voxel !== BLOCK_TYPES.WATER && neighbor === BLOCK_TYPES.WATER)
                    return null;

                if (voxel !== BLOCK_TYPES.LEAVES && neighbor === BLOCK_TYPES.LEAVES)
                    return null;
                return neighbor;
            }

            // return bottom voxel negative y
            if (vy < 0) {
                return getVoxel(x, 0, z);
            }

            if (vy > WorldConstants.WORLD_HEIGHT) return null;

            // chunk neighbor checking
            var neighbor = null;

            // check if voxel in chunk neighbor exists

            if (neighbor != null) {
                if (voxel !== BLOCK_TYPES.WATER && neighbor === BLOCK_TYPES.WATER)
                    return null;

                if (neighbor === BLOCK_TYPES.LEAVES) return null;

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

        // console.log("BEGIN: " + cx + "," + cz + " " + performance.now())
        for (let y = 0; y < WorldConstants.WORLD_HEIGHT; ++y) {
            var vy = cy * WorldConstants.CHUNK_SIZE + y;
            for (let z = 0; z < WorldConstants.CHUNK_SIZE; ++z) {
                var vz = cz * WorldConstants.CHUNK_SIZE + z;
                for (let x = 0; x < WorldConstants.CHUNK_SIZE; ++x) {
                    var vx = cx * WorldConstants.CHUNK_SIZE + x;
                    const voxel = getVoxel(vx, vy, vz);

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
                                    if (!voxel.isTransparent) {
                                        positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);

                                        normals.push(...dir);
                                        uvs.push(
                                            ((voxel.id + uv[0]) * TILE_SIZE) /
                                            TILE_TEXTURE_WIDTH,
                                            1 -
                                            ((uvRow + 1 - uv[1]) * TILE_SIZE) /
                                            TILE_TEXTURE_HEIGHT
                                        );
                                        continue;
                                    }

                                    if (voxel === BLOCK_TYPES.WATER) {
                                        t_positions.push(vx + pos[0], vy + pos[1] - 0.1, vz + pos[2]);
                                    } else {
                                        t_positions.push(vx + pos[0], vy + pos[1], vz + pos[2]);
                                    }

                                    t_normals.push(...dir);
                                    t_uvs.push(
                                        ((voxel.id + uv[0]) * TILE_SIZE) /
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
                                    voxel !== BLOCK_TYPES.WATER &&
                                    voxel !== BLOCK_TYPES.LEAVES
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

        return { geometry, t_geometry };
    }, [voxels, cx, cy, cz,]);

    return { geometry, t_geometry };
}

