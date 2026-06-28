import { diffle } from "./core";
import { showReault, showStats } from "./dom";
import { PlayData, StatsData } from "./runtime";
import { getElementById } from "./utils";
import { isSolved } from "./runtime";

const $guess = getElementById("guess", HTMLDivElement);
const $history = getElementById("history", HTMLDivElement);

export function restore(play: PlayData, stats: StatsData) {
    play.history.forEach(x => insertHistory(x, play.answer));
    
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
    $guess.appendChild(letter_element);
    $guess.classList.remove("empty");
}

export function removeLetter() {
    if ($guess.lastElementChild) $guess.removeChild($guess.lastElementChild);
    if ($guess.childElementCount == 0) $guess.classList.add("empty");
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

export function insertHistory(guess: string, answer: string) {
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
    $history.insertBefore(row, $guess);
}

export function clearGuess() {
    $guess.innerHTML = "";
    $guess.classList.add("empty");
}