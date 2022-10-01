import create, { SetState, UseBoundStore, StoreApi } from 'zustand'

import { IEntities } from '@/interface/entities';
import { IGenericEvent } from '@/interface/events';
import { ISystem } from '@/interface/system';

interface InternalEntityComponent {
  entities: IEntities;
  events: IGenericEvent[];
  queuedEvents: IGenericEvent[];
  update: (systems: any[]) => void;
  emitEvent: (name: string, payload: any) => void;
  queueEvent: (name: string, payload: any) => void;
};

const createUpdateHandler = (set: SetState<InternalEntityComponent>) =>
  (systems: ISystem[]) => set(state => {
    const entities = systems.reduce<IEntities>((total, system) => {
      return system.update(total, state.events, state.queueEvent);
    }, state.entities);

    return { entities, events: [] };
  });

type IEntityComponent = Omit<InternalEntityComponent, "queueEvent" | "queuedEvents">;

type IUseEntityComponent = UseBoundStore<IEntityComponent, StoreApi<IEntityComponent>>;

const useEntityComponent = create<InternalEntityComponent>((set) => ({
  entities: {
    explorers: [],
    gametime: 0
  },
  events: [],
  queuedEvents: [],
  update: createUpdateHandler(set),
  emitEvent: (name, payload) => set(state => ({ events: [{ name, payload }, ...state.events] })),
  queueEvent: (name, payload) => set(state => ({ events: [{ name, payload }, ...state.queuedEvents] })),
})) as unknown as IUseEntityComponent;

export { useEntityComponent };
