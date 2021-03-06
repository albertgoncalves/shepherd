"use strict";

var CANVAS, CTX;

var WHITE = "hsl(0, 0%, 90%)";
var CYAN = "hsla(175, 65%, 50%, 0.35)";
var RED = "hsl(0, 75%, 70%)";
var PI_2 = Math.PI * 2;
var RADIUS = 8;
var RADIUS_2 = RADIUS * 2;
var N = 75;
var POINTS = new Array(N);
var WIDTH = 300;
var HEIGHT = 225;
var RECTANGLE = {
    width: WIDTH,
    height: HEIGHT,
};
var MAGNITUDE = 0.25;
var SCALE = MAGNITUDE / 2;
var RESET = 360;
var ELAPSED = RESET + 1;

function buildTree(points, axis, xLower, xUpper, yLower, yUpper) {
    var n = points.length;
    if (n === 0) {
        return null;
    }
    if (axis === 0) {
        points.sort(function(a, b) {
            return a.x - b.x;
        });
    } else if (axis === 1) {
        points.sort(function(a, b) {
            return a.y - b.y;
        });
    }
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
    if (axis === 0) {
        var next = 1;
        tree.left = buildTree(left, next, xLower, point.x, yLower, yUpper);
        tree.right = buildTree(right, next, point.x, xUpper, yLower, yUpper);
    } else if (axis === 1) {
        var next = 0;
        tree.left = buildTree(left, next, xLower, xUpper, yLower, point.y);
        tree.right = buildTree(right, next, xLower, xUpper, point.y, yUpper);
    }
    return tree;
}

function rectsOverlap(a, b) {
    if (((a.x + a.width) < b.x) || ((b.x + b.width) < a.x)) {
        return false;
    }
    if (((a.y + a.height) < b.y) || ((b.y + b.height) < a.y)) {
        return false;
    }
    return true;
}

function pointInRect(point, rectangle) {
    return ((rectangle.x < point.x) && (rectangle.y < point.y) &&
            (point.x < (rectangle.x + rectangle.width)) &&
            (point.y < (rectangle.y + rectangle.height)));
}

function intersections(tree, rectangle, callback) {
    if (tree === null) {
        return;
    }
    var branch = {
        x: tree.xLower,
        y: tree.yLower,
        width: tree.xUpper - tree.xLower,
        height: tree.yUpper - tree.yLower,
    };
    if (rectsOverlap(branch, rectangle)) {
        callback(tree.point);
        intersections(tree.left, rectangle, callback);
        intersections(tree.right, rectangle, callback);
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
    if (RESET < ELAPSED) {
        for (var i = 0; i < N; ++i) {
            POINTS[i] = {
                x: Math.random() * CANVAS.width,
                y: Math.random() * CANVAS.height,
            };
        }
        RECTANGLE.x = Math.random() * (CANVAS.width - WIDTH);
        RECTANGLE.y = Math.random() * (CANVAS.height - HEIGHT);
        ELAPSED = 0;
    } else {
        RECTANGLE.x += (Math.random() * MAGNITUDE) - SCALE;
        RECTANGLE.y += (Math.random() * MAGNITUDE) - SCALE;
        for (var i = 0; i < N; ++i) {
            POINTS[i].x += (Math.random() * MAGNITUDE) - SCALE;
            POINTS[i].y += (Math.random() * MAGNITUDE) - SCALE;
        }
        ELAPSED += 1;
    }
    var tree = buildTree(POINTS, 0, 0, CANVAS.width, 0, CANVAS.height);
    var neighbors = [];
    intersections(tree, RECTANGLE, function(candidate) {
        if (pointInRect(candidate, RECTANGLE)) {
            neighbors.push(candidate);
        }
    });
    CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
    {
        CTX.fillStyle = CYAN;
        CTX.fillRect(RECTANGLE.x,
                     RECTANGLE.y,
                     RECTANGLE.width,
                     RECTANGLE.height);
    }
    {
        var n = neighbors.length;
        CTX.beginPath();
        for (var i = 0; i < n; ++i) {
            var point = neighbors[i];
            CTX.moveTo(point.x + RADIUS_2, point.y);
            CTX.arc(point.x, point.y, RADIUS_2, 0, PI_2);
        }
        CTX.fillStyle = RED;
        CTX.fill();
    }
    {
        CTX.beginPath();
        for (var i = 0; i < N; ++i) {
            var point = POINTS[i];
            CTX.moveTo(point.x + RADIUS, point.y);
            CTX.arc(point.x, point.y, RADIUS, 0, PI_2);
        }
        CTX.fillStyle = WHITE;
        CTX.fill();
    }
    {
        CTX.beginPath();
        drawTree(tree);
        CTX.stroke();
    }
    requestAnimationFrame(loop);
}

window.onload = function() {
    CANVAS = document.getElementById("canvas");
    CTX = CANVAS.getContext("2d");
    CTX.imageSmoothingEnabled = false;
    CTX.strokeStyle = WHITE;
    CTX.lineWidth = 3;
    loop();
};
