export type IPosition = {
    x: number;
    y: number;
    z: number;
};

export type IChunkData = {
    voxels: Uint32Array;
    elevation: Int32Array;
    position: IPosition;
};