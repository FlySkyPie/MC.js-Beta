import { useMemo } from "react";

import { ISystem } from "@/interface/system";

import { TickSystem } from './TickSystem';


export const useSystems = () => {
    const systems = useMemo<ISystem[]>(() => {
        return [
            new TickSystem(),
        ];
    }, []);

    return { systems };
};
