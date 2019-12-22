"use strict";

function distanceSquared(a, b) {
    var x = a.x - b.x;
    var y = a.y - b.y;
    return (x * x) + (y * y);
}

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var COLOR = "hsl(0, 0%, 90%)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = COLOR;
CTX.fillStyle = COLOR;
CTX.lineWidth = 3;

function randomPoint() {
    return {
        x: Math.random() * CANVAS.width,
        y: Math.random() * CANVAS.height,
    };
}

var PI_2 = Math.PI * 2;
var RADIUS = 6;
var D = 2;
var N = 9;
var POINTS = new Array(N);

for (var i = 0; i < N; i++) {
    POINTS[i] = randomPoint();
}

function order(axis) {
    if (axis === 0) {
        return function(a, b) {
            return a.x - b.x;
        };
    } else if (axis === 1) {
        return function(a, b) {
            return a.y - b.y;
        };
    } else {
        return undefined;
    }
}

function buildTree(points, depth) {
    var n = points.length;
    if (n <= 0) {
        return null;
    }
    var axis = depth % D;
    points.sort(order(axis));
    var m = Math.floor(n / 2);
    var d = axis + 1;
    return {
        point: points[m],
        left: buildTree(points.slice(0, m), d),
        right: buildTree(points.slice(m + 1), d),
        axis: axis,
    };
}

function drawTree(tree, xLower, xUpper, yLower, yUpper) {
    if (tree === null) {
        return;
    } else if (tree.axis === 0) {
        CTX.moveTo(tree.point.x, yLower);
        CTX.lineTo(tree.point.x, yUpper);
        drawTree(tree.left, xLower, tree.point.x, yLower, yUpper);
        drawTree(tree.right, tree.point.x, xUpper, yLower, yUpper);
    } else if (tree.axis === 1) {
        CTX.moveTo(xLower, tree.point.y);
        CTX.lineTo(xUpper, tree.point.y);
        drawTree(tree.left, xLower, xUpper, yLower, tree.point.y);
        drawTree(tree.right, xLower, xUpper, tree.point.y, yUpper);
    }
}

function loop() {
    var tree, i, x, y;
    var axis = 0;
    tree = buildTree(POINTS, axis);
    CTX.beginPath();
    drawTree(tree, 0, CANVAS.width, 0, CANVAS.height);
    CTX.stroke();
    CTX.beginPath();
    for (i = 0; i < N; i++) {
        x = POINTS[i].x;
        y = POINTS[i].y;
        CTX.moveTo(x + RADIUS, y);
        CTX.arc(x, y, RADIUS, 0, PI_2);
    }
    CTX.fill();
}

loop();
