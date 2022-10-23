import { useEffect, useState } from "react";
import { BufferGeometry } from "three";

import { IChunkData } from '@/interface/chunks';

import { genGeometriesAsyc } from './genGeometriesAsyc';

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
        genGeometriesAsyc({ data, down, east, north, south, up, west }).then(item=>{
            setGeometries(item);
        });
      
    }, [data, down, east, north, south, up, west]);

    return geometries;
};
