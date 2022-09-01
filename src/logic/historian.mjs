export function useHistorian(Game, tracked, size = 10) {
    const history = { undo: [], redo: [] };
    
    tracked = new Set(tracked.split(/ +/));

    const update = (queue, prop, snapshot) => {
        if(queue.length === size) {
            for(let i = 1; i < size; i++) {
                queue[i - 1] = queue[i];
            }
            queue[size - 1] = { prop, snapshot };
        } else {
            queue.push({ prop, snapshot });
        }
    }

    const move = (first, second) => (target) => {
        const queue = history[second];
        const { prop, snapshot } = queue.length > 0 ? queue.pop() : queue.initial;
        update(history[first], prop, target.serialize());
        target.deserialize(snapshot);
    }

    const instHandler = {
        get(target, prop, proxy) {
            if(prop === "redo" || prop === "undo") {
                return () => {
                    this[prop](target);
                    return proxy;
                }
            }
            if(tracked.has(prop)) {
                update(history.undo, prop, target.serialize());
            }
            return Reflect.get(target, prop);
        },
        redo: move("undo", "redo"),
        undo: move("redo", "undo")
    };

    return new Proxy(Game, {
        construct(target, args) {
            const inst = new target(...args);
            if(!history.undo.initial) {
                history.undo.initial = { prop: "construct", snapshot: inst.serialize() };
            }
            return new Proxy(inst, instHandler);
        }
    });
}