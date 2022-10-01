export type IGenericEvent = {
    name: string,
    payload: any,
}

type TestEvent = {
    name: 'test',
    payload: any,
}


export type IEvent = TestEvent;