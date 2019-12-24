"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 35%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 4;

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
var POINT;

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
        RECTANGLE.x = Math.random() * (CANVAS.width - WIDTH);
        RECTANGLE.y = Math.random() * (CANVAS.height - HEIGHT);
        CIRCLE.x =
            (Math.random() * (CANVAS.width - CIRCLE_RADIUS_2)) + CIRCLE_RADIUS;
        CIRCLE.y = (Math.random() * (CANVAS.height - CIRCLE_RADIUS_2)) +
            CIRCLE_RADIUS;
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
    CTX.strokeRect(RECTANGLE.x, RECTANGLE.y, RECTANGLE.width,
                   RECTANGLE.height);
    {
        CTX.beginPath();
        CTX.moveTo(CIRCLE.x + CIRCLE.radius, CIRCLE.y);
        CTX.arc(CIRCLE.x, CIRCLE.y, CIRCLE.radius, 0, PI_2);
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
            CTX.moveTo(POINT.x + POINT_RADIUS, POINT.y);
            CTX.arc(POINT.x, POINT.y, POINT_RADIUS, 0, PI_2);
            CTX.moveTo(intersection.x + POINT_RADIUS, intersection.y);
            CTX.arc(intersection.x, intersection.y, POINT_RADIUS, 0, PI_2);
            CTX.fill();
        }
    }
    requestAnimationFrame(loop);
}

loop();
