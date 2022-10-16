import { useEffect, useState } from "react";
import { BufferGeometry } from "three";

import { IChunkData } from '@/interface/chunks';

import { genGeometries } from './genGeometries';

type IProps = {
    data: IChunkData;

    north?: IChunkData;
    south?: IChunkData;
    west?: IChunkData;
    east?: IChunkData;
    up?: IChunkData;
    down?: IChunkData;
};

export const useGeometries = ({ data, }: IProps) => {
    const [geometries, setGeometries] = useState<{ geometry: BufferGeometry, t_geometry: BufferGeometry }>();

    useEffect(() => {
        const { x, y, z } = data.position;
        genGeometries(data.voxels, x, y, z).then(item => {
            setGeometries(item);
        })
    }, [data]);


    return geometries;
}

