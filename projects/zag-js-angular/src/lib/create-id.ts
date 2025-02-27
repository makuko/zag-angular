let id = 0;

export function createId() {
    return (++id).toString(36).padStart(5, '0');
}
