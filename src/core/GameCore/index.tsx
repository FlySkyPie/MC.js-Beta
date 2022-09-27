
import { useEntityComponent } from '@/core/useEntityComponent';
import { useEffect } from 'react';

import { useSystems } from '../Systems';

const TickPerSecond = 20;
const Delay = 1000 / TickPerSecond; //millisecond

const GameCore: React.FC = () => {
    const { update } = useEntityComponent();
    const { systems } = useSystems();

    useEffect(() => {
        let lastTime: number = performance.now();
        let count: number = 0;
        let requestId: number;
        function playAnimation(millisecond: number) {
            if (lastTime != null) {
                const delta = millisecond - lastTime;
                count += delta;
                while (count > Delay) {
                    update(systems);

                    count -= Delay;
                }
            }

            lastTime = millisecond;
            requestId = window.requestAnimationFrame(playAnimation);
        }

        requestId = window.requestAnimationFrame(playAnimation);

        return () => {
            window.cancelAnimationFrame(requestId)
        };
    }, []);

    return null;
}

export { GameCore };
