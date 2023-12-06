import NodeCache from "node-cache";


const myCache = new NodeCache({ stdTTL: 20000 });

export function setCache(key, value) {
    myCache.set(key, value);
}

export function getCache(key) {
    return myCache.get(key);
}