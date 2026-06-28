import { PlayData, StatsData } from "./runtime";
import { getElementById, getDateString } from "./utils";

export function myAlert(message: string) {
    const alert = getElementById("alert", HTMLDivElement);

    alert.textContent = message;
    alert.classList.add("visible");

    setTimeout(() => alert.classList.remove("visible"), 1500);
}

export function showReault(play: PlayData) {
    getElementById("input_row", HTMLDivElement).style.display = "none";
    getElementById("result", HTMLDivElement).style.display = "";
    getElementById("timer_container", HTMLDivElement).style.display = "";
    getElementById("letters_used", HTMLDivElement).textContent = "" + play.letter_count;
    getElementById("words_used", HTMLDivElement).textContent = "" + play.history.length;
    getElementById("words_used_label", HTMLSpanElement).innerHTML = play.history.length <= 1 ? "Word<br>Used" : "Words<br>Used";
}

export function showStats(stats: StatsData) {
    getElementById("stats_played", HTMLDivElement).textContent = "" + stats.played;
    getElementById("stats_won", HTMLDivElement).textContent = "" + stats.won;
    getElementById("stats_average_words", HTMLDivElement).textContent = stats.won == 0 ? "0.0" : (stats.total_guess_count / stats.won).toFixed(1);
    getElementById("stats_average_letters", HTMLDivElement).textContent = stats.won == 0 ? "0.0" : (stats.total_letter_count / stats.won).toFixed(1);
}

export function updateTimer(play: PlayData) {
    const today = getDateString(new Date());
    if (play.date !== today) {
        getElementById("timer", HTMLDivElement).textContent = "00:00:00";
        return;
    }

    const now = new Date();
    const rest = 86400 - (3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds());

    const rest_hours = Math.floor(rest / 3600);
    const rest_minutes = Math.floor((rest - 3600 * rest_hours) / 60);
    const rest_seconds = rest - 3600 * rest_hours - 60 * rest_minutes;
    const rest_format = `${("" + rest_hours).padStart(2, "0")}:${("" + rest_minutes).padStart(2, "0")}:${("" + rest_seconds).padStart(2, "0")}`;

    getElementById("timer", HTMLDivElement).textContent = rest_format;
}