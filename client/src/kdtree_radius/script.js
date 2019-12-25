"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var WHITE = "hsl(0, 0%, 90%)";
var GREEN = "hsl(165, 100%, 75%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
var RED = "hsl(0, 75%, 70%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = WHITE;
CTX.lineWidth = 3;

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var N = 50;
var POINTS = new Array(N);
var CIRCLE = {
    radius: 175,
};
var MAGNITUDE = 0.25;
var SCALE = MAGNITUDE / 2;
var RESET = 360;
var ELAPSED = RESET + 1;

function order(axis) {
    if (axis === 0) {
        return function(a, b) {
            return a.x - b.x;
        };
    } else if (axis === 1) {
        return function(a, b) {
            return a.y - b.y;
        };
    }
}

function buildTree(points, axis, xLower, xUpper, yLower, yUpper) {
    var n = points.length;
    if (n === 0) {
        return null;
    }
    points.sort(order(axis));
    var median = Math.floor(n / 2);
    var point = points[median];
    var tree = {
        point: point,
        axis: axis,
        xLower: xLower,
        xUpper: xUpper,
        yLower: yLower,
        yUpper: yUpper,
    };
    var left = points.slice(0, median);
    var right = points.slice(median + 1);
    var next;
    if (axis === 0) {
        next = 1;
        tree.left = buildTree(left, next, xLower, point.x, yLower, yUpper);
        tree.right = buildTree(right, next, point.x, xUpper, yLower, yUpper);
    } else if (axis === 1) {
        next = 0;
        tree.left = buildTree(left, next, xLower, xUpper, yLower, point.y);
        tree.right = buildTree(right, next, xLower, xUpper, point.y, yUpper);
    }
    return tree;
}

function rectCircleOverlap(rectangle, circle) {
    var xDelta = circle.x -
        Math.max(rectangle.xLower, Math.min(circle.x, rectangle.xUpper));
    var yDelta = circle.y -
        Math.max(rectangle.yLower, Math.min(circle.y, rectangle.yUpper));
    return ((xDelta * xDelta) + (yDelta * yDelta)) <
        (circle.radius * circle.radius);
}

function pointInCircle(point, circle) {
    var xDelta = point.x - circle.x;
    var yDelta = point.y - circle.y;
    return ((xDelta * xDelta) + (yDelta * yDelta)) <
        (circle.radius * circle.radius);
}

function intersections(tree, circle, callback) {
    if (tree === null) {
        return;
    }
    if (rectCircleOverlap(tree, circle)) {
        callback(tree.point);
        intersections(tree.left, circle, callback);
        intersections(tree.right, circle, callback);
    }
}

function drawTree(tree) {
    if (tree === null) {
        return;
    } else if (tree.axis === 0) {
        CTX.moveTo(tree.point.x, tree.yLower);
        CTX.lineTo(tree.point.x, tree.yUpper);
    } else if (tree.axis === 1) {
        CTX.moveTo(tree.xLower, tree.point.y);
        CTX.lineTo(tree.xUpper, tree.point.y);
    }
    drawTree(tree.left);
    drawTree(tree.right);
}

function loop() {
    var i, j;
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        for (i = 0; i < N; i++) {
            POINTS[i] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            };
        }
        CIRCLE.x = Math.random() * CANVAS.width;
        CIRCLE.y = Math.random() * CANVAS.height;
    } else {
        ELAPSED += 1;
    }
    CIRCLE.x += (Math.random() * MAGNITUDE) - SCALE;
    CIRCLE.y += (Math.random() * MAGNITUDE) - SCALE;
    for (i = 0; i < N; i++) {
        POINTS[i].x += (Math.random() * MAGNITUDE) - SCALE;
        POINTS[i].y += (Math.random() * MAGNITUDE) - SCALE;
    }
    var tree = buildTree(POINTS, 0, 0, CANVAS.width, 0, CANVAS.height);
    var inPoints = [];
    intersections(tree, CIRCLE, function(candidate) {
        if (pointInCircle(candidate, CIRCLE)) {
            inPoints.push(candidate);
        }
    });
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.beginPath();
        CTX.moveTo(CIRCLE.x + CIRCLE.radius, CIRCLE.y);
        CTX.arc(CIRCLE.x, CIRCLE.y, CIRCLE.radius, 0, PI_2);
        CTX.fillStyle = CYAN;
        CTX.fill();
    }
    {
        CTX.beginPath();
        drawTree(tree);
        CTX.stroke();
    }
    var n = inPoints.length;
    {
        var flag, outPoint;
        CTX.beginPath();
        for (i = 0; i < N; i++) {
            flag = true;
            outPoint = POINTS[i];
            for (j = 0; j < n; j++) {
                if (outPoint === inPoints[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                CTX.moveTo(outPoint.x + RADIUS, outPoint.y);
                CTX.arc(outPoint.x, outPoint.y, RADIUS, 0, PI_2);
            }
        }
        CTX.fillStyle = WHITE;
        CTX.fill();
    }
    {
        var inPoint;
        CTX.beginPath();
        for (i = 0; i < n; i++) {
            inPoint = inPoints[i];
            CTX.moveTo(inPoint.x + RADIUS, inPoint.y);
            CTX.arc(inPoint.x, inPoint.y, RADIUS, 0, PI_2);
        }
        CTX.fillStyle = RED;
        CTX.fill();
    }
    {
        CTX.beginPath();
        CTX.moveTo(CIRCLE.x + RADIUS, CIRCLE.y);
        CTX.arc(CIRCLE.x, CIRCLE.y, RADIUS, 0, PI_2);
        CTX.fillStyle = GREEN;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
