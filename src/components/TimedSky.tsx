import * as React from 'react'
import { Sky, } from '@react-three/drei';
import { Vector3 } from 'three';

import { useEntityComponent } from '@/core/useEntityComponent';

export const TimedSky = () => {
    const { entities } = useEntityComponent();

    const sunVec = React.useMemo(() => {
        const pos = new Vector3(1, 0, 0);
        const axis = new Vector3(0, 0, 1);
        const angle = entities.gametime / 24000 * 2 * Math.PI;
        return pos.applyAxisAngle(axis, angle)
    }, [entities.gametime]);

    return (
        <Sky
            distance={8000}
            turbidity={0.3}
            rayleigh={0.1}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            sunPosition={sunVec} />
    )
};
