import React, { useContext, useMemo } from "react";
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const prng = alea('seed');
const SimplexNoiseContext = React.createContext(createNoise2D(prng));

type IProps = {
    seed: string;
    children: React.ReactNode;
};

const SimplexNoiseProvider: React.FC<IProps> = ({ seed, children }) => {
    const prng = useMemo(() => alea('seed'), [seed]);
    const simplex = useMemo(() => createNoise2D(prng), [prng]);

    return (
        <SimplexNoiseContext.Provider value={simplex}>
            {children}
        </SimplexNoiseContext.Provider>
    );
}

const useSimplexNoise = () => {
    const simplex = useContext(SimplexNoiseContext);

    return { simplex };
};

export { SimplexNoiseProvider, useSimplexNoise };
