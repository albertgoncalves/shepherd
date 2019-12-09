"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

var PI_2 = Math.PI * 2;
var RADIUS = 7;
var N = 20;
var M = N - 1;
var SPREAD = 275;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var ANGLES = new Array(N);
var XS = new Array(N);
var YS = new Array(N);
var DRAG = 10;
var RESET = 60 * 3;
var ELAPSED = RESET + 1;

function loop() {
    var i, x, y, left, right;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    if (RESET < ELAPSED) {
        for (i = 0; i < N; i++) {
            ANGLES[i] = Math.random() * PI_2;
        }
        ANGLES.sort();
        for (i = 0; i < N; i++) {
            XS[i] = (Math.cos(ANGLES[i]) * SPREAD) + HALF_WIDTH;
            YS[i] = (Math.sin(ANGLES[i]) * SPREAD) + HALF_HEIGHT;
        }
        ELAPSED = 0;
    } else {
        ELAPSED += 1;
    }
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        left = i === 0 ? M : i - 1;
        right = i === M ? 0 : i + 1;
        XS[i] += (((XS[left] + XS[right]) / 2) - XS[i]) / DRAG;
        YS[i] += (((YS[left] + YS[right]) / 2) - YS[i]) / DRAG;
        CTX.moveTo(XS[left], YS[left]);
        CTX.lineTo(XS[i], YS[i]);
    }
    CTX.stroke();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        x = XS[i];
        y = YS[i];
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
    requestAnimationFrame(loop);
}

loop();
