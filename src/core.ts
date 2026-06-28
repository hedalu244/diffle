export interface DiffleResult {
    pattern: (0 | 1 | 2 | 3)[],
    start: boolean,
    end: boolean,
}

export function diffle(answer: string, guess: string): DiffleResult {
    const table = Array.from({ length: answer.length + 1 }, () => Array.from({ length: guess.length + 1 }, () => (
        { cost: 0, paths: [] as ("+" | "-" | ">")[][], }
    )));

    table[0][0] = { cost: 0, paths: [[]] };
    for (let a = 1; a < answer.length + 1; a++)
        table[a][0] = { cost: a, paths: table[a - 1][0].paths.map(x => [...x, "+"]) };
    for (let b = 1; b < guess.length + 1; b++)
        table[0][b] = { cost: b, paths: table[0][b - 1].paths.map(x => [...x, "-"]) };

    for (let a = 1; a < answer.length + 1; a++) {
        for (let b = 1; b < guess.length + 1; b++) {
            const accept = table[a - 1][b - 1].cost + (answer[a - 1] == guess[b - 1] ? 0 : Infinity);
            const insert = table[a - 1][b].cost + 1;
            const remove = table[a][b - 1].cost + 1;

            const cost = Math.min(insert, remove, accept);
            const paths = [] as ("+" | "-" | ">")[][];

            if (cost == accept) paths.push(...table[a - 1][b - 1].paths.map(x => [...x, ">" as const]));
            if (cost == insert) paths.push(...table[a - 1][b].paths.map(x => [...x, "+" as const]));
            if (cost == remove) paths.push(...table[a][b - 1].paths.map(x => [...x, "-" as const]));

            table[a][b] = { cost, paths };
        }
    }

    let best_score = -Infinity;
    let best_results: DiffleResult[] = [];

    table[answer.length][guess.length].paths.forEach(path => {
        const start = path[0] == ">";
        const end = path[path.length - 1] == ">";
        const pattern: (0 | 1 | 2 | 3)[] = Array.from({ length: guess.length }, x => 0);
        const unused_letter: string[] = Array.from(answer); //　answerの中でまだ使ってない文字

        let accept_count = 0;
        let streak_length = 0;
        let score = 0;
        if (start) score += 1;
        if (end) score += 1;


        let a = 0, b = 0;
        for (let i = 0; i < path.length; i++) {
            switch (path[i]) {
                case ">":
                    accept_count++;
                    streak_length++;
                    pattern[b] = streak_length == 1 ? 2 : 3;
                    unused_letter.splice(unused_letter.indexOf(guess[b]), 1);
                    score += 3 * streak_length;
                    a++;
                    b++;
                    break;
                case "+":
                    streak_length = 0;
                    a++;
                    break;
                case "-":
                    streak_length = 0;
                    b++;
                    break;
            }
        }

        // 黄色を生成
        for (let i = 0; i < guess.length; i++) {
            if (pattern[i] == 0 && unused_letter.includes(guess[i])) {
                pattern[i] = 1;
                unused_letter.splice(unused_letter.indexOf(guess[i]), 1);
            }
        }
        // 緑が一文字のとき黄色に変換
        if (accept_count == 1 && !start && !end) {
            pattern[pattern.indexOf(2)] = 1;
        }

        if (best_score == score) {
            best_results.push({ pattern, start, end });
        } else if (best_score < score) {
            best_score = score;
            best_results = [{ pattern, start, end }];
        }
    });

    best_results.sort((a, b) => a.pattern.join() < b.pattern.join() ? 1 : -1);
    return best_results[0];
}