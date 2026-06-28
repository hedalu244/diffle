import { diffle } from "./core";
import { myAlert } from "./dom";
import { PlayData } from "./runtime";

function generateShareText(play: PlayData): string {
    const title = "Diffle " + play.date + "\n";
    const result = play.history.length + (play.history.length <= 1 ? " word / " : " words / ") + (play.letter_count - play.answer.length) + " letters except the answer\n\n";
    const pattern = play.history.map((x, i) => {
        if (i == play.history.length - 1) return "\u2705";
        return diffle(play.answer, x).pattern.map(y => y == 0 ? "\u26AA" : y == 1 ? "\ud83d\udfe1" : "\ud83d\udfe2").join("");
    }).join("\n");
    const url = location.href;

    return title + result + pattern + "\n\n" + url;
}

export function copyShareText(play: PlayData) {
    const shareText = generateShareText(play);

    navigator.clipboard.writeText(shareText).then(function () {
        myAlert('Copied results to clipboard');
    }).catch(function (error) {
        myAlert(error.message);
    });
}

function generateShareImage(play: PlayData): Promise<Blob> {
    const width = 500;
    const circle_radius = 21;
    const dot_radius = 4;
    const margin_x = 2;
    const margin_y = 10;
    const header_height = 70;

    const white = "#ffffff";
    const green = "#4fb061";
    const yellow = "#e8b838";
    const gray = "#959b9d";

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = play.history.length * (circle_radius + margin_y) * 2 + header_height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    context.fillStyle = white;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#1a1a1b";
    context.font = "40px 'HK Super Round Bold'";
    context.textAlign = "center";
    context.fillText("Diffle".split("").join(String.fromCharCode(8202)), width / 2, 40);

    context.font = "20px 'HK Super Round Bold'";
    context.textAlign = "center";
    context.fillText(play.date, width / 2, 65);

    play.history.forEach((guess, i) => {
        const center_y = (2 * i + 1) * (circle_radius + margin_y) + header_height;
        const result = diffle(play.answer, guess);

        if (guess == play.answer) {
            context.fillStyle = green;
            context.fillRect(0, center_y - circle_radius, width, circle_radius * 2);
            return;
         }

        if (result.start) {
            context.fillStyle = green;
            context.fillRect(width / 2 - guess.length * (circle_radius + margin_x), center_y - circle_radius, circle_radius + margin_x, circle_radius * 2);
        }
        if (result.end) {
            context.fillStyle = green;
            context.fillRect(width / 2 + (guess.length - 1) * (circle_radius + margin_x), center_y - circle_radius, circle_radius + margin_x, circle_radius * 2);
        }

        result.pattern.forEach((color, j) => {
            const center_x = width / 2 + (1 + 2 * j - guess.length) * (circle_radius + margin_x);

            context.beginPath();
            context.arc(center_x, center_y, circle_radius, 0, 360 * Math.PI / 180, false);
            context.fillStyle = [gray, yellow, green, green][color];
            context.fill();

            if (color == 3) {
                context.fillStyle = green;
                context.fillRect(center_x - (circle_radius + margin_x) * 2, center_y - circle_radius, (circle_radius + margin_x) * 2, circle_radius * 2);
                context.fill();
            }
        });
    });

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob == null) {
                reject(new Error("something went wrong"));
            } else {
                resolve(blob);
            }
        }, "image/png");
    });
}

export async function openShareImage(play: PlayData) {
    try {
        const blob = await generateShareImage(play);

        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL);
    } catch (err) {
        console.log(err);
    }
}