"use strict";

var KEY_CODE = {
    w: 87,
    a: 65,
    d: 68,
};

var RECT_WIDTH = 40;
var RECT_HEIGHT = 40;
var RECT_X_RESET = 50;
var RECT_Y_RESET = -RECT_HEIGHT;

var EPSILON = 0.01;

var JUMP = 4.25;
var GRAVITY = 0.08;

var RUN = 0.35;
var DRAG = 0.94;
var FRICTION = 0.93;
var BOUNCE = -0.75;

var LINE_WIDTH = 4.0;
var LINE_WIDTH_HALF = LINE_WIDTH / 2.0;

var MILLISECONDS = 1000.0;
var FRAME_DURATION = (1.0 / 60.0) * MILLISECONDS;
var FRAME_UPDATE_COUNT = 3.5;
var FRAME_STEP = FRAME_DURATION / FRAME_UPDATE_COUNT;

var EDGES = [
    {
        left: 10,
        right: 200,
        y: 275,
    },
    {
        left: 10,
        right: 200,
        y: 400,
    },
    {
        left: 250,
        right: 350,
        y: 450,
    },
    {
        left: 300,
        right: 350,
        y: 375,
    },
    {
        left: 400,
        right: 700,
        y: 225,
    },
    {
        left: 400,
        right: 450,
        y: 475,
    },
    {
        left: 400,
        right: 700,
        y: 500,
    },
    {
        left: 650,
        right: 700,
        y: 475,
    },
    {
        left: 775,
        right: 875,
        y: 175,
    },
    {
        left: 825,
        right: 875,
        y: 100,
    },
];

function keyDown(state) {
    function f(event) {
        switch (event.keyCode) {
        case KEY_CODE.w: {
            state.keys.w = true;
            break;
        }
        case KEY_CODE.a: {
            state.keys.a = true;
            break;
        }
        case KEY_CODE.d: {
            state.keys.d = true;
            break;
        }
        }
    }
    return f;
}

function keyUp(state) {
    function f(event) {
        switch (event.keyCode) {
        case KEY_CODE.w: {
            state.keys.w = false;
            break;
        }
        case KEY_CODE.a: {
            state.keys.a = false;
            break;
        }
        case KEY_CODE.d: {
            state.keys.d = false;
            break;
        }
        }
    }
    return f;
}

function resetRect(state) {
    state.rect = {
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        left: RECT_X_RESET,
        top: RECT_Y_RESET,
        right: null,
        bottom: null,
        xSpeed: 0.0,
        ySpeed: 0.0,
        canJump: false,
    };
    state.rect.right = state.rect.left + state.rect.width;
    state.rect.bottom = state.rect.top + state.rect.height;
}

function intersectRectRect(a, b) {
    return (a.left < b.right) && (b.left < a.right) && (a.top < b.bottom) &&
        (b.top < a.bottom);
}

function intersectLeft(rect, xSpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.left,
        top: rect.top,
        right: rect.left - xSpeed,
        bottom: rect.bottom - LINE_WIDTH_HALF,
    });
}

function intersectRight(rect, xSpeed, edge) {
    return intersectRectRect(edge, {
        left: rect.right - xSpeed,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom - LINE_WIDTH_HALF,
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
    if (state.keys.d) {
        state.rect.xSpeed += RUN;
    }
    if (state.keys.a) {
        state.rect.xSpeed -= RUN;
    }
    if (state.rect.ySpeed === 0) {
        state.rect.xSpeed *= FRICTION;
    } else {
        state.rect.xSpeed *= DRAG;
    }
    if ((-EPSILON < state.rect.xSpeed) && (state.rect.xSpeed < EPSILON)) {
        state.rect.xSpeed = 0.0;
    }
    state.rect.left += state.rect.xSpeed;
    state.rect.right += state.rect.xSpeed;
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
                state.rect.right = EDGES[i].right + state.rect.width;
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
                state.rect.left = EDGES[i].left - state.rect.width;
                state.rect.right = EDGES[i].left;
                break;
            }
        }
    }
}

function setRectY(state) {
    if (state.rect.canJump && state.keys.w) {
        state.rect.ySpeed -= JUMP;
    }
    if (state.rect.ySpeed !== 0) {
        state.rect.canJump = false;
    }
    state.rect.ySpeed += GRAVITY;
    state.rect.top += state.rect.ySpeed;
    state.rect.bottom += state.rect.ySpeed;
    if (state.rect.ySpeed < 0) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y - LINE_WIDTH_HALF,
                right: EDGES[i].right,
                bottom: EDGES[i].y + LINE_WIDTH_HALF,
            };
            if (intersectAbove(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y;
                state.rect.bottom = EDGES[i].y + state.rect.height;
                break;
            }
        }
    } else if (0 < state.rect.ySpeed) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y - LINE_WIDTH_HALF,
                right: EDGES[i].right,
                bottom: EDGES[i].y + LINE_WIDTH_HALF,
            };
            if (intersectBelow(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y - state.rect.height;
                state.rect.bottom = EDGES[i].y;
                if (!state.keys.w) {
                    state.rect.canJump = true;
                }
                break;
            }
        }
    }
    if (state.height < state.rect.top) {
        resetRect(state);
    }
}

function update(state) {
    var elapsed = state.time - state.prevTime;
    while (FRAME_STEP < elapsed) {
        setRectY(state);
        setRectX(state);
        elapsed -= FRAME_STEP;
    }
    state.prevTime = state.time;
}

function draw(ctx, state) {
    ctx.clearRect(0, 0, state.width, state.height);
    ctx.fillRect(state.rect.left,
                 state.rect.top,
                 state.rect.width,
                 state.rect.height);
    ctx.beginPath();
    for (var i = EDGES.length - 1; 0 <= i; --i) {
        ctx.moveTo(EDGES[i].left, EDGES[i].y);
        ctx.lineTo(EDGES[i].right, EDGES[i].y);
    }
    ctx.stroke();
}

function loop(ctx, state) {
    function f(t) {
        state.time = t;
        update(state);
        draw(ctx, state);
        requestAnimationFrame(loop(ctx, state));
    }
    return f;
}

window.onload = function() {
    var canvas = document.getElementById("canvas");
    canvas.setAttribute("tabindex", "0");
    canvas.focus();
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(200, 40, 80)";
    ctx.strokeStyle = "hsl(0, 0%, 90%)";
    ctx.lineWidth = LINE_WIDTH;
    var state = {
        time: performance.now(),
        prevTime: performance.now(),
        width: canvas.width,
        height: canvas.height,
        keys: {
            w: false,
            s: false,
            a: false,
            d: false,
        },
        rect: null,
    };
    resetRect(state);
    window.addEventListener("keydown", keyDown(state));
    window.addEventListener("keyup", keyUp(state));
    requestAnimationFrame(loop(ctx, state));
    console.log("Done!");
};
