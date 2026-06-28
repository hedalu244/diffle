import { diffle } from "./core";
import { showReault, showStats } from "./dom";
import { PlayData, StatsData } from "./runtime";
import { getElementById } from "./utils";
import { isSolved } from "./runtime";

const $inputRow = getElementById("input_row", HTMLDivElement);
const $board = getElementById("board", HTMLDivElement);

export function restore(play: PlayData, stats: StatsData) {
    play.history.forEach(x => insertGuess(x, play.answer));
    
    Array.from(play.guess).forEach(x => insertLetter(x));

    if (isSolved(play)) showReault(play);

    if (stats.played === 0) {
        getElementById("open_help", HTMLInputElement).checked = true;
    }

    showStats(stats);
}

function render(play: PlayData, stats: StatsData) {
    // for future use, if needed
}

export function insertLetter(letter: string) {
    const letter_element = document.createElement("div");
    letter_element.className = "letter";
    letter_element.textContent = letter;
    $inputRow.appendChild(letter_element);
    $inputRow.classList.remove("empty");
}

export function removeLetter() {
    if ($inputRow.lastElementChild) $inputRow.removeChild($inputRow.lastElementChild);
    if ($inputRow.childElementCount == 0) $inputRow.classList.add("empty");
}

function updateKeyboard(letter: string, result: 0 | 1 | 2 | 3) {
    const keyboard_button = getElementById("keyboard_" + letter, HTMLButtonElement);
    if (result == 0
        && keyboard_button.className !== "present"
        && keyboard_button.className !== "correct")
        keyboard_button.className = "absent";
    if (result == 1
        && keyboard_button.className !== "correct")
        keyboard_button.className = "present";
    if (result == 2 || result == 3)
        keyboard_button.className = "correct";
}

export function insertGuess(guess: string, answer: string) {
    const row = document.createElement("div");
    row.className = "guess";

    const result = diffle(answer, guess);

    Array.from(guess).forEach((letter, i) => {
        const letter_element = document.createElement("div");
        letter_element.className = "letter";
        letter_element.textContent = letter;
        letter_element.classList.add(["absent", "present", "head", "tail"][result.pattern[i]]);

        updateKeyboard(letter, result.pattern[i]);

        if (i == 0 && result.start) letter_element.classList.add("start");
        if (i == guess.length - 1 && result.end) letter_element.classList.add("end");

        row.appendChild(letter_element);
    });
    $board.insertBefore(row, $inputRow);
}

export function clearInputRow() {
    $inputRow.innerHTML = "";
    $inputRow.classList.add("empty");
}