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

    return result;
}

function assure<T extends new (...args: any[]) => any>(a: any, b: T): InstanceType<T> {
    if (a instanceof b) return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}

const $inputRow = assure(document.getElementById("input_row"), HTMLDivElement);
const $board = assure(document.getElementById("board"), HTMLDivElement);

interface PlayData {
    date: string;
    guess: string;
    letter_count: number;
    answer: string;
    history: string[];
}
interface StatsData {
    played: number;
    won: number;
    total_guess_count: number;
    total_letter_count: number;
}
let play: PlayData;
let stats: StatsData;

function dailySeed() {
    const now = new Date();
    return now.getDate() + now.getMonth() * 32 + now.getFullYear() * 400;
}

function getAnswer(seed: number): string {
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

    return answers[Math.abs(w) % answers.length];
}

function save() {
    localStorage.setItem("diffle_play", JSON.stringify(play));
    localStorage.setItem("diffle_stats", JSON.stringify(stats));
}

function load() {
    const today = getTodayString();

    const statsString = localStorage.getItem("diffle_stats");
    stats = statsString ? JSON.parse(statsString) : {} as StatsData;

    if(stats.played == undefined) stats.played = 0;
    if(stats.won == undefined) stats.won = 0;
    if(stats.total_guess_count == undefined) stats.total_guess_count = 0;
    if(stats.total_letter_count == undefined) stats.total_letter_count = 0;

    const playString = localStorage.getItem("diffle_play");
    const _play = playString ? JSON.parse(playString) as PlayData : null;

    if (_play && _play.date == today) {
        play = _play;
        if (play.answer == undefined) play.answer = getAnswer(dailySeed());
        play.history.forEach(x => insertGuess(x));

        Array.from(play.guess).forEach(x => insertLetter(x));
        if (play.history[play.history.length - 1] == play.answer) showReault();
    }
    else {
        play = {
            date: today,
            guess: "",
            history: [],
            answer: getAnswer(dailySeed()),
            letter_count: 0,
        };
        save();
    }

    showStats();
}

function insertLetter(letter: string) {
    const letter_element = document.createElement("div");
    letter_element.className = "letter";
    letter_element.textContent = letter;
    $inputRow.appendChild(letter_element);
    $inputRow.classList.remove("empty");
}

function insertGuess(guess: string) {
    const row = document.createElement("div");
    row.className = "guess";

    const result = diffle(play.answer, guess);

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

    $inputRow.innerHTML = "";
    $inputRow.classList.add("empty");
}

function inputLetter(letter: string) {
    if (play.history[play.history.length - 1] == play.answer) return;
    if (!/^[a-z]$/.test(letter)) throw new Error("invalid input");
    if (10 <= play.guess.length) return;

    insertLetter(letter);

    play.guess += letter;
    save();
}
function inputBackspace() {
    if (play.history[play.history.length - 1] == play.answer) return;
    if ($inputRow.lastElementChild) $inputRow.removeChild($inputRow.lastElementChild);
    if (play.guess !== "")
        play.guess = play.guess.substring(0, play.guess.length - 1);
    if (play.guess == "")
        $inputRow.classList.add("empty");

    save();
}

function enter() {
    if (play.history[play.history.length - 1] == play.answer) return;
    if (!allowed.includes(play.guess)) {
        myAlert("not in word list");
        return;
    }
    if (play.history.length == 0) {
        stats.played++;
        showStats();
    }

    insertGuess(play.guess);

    play.letter_count += play.guess.length;
    play.history.push(play.guess);

    if (play.guess == play.answer) {
        setTimeout(() => myAlert("excellent!"), 0);
        stats.won++;
        stats.total_guess_count += play.history.length;
        stats.total_letter_count += play.letter_count;
        showReault();
        showStats();
    }

    play.guess = "";

    save();
}

function showReault() {
    $inputRow.style.display = "none";
    assure(document.getElementById("result"), HTMLDivElement).style.display = "";
    assure(document.getElementById("timer_container"), HTMLDivElement).style.display = "";
    assure(document.getElementById("letters_used"), HTMLDivElement).textContent = "" + play.letter_count;
    assure(document.getElementById("words_used"), HTMLDivElement).textContent = "" + play.history.length;
    assure(document.getElementById("words_used_label"), HTMLSpanElement).innerHTML = play.history.length <= 1 ? "Word<br>Used" : "Words<br>Used";
}

function showStats() {
    assure(document.getElementById("stats_played"), HTMLDivElement).textContent = "" + stats.played;
    assure(document.getElementById("stats_won"), HTMLDivElement).textContent = "" + stats.won;
    assure(document.getElementById("stats_average_words"), HTMLDivElement).textContent = stats.won == 0 ? "0.0" : (stats.total_guess_count / stats.won).toFixed(1);
    assure(document.getElementById("stats_average_letters"), HTMLDivElement).textContent = stats.won == 0 ? "0.0" : (stats.total_letter_count / stats.won).toFixed(1);
}

function myAlert(message: string) {
    const alert = assure(document.getElementById("alert"), HTMLDivElement);

    alert.textContent = message;
    alert.classList.add("visible");

    setTimeout(() => alert.classList.remove("visible"), 1500);
}

function share() {
    const title = "Diffle " + play.date + "\n";
    const result = play.history.length + (play.history.length <= 1 ? " word / " : " words / ") + play.letter_count + " letters\n\n";
    const pattern = play.history.map((x, i) => diffle(play.answer, x).pattern.map(y =>
        i == play.history.length - 1 ? "\ud83d\udfe9" : y == 0 ? "\u26AA" : y == 1 ? "\ud83d\udfe1" : "\ud83d\udfe2"
    ).join("")).join("\n");
    const url = location.href;

    navigator.clipboard.writeText(title + result + pattern + "\n\n" + url).then(function () {
        myAlert('Copyed results to clipboard');
    }).catch(function (error) {
        myAlert(error.message);
    });
}

document.addEventListener("keydown", (ev) => {
    if (ev.key == "Backspace") inputBackspace();
    if (ev.key == "Enter") enter();
    if (/^[A-Za-z]$/.test(ev.key)) inputLetter(ev.key.toLowerCase());
});

Array.from("qwertyuiopasdfghjklzxcvbnm").forEach(letter => {
    const keyboard_button = assure(document.getElementById("keyboard_" + letter), HTMLButtonElement);
    keyboard_button.addEventListener("click", () => inputLetter(letter));
});

function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function updateTimer() {
    const today = getTodayString();
    if (play.date !== today) {
        assure(document.getElementById("timer"), HTMLDivElement).textContent = "00:00:00";
        return;
    }

    const now = new Date();
    const rest = 86400 - (3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds());

    const rest_hours = Math.floor(rest / 3600);
    const rest_minutes = Math.floor((rest - 3600 * rest_hours) / 60);
    const rest_seconds = rest - 3600 * rest_hours - 60 * rest_minutes;
    const rest_format = `${("" + rest_hours).padStart(2, "0")}:${("" + rest_minutes).padStart(2, "0")}:${("" + rest_seconds).padStart(2, "0")}`;

    assure(document.getElementById("timer"), HTMLDivElement).textContent = rest_format;
}

assure(document.getElementById("keyboard_enter"), HTMLButtonElement).addEventListener("click", enter);
assure(document.getElementById("keyboard_backspace"), HTMLButtonElement).addEventListener("click", inputBackspace);
assure(document.getElementById("share_button"), HTMLButtonElement).addEventListener("click", share);

load();
setInterval(updateTimer, 1000);
