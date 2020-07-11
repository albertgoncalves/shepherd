"use strict";

var CANVAS, CTX;

var COLOR = "hsl(0, 0%, 35%)";
var PI_2 = Math.PI * 2;
var POINT_RADIUS = 7;
var WIDTH = 300;
var HEIGHT = 150;
var CIRCLE_RADIUS = 100;
var CIRCLE_RADIUS_2 = CIRCLE_RADIUS * 2;
var RESET = 360;
var ELAPSED = RESET + 1;
var MAGNITUDE = 0.5;
var SCALE = MAGNITUDE / 2;
var RECTANGLE = {
    width: WIDTH,
    height: HEIGHT,
};
var CIRCLE = {
    radius: CIRCLE_RADIUS,
};

function nearest(rectangle, point) {
    return {
        x: Math.max(rectangle.x,
                    Math.min(point.x, rectangle.x + rectangle.width)),
        y: Math.max(rectangle.y,
                    Math.min(point.y, rectangle.y + rectangle.height)),
    };
}

function intersect(rectangle, circle) {
    var x = circle.x -
        Math.max(rectangle.x,
                 Math.min(circle.x, rectangle.x + rectangle.width));
    var y = circle.y -
        Math.max(rectangle.y,
                 Math.min(circle.y, rectangle.y + rectangle.height));
    return ((x * x) + (y * y)) < (circle.radius * circle.radius);
}

function loop() {
    if (RESET < ELAPSED) {
        RECTANGLE.x = Math.random() * (CANVAS.width - WIDTH);
        RECTANGLE.y = Math.random() * (CANVAS.height - HEIGHT);
        CIRCLE.x =
            (Math.random() * (CANVAS.width - CIRCLE_RADIUS_2)) + CIRCLE_RADIUS;
        CIRCLE.y = (Math.random() * (CANVAS.height - CIRCLE_RADIUS_2)) +
            CIRCLE_RADIUS;
        ELAPSED = 0;
    } else {
        RECTANGLE.x += (Math.random() * MAGNITUDE) - SCALE;
        RECTANGLE.y += (Math.random() * MAGNITUDE) - SCALE;
        CIRCLE.x += (Math.random() * MAGNITUDE) - SCALE;
        CIRCLE.y += (Math.random() * MAGNITUDE) - SCALE;
        ELAPSED += 1;
    }
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.strokeRect(RECTANGLE.x,
                   RECTANGLE.y,
                   RECTANGLE.width,
                   RECTANGLE.height);
    {
        CTX.beginPath();
        CTX.moveTo(CIRCLE.x + CIRCLE.radius, CIRCLE.y);
        CTX.arc(CIRCLE.x, CIRCLE.y, CIRCLE.radius, 0, PI_2);
        CTX.stroke();
    }
    if (!intersect(RECTANGLE, CIRCLE)) {
        var rectPoint = nearest(RECTANGLE, CIRCLE);
        var radians =
            Math.atan2(rectPoint.y - CIRCLE.y, rectPoint.x - CIRCLE.x);
        var circlePoint = {
            x: CIRCLE.x + (CIRCLE.radius * Math.cos(radians)),
            y: CIRCLE.y + (CIRCLE.radius * Math.sin(radians)),
        };
        {
            CTX.beginPath();
            CTX.moveTo(rectPoint.x, rectPoint.y);
            CTX.lineTo(circlePoint.x, circlePoint.y);
            CTX.stroke();
        }
        {
            CTX.beginPath();
            CTX.moveTo(rectPoint.x + POINT_RADIUS, rectPoint.y);
            CTX.arc(rectPoint.x, rectPoint.y, POINT_RADIUS, 0, PI_2);
            CTX.moveTo(circlePoint.x + POINT_RADIUS, circlePoint.y);
            CTX.arc(circlePoint.x, circlePoint.y, POINT_RADIUS, 0, PI_2);
            CTX.fill();
        }
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = COLOR;
    CTX.fillStyle = COLOR;
    CTX.lineWidth = 4;
    loop();
};
