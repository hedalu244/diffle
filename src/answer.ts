import { parseDateString } from "./utils";
import { answers } from "./words";

export function randomInt(seed: number): number {
    let x = 123456789;
    let y = 362436069;
    let z = 521288629;
    let w = seed;
    
    for (let i = 0; i < 1024; i++) {
        let t = x ^ (x << 11);
        x = y;
        y = z;
        z = w;
        w = (w ^ (w >>> 19)) ^ (t ^ (t >>> 8));
    }
    return Math.abs(w);
}

export function getDailyAnswer(today: string): string {
    const { year, month, day } = parseDateString(today);
    const seed =  day + month * 32 + year * 400;
    if (seed == 808836) return "differ";

    return answers[randomInt(seed) % answers.length];
}
