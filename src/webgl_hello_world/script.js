"use strict";

/* NOTE: See
 * `https://avikdas.com/2020/07/08/barebones-webgl-in-75-lines-of-code.html`
 */

window.onload = function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    gl.clearColor(0.9, 0.9, 0.9, 1);
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,
                    document.getElementById("vertex-shader").innerHTML);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
        return;
    }
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,
                    document.getElementById("fragment-shader").innerHTML);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fragmentShader));
        return;
    }
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);
    var data = new Float32Array([
        -0.85, //     <- `x`
        -0.85, //  1  <- `y`
        0.0,   // ___ <- ... `opacity` ?
        0.85,  //
        -0.85, //  2
        0.0,   // ___
        0.0,   //
        0.85,  //  3
        0.0,   // ___
    ]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
};
