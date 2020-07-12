"use strict";

var CANVAS, CTX;

var PI_2 = Math.PI * 2.0;
var N = 5;
var CIRCLES = new Array(N);
var COLORS = new Array(N);
var SCALE = 1.75;
var HALF_SCALE = SCALE / 2.0;

function numberToHex(x) {
    return x.toString(16).padStart(2, "0");
}

function colorToHex(color) {
    return "#" + numberToHex(color.red) + numberToHex(color.green) +
        numberToHex(color.blue) + numberToHex(color.alpha);
}

function lerp(a, b, t) {
    return a + (t * (b - a));
}

function lerpCircle(a, b, t) {
    return {
        x: Math.floor(lerp(a.x, b.x, t)),
        y: Math.floor(lerp(a.y, b.y, t)),
        radius: Math.floor(lerp(a.radius, b.radius, t)),
    };
}

function lerpColor(a, b, t) {
    return {
        red: Math.floor(lerp(a.red, b.red, t)),
        green: Math.floor(lerp(a.green, b.green, t)),
        blue: Math.floor(lerp(a.blue, b.blue, t)),
        alpha: Math.floor(lerp(a.alpha, b.alpha, t)),
    };
}

function initCircles() {
    var xOffset = CANVAS.width / 8.0;
    var halfHeight = CANVAS.height / 2.0;
    CIRCLES[0] = {
        x: xOffset,
        y: halfHeight,
        radius: 35.0,
    };
    COLORS[0] = {
        red: 90,
        green: 140,
        blue: 230,
        alpha: 200,
    };
    CIRCLES[1] = {
        x: CANVAS.width - xOffset,
        y: halfHeight,
        radius: 100.0,
    };
    COLORS[1] = {
        red: 240,
        green: 200,
        blue: 95,
        alpha: 200,
    };
    {
        var t = 0.25;
        CIRCLES[2] = lerpCircle(CIRCLES[0], CIRCLES[1], t);
        COLORS[2] = lerpColor(COLORS[0], COLORS[1], t);
    }
    {
        var t = 0.5;
        CIRCLES[3] = lerpCircle(CIRCLES[0], CIRCLES[1], t);
        COLORS[3] = lerpColor(COLORS[0], COLORS[1], t);
    }
    {
        var t = 0.75;
        CIRCLES[4] = lerpCircle(CIRCLES[0], CIRCLES[1], t);
        COLORS[4] = lerpColor(COLORS[0], COLORS[1], t);
    }
}

function loop() {
    for (var i = 0; i < N; ++i) {
        var circle = CIRCLES[i];
        circle.x += (Math.random() * SCALE) - HALF_SCALE;
        circle.y += (Math.random() * SCALE) - HALF_SCALE;
        if ((circle.x < 0.0) || (circle.y < 0.0) ||
            (CANVAS.width <= circle.x) || (CANVAS.height <= circle.y))
        {
            initCircles();
            break;
        }
    }
    for (var i = 2; i < N; ++i) {
        var xLeft = Math.min(CIRCLES[0].x, CIRCLES[1].x);
        var xRight = Math.max(CIRCLES[0].x, CIRCLES[1].x);
        var t = (CIRCLES[i].x - xLeft) / (xRight - xLeft);
        if (t < 0.0) {
            t = 0.0;
        } else if (1.0 < t) {
            t = 1.0;
        }
        COLORS[i] = lerpColor(COLORS[0], COLORS[1], t);
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    for (var i = 0; i < N; ++i) {
        var circle = CIRCLES[i];
        CTX.fillStyle = colorToHex(COLORS[i]);
        CTX.beginPath();
        CTX.moveTo(circle.x + circle.radius, circle.y);
        CTX.arc(circle.x, circle.y, circle.radius, 0, PI_2);
        CTX.fill();
    }
    CTX.beginPath();
    for (var i = 0; i < N; ++i) {
        var circle = CIRCLES[i];
        CTX.moveTo(circle.x + circle.radius, circle.y);
        CTX.arc(circle.x, circle.y, circle.radius, 0, PI_2);
    }
    CTX.stroke();
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = "hsl(0, 0%, 90%)";
    CTX.lineWidth = 4;
    initCircles();
    loop();
};
