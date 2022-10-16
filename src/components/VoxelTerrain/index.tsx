import React, { useEffect, useMemo } from 'react';

import { Chunk } from './components/Chunk';

const RENDER_DISTANCE = 8;

export const VoxelTerrain: React.FC = () => {

    const renderChunks = useMemo(() => {
        const list = [];
        const cx = 0, cy = 0, cz = 0;
        const pbx = cx - RENDER_DISTANCE;
        const pfx = cx + RENDER_DISTANCE;

        const pby = cy - RENDER_DISTANCE;
        const pfy = cy + RENDER_DISTANCE;

        const pbz = cz - RENDER_DISTANCE;
        const pfz = cz + RENDER_DISTANCE;

        for (let x = pbx; x <= pfx; ++x) {
            for (let z = pbz; z <= pfz; ++z) {
                list.push({
                    key: `${x},0,${z}`,
                    cx: x,
                    cz: z,
                });
            }
        }
        return list;
    }, []);

    return (
        <>
            {/* {renderChunks.map(item =>
                <Chunk key={item.key} cx={item.cx} cz={item.cz} />)} */}
            <Chunk cx={0} cy={0} cz={0} />
        </>
    );
}
