"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;
CTX.imageSmoothingEnabled = false;

var PI_2 = Math.PI * 2;
var RADIUS = 5;
var N = 20;
var M = N - 1;
var SPREAD = 275;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var ANGLES = new Array(N);
var XS = new Array(N);
var YS = new Array(N);

function init() {
    for (var i = 0; i < N; i++) {
        ANGLES[i] = Math.random() * PI_2;
    }
    ANGLES.sort();
    for (i = 0; i < N; i++) {
        XS[i] = (Math.cos(ANGLES[i]) * SPREAD) + HALF_WIDTH;
        YS[i] = (Math.sin(ANGLES[i]) * SPREAD) + HALF_HEIGHT;
    }
}

var DRAG = 10;
var RESET = 60 * 3;
var ELAPSED = RESET + 1;
var INDEX_LEFT, INDEX_RIGHT;
var MAGNITUDE = 1.75;
var CENTER = MAGNITUDE / 2;

function loop() {
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (RESET < ELAPSED) {
        init();
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    for (var i = 0; i < N; i++) {
        INDEX_LEFT = i === 0 ? M : i - 1;
        INDEX_RIGHT = i === M ? 0 : i + 1;
        XS[i] += (Math.random() * MAGNITUDE) - CENTER;
        YS[i] += (Math.random() * MAGNITUDE) - CENTER;
        XS[i] += (((XS[INDEX_LEFT] + XS[INDEX_RIGHT]) / 2) - XS[i]) / DRAG;
        YS[i] += (((YS[INDEX_LEFT] + YS[INDEX_RIGHT]) / 2) - YS[i]) / DRAG;
        {
            CTX.beginPath();
            CTX.lineTo(XS[INDEX_LEFT], YS[INDEX_LEFT]);
            CTX.lineTo(XS[i], YS[i]);
            CTX.stroke();
        }
        {
            CTX.beginPath();
            CTX.arc(XS[i], YS[i], RADIUS, 0, PI_2);
            CTX.fill();
        }
    }
    requestAnimationFrame(loop);
}

loop();
