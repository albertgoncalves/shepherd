"use strict";

var CANVAS = document.getElementById("canvas");
var CTX = CANVAS.getContext("2d");
var GRAY = "hsl(0, 0%, 35%)";
var RED = "hsl(15, 85%, 50%)";
var BLUE = "hsl(200, 75%, 50%)";
var CYAN = "hsla(175, 65%, 50%, 0.1)";
CTX.imageSmoothingEnabled = false;
CTX.strokeStyle = GRAY;
CTX.lineWidth = 3;

function randomPoint() {
    return {
        x: Math.random() * CANVAS.width,
        y: Math.random() * CANVAS.height,
    };
}

var PI_2 = Math.PI * 2;
var RADIUS = 8;
var N = 50;
var POINTS = new Array(N);

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

function rectsOverlap(a, b) {
    if ((a.xBottomRight < b.xTopLeft) || (b.xBottomRight < a.xTopLeft)) {
        return false;
    }
    if ((a.yTopLeft < b.yBottomRight) || (b.yTopLeft < a.yBottomRight)) {
        return false;
    }
    return true;
}

function pointInRect(p, r) {
    return ((r.xTopLeft < p.x) && (p.y < r.yTopLeft) &&
            (p.x < r.xBottomRight) && (r.yBottomRight < p.y));
}

function intersections(tree, points, rectangle) {
    if (tree === null) {
        return;
    }
    var branch = {
        xTopLeft: tree.xLower,
        yTopLeft: tree.yUpper,
        xBottomRight: tree.xUpper,
        yBottomRight: tree.yLower,
    };
    if (rectsOverlap(branch, rectangle)) {
        if (pointInRect(tree.point, rectangle)) {
            points.push(tree.point);
        }
        intersections(tree.left, points, rectangle);
        intersections(tree.right, points, rectangle);
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

function drawCircle(point) {
    var x = point.x;
    var y = point.y;
    CTX.moveTo(x + RADIUS, y);
    CTX.arc(x, y, RADIUS, 0, PI_2);
}

var RESET = 360;
var ELAPSED = RESET + 1;
var MAGNITUDE = 0.5;
var SCALE = MAGNITUDE / 2;
var L = 200;
var L_2 = L * 2;

function loop() {
    var i, j;
    if (RESET < ELAPSED) {
        ELAPSED = 0;
        for (i = 0; i < N; i++) {
            POINTS[i] = randomPoint();
        }
    } else {
        ELAPSED += 1;
    }
    for (i = 0; i < N; i++) {
        POINTS[i].x += (Math.random() * MAGNITUDE) - SCALE;
        POINTS[i].y += (Math.random() * MAGNITUDE) - SCALE;
    }
    var tree = buildTree(POINTS, 0, 0, CANVAS.width, 0, CANVAS.height);
    var point = POINTS[0];
    var rectangle = {
        xTopLeft: point.x - L,
        yTopLeft: point.y + L,
        xBottomRight: point.x + L,
        yBottomRight: point.y - L,
    };
    var inPoints = [];
    intersections(tree, inPoints, rectangle);
    var n = inPoints.length;
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.fillStyle = CYAN;
        CTX.fillRect(point.x - L, point.y - L, L_2, L_2);
    }
    {
        CTX.beginPath();
        drawTree(tree);
        CTX.stroke();
    }
    {
        var flag, outPoint;
        CTX.beginPath();
        for (i = 1; i < N; i++) {
            outPoint = POINTS[i];
            flag = true;
            for (j = 0; j < n; j++) {
                if (outPoint === inPoints[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                drawCircle(outPoint);
            }
        }
        CTX.fillStyle = GRAY;
        CTX.fill();
    }
    {
        var inPoint;
        CTX.beginPath();
        for (i = 0; i < n; i++) {
            inPoint = inPoints[i];
            if (point !== inPoint) {
                drawCircle(inPoint);
            }
        }
        CTX.fillStyle = BLUE;
        CTX.fill();
    }
    {
        CTX.beginPath();
        drawCircle(point);
        CTX.fillStyle = RED;
        CTX.fill();
    }
    requestAnimationFrame(loop);
}

loop();
