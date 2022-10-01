import { IEntities } from "./entities";
import { IGenericEvent } from "./events";

type PreEmitEventFunc = (name: string, payload: any) => void;

export interface ISystem {
    update: (entities: IEntities, events: IGenericEvent[], func: PreEmitEventFunc) => IEntities;
};
