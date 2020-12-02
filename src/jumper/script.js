"use strict";

var KEY_CODE = {
    w: 87,
    a: 65,
    d: 68,
    i: 73,
    j: 74,
    l: 76,
};

var LINE_WIDTH = 4;
var LINE_WIDTH_HALF = LINE_WIDTH / 2;

var RECT_WIDTH = 40;
var RECT_WIDTH_HALF = RECT_WIDTH / 2;
var RECT_HEIGHT = 40;

var RESET_RECT_LEFT = 830;
var RESET_RECT_BOTTOM = 200;

var CAMERA_TOP = 0.6;
var CAMERA_BOTTOM = 0.25;
var CAMERA_SPEED = 0.01;
var CAMERA_EPSILON = 0.125;

var JUMP = 4.15;
var GRAVITY = 0.0745;

var RUN = 0.25;
var RUN_MAX = 2.5;
var DRAG = 0.9425;
var FRICTION = 0.9025;
var BOUNCE = -0.5;
var RUN_STOP = 0.0075;

var MILLISECONDS = 1000;

var FRAME_UPDATE_COUNT = 4.15;
var FRAME_DURATION = (1 / 60) * MILLISECONDS;
var FRAME_STEP = FRAME_DURATION / FRAME_UPDATE_COUNT;

var EDGES = [
    {
        left: 825,
        right: 875,
        y: 50,
    },
    {
        left: 10,
        right: 200,
        y: 275,
    },
    {
        left: 10,
        right: 200,
        y: 150,
    },
    {
        left: 250,
        right: 350,
        y: 100,
    },
    {
        left: 300,
        right: 350,
        y: 175,
    },
    {
        left: 250,
        right: 350,
        y: 425,
    },
    {
        left: 400,
        right: 700,
        y: 325,
    },
    {
        left: 400,
        right: 450,
        y: 75,
    },
    {
        left: 650,
        right: 700,
        y: 75,
    },
    {
        left: 450,
        right: 650,
        y: 50,
    },
    {
        left: 775,
        right: 875,
        y: 375,
    },
    {
        left: 825,
        right: 875,
        y: 450,
    },
    {
        left: 600,
        right: 675,
        y: 545,
    },
    {
        left: 425,
        right: 600,
        y: 590,
    },
    {
        left: 300,
        right: 375,
        y: 610,
    },
    {
        left: 150,
        right: 250,
        y: 650,
    },
    {
        left: 25,
        right: 75,
        y: 680,
    },
    {
        left: 150,
        right: 250,
        y: 775,
    },
];

function keyDown(state) {
    return function(event) {
        switch (event.keyCode) {
        case KEY_CODE.w:
        case KEY_CODE.i: {
            state.keys.up = true;
            break;
        }
        case KEY_CODE.a:
        case KEY_CODE.j: {
            state.keys.left = true;
            break;
        }
        case KEY_CODE.d:
        case KEY_CODE.l: {
            state.keys.right = true;
            break;
        }
        }
    };
}

function keyUp(state) {
    return function(event) {
        switch (event.keyCode) {
        case KEY_CODE.w:
        case KEY_CODE.i: {
            state.keys.up = false;
            break;
        }
        case KEY_CODE.a:
        case KEY_CODE.j: {
            state.keys.left = false;
            break;
        }
        case KEY_CODE.d:
        case KEY_CODE.l: {
            state.keys.right = false;
            break;
        }
        }
    };
}

function resetRect(state) {
    state.rect = {
        left: RESET_RECT_LEFT,
        top: RESET_RECT_BOTTOM + RECT_HEIGHT,
        right: RESET_RECT_LEFT + RECT_WIDTH,
        bottom: RESET_RECT_BOTTOM,
        xSpeed: 0,
        ySpeed: 0,
        canJump: false,
    };
}

function intersectRectRect(a, b) {
    return (a.left < b.right) && (b.left < a.right) && (a.bottom < b.top) &&
        (b.bottom < a.top);
}

function intersectLeft(rect, xSpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.left,
        top: rect.top,
        right: rect.left - xSpeed,
        bottom: rect.bottom,
    });
}

function intersectRight(rect, xSpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.right - xSpeed,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
    });
}

function intersectBelow(rect, ySpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.left,
        top: rect.bottom - ySpeed,
        right: rect.right,
        bottom: rect.bottom,
    });
}

function intersectAbove(rect, ySpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.top - ySpeed,
    });
}

function setRectX(state) {
    if (state.keys.right) {
        if (state.rect.xSpeed < RUN_MAX) {
            state.rect.xSpeed += RUN;
        } else {
            state.rect.xSpeed = RUN_MAX;
        }
    }
    if (state.keys.left) {
        if (-RUN_MAX < state.rect.xSpeed) {
            state.rect.xSpeed -= RUN;
        } else {
            state.rect.xSpeed = -RUN_MAX;
        }
    }
    if ((-RUN_STOP < state.rect.xSpeed) && (state.rect.xSpeed < RUN_STOP)) {
        state.rect.xSpeed = 0;
    } else if (state.rect.ySpeed === 0) {
        state.rect.xSpeed *= FRICTION;
    } else {
        state.rect.xSpeed *= DRAG;
    }
    state.rect.left += state.rect.xSpeed;
    state.rect.right = state.rect.left + RECT_WIDTH;
    if (state.rect.xSpeed < 0) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y,
            };
            if (intersectLeft(state.rect, state.rect.xSpeed, edge)) {
                state.rect.xSpeed *= BOUNCE;
                state.rect.left = EDGES[i].right;
                state.rect.right = EDGES[i].right + RECT_WIDTH;
                break;
            }
        }
    } else if (0 < state.rect.xSpeed) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y,
            };
            if (intersectRight(state.rect, state.rect.xSpeed, edge)) {
                state.rect.xSpeed *= BOUNCE;
                state.rect.left = EDGES[i].left - RECT_WIDTH;
                state.rect.right = EDGES[i].left;
                break;
            }
        }
    }
}

