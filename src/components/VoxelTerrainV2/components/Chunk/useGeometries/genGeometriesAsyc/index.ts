import { BufferAttribute, BufferGeometry } from "three";
import { nanoid } from 'nanoid'

import { IChunkData } from '@/interface/chunks';

import MeshWorker from './MeshWorker.ts?worker';

type IMatrixlizeDataParams = {
    data: IChunkData;

    north?: IChunkData;
    south?: IChunkData;
    west?: IChunkData;
    east?: IChunkData;
    up?: IChunkData;
    down?: IChunkData;
};

type IResult = {
    positions: number[],
    normals: number[],
    indices: number[],
    uvs: number[],
    t_positions: number[],
    t_normals: number[],
    t_indices: number[],
    t_uvs: number[]
};

const worker = new MeshWorker();
const taskPool = new Map<string, (result: IResult) => void>();

worker.addEventListener('message', function (e) {
    const payload = e.data;
    const resolve = taskPool.get(payload.id);

    if (resolve === undefined) {
        throw new Error('Unexpected task id');
    }
    resolve(payload.result);
}, false);


const genGeometriesInfoAsyc = (params: IMatrixlizeDataParams) => new Promise<IResult>((resolve) => {
    const id = nanoid();
    worker.postMessage({ id, ...params });

    taskPool.set(id, resolve);
});


export const genGeometriesAsyc = async (params: IMatrixlizeDataParams) => {
    const {
        positions, normals, indices, uvs,
        t_positions, t_normals, t_indices, t_uvs
    } = await genGeometriesInfoAsyc(params);

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
