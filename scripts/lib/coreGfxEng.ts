/**
 * \file
 *
 * Defines the core graphics functionality</br>
 * To be constructed with a canvas, intended as the main screen canvas
 */

import RGBA from "./rgba";
import { Rect } from "./geometry";
import * as constants from "./constants";
import DrawConcreteContext from "./drawConcreteContext.ts";
import { IConcreteGiftbox } from "./drawConcreteContext.ts";

interface ICoreGfxEngConcGift extends IConcreteGiftbox
{
	owningInstance: CoreGfxEng;
	owner: DrawConcreteContext;
	texture: WebGLTexture;
}

export default class CoreGfxEng
{
	/*/***************************************************************************
	 * Static utility functions
	 */

	/**
	 * returns a compiled and linked program for the given context and shaders
	 */
	private static createProgramFromSource(glCtx: WebGLRenderingContext,
										   vtxShaderSrc: string,
										   fragShaderSrc: string) : WebGLProgram
	{
		let prog = glCtx.createProgram();
		let vtxShader = glCtx.createShader(glCtx.VERTEX_SHADER);
		let fragShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);

		glCtx.shaderSource(vtxShader, vtxShaderSrc);
		glCtx.shaderSource(fragShader, fragShaderSrc);

		glCtx.compileShader(vtxShader);
		glCtx.compileShader(fragShader);
		// console.log("vtx shader: " + glCtx.getShaderInfoLog(vtxShader));
		// console.log("frag shader: " + glCtx.getShaderInfoLog(fragShader));
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
	 *   lowp vec4 tintColor -> color to tint to (alpha is percentage)
	 *   lowp float alphaFactor -> multiplier of alpha
	 *   sampler2D texSampler -> the texture unit to sample from
	 */
	private static getRenderTextureProg(glCtx: WebGLRenderingContext) : WebGLProgram
	{
		return CoreGfxEng.createProgramFromSource(glCtx,
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
			"uniform lowp vec4 tintColor;                          " +
			"uniform lowp float alphaFactor;                       " +
			"uniform sampler2D texSampler;                         " +
			"varying highp vec2 sampleCoord;                       " +
			"void main(void)                                       " +
			"{                                                           " +
			"    lowp vec4 sampCol = texture2D(texSampler, sampleCoord); " +
			"    gl_FragColor.rgb = sampCol.rgb * (1.0-tintColor.a) +    " +
			"                       (tintColor.rgb * tintColor.a);       " +
			"    gl_FragColor.a = sampCol.a * alphaFactor;               " +
			"}                                                           "
		);
	};

	/**
	 * returns a program to render a colored rectangle
	 *
	 * Vertex attributes:
	 *   vec2 vec_in -> coordinates of the vertex
	 * Uniforms:
	 *   vec4 color_in -> color to render (R,G,B,A)
	 */
	private static getRenderColorRectProg(glCtx: WebGLRenderingContext) : WebGLProgram
	{
		return CoreGfxEng.createProgramFromSource(glCtx,
			// vtx shader
			"attribute vec2 vec_in;void main(void){gl_Position = vec4(vec_in, 0, 1.0);}",

			// frag shader
			"uniform lowp vec4 color_in;void main(void){gl_FragColor=color_in;}"
		);
	};