function setRectY(state) {
    if (state.rect.canJump && state.keys.up) {
        state.rect.ySpeed += JUMP;
    }
    state.rect.ySpeed -= GRAVITY;
    state.rect.canJump = false;
    state.rect.bottom += state.rect.ySpeed;
    state.rect.top = state.rect.bottom + RECT_HEIGHT;
    if (0 < state.rect.ySpeed) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y - LINE_WIDTH,
            };
            if (intersectAbove(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y - LINE_WIDTH;
                state.rect.bottom = state.rect.top - RECT_HEIGHT;
                break;
            }
        }
    } else if (state.rect.ySpeed < 0) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y - LINE_WIDTH,
            };
            if (intersectBelow(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y + RECT_HEIGHT;
                state.rect.bottom = EDGES[i].y;
                if (!state.keys.up) {
                    state.rect.canJump = true;
                }
                break;
            }
        }
    }
}

function setCamera(state) {
    var cameraTop = (state.canvas.height * CAMERA_TOP) + state.cameraBottom;
    var deltaTop = state.rect.top - cameraTop;
    if (0 < deltaTop) {
        if (deltaTop < CAMERA_EPSILON) {
            state.cameraBottom += deltaTop;
        } else {
            state.cameraBottom += deltaTop * CAMERA_SPEED;
        }
        return;
    }
    var cameraBottom =
        (state.canvas.height * CAMERA_BOTTOM) + state.cameraBottom;
    var deltaBottom = cameraBottom - state.rect.bottom;
    if (0 < deltaBottom) {
        if (deltaBottom < CAMERA_EPSILON) {
            state.cameraBottom -= deltaBottom;
        } else {
            state.cameraBottom -= deltaBottom * CAMERA_SPEED;
        }
    }
}

function update(state) {
    state.frame.delta += state.frame.time - state.frame.prev;
    while (FRAME_STEP < state.frame.delta) {
        state.frame.delta -= FRAME_STEP;
        setRectY(state);
        if (state.rect.top < Math.min(state.cameraBottom, 0)) {
            resetRect(state);
            state.cameraBottom = 0;
            continue;
        }
        setRectX(state);
        setCamera(state);
    }
    state.frame.prev = state.frame.time;
}

function draw(ctx, state) {
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    {
        ctx.strokeStyle = "hsla(0, 0%, 90%, 0.1)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        var cameraTop = state.canvas.height * (1 - CAMERA_TOP);
        ctx.moveTo(0, cameraTop);
        ctx.lineTo(state.canvas.width, cameraTop);
        var cameraBottom = state.canvas.height * (1 - CAMERA_BOTTOM);
        ctx.moveTo(0, cameraBottom);
        ctx.lineTo(state.canvas.width, cameraBottom);
        ctx.stroke();
    }
    ctx.fillRect(state.rect.left,
                 state.canvas.height - (state.rect.top - state.cameraBottom),
                 RECT_WIDTH,
                 RECT_HEIGHT);
    {
        ctx.strokeStyle = "hsl(0, 0%, 90%)";
        ctx.lineWidth = LINE_WIDTH;
        ctx.beginPath();
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var y = state.canvas.height -
                ((EDGES[i].y - LINE_WIDTH_HALF) - state.cameraBottom);
            if ((y < 0) || (state.canvas.height < y)) {
                continue;
            }
            ctx.moveTo(EDGES[i].left, y);
            ctx.lineTo(EDGES[i].right, y);
        }
        ctx.stroke();
    }
}

function setDebug(state) {
    ++state.debug.count;
    var elapsed = state.frame.time - state.debug.time;
    if (MILLISECONDS < elapsed) {
        var fps = ((state.debug.count / elapsed) * MILLISECONDS).toFixed(2);
        state.debug.element.innerHTML = "<strong>" + fps + "</strong> fps" +
            "<br>" +
            "<strong>" + state.debug.count + "</strong> frames / " +
            "<strong>" + elapsed.toFixed(2) + "</strong> ms" +
            "<br>" +
            "<em>" + JSON.stringify({
                rectCenter: (state.rect.left + RECT_WIDTH_HALF).toFixed(2),
                rectBottom: state.rect.bottom.toFixed(2),
                cameraBottom: state.cameraBottom.toFixed(2),
            }) +
            "</em>";
        state.debug.time = state.frame.time;
        state.debug.count = 0;
    }
}

function loop(ctx, state) {
    return function(t) {
        state.frame.time = t;
        update(state);
        draw(ctx, state);
        setDebug(state);
        requestAnimationFrame(loop(ctx, state));
    };
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    canvas.setAttribute("tabindex", "0");
    canvas.focus();
    var ctx = canvas.getContext("2d", {alpha: false});
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(200, 40, 80)";
    var state = {
        canvas: canvas,
        frame: {
            time: performance.now(),
            prev: performance.now(),
            delta: 0,
        },
        debug: {
            element: document.getElementById("debug"),
            time: performance.now(),
            count: 0,
        },
        cameraBottom: 0,
        keys: {
            up: false,
            left: false,
            right: false,
        },
        rect: null,
    };
    resetRect(state);
    window.addEventListener("keydown", keyDown(state));
    window.addEventListener("keyup", keyUp(state));
    requestAnimationFrame(loop(ctx, state));
    console.log("Done!");
};
