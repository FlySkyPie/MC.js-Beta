import React, { useMemo } from 'react';

import { Chunk } from './components/Chunk';
import { useChunksData } from './hooks/useChunksData';

export const VoxelTerrain: React.FC = () => {
    const { chunksMapPayload } = useChunksData({ cx: 0, cy: 0, cz: 0 });


    const chunks = useMemo(() => {
        return Array.from(chunksMapPayload.chunksMap.entries()).map(([key, item]) => {
            return <Chunk key={key} data={item} />
        })
    }, [chunksMapPayload]);


    return (
        <>
            {/* {renderChunks.map(item =>
                <Chunk key={item.key} cx={item.cx} cz={item.cz} />)} */}
            {chunks}
        </>
    );
}
