function diffle(answer: string, guess: string) {
    const table = Array.from({ length: answer.length + 1 }, () => Array.from({ length: guess.length + 1 }, () => ({ cost: 0, operation: "insert" as "insert" | "remove" | "accept" })));

    for (let i = 0; i < answer.length + 1; i++) table[i][0] = { cost: i, operation: "insert" };
    for (let j = 0; j < guess.length + 1; j++) table[0][j] = { cost: j, operation: "remove" };

    for (let i = 1; i < answer.length + 1; i++) {
        for (let j = 1; j < guess.length + 1; j++) {
            const insert = table[i - 1][j].cost + 1;
            const remove = table[i][j - 1].cost + 1;
            const accept = table[i - 1][j - 1].cost + (answer[i - 1] == guess[j - 1] ? 0 : Infinity);
            const cost = Math.min(remove, insert, accept);

            if (cost == insert) table[i][j] = { cost: cost, operation: "insert" };
            if (cost == remove) table[i][j] = { cost: cost, operation: "remove" };
            if (cost == accept) table[i][j] = { cost: cost, operation: "accept" };
        }
    }

    let i = answer.length, j = guess.length;
    let accept_count = 0;
    let state: number[] = Array.from({ length: guess.length }, (x, i) => answer.indexOf(guess[i]) == -1 ? 0 : 1);
    let log = "";
    while (0 < i || 0 < j) {
        switch (table[i][j].operation) {
            case "remove":
                j--;
                log = "-" + guess[j] + "\n" + log;
                break;
            case "insert":
                i--;
                log = "+" + answer[i] + "\n" + log;
                break;
            case "accept":
                i--;
                j--;
                log = "=" + guess[j] + "\n" + log;
                state[j] = table[i][j].operation == "accept" ? 3 : 2;
                accept_count++;
                break;
        }
    }
    if (accept_count == 1) state = state.map(x => x == 2 ? 1 : x);

    console.log(log);
    console.log(guess);
    console.log(state.join(""));
    return state;
}