import { getDailyAnswer } from "./answer";
import { getDateString } from "./utils"
import { PlayData, StatsData } from "./runtime";

export function load(): {play: PlayData, stats: StatsData} {
    const today = getDateString(new Date());

    const statsString = localStorage.getItem("diffle_stats");
    const stats = statsString ? JSON.parse(statsString) as StatsData : {} as StatsData;

    if (stats.played == undefined) stats.played = 0;
    if (stats.won == undefined) stats.won = 0;
    if (stats.total_guess_count == undefined) stats.total_guess_count = 0;
    if (stats.total_letter_count == undefined) stats.total_letter_count = 0;

    const playString = localStorage.getItem("diffle_play");
    let play = playString ? JSON.parse(playString) as PlayData : {} as PlayData;

    if (play.date !== today) { play = {} as PlayData; }
    
    play.date = today;
    if (play.answer == undefined) play.answer = getDailyAnswer(today);
    if (play.history == undefined) play.history = [];
    if (play.letter_count == undefined) play.letter_count = 0;
    if (play.guess == undefined) play.guess = "";

    save(play, stats);
    return { play: play, stats: stats };
}

export function save(play: PlayData, stats: StatsData) {
    localStorage.setItem("diffle_play", JSON.stringify(play));
    localStorage.setItem("diffle_stats", JSON.stringify(stats));
}