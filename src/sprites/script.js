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
    return function(event) {
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
    };
}

function keyUp(state) {
    return function(event) {
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
    };
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

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
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
        keys: {
            j: false,
            l: false,
        },
    };
    window.addEventListener("keydown", keyDown(state));
    window.addEventListener("keyup", keyUp(state));
    function loop(t) {
        setSprite(state, t);
        draw(ctx, state);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    console.log("Done!");
};
