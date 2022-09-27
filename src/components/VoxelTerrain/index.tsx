import React, { useEffect } from 'react';

import { Chunk } from './components/Chunk';

export const VoxelTerrain: React.FC = () => {

    return (
        <>
            <Chunk cx={0} cz={0} />
            <Chunk cx={1} cz={0} />
            <Chunk cx={-1} cz={0} />
            <Chunk cx={0} cz={1} />
            <Chunk cx={0} cz={-1} />
        </>
    );
}
