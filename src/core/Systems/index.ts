import { useMemo } from "react";

import { ISystem } from "../interface/system";


const useSystems = () => {
    const systems = useMemo<ISystem[]>(() => {
        return [];
    }, []);

    return { systems };
};

export { useSystems };