	/**
	 * Sets texture sampling parameters to the boringest values
	 */
	private static setTexParamOfTarget(glCtx: WebGLRenderingContext, target: GLenum) : void
	{
		glCtx.texParameteri(target, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
		glCtx.texParameteri(target, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
		glCtx.texParameteri(target, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
		glCtx.texParameteri(target, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
	};

	/*/***************************************************************************
	*  CONCRETE CONTEXT CALLBACKS
	*/

	private pushDrawFillRect(gft: ICoreGfxEngConcGift,
							 destRect: Rect,
							 color: RGBA) : void
	{
		const { glCtx } = this;
		let x = destRect.x;
		let y = destRect.y;
		let w = destRect.w;
		let h = destRect.h;

		// normalize
		x /= gft.owner.width/2;
		x -= 1;
		w /= gft.owner.width/2;

		y /= -gft.owner.height/2;
		y += 1;
		h /= -gft.owner.height/2;

		// set up draw parameters
		glCtx.useProgram(this.renderColoredRectProg);
		glCtx.bindBuffer(glCtx.ARRAY_BUFFER, this.rectVtxBuf);
		glCtx.bufferData(glCtx.ARRAY_BUFFER,
						 new Float32Array([x, y, x+w, y, x+w, y+h, x, y+h]),
						 glCtx.STREAM_DRAW);
		glCtx.vertexAttribPointer(this.attrib_rcrp_vec_in, 2, glCtx.FLOAT, false, 0, 0);
		glCtx.uniform4f(this.uniform_rcrp_color_in, color.r/255, color.g/255, color.b/255, color.a/255);
		glCtx.enableVertexAttribArray(this.attrib_rcrp_vec_in);

		// set up frame buffer
		if(gft.texture == null)
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
			glCtx.viewport(0, 0, constants.SCREEN_CANVAS_WIDTH, constants.SCREEN_CANVAS_HEIGHT);
		}
		else
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, this.frameBuffer);
			glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D,
									   gft.texture, 0);
			glCtx.viewport(0, 0, gft.owner.width, gft.owner.height);
		}

		glCtx.drawArrays(glCtx.TRIANGLE_FAN, 0, 4);
		glCtx.disableVertexAttribArray(this.attrib_rcrp_vec_in);
	}

