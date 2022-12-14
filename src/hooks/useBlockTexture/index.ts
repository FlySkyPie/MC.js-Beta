import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { LinearMipMapLinearFilter, NearestFilter, NearestMipmapNearestFilter } from 'three';

import textureUrl from './textureatlas.png';

const useBlockTexture = () => {
    const blockTexture = useLoader(TextureLoader, textureUrl);

    useEffect(() => {
        blockTexture.magFilter = NearestFilter;
        blockTexture.minFilter = NearestMipmapNearestFilter;
    }, [blockTexture]);

    return { blockTexture };
}

export { useBlockTexture };
