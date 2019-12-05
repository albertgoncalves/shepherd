"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.fillStyle = COLOR;
CTX.strokeStyle = COLOR;

var PI_2 = Math.PI * 2;
var RADIUS = 3;
var HALF_HEIGHT = CANVAS.height / 2;

var N = 300;
var M = N - 1;
var CIRCLES = new Array(N);
for (var i = 0; i < N; i++) {
    CIRCLES[i] = {
        x: CANVAS.width * ((i + 0.5) / N),
        y: HALF_HEIGHT,
        speedRegular: 0,
        speedSpecial: 0,
    };
}

var LOWER = CANVAS.height / 10;
var UPPER = CANVAS.height - LOWER;
var SCALE = 15;
var MAGNITUDE = 1.1;
var CENTER = MAGNITUDE / 2;
var OFFSET = 0.3;
var OFFSET_LOWER = CENTER * (1 - OFFSET);
var OFFSET_UPPER = CENTER * (1 + OFFSET);
var K;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; i++) {
        CIRCLES[i].speedRegular += (Math.random() * MAGNITUDE) - CENTER;
        K = 0;
        if (CIRCLES[i].speedSpecial < 0) {
            for (var j = 0; j < i; j++) {
                CIRCLES[i].speedSpecial += CIRCLES[j].speedRegular;
                K += 1;
            }
        } else {
            for (var k = i + 1; k < N; k++) {
                CIRCLES[i].speedSpecial += CIRCLES[k].speedRegular;
                K += 1;
            }
        }
        CIRCLES[i].y += CIRCLES[i].speedSpecial / K;
        if (CIRCLES[i].y < LOWER) {
            CIRCLES[i].y = LOWER;
            CIRCLES[i].speedRegular =
                (Math.random() * MAGNITUDE) - OFFSET_LOWER;
            CIRCLES[i].speedSpecial = 0;
        } else if (UPPER < CIRCLES[i].y) {
            CIRCLES[i].y = UPPER;
            CIRCLES[i].speedRegular =
                (Math.random() * MAGNITUDE) - OFFSET_UPPER;
            CIRCLES[i].speedSpecial = 0;
        }
    }
    for (var l = 1; l < M; l++) {
        CTX.beginPath();
        CTX.arc(CIRCLES[l].x, CIRCLES[l].y, RADIUS, 0, PI_2);
        CTX.fill();
        CTX.beginPath();
        CTX.moveTo(CIRCLES[l].x, CIRCLES[l].y);
        CTX.lineTo(CIRCLES[l].x,
                   CIRCLES[l].y + (CIRCLES[l].speedRegular * SCALE));
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

loop();