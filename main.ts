/// <reference path="data.ts">

interface DiffleResult {
    pattern: (0 | 1 | 2 | 3)[],
    start: boolean,
    end: boolean,
}

function diffle(answer: string, guess: string): DiffleResult {
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
    let result: DiffleResult = { pattern: [], start: false, end: false };
    let best_path;

    table[answer.length][guess.length].paths.forEach(path => {
        const start = path[0] == ">";
        const end = path[path.length - 1] == ">";
        const pattern: (0 | 1 | 2 | 3)[] = Array.from({ length: guess.length }, (x, i) => answer.indexOf(guess[i]) == -1 ? 0 : 1);

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
        if (accept_count == 1 && !start && !end)
            pattern[pattern.indexOf(2)] = 1;

        if (best_score < score) {
            best_score = score;
            best_path = path;
            result = { pattern, start, end };
        }
    });

    console.log(table);
    console.log(best_path);

    return result;
}

function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

const $inputRow = assure(document.getElementById("input_row"), HTMLDivElement);
const $board = assure(document.getElementById("board"), HTMLDivElement);
let answer = answers[Math.floor(Math.random() * answers.length)];
let progress: { guess: string, result: DiffleResult; }[] = [];
let guess = "";
let count = 0;

function input_letter(letter: string) {
    if (!/^[a-z]$/.test(letter)) throw new Error("invalid input");
    if (10 <= guess.length) return;

    const letter_element = document.createElement("div");
    letter_element.className = "letter";
    letter_element.textContent = letter;
    $inputRow.appendChild(letter_element);
    guess += letter;
    count++;

    $inputRow.classList.remove("empty");
    //console.log(guess);
}
function input_backspace() {
    if ($inputRow.lastElementChild) $inputRow.removeChild($inputRow.lastElementChild);
    if (guess !== "") {
        guess = guess.substring(0, guess.length - 1);
        count--;
    }
    if (guess == "")
        $inputRow.classList.add("empty");
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
        letter_element.classList.add(["absent", "present", "head", "tail"][result.pattern[i]]);

        const keyboard_button = assure(document.getElementById("keyboard_" + letter), HTMLButtonElement);
        if (result.pattern[i] == 0)
            keyboard_button.className = "absent";
        if (result.pattern[i] == 1 && keyboard_button.className !== "correct")
            keyboard_button.className = "present";
        if (result.pattern[i] == 2 || result.pattern[i] == 3)
            keyboard_button.className = "correct";

        if (i == 0 && result.start) letter_element.classList.add("start");
        if (i == guess.length - 1 && result.end) letter_element.classList.add("end");

        row.appendChild(letter_element);
    });
    $board.insertBefore(row, $inputRow);
    progress.push({ guess, result });

    if (guess == answer) {
        $inputRow.style.display = "none";
        setTimeout(() => alert("excellent!"), 0);
        assure(document.getElementById("result"), HTMLDivElement).style.display = "";
        assure(document.getElementById("letters_used"), HTMLDivElement).textContent = "" + count;
        assure(document.getElementById("letters_answer"), HTMLDivElement).textContent = "" + answer.length;
    }
    else {
        guess = "";
        $inputRow.innerHTML = "";
        $inputRow.classList.add("empty");
    }
}

function share() {
    const result = count + "/" + answer.length + "\n\n";
    const pattern = progress.map(x => x.result.pattern.map(x =>
        x == 0 ? "\u26AA" : x == 1 ? "\ud83d\udfe1" : "\ud83d\udfe2"
    ).join("")).join("\n");

    navigator.clipboard.writeText("Diffle " + result + pattern);
}

document.addEventListener("keydown", (ev) => {
    //console.log(ev.key);
    if (ev.key == "Backspace") input_backspace();
    if (ev.key == "Enter") enter();
    if (/^[A-Za-z]$/.test(ev.key)) input_letter(ev.key.toLowerCase());
});

Array.from("qwertyuiopasdfghjklzxcvbnm").forEach(letter => {
    const keyboard_button = assure(document.getElementById("keyboard_" + letter), HTMLButtonElement);
    keyboard_button.addEventListener("click", () => input_letter(letter));
});

function getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function updateTimer() {
    const now = new Date();
    const rest = 86400 - (3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds());

    const rest_hours = Math.floor(rest / 3600);
    const rest_minutes = Math.floor((rest - 3600 * rest_hours) / 60);
    const rest_seconds = rest - 3600 * rest_hours - 60 * rest_minutes;
    const rest_format = `${("" + rest_hours).padStart(2, "0")}:${("" + rest_minutes).padStart(2, "0")}:${("" + rest_seconds).padStart(2, "0")}`;

    assure(document.getElementById("timer"), HTMLDivElement).textContent = rest_format;
}

assure(document.getElementById("keyboard_enter"), HTMLButtonElement).addEventListener("click", enter);
assure(document.getElementById("keyboard_backspace"), HTMLButtonElement).addEventListener("click", input_backspace);
assure(document.getElementById("share_button"), HTMLButtonElement).addEventListener("click", share);

setInterval(updateTimer, 1000);
