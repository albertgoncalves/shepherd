"use strict";

var TAU = Math.PI * 2;

var COLOR = "hsl(0, 0%, 35%)";

var LINE_WIDTH = 3.25;
var LINE_CAP = "square";

var POINT_RADIUS = 4;

var BUFFER = 85;
var K = 3;

var GAP = 40;

var INTERVAL = 1750;

var X = 50;
var Y = 50;

if ((BUFFER / 2) <= GAP) {
    throw new Error();
}

function split(lines, x, y, w, h, flag) {
    if (Math.min(w, h) <= (BUFFER * K)) {
        return;
    }

    if (flag) {
        var k = Math.min(Math.max(Math.random() * w, BUFFER), w - BUFFER);
        var xK = x + k;

        lines.push([[xK, y], [xK, y + h]]);
        split(lines, x, y, k, h, false);
        split(lines, xK, y, w - k, h, false);
    } else {
        var k = Math.min(Math.max(Math.random() * h, BUFFER), h - BUFFER);
        var yK = y + k;

        lines.push([[x, yK], [x + w, yK]]);
        split(lines, x, y, w, k, true);
        split(lines, x, yK, w, h - k, true);
    }
}

function setIfNotFound(object, key, value) {
    if (object.hasOwnProperty(key)) {
        return;
    }
    object[key] = value;
}

function pushIfNotFound(array, element) {
    if (0 <= array.indexOf(element)) {
        return;
    }
    array.push(element);
}

function lerp(a, b, t) {
    return a + ((b - a) * t);
}

function len(x0, y0, x1, y1) {
    var x2 = x1 - x0;
    var y2 = y1 - y0;
    return Math.sqrt((x2 * x2) + (y2 * y2));
}

function subtract(a, b) {
    return a - b;
}

function generate(canvas) {
    var lines = [];
    split(lines, X, Y, canvas.width - (X * 2), canvas.height - (Y * 2), true);

    var xs = {};
    var ys = {};
    for (var i = 0; i < lines.length; ++i) {
        var x0 = lines[i][0][0];
        var y0 = lines[i][0][1];
        var x1 = lines[i][1][0];
        var y1 = lines[i][1][1];

        setIfNotFound(xs, x0, []);
        setIfNotFound(xs, x1, []);
        setIfNotFound(ys, y0, []);
        setIfNotFound(ys, y1, []);

        pushIfNotFound(xs[x0], y0);
        pushIfNotFound(xs[x0], y1);
        pushIfNotFound(xs[x1], y0);
        pushIfNotFound(xs[x1], y1);
        pushIfNotFound(ys[y0], x0);
        pushIfNotFound(ys[y0], x1);
        pushIfNotFound(ys[y1], x0);
        pushIfNotFound(ys[y1], x1);
    }

    for (var i = 0; i < Object.keys(xs).length; ++i) {
        xs[Object.keys(xs)[i]].sort(subtract);
    }
    for (var i = 0; i < Object.keys(ys).length; ++i) {
        ys[Object.keys(ys)[i]].sort(subtract);
    }

    lines = [];
    var vs, n;
    for (var i = 0; i < Object.keys(xs).length; ++i) {
        vs = xs[Object.keys(xs)[i]];
        n = vs.length - 1;
        if (n === 0) {
            continue;
        }
        var x = Number(Object.keys(xs)[i]);
        for (var j = 0; j < n; ++j) {
            lines.push([[x, vs[j]], [x, vs[j + 1]]]);
        }
    }
    for (var i = 0; i < Object.keys(ys).length; ++i) {
        vs = ys[Object.keys(ys)[i]];
        n = vs.length - 1;
        if (n === 0) {
            continue;
        }
        var y = Number(Object.keys(ys)[i]);
        for (var j = 0; j < n; ++j) {
            lines.push([[vs[j], y], [vs[j + 1], y]]);
        }
    }

    var state = {
        lines: [],
        points: [],
    };
    for (var i = 0; i < lines.length; ++i) {
        var x0 = lines[i][0][0];
        var y0 = lines[i][0][1];
        var x1 = lines[i][1][0];
        var y1 = lines[i][1][1];

        var l = len(x0, y0, x1, y1);

        if (l < (BUFFER * 2)) {
            state.lines.push(lines[i]);
            continue;
        }

        var k = BUFFER / l;
        var t = ((1 - k) * Math.random()) + (k / 2);
        var m = GAP / l;

        if ((t < m) || (1 < (t + m))) {
            throw new Error();
        }

        state.points.push([lerp(x0, x1, t), lerp(y0, y1, t)]);

        state.lines.push(
            [[x0, y0], [lerp(x0, x1, t - m), lerp(y0, y1, t - m)]]);
        state.lines.push(
            [[lerp(x0, x1, t + m), lerp(y0, y1, t + m)], [x1, y1]]);
    }
    return state;
}

function draw(canvas, context, state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    for (var i = 0; i < state.lines.length; ++i) {
        context.moveTo(state.lines[i][0][0], state.lines[i][0][1]);
        context.lineTo(state.lines[i][1][0], state.lines[i][1][1]);
    }
    context.stroke();

    context.beginPath();
    for (var i = 0; i < state.points.length; ++i) {
        context.moveTo(state.points[i][0], state.points[i][1]);
        context.arc(state.points[i][0],
                    state.points[i][1],
                    POINT_RADIUS,
                    0,
                    TAU);
    }
    context.fill();
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    if (canvas === null) {
        throw new Error();
    }
    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.lineWidth = LINE_WIDTH;
    context.lineCap = LINE_CAP;
    context.strokeStyle = COLOR;
    context.fillStyle = COLOR;

    draw(canvas, context, generate(canvas));

    var prev = performance.now();
    var loop = function(now) {
        if (INTERVAL <= (now - prev)) {
            draw(canvas, context, generate(canvas));
            prev = now;
        }
        window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    console.log("Done!");
};
