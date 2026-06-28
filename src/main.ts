
import { openShareImage, copyShareText } from "./share";
import { getElementById } from "./utils";
import { Runtime } from "./runtime";
import { updateTimer } from "./dom";

document.addEventListener("keydown", (ev) => {
    if (ev.key == "Backspace") runtime.inputBackspace();
    if (ev.key == "Enter") runtime.inputEnter();
    if (/^[A-Za-z]$/.test(ev.key)) runtime.inputLetter(ev.key.toLowerCase());
});

Array.from("qwertyuiopasdfghjklzxcvbnm").forEach(letter => {
    const keyboard_button = getElementById("keyboard_" + letter, HTMLButtonElement);
    keyboard_button.addEventListener("click", () => runtime.inputLetter(letter));
});

getElementById("keyboard_enter", HTMLButtonElement).addEventListener("click", () => runtime.inputEnter());
getElementById("keyboard_backspace", HTMLButtonElement).addEventListener("click", () => runtime.inputBackspace());
getElementById("share_button", HTMLButtonElement).addEventListener("click", () => copyShareText(runtime.play));
getElementById("share_image_button", HTMLButtonElement).addEventListener("click", () => openShareImage(runtime.play));

const runtime = new Runtime();
setInterval(() => updateTimer(runtime.play), 1000);