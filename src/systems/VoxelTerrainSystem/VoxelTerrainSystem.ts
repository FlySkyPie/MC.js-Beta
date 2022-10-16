import { IEntities } from '@/interface/entities';
import { IGenericEvent } from '@/interface/events';
import type { ISystem } from '@/interface/system';


const RENDER_DISTANCE = 8;
const CHUNK_SIZE = 16;

export class VoxelTerrainSystem implements ISystem {
    update(entities: IEntities, events: IGenericEvent[], func: (name: string, payload: any) => void) {
        const { explorers } = entities;
        const renderChunks = new Map();

        explorers.forEach(item => {
            const pbx = Math.floor(item.x / CHUNK_SIZE) - RENDER_DISTANCE;
            const pfx = Math.floor(item.x / CHUNK_SIZE) + RENDER_DISTANCE;

            // const pby =  Math.floor(item.y / CHUNK_SIZE) - RENDER_DISTANCE;
            // const pfy =  Math.floor(item.y / CHUNK_SIZE) + RENDER_DISTANCE;

            const pbz = Math.floor(item.z / CHUNK_SIZE) - RENDER_DISTANCE;
            const pfz = Math.floor(item.z / CHUNK_SIZE) + RENDER_DISTANCE;

            for (let x = pbx; x <= pfx; ++x) {
                for (let z = pbz; z <= pfz; ++z) {
                    renderChunks.set(`${x},0,${z}`, { x, z });
                }
            }
        })


        return entities;
    };

}