import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { NearestFilter } from 'three';

import textureUrl from './textureatlas.png';

const useBlockTexture = () => {
    const blockTexture = useLoader(TextureLoader, textureUrl);

    useEffect(() => {
        blockTexture.magFilter = NearestFilter;
        blockTexture.minFilter = NearestFilter;
    }, [blockTexture]);

    return { blockTexture };
}

export { useBlockTexture };
