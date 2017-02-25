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
  return function(theCanvas)
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

    glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, true);
    glCtx.activeTexture(glCtx.TEXTURE0);

    // Generate programs
    var renderTextureProg = getRenderTextureProg(glCtx);
    var attrib_rtp_vec_in = glCtx.getAttribLocation(renderTextureProg, "vec_in");
    var attrib_rtp_texPosn = glCtx.getAttribLocation(renderTextureProg, "texPosn");
    var uniform_rtp_texSampler = glCtx.getUniformLocation(renderTextureProg, "texSampler");

    var renderColoredRectProg = getRenderColorRectProg(glCtx);
    var attrib_rcrp_vec_in = glCtx.getAttribLocation(renderColoredRectProg, "vec_in");
    var uniform_rcrp_color_in = glCtx.getUniformLocation(renderColoredRectProg, "color_in");

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

    function pushDrawConcrete(concCtx, xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc)
    {
      console.log("pushDrawConcrete");

      if( (!(concSrc instanceof DrawConcreteContext)) || concSrc.giftbox.texture == null)
        throw "Invalid source concrete context (cannot draw from root context)";

      if(xSrc == undefined)
        xSrc = 0;
      if(ySrc == undefined)
        ySrc = 0;
      if(wSrc == undefined)
        wSrc = concSrc.width;
      if(hSrc == undefined)
        hSrc = concSrc.height;

      // normalize
      xDest /= concCtx.width/2;
      xDest -= 1;
      wDest /= concCtx.width/2;

      yDest /= -concCtx.height/2;
      yDest += 1;
      hDest /= -concCtx.height/2;

      xSrc /= concSrc.width;
      wSrc /= concSrc.width;

      ySrc /= concSrc.height;
      ySrc = 1 - ySrc;
      hSrc /= -concSrc.height;

      // set up draw parameters
      glCtx.useProgram(renderTextureProg);

      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, rectVtxBuf);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([xDest, yDest, xDest+wDest, yDest, xDest+wDest,
                                                             yDest+hDest, xDest, yDest+hDest]), glCtx.STREAM_DRAW);
      glCtx.vertexAttribPointer(attrib_rtp_vec_in, 2, glCtx.FLOAT, glCtx.FALSE, 0, 0);

      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, sampleLocBuf);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([xSrc, ySrc, xSrc+wSrc, ySrc, xSrc+wSrc,
                                                             ySrc+hSrc, xSrc, ySrc+hSrc]), glCtx.STREAM_DRAW);
      //glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1,0, 0, 0]), glCtx.STREAM_DRAW);
      glCtx.vertexAttribPointer(attrib_rtp_texPosn, 2, glCtx.FLOAT, glCtx.FALSE, 0, 0);

      glCtx.enableVertexAttribArray(attrib_rtp_vec_in);
      glCtx.enableVertexAttribArray(attrib_rtp_texPosn);

      glCtx.bindTexture(glCtx.TEXTURE_2D, concSrc.giftbox.texture);
      glCtx.uniform1i(uniform_rtp_texSampler, 0);

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

    function loadImage(concCtx, img)
    {
      if(!(img instanceof HTMLImageElement))
        throw "Not an image";
      if(img.width != concCtx.width)
        throw "Unequal widths";
      if(img.height != concCtx.height)
        throw "Unequal heights";

      if(concCtx.giftbox.texture == null)
        throw "Cannot load image to root concrete context";

      glCtx.bindTexture(glCtx.TEXTURE_2D, concCtx.giftbox.texture);
      glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, img);
    }

    function pushDrawTextLine(concCtx, x, y, str)
    {
      console.log("pushDrawTextLine");
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

    ConcreteGiftbox.prototype.pushDrawFillRect =
      function(x, y, w, h, r, g, b, a)
    { pushDrawFillRect(this.owner, x, y, w, h, r, g, b, a); };

    ConcreteGiftbox.prototype.pushDrawConcrete =
      function(xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc)
    { pushDrawConcrete(this.owner, xDest, yDest, wDest, hDest, concSrc, xSrc, ySrc, wSrc, hSrc); };

    ConcreteGiftbox.prototype.loadImage =
      function(img)
    { loadImage(this.owner, img); };

    ConcreteGiftbox.prototype.pushDrawTextLine =
      function(x, y, str)
    { pushDrawTextLine(this.owner, x, y, str); };





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
