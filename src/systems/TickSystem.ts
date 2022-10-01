

import { IEntities } from '@/interface/entities';
import { IGenericEvent } from '@/interface/events';
import type { ISystem } from '@/interface/system';

export class TickSystem implements ISystem {
    update(entities: IEntities, events: IGenericEvent[], func: (name: string, payload: any) => void) {
        entities.gametime += 1;

        //console.log(entities.gametime);

        return entities;
    };
}