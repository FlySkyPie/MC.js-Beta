import React, { useMemo } from 'react';

import { Chunk } from './components/Chunk';
import { useChunksData } from './hooks/useChunksData';

export const VoxelTerrain: React.FC = () => {
    const { chunksMapPayload } = useChunksData({ cx: 0, cy: 0, cz: 0 });


    const chunks = useMemo(() => {
        return Array.from(chunksMapPayload.chunksMap.entries()).map(([key, item]) => {
            const map = chunksMapPayload.chunksMap;
            const { x, y, z } = item.position;
            return (
                <Chunk key={key}
                    north={map.get(`${x + 1},${y},${z}`)}
                    south={map.get(`${x - 1},${y},${z}`)}
                    west={map.get(`${x},${y},${z - 1}`)}
                    east={map.get(`${x},${y},${z + 1}`)}
                    up={map.get(`${x},${y + 1},${z}`)}
                    down={map.get(`${x},${y - 1},${z}`)}
                    data={item} />
            );
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
