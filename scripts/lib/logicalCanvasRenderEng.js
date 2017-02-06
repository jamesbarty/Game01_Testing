/**
 * \file
 *
 * Defines the logicalCanvasRenderEng module.</br>
 * Given a canvas, it will return a function to render an ImageData to the canvas at the
 *   parameters defined in constants
 *
 * No opportunity for cleanup is given
 */
define([
  'lib/constants'
], function(constants) {
  'use strict';
  return function(theCanvas)
  {
    var SCREEN_CANVAS_WIDTH = constants.LOGICAL_CANVAS_WIDTH * constants.LOGICAL_PIXEL_EDGE;
    var SCREEN_CANVAS_HEIGHT = constants.LOGICAL_CANVAS_HEIGHT * constants.LOGICAL_PIXEL_EDGE;

    // checking
    if(! theCanvas instanceof HTMLCanvasElement)
      throw "Parameter is not a canvas";
    if(theCanvas.width != SCREEN_CANVAS_WIDTH)
      throw "Improper canvas width";
    if(theCanvas.height != SCREEN_CANVAS_HEIGHT)
      throw "Improper canvas height";

    // Get the gl context
    var glCtx = theCanvas.getContext('webgl');
    if(!glCtx)
      glCtx = theCanvas.getContext('experimental-webgl');
    if(!glCtx)
      throw "Could not acquire gl context";

    // Program to render the entire screen
    var prog = glCtx.createProgram();
    var prov_vtxShader = glCtx.createShader(glCtx.VERTEX_SHADER);
    var prov_fragShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);

    var vtxShader_code = "attribute vec3 vec_in;void main(void){gl_Position=vec4(vec_in,1.0);}";
    glCtx.shaderSource(prov_vtxShader, vtxShader_code);
    glCtx.compileShader(prov_vtxShader);

    var fragShader_code =
    "uniform sampler2D sampler;void main(void){gl_FragColor =" +
    "vec4(texture2D(sampler, vec2(gl_FragCoord.x/" + SCREEN_CANVAS_WIDTH + ".00001," +
                                 "1.00001-gl_FragCoord.y/" + SCREEN_CANVAS_HEIGHT + ".0)).xyz, 1);}";
    glCtx.shaderSource(prov_fragShader, fragShader_code);
    glCtx.compileShader(prov_fragShader);

    glCtx.attachShader(prog, prov_vtxShader);
    glCtx.attachShader(prog, prov_fragShader);
    glCtx.linkProgram(prog);
    glCtx.useProgram(prog);

    // The entire screen will be covered by this quad
    var screenVtxBuf = glCtx.createBuffer();
    glCtx.bindBuffer(glCtx.ARRAY_BUFFER, screenVtxBuf);
    glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([1, 1, -1, 1, 1, -1, -1, -1]), glCtx.STATIC_DRAW);

    // Set vertex data for shader
    var prog_vtxAttrib = glCtx.getAttribLocation(prog, "vec_in");
    glCtx.enableVertexAttribArray(prog_vtxAttrib);
    glCtx.vertexAttribPointer(prog_vtxAttrib, 2, glCtx.FLOAT, false, 0, 0);

    // Create the texture which will contain logical pixels
    var logicalPixel_tex = glCtx.createTexture();
    glCtx.bindTexture(glCtx.TEXTURE_2D, logicalPixel_tex);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);

    // Set shader's sampler
    var prog_texUniform = glCtx.getUniformLocation(prog, 'sampler')
    glCtx.activeTexture(glCtx.TEXTURE0);
    glCtx.uniform1i(prog_texUniform, 0);

    return function(imgData)
    {
      if(!(imgData instanceof ImageData))
        return false;
      if(imgData.width != LOGICAL_CANVAS_WIDTH)
        return false;
      if(imgData.height != LOGICAL_CANVAS_HEIGHT)
        return false;

      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, imgData);
      // glCtx.clearColor(1, 1, 1, 1);
      // glCtx.clear(glCtx.COLOR_BUFFER_BIT);
      glCtx.drawArrays(glCtx.TRIANGLE_STRIP, 0, 4);
      return true;
    };
  }
});
