

export enum BlockEnum {
    Air = 0,
    Dirt = 0x72523aff,
    Rock = 0x666666ff,
    Grass = 0x6b903bff,
    Leaves = 0x566e4866,
    Log = 0x806632ff,
    Sand = 0xddac80ff,
    Water = 0x18b0dc66,
    Plank = 0x715644ff,
};

export const convertBlockType2TextureId = (type: BlockEnum) => {
    switch (type) {
        case BlockEnum.Grass:
            return 0;
        case BlockEnum.Dirt:
            return 1;
        case BlockEnum.Sand:
            return 2;
        case BlockEnum.Rock:
            return 3;
        case BlockEnum.Log:
            return 4;
        case BlockEnum.Leaves:
            return 5;
        // case BlockEnum.Brick:
        //     return 0;
        case BlockEnum.Plank:
            return 7;
        case BlockEnum.Water:
            return 12;
    }

    return 0;
}