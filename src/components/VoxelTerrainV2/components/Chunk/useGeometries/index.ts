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

export const useGeometries = ({ data, down, east, north, south, up, west }: IProps) => {
    const [geometries, setGeometries] = useState<{ geometry: BufferGeometry, t_geometry: BufferGeometry }>();

    useEffect(() => {
        const item = genGeometries({ data, down, east, north, south, up, west });
        setGeometries(item);
    }, [data, down, east, north, south, up, west]);

    return geometries;
};
