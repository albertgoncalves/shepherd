"use strict";

var KEY_CODE = {
    w: 87,
    a: 65,
    d: 68,
    i: 73,
    j: 74,
    l: 76,
};

var RECT_WIDTH = 40;
var RECT_HEIGHT = 40;
var RECT_LEFT_RESET = 50;
var RECT_TOP_RESET = -RECT_HEIGHT;

var EPSILON = 0.01;

var JUMP = 4.15;
var GRAVITY = 0.0735;

var RUN = 0.25;
var TOP_SPEED = 2.5;
var DRAG = 0.9425;
var FRICTION = 0.9225;
var BOUNCE = -0.5;

var LINE_WIDTH = 4.0;
var LINE_WIDTH_HALF = LINE_WIDTH / 2.0;

var MILLISECONDS = 1000.0;

var FRAME_UPDATE_COUNT = 4.175;
var FRAME_DURATION = (1.0 / 60.0) * MILLISECONDS;
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
        left: 250,
        right: 350,
        y: 125,
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
        left: 450,
        right: 650,
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
    {
        left: 825,
        right: 875,
        y: 500,
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
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        left: RECT_LEFT_RESET,
        top: RECT_TOP_RESET,
        right: RECT_LEFT_RESET + RECT_WIDTH,
        bottom: RECT_TOP_RESET + RECT_HEIGHT,
        xSpeed: 0.0,
        ySpeed: 0.0,
        canJump: false,
    };
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
        if (state.rect.xSpeed < TOP_SPEED) {
            state.rect.xSpeed += RUN;
        } else {
            state.rect.xSpeed = TOP_SPEED;
        }
    }
    if (state.keys.left) {
        if (-TOP_SPEED < state.rect.xSpeed) {
            state.rect.xSpeed -= RUN;
        } else {
            state.rect.xSpeed = -TOP_SPEED;
        }
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
    if (state.rect.canJump && state.keys.up) {
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
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y + LINE_WIDTH,
            };
            if (intersectAbove(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y + LINE_WIDTH;
                state.rect.bottom = state.rect.top + state.rect.height;
                break;
            }
        }
    } else if (0 < state.rect.ySpeed) {
        for (var i = EDGES.length - 1; 0 <= i; --i) {
            var edge = {
                left: EDGES[i].left,
                top: EDGES[i].y,
                right: EDGES[i].right,
                bottom: EDGES[i].y + LINE_WIDTH,
            };
            if (intersectBelow(state.rect, state.rect.ySpeed, edge)) {
                state.rect.ySpeed = 0;
                state.rect.top = EDGES[i].y - state.rect.height;
                state.rect.bottom = EDGES[i].y;
                if (!state.keys.up) {
                    state.rect.canJump = true;
                }
                break;
            }
        }
    }
    if (state.canvas.height < state.rect.top) {
        resetRect(state);
    }
}

function update(state) {
    state.frame.delta += state.frame.time - state.frame.prev;
    while (FRAME_STEP < state.frame.delta) {
        setRectY(state);
        setRectX(state);
        state.frame.delta -= FRAME_STEP;
    }
    state.frame.prev = state.frame.time;
}

function draw(ctx, state) {
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.fillRect(state.rect.left,
                 state.rect.top,
                 state.rect.width,
                 state.rect.height);
    ctx.beginPath();
    for (var i = EDGES.length - 1; 0 <= i; --i) {
        var y = EDGES[i].y + LINE_WIDTH_HALF;
        ctx.moveTo(EDGES[i].left, y);
        ctx.lineTo(EDGES[i].right, y);
    }
    ctx.stroke();
}

function setFps(state) {
    ++state.fps.count;
    var elapsed = state.frame.time - state.fps.time;
    if (MILLISECONDS < elapsed) {
        var fps = ((state.fps.count / elapsed) * MILLISECONDS).toFixed(2);
        state.fps.element.innerHTML = "<strong>" + fps + "</strong> fps" +
            "<br>" +
            "<strong>" + state.fps.count + "</strong> frames / " +
            "<strong>" + elapsed.toFixed(2) + "</strong> ms" +
            "<br>" +
            "<em>" + state.fps.ticks + "</em>";
        state.fps.time = state.frame.time;
        state.fps.count = 0;
        ++state.fps.ticks;
    }
}

function loop(ctx, state) {
    return function(t) {
        state.frame.time = t;
        update(state);
        draw(ctx, state);
        setFps(state);
        requestAnimationFrame(loop(ctx, state));
    };
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
        canvas: canvas,
        frame: {
            time: performance.now(),
            prev: performance.now(),
            delta: 0,
        },
        fps: {
            element: document.getElementById("fps"),
            count: 0,
            ticks: 0,
            time: performance.now(),
        },
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
