import { allowed } from "./words";
import { save, load } from "./storage";
import { showReault, showStats, myAlert } from "./dom";
import { clearInputRow, insertGuess, insertLetter, removeLetter, restore } from "./render";

export interface PlayData {
    date: string;
    guess: string;
    letter_count: number;
    answer: string;
    history: string[];
}

export interface StatsData {
    played: number;
    won: number;
    total_guess_count: number;
    total_letter_count: number;
}

export function isSolved(play: PlayData): boolean {
    return play.history[play.history.length - 1] == play.answer;
}

function appreciate(play: PlayData): string {
    if (!isSolved(play)) throw new Error("not solved");

    if (play.history.length <= 1) return "miracle!";
    if (play.history.length <= 3) return "genius!";
    if (play.history.length <= 6) return "excellent!";
    if (play.history.length <= 10) return "great!";
    return "good!";
}

export class Runtime {
    play: PlayData;
    stats: StatsData;

    constructor() {
        const { play, stats } = load();
        this.play = play;
        this.stats = stats;

        restore(play, stats);
    }

    private solved() {
        if (!isSolved(this.play)) throw new Error("not solved");

        myAlert(appreciate(this.play));
        this.stats.won++;
        this.stats.total_guess_count += this.play.history.length;
        this.stats.total_letter_count += this.play.letter_count;
        showReault(this.play);
        showStats(this.stats);
    }

    inputLetter(letter: string) {
        if (isSolved(this.play)) return;
        if (!/^[a-z]$/.test(letter)) throw new Error("invalid input");
        if (10 <= this.play.guess.length) return;

        insertLetter(letter);

        this.play.guess += letter;
        save(this.play, this.stats);
    }

    inputBackspace() {
        if (isSolved(this.play)) return;

        removeLetter();

        if (this.play.guess !== "")
            this.play.guess = this.play.guess.substring(0, this.play.guess.length - 1);

        save(this.play, this.stats);
    }

    inputEnter() {
        if (isSolved(this.play)) return;

        if (!allowed.includes(this.play.guess)) {
            myAlert("not in word list");
            return;
        }
        if (this.play.history.length == 0) {
            this.stats.played++;
            showStats(this.stats);
        }

        insertGuess(this.play.guess, this.play.answer);
        clearInputRow();

        this.play.letter_count += this.play.guess.length;
        this.play.history.push(this.play.guess);
        this.play.guess = "";

        if (isSolved(this.play)) this.solved();

        save(this.play, this.stats);
    }
}