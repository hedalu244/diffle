"use strict";
/// <reference path="data.ts">
function diffle(answer, guess) {
    const table = Array.from({ length: answer.length + 1 }, () => Array.from({ length: guess.length + 1 }, () => ({ cost: 0, paths: [], })));
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
            const paths = [];
            if (cost == accept)
                paths.push(...table[a - 1][b - 1].paths.map(x => [...x, ">"]));
            if (cost == insert)
                paths.push(...table[a - 1][b].paths.map(x => [...x, "+"]));
            if (cost == remove)
                paths.push(...table[a][b - 1].paths.map(x => [...x, "-"]));
            table[a][b] = { cost, paths };
        }
    }
    let best_score = -Infinity;
    let result = { pattern: [], start: false, end: false };
    let best_path;
    table[answer.length][guess.length].paths.forEach(path => {
        const start = path[0] == ">";
        const end = path[path.length - 1] == ">";
        const pattern = Array.from({ length: guess.length }, (x, i) => answer.indexOf(guess[i]) == -1 ? 0 : 1);
        let score = 0;
        if (start)
            score += 1;
        if (end)
            score += 1;
        let a = 0, b = 0;
        for (let i = 0; i < path.length; i++) {
            switch (path[i]) {
                case ">":
                    pattern[b] = path[i - 1] == ">" ? 3 : 2;
                    a++;
                    b++;
                    if (path[i - 1] == ">")
                        score += 3;
                    break;
                case "+":
                    a++;
                    break;
                case "-":
                    b++;
                    break;
            }
        }
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
function assure(a, b) {
    if (a instanceof b)
        return a;
    throw new TypeError(`${a} is not ${b.name}.`);
}
const inputRow = assure(document.getElementById("input_row"), HTMLDivElement);
const board = assure(document.getElementById("board"), HTMLDivElement);
let answer = answers[Math.floor(Math.random() * answers.length)];
let guess = "";
function input_letter(letter) {
    if (!/^[a-z]$/.test(letter))
        throw new Error("invalid input");
    if (10 <= guess.length)
        return;
    const letter_element = document.createElement("div");
    letter_element.className = "letter";
    letter_element.textContent = letter;
    inputRow.appendChild(letter_element);
    guess += letter;
    //console.log(guess);
}
function input_backspace() {
    if (inputRow.lastElementChild)
        inputRow.removeChild(inputRow.lastElementChild);
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
        letter_element.classList.add(["absent", "present", "head", "tail"][result.pattern[i]]);
        const keyboard_button = assure(document.getElementById("keyboard_" + letter), HTMLButtonElement);
        if (result.pattern[i] == 2 || result.pattern[i] == 3)
            keyboard_button.className = "correct";
        if (result.pattern[i] == 1 && keyboard_button.className !== "correct")
            keyboard_button.className = "present";
        if (i == 0 && result.start)
            letter_element.classList.add("start");
        if (i == guess.length - 1 && result.end)
            letter_element.classList.add("end");
        row.appendChild(letter_element);
    });
    board.insertBefore(row, inputRow);
    guess = "";
    inputRow.innerHTML = "";
    if (guess == answer)
        alert("excellent!");
}
document.addEventListener("keydown", (ev) => {
    //console.log(ev.key);
    if (ev.key == "Backspace")
        input_backspace();
    if (ev.key == "Enter")
        enter();
    if (/^[A-Za-z]$/.test(ev.key))
        input_letter(ev.key.toLowerCase());
});
Array.from("qwertyuiopasdfghjklzxcvbnm").forEach(letter => {
    const keyboard_button = assure(document.getElementById("keyboard_" + letter), HTMLButtonElement);
    keyboard_button.addEventListener("click", () => input_letter(letter));
});
assure(document.getElementById("keyboard_enter"), HTMLButtonElement).addEventListener("click", enter);
assure(document.getElementById("keyboard_backspace"), HTMLButtonElement).addEventListener("click", input_backspace);
