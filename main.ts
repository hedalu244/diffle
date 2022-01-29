/// <reference path="data.ts">

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

function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

const inputRow = assure(document.getElementById("input_row"), HTMLDivElement);
const board = assure(document.getElementById("board"), HTMLDivElement);
let answer = answers[Math.floor(Math.random() * answers.length)];
let guess = "";

function input_letter(letter: string) {
    if (!/^[a-z]$/.test(letter)) throw new Error("invalid input");
    if (10 <= guess.length) return;

    const letter_element = document.createElement("div");
    letter_element.className = "letter";
    letter_element.textContent = letter;
    inputRow.appendChild(letter_element);
    guess += letter;
    console.log(guess);
}
function input_backspace() {
    if (inputRow.lastElementChild) inputRow.removeChild(inputRow.lastElementChild);
    guess = guess.substring(0, guess.length - 1);
    console.log(guess);
}
function enter() {
    if (!arrowed.includes(guess)) {
        alert("not in word list");
        return;
    }

    const row = document.createElement("div");
    row.className = "guess";

    const result = diffle(answer, guess);

    Array.from(guess).forEach((letter, i) => {
        const letter_element = document.createElement("div");
        letter_element.className = "letter";
        letter_element.textContent = letter;
        letter_element.classList.add(["absent", "present", "head", "tail"][result[i]]);

        row.appendChild(letter_element);

        result[i];
    });

    board.insertBefore(row, inputRow);
    guess = "";
    inputRow.innerHTML = "";

    if(guess == answer) alert("excellent!");
}

document.addEventListener("keydown", (ev) => {
    console.log(ev.key);
    if (ev.key == "Backspace") input_backspace();
    if (ev.key == "Enter") enter();
    if (/^[A-Za-z]$/.test(ev.key)) input_letter(ev.key.toLowerCase());
});