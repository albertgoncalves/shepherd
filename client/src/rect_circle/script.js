"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = WHITE;
CTX.fillStyle = WHITE;
CTX.lineWidth = 3;

var PI_2 = Math.PI * 2;
var POINT_R = 7;
var RECT_K = 500;
var CIRCLE_R = RECT_K / 4;
var CIRCLE_R_2 = CIRCLE_R * 2;
var RESET = 360;
var ELAPSED = RESET + 1;
var MAGNITUDE = 1.5;
var SCALE = MAGNITUDE / 2;
var WIDTH, HEIGHT, RECTANGLE, CIRCLE, POINT;

function nearest(rectangle, point) {
    return {
        x: Math.max(rectangle.x,
                    Math.min(point.x, rectangle.x + rectangle.width)),
        y: Math.max(rectangle.y,
                    Math.min(point.y, rectangle.y + rectangle.height)),
    };
}

function intersect(rectangle, circle) {
    var xDelta = circle.x -
        Math.max(rectangle.x,
                 Math.min(circle.x, rectangle.x + rectangle.width));
    var yDelta = circle.y -
        Math.max(rectangle.y,
                 Math.min(circle.y, rectangle.y + rectangle.height));
    return ((xDelta * xDelta) + (yDelta * yDelta)) <
        (circle.radius * circle.radius);
}

function loop() {
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        WIDTH = Math.random() * RECT_K;
        HEIGHT = Math.random() * RECT_K;
        RECTANGLE = {
            x: Math.random() * (CANVAS.width - WIDTH),
            y: Math.random() * (CANVAS.height - HEIGHT),
            width: WIDTH,
            height: HEIGHT,
        };
        CIRCLE = {
            x: (Math.random() * (CANVAS.width - CIRCLE_R_2)) + CIRCLE_R,
            y: (Math.random() * (CANVAS.height - CIRCLE_R_2)) + CIRCLE_R,
            radius: CIRCLE_R,
        };
        POINT = nearest(RECTANGLE, CIRCLE);
    } else {
        ELAPSED += 1;
        RECTANGLE.x += (Math.random() * MAGNITUDE) - SCALE;
        RECTANGLE.y += (Math.random() * MAGNITUDE) - SCALE;
        CIRCLE.x += (Math.random() * MAGNITUDE) - SCALE;
        CIRCLE.y += (Math.random() * MAGNITUDE) - SCALE;
        POINT = nearest(RECTANGLE, CIRCLE);
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.strokeRect(RECTANGLE.x, RECTANGLE.y, RECTANGLE.width,
                       RECTANGLE.height);
        CTX.beginPath();
        CTX.moveTo(CIRCLE.x + CIRCLE_R, CIRCLE.y);
        CTX.arc(CIRCLE.x, CIRCLE.y, CIRCLE_R, 0, PI_2);
        CTX.stroke();
    }
    if (!intersect(RECTANGLE, CIRCLE)) {
        var radians = Math.atan2(POINT.y - CIRCLE.y, POINT.x - CIRCLE.x);
        var intersection = {
            x: CIRCLE.x + (CIRCLE.radius * Math.cos(radians)),
            y: CIRCLE.y + (CIRCLE.radius * Math.sin(radians)),
        };
        {
            CTX.beginPath();
            CTX.moveTo(POINT.x, POINT.y);
            CTX.lineTo(intersection.x, intersection.y);
            CTX.stroke();
        }
        {
            CTX.beginPath();
            CTX.moveTo(POINT.x + POINT_R, POINT.y);
            CTX.arc(POINT.x, POINT.y, POINT_R, 0, PI_2);
            CTX.moveTo(intersection.x + POINT_R, intersection.y);
            CTX.arc(intersection.x, intersection.y, POINT_R, 0, PI_2);
            CTX.fill();
        }
    }
    requestAnimationFrame(loop);
}

loop();
