"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var GRAY = "hsl(0, 0%, 35%)";
var CYAN = "hsl(175, 75%, 50%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = GRAY;
CTX.lineWidth = 3;

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var HALF_WIDTH = CANVAS.width / 2;
var HALF_HEIGHT = CANVAS.height / 2;
var N = 5;
var POINTS = new Array(N);
var SPREAD = 150;
var K = 15;
var MAGNITUDE = 0.5;
var SCALE = MAGNITUDE / 2;
var RESET = 360;
var ELAPSED = RESET + 1;

function distance(aPoint, bPoint) {
    var x = aPoint.x - bPoint.x;
    var y = aPoint.y - bPoint.y;
    return Math.sqrt((x * x) + (y * y));
}

function angle(aPoint, bPoint, cPoint) {
    var a = distance(aPoint, bPoint);
    var b = distance(bPoint, cPoint);
    var c = distance(cPoint, aPoint);
    return Math.acos(((b * b) - (a * a) - (c * c)) / (2 * a * c));
}

function loop() {
    var i, j, n, point;
    if (RESET < ELAPSED) {
        for (i = 0; i < N; i++) {
            POINTS[i] = {
                angle: Math.random() * PI_2,
            };
        }
        POINTS.sort(function(a, b) {
            return a.angle - b.angle;
        });
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            point.x = (Math.cos(point.angle) * SPREAD) + HALF_WIDTH;
            point.y = (Math.sin(point.angle) * SPREAD) + HALF_HEIGHT;
        }
        n = N - 1;
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            point.left = POINTS[i === 0 ? n : i - 1];
            point.right = POINTS[i === n ? 0 : i + 1];
        }
        ELAPSED = 0;
    } else {
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            point.x += (Math.random() * MAGNITUDE) - SCALE;
            point.y += (Math.random() * MAGNITUDE) - SCALE;
        }
        ELAPSED += 1;
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        var theta;
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            theta = angle(point, point.left, point.right) * K;
            CTX.moveTo(point.x + theta, point.y);
            CTX.arc(point.x, point.y, theta, 0, PI_2);
        }
        CTX.fillStyle = CYAN;
        CTX.fill();
    }
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            CTX.moveTo(point.x + RADIUS, point.y);
            CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
        }
        CTX.fillStyle = GRAY;
        CTX.fill();
    }
    {
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            point = POINTS[i];
            CTX.moveTo(point.left.x, point.left.y);
            CTX.lineTo(point.x, point.y);
        }
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

window.onload = loop;
