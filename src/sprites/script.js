"use strict";

var SPRITE_COLS = 6;
var SPRITE_WIDTH = 24;
var SPRITE_HEIGHT = 16;
var SPRITE_COL_IDLE = SPRITE_WIDTH * 3;
var SPRITE_ROW_IDLE_LEFT = 0;
var SPRITE_ROW_IDLE_RIGHT = SPRITE_HEIGHT * 3;
var SPRITE_ROW_RUNNING_LEFT = SPRITE_HEIGHT * 2;
var SPRITE_ROW_RUNNING_RIGHT = SPRITE_HEIGHT * 5;
var KEY_CODE = {
    j: 74,
    l: 76,
};
var FRAME_DRAG = 72.0;

function keyDown(state) {
    function f(event) {
        switch (event.keyCode) {
        case KEY_CODE.j: {
            state.keys.j = true;
            break;
        }
        case KEY_CODE.l: {
            state.keys.l = true;
            break;
        }
        }
    }
    return f;
}

function keyUp(state) {
    function f(event) {
        switch (event.keyCode) {
        case KEY_CODE.j: {
            state.keys.j = false;
            break;
        }
        case KEY_CODE.l: {
            state.keys.l = false;
            break;
        }
        }
    }
    return f;
}

function setSprite(state, t) {
    if (state.keys.j === state.keys.l) {
        state.sprite.animation.col = SPRITE_COL_IDLE;
        state.sprite.animation.row = state.sprite.animation.left
            ? SPRITE_ROW_IDLE_LEFT
            : SPRITE_ROW_IDLE_RIGHT;
    } else {
        state.sprite.animation.col =
            (Math.floor(t / FRAME_DRAG) % SPRITE_COLS) * SPRITE_WIDTH;
        state.sprite.animation.left = state.keys.j;
        state.sprite.animation.row = state.sprite.animation.left
            ? SPRITE_ROW_RUNNING_LEFT
            : SPRITE_ROW_RUNNING_RIGHT;
    }
}

function draw(ctx, state) {
    ctx.clearRect(state.sprite.position.x,
                  state.sprite.position.y,
                  SPRITE_WIDTH,
                  SPRITE_HEIGHT);
    ctx.drawImage(state.sprite.frames,
                  state.sprite.animation.col,
                  state.sprite.animation.row,
                  SPRITE_WIDTH,
                  SPRITE_HEIGHT,
                  state.sprite.position.x,
                  state.sprite.position.y,
                  SPRITE_WIDTH,
                  SPRITE_HEIGHT);
}

function loop(ctx, state) {
    function f(t) {
        setSprite(state, t);
        draw(ctx, state);
        requestAnimationFrame(loop(ctx, state));
    }
    return f;
}

function getState(canvas) {
    var state = {
        sprite: {
            frames: document.getElementById("sprites"),
            position: {
                x: Math.floor((canvas.width / 2) - (SPRITE_WIDTH / 2)),
                y: Math.floor((canvas.height / 2) - (SPRITE_HEIGHT / 2)),
            },
            animation: {
                left: true,
                row: 0,
                col: 0,
            },
        },
        background: {
            x: 0,
            y: undefined,
            width: canvas.width,
            height: undefined,
        },
        keys: {
            j: false,
            l: false,
        },
    };
    state.background.y = state.sprite.position.y + SPRITE_HEIGHT;
    state.background.height = canvas.height - state.background.y;
    return state;
}

function main() {
    var canvas = document.getElementById("canvas");
    canvas.setAttribute("tabindex", "0");
    canvas.focus();
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "hsl(0, 0%, 80%)";
    var state = getState(canvas);
    window.addEventListener("keydown", keyDown(state));
    window.addEventListener("keyup", keyUp(state));
    ctx.fillRect(state.background.x,
                 state.background.y,
                 state.background.width,
                 state.background.height);
    requestAnimationFrame(loop(ctx, state));
    console.log("Done!");
}

window.onload = main;
