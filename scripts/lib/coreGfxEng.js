/**
 * \file
 *
 * Defines the core graphics functionality</br>
 * To be initialized with a canvas, intended to be the main screen canvas
 */
'use strict';
define([
  'lib/drawConcreteContext',
  'lib/constants'
], function(DrawConcreteContext, constants)
{
  return function(theCanvas, imgManager)
  {
    /*/*****************************************************************
    *
    *  CONSTANTS DEFINITION
    *
    */

    var SCREEN_CANVAS_WIDTH = constants.LOGICAL_CANVAS_WIDTH * constants.LOGICAL_PIXEL_EDGE;
    var SCREEN_CANVAS_HEIGHT = constants.LOGICAL_CANVAS_HEIGHT * constants.LOGICAL_PIXEL_EDGE;



    /*/*****************************************************************
    *
    *  PARAMETER VALIDATION
    *
    */

    if(!(theCanvas instanceof HTMLCanvasElement))
      throw "Parameter is not a canvas";
    if(theCanvas.width != SCREEN_CANVAS_WIDTH)
      throw "Improper canvas width";
    if(theCanvas.height != SCREEN_CANVAS_HEIGHT)
      throw "Improper canvas height";



    /*/*****************************************************************
    *
    *  UTILITY FUNCTIONS
    *
    */

    /**
     * returns a compiled and linked program for the given context and shaders
     */
    function createProgramFromSource(glCtx, vtxShaderSrc, fragShaderSrc)
    {
      var prog = glCtx.createProgram();
      var vtxShader = glCtx.createShader(glCtx.VERTEX_SHADER);
      var fragShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);

      glCtx.shaderSource(vtxShader, vtxShaderSrc);

      glCtx.shaderSource(fragShader, fragShaderSrc);

      glCtx.compileShader(vtxShader);
      glCtx.compileShader(fragShader);
      glCtx.attachShader(prog, vtxShader);
      glCtx.attachShader(prog, fragShader);
      glCtx.linkProgram(prog);

      return prog;
    };

    /**
     * returns a program to render a subsection of a texture to the viewport.
     * Intention is rectangular subtexture to rectangle
     *
     * Vertex attributes:
     *   vec2 vec_in -> coordinates of the vertex
     *   vec2 texPosn -> coordinates vertex's location in texture
     * Uniforms:
     *   sampler2D texSampler -> the texture unit to sample from
     */
    function getRenderTextureProg(glCtx)
    {
      var prog = createProgramFromSource(glCtx,
        // vtx shader
        "attribute vec2 vec_in;                 " +
        "attribute vec2 texPosn;                " +
        "varying highp vec2 sampleCoord;        " +
        "void main(void)                        " +
        "{                                      " +
        "  gl_Position = vec4(vec_in, 0.0, 1.0);" +
        "  sampleCoord = texPosn;               " +
        "}                                      ",

        // frag shader
        "uniform sampler2D texSampler;                       " +
        "varying highp vec2 sampleCoord;                     " +
        "void main(void)                                     " +
        "{gl_FragColor = texture2D(texSampler, sampleCoord);}"
      );

      return prog;
    };

    /**
     * returns a program to render a colored rectangle
     *
     * Vertex attributes:
     *   vec2 vec_in -> coordinates of the vertex
     * Uniforms:
     *   vec4 color_in -> color to render (R,G,B,A)
     */
    function getRenderColorRectProg(glCtx)
    {
      var prog = createProgramFromSource(glCtx,
        // vtx shader
        "attribute vec2 vec_in;void main(void){gl_Position = vec4(vec_in, 0, 1.0);}",

        // frag shader
        "uniform lowp vec4 color_in;void main(void){gl_FragColor=color_in;}"
      );

      return prog;
    };

    /**
     * Sets texture sampling parameters to the boringest values
     */
    function setTexParamOfTarget(target)
    {
      glCtx.texParameteri(target, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(target, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
      glCtx.texParameteri(target, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
      glCtx.texParameteri(target, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
    };

    /**
     * Binds and creates the main sprite sheet to the active texture unit
     */
    function getMainSpritesheetTex(glCtx, imgMan, consts)
    {
      var domImgSrc = imgMan.image[consts.MAIN_SPRITE_SHEET_ID];
      if (!(domImgSrc instanceof HTMLImageElement))
        throw "Image is of incorrect type";

      var tex = glCtx.createTexture();
      glCtx.bindTexture(glCtx.TEXTURE_2D, tex);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, domImgSrc);
      setTexParamOfTarget(glCtx.TEXTURE_2D);

      return tex;
    };



    /*/*****************************************************************
    *
    *  PERFORM INITIALIZATION
    *
    */

    // Get the gl context
    var glCtx = theCanvas.getContext('webgl');
    if(!glCtx)
      glCtx = theCanvas.getContext('experimental-webgl');
    if(!glCtx)
      throw "Could not acquire gl context";

    // Generate programs
    var renderTextureProg = getRenderTextureProg(glCtx);
    var attrib_rtp_vec_in = glCtx.getAttribLocation(renderTextureProg, "vec_in");
    var attrib_rtp_texPosn = glCtx.getAttribLocation(renderTextureProg, "texPosn");
    var uniform_rtp_texSampler = glCtx.getUniformLocation(renderTextureProg, "texSampler");

    var renderColoredRectProg = getRenderColorRectProg(glCtx);
    var attrib_rcrp_vec_in = glCtx.getAttribLocation(renderColoredRectProg, "vec_in");
    var uniform_rcrp_color_in = glCtx.getUniformLocation(renderColoredRectProg, "color_in");

    // load the main sprite sheet
    glCtx.activeTexture(glCtx.TEXTURE0);
    var mainSpriteSheetTex = getMainSpritesheetTex(glCtx, imgManager, constants);

    glCtx.activeTexture(glCtx.TEXTURE1);

    // create vertex buffer
    var rectVtxBuf = glCtx.createBuffer();
    var sampleLocBuf = glCtx.createBuffer();

    // create frame buffer
    var theFrameBuffer = glCtx.createFramebuffer();

    // create root concrete context
    var rootConcCtx = new DrawConcreteContext(null, constants.LOGICAL_CANVAS_WIDTH,
                                                    constants.LOGICAL_CANVAS_HEIGHT);
    rootConcCtx.giftbox = new ConcreteGiftbox(rootConcCtx, null);

    /*/*****************************************************************
     *
     *  CONCRETE CONTEXT CALLBACKS
     *
     */

    // x, y, w, h are in logical coordinates/dimensions
    // r, g, b, a are color components [0,255]
    function pushDrawFillRect(concCtx, x, y, w, h, r, g, b, a)
    {
      console.log("pushDrawFillRect");
      // normalize
      x /= concCtx.width/2;
      x -= 1;
      w /= concCtx.width/2;

      y /= -concCtx.height/2;
      y += 1;
      h /= -concCtx.height/2;

      // set up draw parameters
      glCtx.useProgram(renderColoredRectProg);
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, rectVtxBuf);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([x, y, x+w, y, x+w, y+h, x, y+h]), glCtx.STREAM_DRAW);
      glCtx.vertexAttribPointer(attrib_rcrp_vec_in, 2, glCtx.FLOAT, glCtx.FALSE, 0, 0);
      glCtx.uniform4f(uniform_rcrp_color_in, r/255, g/255, b/255, a/255);
      glCtx.enableVertexAttribArray(attrib_rcrp_vec_in);

      // set up frame buffer
      if(concCtx.giftbox.texture == null)
      {
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
        glCtx.viewport(0, 0, SCREEN_CANVAS_WIDTH, SCREEN_CANVAS_HEIGHT);
      }
      else
      {
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, theFrameBuffer);
        glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D,
                                   concCtx.giftbox.texture, 0);
        glCtx.viewport(0, 0, concCtx.width, concCtx.height);
      }

      glCtx.drawArrays(glCtx.TRIANGLE_FAN, 0, 4);
      glCtx.disableVertexAttribArray(attrib_rcrp_vec_in);
    }

    function pushDrawSprite(concCtx, xDest, yDest, wDest, hDest, xSrc, ySrc, wSrc, hSrc)
    {
      console.log("pushDrawSprite");
    }

    function pushDrawTextLine(concCtx, x, y, str)
    {
      console.log("pushDrawTextLine");
    }

    function pushDrawConcrete(concCtx, x, y, w, h, concreteCtx)
    {
      console.log("pushDrawConcrete");
      glCtx.bindTexture(glCtx.TEXTURE_2D, concreteCtx.giftbox.texture);

      // normalize
      x /= concCtx.width/2;
      x -= 1;
      w /= concCtx.width/2;

      y /= -concCtx.height/2;
      y += 1;
      h /= -concCtx.height/2;

      // set up draw parameters
      glCtx.useProgram(renderTextureProg);

      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, rectVtxBuf);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([x, y, x+w, y, x+w, y+h, x, y+h]), glCtx.STREAM_DRAW);
      glCtx.vertexAttribPointer(attrib_rtp_vec_in, 2, glCtx.FLOAT, glCtx.FALSE, 0, 0);

      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, sampleLocBuf);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), glCtx.STREAM_DRAW);
      glCtx.vertexAttribPointer(attrib_rtp_texPosn, 2, glCtx.FLOAT, glCtx.FALSE, 0, 0);

      glCtx.enableVertexAttribArray(attrib_rtp_vec_in);
      glCtx.enableVertexAttribArray(attrib_rtp_texPosn);

      glCtx.uniform1i(uniform_rtp_texSampler, 1);

      // set up frame buffer
      if(concCtx.giftbox.texture == null)
      {
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
        glCtx.viewport(0, 0, SCREEN_CANVAS_WIDTH, SCREEN_CANVAS_HEIGHT);
      }
      else
      {
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, theFrameBuffer);
        glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D,
                                   concCtx.giftbox.texture, 0);
        glCtx.viewport(0, 0, concCtx.width, concCtx.height);
      }

      glCtx.drawArrays(glCtx.TRIANGLE_FAN, 0, 4);

      glCtx.disableVertexAttribArray(attrib_rtp_vec_in);
      glCtx.disableVertexAttribArray(attrib_rtp_texPosn);

    }



    /*/*****************************************************************
    *
    *  CONCRETE GIFTBOX
    *
    */

    function ConcreteGiftbox(owningConcCtx, backingTexture)
    {
      this.owner = owningConcCtx;
      this.texture = backingTexture;
    };

    ConcreteGiftbox.prototype.pushDrawFillRect = function(x, y, w, h, r, g, b, a)
    { pushDrawFillRect(this.owner, x, y, w, h, r, g, b, a); };

    ConcreteGiftbox.prototype.pushDrawSprite = function(xDest, yDest, wDest, hDest, xSrc, ySrc, wSrc, hSrc)
    { pushDrawSprite(this.owner, xDest, yDest, wDest, hDest, xSrc, ySrc, wSrc, hSrc); };

    ConcreteGiftbox.prototype.pushDrawTextLine = function(x, y, str)
    { pushDrawTextLine(this.owner, x, y, str); };

    ConcreteGiftbox.prototype.pushDrawConcrete = function(x, y, w, h, other)
    { pushDrawConcrete(this.owner, x, y, w, h, other); };



    /*/*****************************************************************
    *
    *  THE ACTUAL RETURN VALUE
    *
    */

    return {
      createConcreteContext: function(w, h)
      {
        var theTex = glCtx.createTexture();
        glCtx.bindTexture(glCtx.TEXTURE_2D, theTex);
        setTexParamOfTarget(glCtx.TEXTURE_2D);
        glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, w, h, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, null);

        var ret = new DrawConcreteContext(null, w, h);
        ret.giftbox = new ConcreteGiftbox(ret, theTex);

        return ret;
      },

      getRootConcreteContext: function()
      {
        return rootConcCtx;
      },

      releaseConcreteContext: function(concCtx)
      {
        if(concCtx.giftbox.texture != null)
          glCtx.deleteTexture(concCtx.giftbox.texture);
      }
    }; // end return value

  }; // end module 'return' function
});
