import { useEffect } from 'react';

import { useEntityComponent } from '@/core/useEntityComponent';
import { ISystem } from '@/interface/system';

const TickPerSecond = 20;
const Delay = 1000 / TickPerSecond; //millisecond

type IProps = {
    systems: ISystem[];
};

const GameCore: React.FC<IProps> = ({ systems }) => {
    const { update } = useEntityComponent();

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
