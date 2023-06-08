export function truncateKey(key) {
    const beginOfKey = key.slice(0, 5);
    const endOfKey = key.slice(key.length - 5);

    return `${beginOfKey}...${endOfKey}`;
}