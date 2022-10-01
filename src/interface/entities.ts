


type IExplorer = {
  x: number,
  y: number,
  z: number;
};



export type IEntities = {
  explorers: IExplorer[];
  gametime: number;

  [key: string]: any;
};