	private pushDrawConcrete(gft: ICoreGfxEngConcGift,
							 destRect: Rect,
							 srcCtx: DrawConcreteContext,
							 alphaFac: number,
							 tint: RGBA,
							 srcRect?: Rect) : void
	{
		const { glCtx } = this;

		let xDest = destRect.x;
		let yDest = destRect.y;
		let wDest = destRect.w;
		let hDest = destRect.h;

		let xSrc;
		let ySrc;
		let hSrc;
		let wSrc;

		if(srcRect)
		{
			xSrc = srcRect.x;
			ySrc = srcRect.y;
			hSrc = srcRect.h;
			wSrc = srcRect.w;
		}
		else
		{
			xSrc = 0;
			ySrc = 0;
			wSrc = srcCtx.width;
			hSrc = srcCtx.height;
		}

		// normalize
		xDest /= gft.owner.width/2;
		xDest -= 1;
		wDest /= gft.owner.width/2;

		yDest /= -gft.owner.height/2;
		yDest += 1;
		hDest /= -gft.owner.height/2;

		xSrc /= srcCtx.width;
		wSrc /= srcCtx.width;

		ySrc /= srcCtx.height;
		ySrc = 1 - ySrc;
		hSrc /= -srcCtx.height;

		// set up draw parameters
		glCtx.useProgram(this.renderTextureProg);

		glCtx.bindBuffer(glCtx.ARRAY_BUFFER, this.rectVtxBuf);
		glCtx.bufferData(glCtx.ARRAY_BUFFER,
						 new Float32Array([xDest, yDest, xDest+wDest, yDest, xDest+wDest,
										   yDest+hDest, xDest, yDest+hDest]),
						 glCtx.STREAM_DRAW);

		glCtx.vertexAttribPointer(this.attrib_rtp_vec_in, 2, glCtx.FLOAT, false, 0, 0);

		glCtx.bindBuffer(glCtx.ARRAY_BUFFER, this.sampleLocBuf);
		glCtx.bufferData(glCtx.ARRAY_BUFFER,
						 new Float32Array([xSrc, ySrc, xSrc+wSrc, ySrc, xSrc+wSrc,
										   ySrc+hSrc, xSrc, ySrc+hSrc]),
						 glCtx.STREAM_DRAW);

		glCtx.vertexAttribPointer(this.attrib_rtp_texPosn, 2, glCtx.FLOAT, false, 0, 0);

		glCtx.enableVertexAttribArray(this.attrib_rtp_vec_in);
		glCtx.enableVertexAttribArray(this.attrib_rtp_texPosn);

		if((<ICoreGfxEngConcGift>srcCtx.giftbox).texture)
		{
			glCtx.bindTexture(glCtx.TEXTURE_2D, (<ICoreGfxEngConcGift>srcCtx.giftbox).texture);
		}
		else
		{
			throw "Invalid concrete source";
		}

		glCtx.uniform1i(this.uniform_rtp_texSampler, 0);
		glCtx.uniform4f(this.uniform_rtp_tintColor, tint.r/255, tint.g/255, tint.b/255, tint.a/255);
		glCtx.uniform1f(this.uniform_rtp_alphaFac, alphaFac);

		// set up frame buffer
		if(gft.texture == null)
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
			glCtx.viewport(0, 0, constants.SCREEN_CANVAS_WIDTH, constants.SCREEN_CANVAS_HEIGHT);
		}
		else
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, this.frameBuffer);
			glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D,
									   gft.texture, 0);
			glCtx.viewport(0, 0, gft.owner.width, gft.owner.height);
		}

		glCtx.drawArrays(glCtx.TRIANGLE_FAN, 0, 4);

		glCtx.disableVertexAttribArray(this.attrib_rtp_vec_in);
		glCtx.disableVertexAttribArray(this.attrib_rtp_texPosn);
	}

	private loadImage(gft: ICoreGfxEngConcGift, img: HTMLImageElement)
	{
		const { glCtx } = this;

		if(img.width != gft.owner.width)
			throw "Unequal widths";
		if(img.height != gft.owner.height)
			throw "Unequal heights";

		if(gft.texture == null)
			throw "Cannot load image to root concrete context";

		glCtx.bindTexture(glCtx.TEXTURE_2D, gft.texture);
		glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, glCtx.RGBA, glCtx.UNSIGNED_BYTE, img);
	}

	private clear(gft: ICoreGfxEngConcGift, color: RGBA)
	{
		const { glCtx } = this;

		// set up frame buffer
		if(gft.texture == null)
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
			glCtx.viewport(0, 0, constants.SCREEN_CANVAS_WIDTH, constants.SCREEN_CANVAS_HEIGHT);
		}
		else
		{
			glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, this.frameBuffer);
			glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0, glCtx.TEXTURE_2D,
									   gft.texture, 0);
			glCtx.viewport(0, 0, gft.owner.width, gft.owner.height);
		}

		glCtx.clearColor(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
		glCtx.clear(glCtx.COLOR_BUFFER_BIT);
	}

	private releaseConcrete(gft: ICoreGfxEngConcGift)
	{
		gft.owningInstance = null;
		gft.owner = null;
		gft.texture = null;
	}

	/*/***************************************************************************
	 * Private members
	 */
	private CoreGfxEngConcGift = class CoreGfxEngConcGift
	{
		owningInstance: CoreGfxEng;
		owner: DrawConcreteContext;
		texture: WebGLTexture;

		constructor(owningInst_new: CoreGfxEng, owner_new: DrawConcreteContext, texture_new: WebGLTexture)
		{
			this.owningInstance = owningInst_new;
			this.owner = owner_new;
			this.texture = texture_new;
		}

		pushDrawFillRect(destRect: Rect, color: RGBA) : void
		{
			this.owningInstance.pushDrawFillRect(this, destRect, color);
		}

		pushDrawConcrete(destRect: Rect,
						 srcCtx: DrawConcreteContext,
						 alphaFac: number,
						 tint: RGBA,
						 srcRect?: Rect) : void
		{
			this.owningInstance.pushDrawConcrete(this, destRect, srcCtx, alphaFac, tint, srcRect);
		}

		loadImage(img: HTMLImageElement) : void
		{
			this.owningInstance.loadImage(this, img);
		}

		clear(color: RGBA)
		{
			this.owningInstance.clear(this, color);
		}

		release()
		{
			this.owningInstance.releaseConcrete(this);
		}
	};

	private makeGiftbox: (owner_new: DrawConcreteContext, texture_new: WebGLTexture) => void;

	private glCtx: WebGLRenderingContext;

	private renderColoredRectProg: WebGLProgram;
	private attrib_rcrp_vec_in: GLint;
	private uniform_rcrp_color_in: WebGLUniformLocation;

	private renderTextureProg: WebGLProgram;
	private attrib_rtp_vec_in: GLint;
	private attrib_rtp_texPosn: GLint;
	private uniform_rtp_tintColor: WebGLUniformLocation;
	private uniform_rtp_alphaFac: WebGLUniformLocation;
	private uniform_rtp_texSampler: WebGLUniformLocation;

	private rectVtxBuf: WebGLBuffer;
	private sampleLocBuf: WebGLBuffer;
	private frameBuffer: WebGLFramebuffer;

	private rootConcCtx: DrawConcreteContext;

	constructor(canv: HTMLCanvasElement)
	{

		// Validate parameters
		if(canv.width != constants.SCREEN_CANVAS_WIDTH)
			throw "Improper canvas width";
		if(canv.height != constants.SCREEN_CANVAS_HEIGHT)
			throw "Improper canvas height";

		this.glCtx = canv.getContext('webgl');
		let { glCtx } = this;
		if(!glCtx)
			glCtx = canv.getContext('experimental-webgl');
		if(!glCtx)
			throw "Could not acquire gl context";

		// Generate programs
		this.renderColoredRectProg = CoreGfxEng.getRenderColorRectProg(glCtx);
		this.attrib_rcrp_vec_in = glCtx.getAttribLocation(this.renderColoredRectProg, "vec_in");
		this.uniform_rcrp_color_in = glCtx.getUniformLocation(this.renderColoredRectProg, "color_in");

		this.renderTextureProg = CoreGfxEng.getRenderTextureProg(glCtx);
		this.attrib_rtp_vec_in = glCtx.getAttribLocation(this.renderTextureProg, "vec_in");
		this.attrib_rtp_texPosn = glCtx.getAttribLocation(this.renderTextureProg, "texPosn");
		this.uniform_rtp_tintColor = glCtx.getUniformLocation(this.renderTextureProg, "tintColor");
		this.uniform_rtp_alphaFac = glCtx.getUniformLocation(this.renderTextureProg, "alphaFactor");
		this.uniform_rtp_texSampler = glCtx.getUniformLocation(this.renderTextureProg, "texSampler");

		// create vertex buffers
		this.rectVtxBuf = glCtx.createBuffer();
		this.sampleLocBuf = glCtx.createBuffer();

		// create frame buffer
		this.frameBuffer = glCtx.createFramebuffer();

		// create root concrete context
		let tmpRootConcGiftbox = new this.CoreGfxEngConcGift(this, null, null);
		this.rootConcCtx = new DrawConcreteContext(tmpRootConcGiftbox,
												   constants.LOGICAL_CANVAS_WIDTH,
												   constants.LOGICAL_CANVAS_HEIGHT);
		tmpRootConcGiftbox.owner = this.rootConcCtx;

		// initialize state
		glCtx.pixelStorei(glCtx.UNPACK_FLIP_Y_WEBGL, true);
		glCtx.activeTexture(glCtx.TEXTURE0);

		glCtx.enable(glCtx.BLEND);
		glCtx.blendEquationSeparate(glCtx.FUNC_ADD, glCtx.FUNC_ADD);
		glCtx.blendFuncSeparate(glCtx.SRC_ALPHA, glCtx.ONE_MINUS_SRC_ALPHA, glCtx.ONE, glCtx.ONE_MINUS_SRC_ALPHA);

	}

	createConcreteContext(w: number, h: number) : DrawConcreteContext
	{
		const { glCtx } = this;
		let theTex = glCtx.createTexture();
		glCtx.bindTexture(glCtx.TEXTURE_2D, theTex);
		CoreGfxEng.setTexParamOfTarget(glCtx, glCtx.TEXTURE_2D);
		glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, w, h, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, null);

		let tmpGiftbox = new this.CoreGfxEngConcGift(this, null, theTex);
		let ret = new DrawConcreteContext(tmpGiftbox, w, h);
		tmpGiftbox.owner = ret;

		return ret;
	}

	getRootConcreteContext() : DrawConcreteContext
	{
		return this.rootConcCtx;
	}
}
