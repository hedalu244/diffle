export function getElementById<T extends HTMLElement>(id: string, type: { new (): T }): T {
    const element = document.getElementById(id);
    if (element instanceof type) return element;
    throw new TypeError(`${id} is not ${type.name}.`);
}

export function getDateString(now: Date) {
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function parseDateString(dateString: string): {year: number, month: number, day: number} {
    const [year, month, day] = dateString.split("-").map(Number);
    return { year, month, day };
}
