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
var FRAME_SPEED = 72.0;

function update(state) {
    if (state.keys.j === state.keys.l) {
        state.sprite.animation.running = false;
    } else if (state.keys.j) {
        state.sprite.animation.running = true;
        state.sprite.animation.left = true;
    } else {
        state.sprite.animation.running = true;
        state.sprite.animation.left = false;
    }
}

function draw(ctx, state, t) {
    if (state.sprite.animation.running) {
        state.sprite.animation.col =
            (Math.floor(t / FRAME_SPEED) % SPRITE_COLS) * SPRITE_WIDTH;
        if (state.sprite.animation.left) {
            state.sprite.animation.row = SPRITE_ROW_RUNNING_LEFT;
        } else {
            state.sprite.animation.row = SPRITE_ROW_RUNNING_RIGHT;
        }
    } else {
        state.sprite.animation.col = SPRITE_COL_IDLE;
        if (state.sprite.animation.left) {
            state.sprite.animation.row = SPRITE_ROW_IDLE_LEFT;
        } else {
            state.sprite.animation.row = SPRITE_ROW_IDLE_RIGHT;
        }
    }
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
                running: false,
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
    window.addEventListener("keydown", function(event) {
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
    });
    window.addEventListener("keyup", function(event) {
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
    });
    function loop(t) {
        update(state);
        draw(ctx, state, t);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    console.log("Done!");
};
