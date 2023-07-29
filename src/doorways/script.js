"use strict";

var TAU = Math.PI * 2;

var COLOR_DARK = "hsl(0, 0%, 35%)";
var COLOR_LIGHT = "hsl(0, 0%, 70%)";

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

function split(lines, points, x, y, w, h, flag) {
    if (Math.min(w, h) <= (BUFFER * K)) {
        points.push([x + (w / 2), y + (h / 2)]);
        return;
    }

    if (flag) {
        var k = Math.min(Math.max(Math.random() * w, BUFFER), w - BUFFER);
        var xK = x + k;

        lines.push([[xK, y], [xK, y + h]]);
        split(lines, points, x, y, k, h, false);
        split(lines, points, xK, y, w - k, h, false);
    } else {
        var k = Math.min(Math.max(Math.random() * h, BUFFER), h - BUFFER);
        var yK = y + k;

        lines.push([[x, yK], [x + w, yK]]);
        split(lines, points, x, y, w, k, true);
        split(lines, points, x, yK, w, h - k, true);
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

function intersects(a, b) {
    var x0 = a[0][0] - a[1][0];
    var y0 = a[0][1] - a[1][1];

    var x1 = a[0][0] - b[0][0];
    var y1 = a[0][1] - b[0][1];

    var x2 = b[0][0] - b[1][0];
    var y2 = b[0][1] - b[1][1];

    var denominator = (x0 * y2) - (y0 * x2);
    if (denominator !== 0) {
        var t = ((x1 * y2) - (y1 * x2)) / denominator;
        var u = -((x0 * y1) - (y0 * x1)) / denominator;
        return (0 <= t) && (t <= 1) && (0 <= u) && (u <= 1);
    }
    return false;
}

function generate(canvas) {
    var lines = [];
    var points = [];
    split(lines,
          points,
          X,
          Y,
          canvas.width - (X * 2),
          canvas.height - (Y * 2),
          true);

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

    var point;
    for (var i = 0; i < lines.length; ++i) {
        for (var j = 0; j < points.length; ++j) {
            point = [
                lerp(lines[i][0][0], lines[i][1][0], 0.5),
                lerp(lines[i][0][1], lines[i][1][1], 0.5),
            ];
            var line = [
                point,
                points[j],
            ];
            var ok = true;
            for (var k = 0; k < lines.length; ++k) {
                if (i === k) {
                    continue;
                }
                if (intersects(line, lines[k])) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                lines[i].push(points[j]);
            }
        }
    }

    var walls = [];
    var paths = [];
    for (var i = 0; i < lines.length; ++i) {
        var x0 = lines[i][0][0];
        var y0 = lines[i][0][1];
        var x1 = lines[i][1][0];
        var y1 = lines[i][1][1];

        var l = len(x0, y0, x1, y1);

        if (l < (BUFFER * 2)) {
            walls.push(lines[i]);
            continue;
        }

        var k = BUFFER / l;
        var t = ((1 - k) * Math.random()) + (k / 2);
        var m = GAP / l;

        if ((t < m) || (1 < (t + m))) {
            throw new Error();
        }

        point = [lerp(x0, x1, t), lerp(y0, y1, t)];
        points.push(point);

        walls.push([[x0, y0], [lerp(x0, x1, t - m), lerp(y0, y1, t - m)]]);
        walls.push([[lerp(x0, x1, t + m), lerp(y0, y1, t + m)], [x1, y1]]);

        for (var j = 2; j < lines[i].length; ++j) {
            paths.push([point, lines[i][j]]);
        }
    }

    return {
        walls: walls,
        paths: paths,
        points: points,
    };
}

function draw(canvas, context, state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = COLOR_DARK;
    context.beginPath();
    for (var i = 0; i < state.walls.length; ++i) {
        context.moveTo(state.walls[i][0][0], state.walls[i][0][1]);
        context.lineTo(state.walls[i][1][0], state.walls[i][1][1]);
    }
    context.stroke();

    context.strokeStyle = COLOR_LIGHT;
    context.beginPath();
    for (var i = 0; i < state.paths.length; ++i) {
        context.moveTo(state.paths[i][0][0], state.paths[i][0][1]);
        context.lineTo(state.paths[i][1][0], state.paths[i][1][1]);
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
    context.fillStyle = COLOR_DARK;

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
