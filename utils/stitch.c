#include<stdio.h>
#include<stdint.h>
#include<string.h>
#include<stdlib.h>
#include<ctype.h>
#include<limits.h>
#define STRHELPER2(a) #a
#define STRHELPER(a) STRHELPER2(a)
#define TRACE(...) printf(__FILE__ ":" STRHELPER(__LINE__) " -- " __VA_ARGS__)
#define DEST_SHEET_SIZE 2048
#define BMP_LCS_sRGB (0x73524742U)
#define BMP_LCS_WINDOWS_COLOR_SPACE (0x57696E20U)
const char* IMG_FILE_EXT = ".bmp";
const char* META_FILE_EXT = ".meta";

/**
 * @returns The number of bytes per row
 */
uint32_t getRowSize(uint32_t bitPerPixel, uint32_t width)
{
	return ((bitPerPixel * width + 31U) / 32U) * 4U;
}

/**
 * @returns non-zero if current computer is big endian
 */
int isBigEndian()
{
	static const unsigned short a = 1U;
	return *((const char*)(&a)) == 0;
}

/**
 * @returns Amount to shift by to get LSB of mask to first bit position
 * @returns <tt>~(0U)</tt> if <tt>a == 0</tt>
 */
uint32_t resolveBitmask(uint32_t a)
{
	if(a == 0U)
	{
		return ~0U;
	}

	for(uint32_t amt = 0; amt < 40; ++amt)
	{
		if (((a >> amt) & 1U) != 0U)
		{
			return amt;
		}
	}
	return ~(0U);
}

struct Pixel;
typedef struct Pixel Pixel;
struct Pixel { unsigned char r, g, b, a; };

struct Sprite;
typedef struct Sprite Sprite;
struct Sprite
{
	char* name;
	unsigned int x, y, w, h; /* x is left edge; w is width */
	unsigned int destX, destY, destSheet;
};

struct SpriteList;
typedef struct SpriteList SpriteList;
struct SpriteList
{
	char* fileStub;
	size_t numSprite;
	Sprite* sprites;
};

void readLittleEndian(void* dest, const void* src, size_t size)
{
	if (isBigEndian())
	{
		for (size_t i = 0; i < size; ++i)
		{
			((char*)dest)[i] = ((const char*)src)[size - i - 1];
		}
	}
	else
	{
		memcpy(dest, src, size);
	}
}

void writeLittleEndian(const void* src, FILE* file, size_t size)
{
	if(isBigEndian())
	{
		for(size_t i = size - 1; i != ~((size_t)0ULL); --i)
		{
			fwrite(((const char*)src) + i, 1, 1, file);
		}
	}
	else
	{
		fwrite(src, 1, size, file);
	}
}

/**
 * Loads a bitmap
 * @returns zero on success
 * @returns non-zero on failure
 */
int loadBitmap(const SpriteList* spriteList, Pixel* bufferData)
{
	char buffer[512];
	snprintf(buffer, sizeof(buffer), "%s%s", spriteList->fileStub, IMG_FILE_EXT);
	FILE* theFile = fopen(buffer, "rb");
	if(theFile)
	{
		size_t numRead = fread(buffer, 1, 14, theFile);
		if (numRead == 14)
		{
			if(buffer[0] != 'B')
			{
				TRACE("Unexpected file format (header -- expected BMP)\n");
				return 1;
			}
			if(buffer[1] != 'M')
			{
				TRACE("Unexpected file format (header -- expected BMP)\n");
				return 2;
			}

			uint32_t fileLength = 0U;
			readLittleEndian(&fileLength, buffer + 2, 4);

			uint32_t bitmapStartLoc = 0U;
			readLittleEndian(&bitmapStartLoc, buffer + 10, 4);
			bitmapStartLoc -= 14;

			char* data = malloc(fileLength);

			if(data)
			{
				fread(data, 1, fileLength, theFile);
				fclose(theFile);

				uint32_t dibLen = 0U;
				readLittleEndian(&dibLen, data, 4);

				if (dibLen != 40U && dibLen != 124)
				{
					TRACE("Unsupported file format (DIB header spec %u)\n", dibLen);
					free(data);
					return 3;
				}

				int32_t bitmapWidth = 0;
				readLittleEndian(&bitmapWidth, data + 4, 4);
				if(bitmapWidth <= 0)
				{
					TRACE("U wot M8??\n");
					free(data);
					return 3;
				}

				int32_t bitmapHeight = 0;
				readLittleEndian(&bitmapHeight, data + 8, 4);

				uint16_t colorPlanes = 0U;
				readLittleEndian(&colorPlanes, data + 12, 2);
				if (colorPlanes != 1U)
				{
					TRACE("Unsupported file format (color planes)\n");
					free(data);
					return 4;
				}

				uint16_t bpp = 0U;
				readLittleEndian(&bpp, data + 14, 2);
				if (bpp == 24U)
				{
					TRACE("WARNING: 24 bpp detected; no alpha channel\n");
				}
				else if (bpp != 32U)
				{
					TRACE("Unsupported file format (bit per pixel)\n");
					free(data);
					return 5;
				}

				uint32_t compressionMethod = 0U;
				readLittleEndian(&compressionMethod, data + 16, 4);
				if (compressionMethod != 3U)
				{
					TRACE("Unsupported file format (compression method %u)\n", compressionMethod);
					free(data);
					return 6;
				}

				uint32_t colorPaletteSize = 0U;
				readLittleEndian(&colorPaletteSize, data + 32, 4);

				uint32_t importantColors = 0U;
				readLittleEndian(&importantColors, data + 36, 4);

				uint32_t rMask;
				readLittleEndian(&rMask, data + 40, 4);
				uint32_t rShAmt = resolveBitmask(rMask);

				uint32_t gMask;
				readLittleEndian(&gMask, data + 44, 4);
				uint32_t gShAmt = resolveBitmask(gMask);

				uint32_t bMask;
				readLittleEndian(&bMask, data + 48, 4);
				uint32_t bShAmt = resolveBitmask(bMask);

				uint32_t aMask;
				readLittleEndian(&aMask, data + 52, 4);
				uint32_t aShAmt = resolveBitmask(aMask);

				if( ((rMask >> rShAmt) & (gMask >> gShAmt) & (bMask >> bShAmt) & (aMask >> aShAmt)) != 0xFFU)
				{
					TRACE("Unsupported masks r=0x%08x g=0x%08x b=0x%08x a=0x%08x\n", rMask, gMask, gMask, aMask);
					free(data);
					return 7;
				}

				uint32_t csType;
				readLittleEndian(&csType, data + 56, 4);

				if(csType != BMP_LCS_sRGB && csType != BMP_LCS_WINDOWS_COLOR_SPACE)
				{
					TRACE("Unsupported colorspace\n");
					free(data);
					return 8;
				}

				const uint32_t rowSize = getRowSize(bpp, bitmapWidth);
				bpp /= CHAR_BIT; /* byte per pixel :P  */
				const uint32_t absBitmapWidth = (uint32_t)bitmapWidth;
				const uint32_t absBitmapHeight = (bitmapHeight < 0) ? (uint32_t)(-bitmapHeight) : (uint32_t)bitmapHeight;

				for(size_t i = spriteList->numSprite - 1; i != ~((size_t)0ULL); --i)
				{
					const Sprite* const curSprite = spriteList->sprites + i;
					const unsigned int maxX = curSprite->x + curSprite->w - 1;
					const unsigned int maxY = curSprite->y + curSprite->h - 1;
					if (maxY >= absBitmapHeight || maxX >= absBitmapWidth)
					{
						TRACE("Invalid sprite %s:%s\n", spriteList->fileStub, curSprite->name);
						free(data);
						return 9;
					}

					for(unsigned int y = curSprite->h - 1; y != ~0U; --y)
					{
						unsigned int srcY = curSprite->y + y;
						if(bitmapHeight > 0)
						{
							srcY = bitmapHeight - srcY - 1;
						}
						for(unsigned int x = curSprite->w - 1; x != ~0U; --x)
						{
							Pixel*const dest = bufferData + (
							                   curSprite->destX + x +
							                   (curSprite->destY + y) * DEST_SHEET_SIZE +
							                   curSprite->destSheet * DEST_SHEET_SIZE * DEST_SHEET_SIZE);
							uint32_t sample;
							memcpy(&sample, data + (curSprite->x + x)*bpp + srcY * rowSize + bitmapStartLoc, bpp);
							dest->r = 0xFFU & (sample >> rShAmt);
							dest->g = 0xFFU & (sample >> gShAmt);
							dest->b = 0xFFU & (sample >> bShAmt);
							dest->a = (bpp == 3U) ? 255U : 0xFFU & (sample >> aShAmt);;
						}
					}
				}

				free(data);
				return 0;
			}
			else
			{
				TRACE("Failed to allocate memory to store file\n");
				fclose(theFile);
				return -3;
			}
		}
		else
		{
			TRACE("Unexpected file size\n");
			return -2;
		}
	}
	else
	{
		TRACE("Failed to open %s%s\n", spriteList->fileStub, IMG_FILE_EXT);
		return -1;
	}
}

/**
 * Dump bitmaps
 * @returns 0 iff success
 */
int dumpBitmap(const Pixel* const bufferData, size_t numSheet)
{
	static const uint32_t dataStart = ((124 + 14 + 3) / 4) * 4;
	char buffer[512];
	for(size_t i = 0; i < numSheet; ++i)
	{
		uint32_t tmp;
		uint16_t tmps;
		snprintf(buffer, sizeof(buffer), "Sheet_%zu.bmp", i);
		FILE* file = fopen(buffer, "wb");
		if(!file)
		{
			TRACE("Failed to write file %s\n", buffer);
			return 1;
		}
		fwrite("BM", 1, 2, file);
		tmp = dataStart + DEST_SHEET_SIZE * DEST_SHEET_SIZE * 4;
		writeLittleEndian(&tmp, file, 4);
		tmp = 0;
		writeLittleEndian(&tmp, file, 4);
		tmp = dataStart;
		writeLittleEndian(&tmp, file, 4);

		tmp = 124;
		writeLittleEndian(&tmp, file, 4); // header size
		tmp = DEST_SHEET_SIZE;
		writeLittleEndian(&tmp, file, 4); // width
		writeLittleEndian(&tmp, file, 4); // height
		tmps = 1;
		writeLittleEndian(&tmps, file, 2); // planes
		tmps = 32;
		writeLittleEndian(&tmps, file, 2); // bit/pixel
		tmp = 3;
		writeLittleEndian(&tmp, file, 4); // compression
		tmp = DEST_SHEET_SIZE * DEST_SHEET_SIZE * 4;
		writeLittleEndian(&tmp, file, 4); // imgSize
		tmp = 2835;
		writeLittleEndian(&tmp, file, 4); // hRes
		writeLittleEndian(&tmp, file, 4); // vRes
		tmp = 0;
		writeLittleEndian(&tmp, file, 4); // colors used
		writeLittleEndian(&tmp, file, 4); // important colors
		tmp = 0xFF000000U;
		writeLittleEndian(&tmp, file, 4); // red mask
		tmp = 0x00FF0000U;
		writeLittleEndian(&tmp, file, 4); // green mask
		tmp = 0x0000FF00U;
		writeLittleEndian(&tmp, file, 4); // blue mask
		tmp = 0x000000FFU;
		writeLittleEndian(&tmp, file, 4); // alpha mask
		tmp = BMP_LCS_sRGB;
		writeLittleEndian(&tmp, file, 4); // colorspace type
		tmp = 0;
		writeLittleEndian(&tmp, file, 4); // block for CIE triplets
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);

		writeLittleEndian(&tmp, file, 4); // block for gammas
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);

		tmp = 8;
		writeLittleEndian(&tmp, file, 4); // intent

		tmp = 0;
		writeLittleEndian(&tmp, file, 4); // more garbage
		writeLittleEndian(&tmp, file, 4);
		writeLittleEndian(&tmp, file, 4);

		fwrite(buffer, 1, dataStart - ftell(file), file); // padding

		for(size_t y = DEST_SHEET_SIZE - 1; y != ~((size_t)0ULL); --y)
		{
			for(size_t x = 0; x < DEST_SHEET_SIZE; ++x)
			{
				fwrite(&((bufferData + (DEST_SHEET_SIZE*DEST_SHEET_SIZE*i + y*DEST_SHEET_SIZE + x))->a), 1, 1, file);
				fwrite(&((bufferData + (DEST_SHEET_SIZE*DEST_SHEET_SIZE*i + y*DEST_SHEET_SIZE + x))->b), 1, 1, file);
				fwrite(&((bufferData + (DEST_SHEET_SIZE*DEST_SHEET_SIZE*i + y*DEST_SHEET_SIZE + x))->g), 1, 1, file);
				fwrite(&((bufferData + (DEST_SHEET_SIZE*DEST_SHEET_SIZE*i + y*DEST_SHEET_SIZE + x))->r), 1, 1, file);
			}
		}

		fclose(file);
	}
	return 0;
}

/**
 * @returns 0 iff success
 */
int dumpJson(const SpriteList*const allSprites, int numFile)
{
	FILE* file = fopen("SheetMeta.json", "w");
	fprintf(file, "{\n");
	for(int i = 0; i < numFile; ++i)
	{
		fprintf(file, "\"%s\":{\n", allSprites[i].fileStub);
		for(size_t j = 0; j < allSprites[i].numSprite; ++j)
		{
			const Sprite* const s = allSprites[i].sprites + j;
			fprintf(file,
			        "\t\"%s\":{\n\t\t\"sheet\" : %u ,\n\t\t\"x\" : %u ,\n\t\t\"y\" : %u ,\n\t\t\"w\" : %u ,\n\t\t\"h\" : %u\n\t}%c\n",
			        s->name, s->destSheet, s->destX, s->destY, s->w, s->h, (j == allSprites[i].numSprite - 1) ? ' ' : ',');
		}
		fprintf(file, "}%c\n", (i == numFile-1) ? ' ' : ',');
	}
	fprintf(file, "}\n");
	fclose(file);
	return 0;
}

/**
 * Loads a sprite list
 * @returns zero iff success
 */
int loadSpriteList(SpriteList* list, const char* fileStub)
{
	char buffer[512];
	int ret = 0;

	snprintf(buffer, sizeof(buffer), "%s%s", fileStub, META_FILE_EXT);
	FILE* file = fopen(buffer, "r");
	if (file)
	{
		size_t curSpriteSize = 2;
		Sprite* sprites = malloc(sizeof(Sprite) * curSpriteSize);

		if (sprites)
		{
			for (size_t curSprite = 0;; ++curSprite)
			{
				if(curSprite >= curSpriteSize)
				{
					Sprite* tmp = malloc(sizeof(Sprite) * curSpriteSize * 2);
					if(tmp)
					{
						memcpy(tmp, sprites, sizeof(Sprite) * curSpriteSize);
						free(sprites);
						sprites = tmp;
						curSpriteSize *= 2;
					}
					else
					{
						TRACE("Failed to reallocate sprite list\n");
						for(size_t i = 0; i < curSprite; ++i)
						{
							free((void*)sprites[i].name);
						}
						free(sprites);
						++ret;
						break;
					}
				}

				int res = fscanf(file,
								" %512s %u %u %u %u ",
								buffer,
								&(sprites[curSprite].x),
								&(sprites[curSprite].y),
								&(sprites[curSprite].w),
								&(sprites[curSprite].h));

				if((res == 5) &&
					(sprites[curSprite].w > 0) &&
					(sprites[curSprite].h > 0))
				{
					char* tmpName = malloc(strlen(buffer) + 1);
					if (tmpName)
					{
						strcpy(tmpName, buffer);
						sprites[curSprite].name = tmpName;
					}
					else
					{
						TRACE("Failed to allocate name for %s%s entry %zu\n",
							  fileStub, META_FILE_EXT, curSprite);
						for(size_t i = 0; i < curSprite; ++i)
						{
							free((void*)sprites[i].name);
						}
						free(sprites);
						++ret;
						break;
					}
				}
				else if(res <= 0 && feof(file))
				{
					char* tmpName = malloc(strlen(fileStub) + 1);
					if (tmpName)
					{
						strcpy(tmpName, fileStub);
						list->fileStub = tmpName;
						list->numSprite = curSprite;
						list->sprites = sprites;
						break;
					}
					else
					{
						TRACE("Failed to allocate name for header of %s%s\n",
						      fileStub, META_FILE_EXT);
						for(size_t i = 0; i < curSprite; ++i)
						{
							free((void*)sprites[i].name);
						}
						free(sprites);
						++ret;
						break;
					}
				}
				else
				{
					TRACE("Erroneous metadata file '%s%s' -- Parsing %zu\n",
					      fileStub, META_FILE_EXT, curSprite);
					for(size_t i = 0; i < curSprite; ++i)
					{
						free((void*)sprites[i].name);
					}
					free(sprites);
					++ret;
					break;
				}
			}
		}
		else
		{
			TRACE("Failed to allocate sprite array\n");
			++ret;
		}

		fclose(file);
	}
	else
	{
		TRACE("Failed to open sprite list file '%s%s'\n", fileStub, META_FILE_EXT);
		++ret;
	}
	return ret;
}

int spriteComp(const void * l_v, const void * r_v)
{
	const Sprite * const l = *(const Sprite*const*const)l_v;
	const Sprite * const r = *(const Sprite*const*const)r_v;
	if (l->h > r->h) return -1;
	if (l->h < r->h) return 1;
	if (l->w > r->w) return -1;
	return l->w < r->w;
}

/**
 * Arrange all of the sprites
 * @returns The number of sheets required
 * @returns 0 on error
 */
uint32_t arrange(Sprite * const * const allSprites, size_t totalSprites)
{
	uint32_t curX = 0;
	uint32_t curY = 0;
	uint32_t nextY = 0;
	uint32_t curSheetNum = 0;
	for(size_t i = 0; i < totalSprites; ++i)
	{
		Sprite *const curSprite = allSprites[i];
		if (curX + curSprite->w > DEST_SHEET_SIZE)
		{
			if (curX == 0)
			{
				TRACE("Sprite %s is too wide\n", curSprite->name);
				return 0;
			}
			curX = 0;
			curY = nextY;
		}
		if (curX == 0)
		{
			nextY = curY + curSprite->h;
			if (nextY > DEST_SHEET_SIZE)
			{
				if(curY == 0)
				{
					TRACE("Sprite %s is too tall\n", curSprite->name);
					return 0;
				}
				curX = 0;
				curY = 0;
				nextY = curSprite->h;
				++curSheetNum;
			}
		}
		curSprite->destX = curX;
		curSprite->destY = curY;
		curSprite->destSheet = curSheetNum;
		curX += curSprite->w;
	}
	return curSheetNum + 1;
}

int main(int argc, char* argv[])
{
	if (argc == 1 || (argc == 2 && strcmp(argv[1], "-h") == 0))
	{
		printf("Arguments is a list of file stubs to stitch together\n");
		printf("For each argument <NAME>, <NAME>%s and <NAME>%s\n", IMG_FILE_EXT, META_FILE_EXT);
		return 0;
	}

	SpriteList * fileSprite = malloc(sizeof(SpriteList) * (argc - 1));

	if (fileSprite)
	{
		size_t totalSprites = 0;
		/* load each file's list of sprites */
		for(int i = 1; i < argc; ++i)
		{
			loadSpriteList(fileSprite + (i-1), argv[i]);
			totalSprites += fileSprite[i-1].numSprite;
		}

#if 0
		/* [debug] list each file's sprites to stdout */
		for(int i = 1; i < argc; ++i)
		{
			printf("%s\n", fileSprite[i-1].fileStub);
			for(size_t j = 0; j < fileSprite[i-1].numSprite; ++j)
			{
				printf("\t%s %u %u %u %u\n",
				       fileSprite[i-1].sprites[j].name,
				       fileSprite[i-1].sprites[j].x,
				       fileSprite[i-1].sprites[j].y,
				       fileSprite[i-1].sprites[j].w,
				       fileSprite[i-1].sprites[j].h);
			}
		}
		printf("Total count: %zu\n\n", totalSprites);
#endif

		Sprite ** allSprites = malloc(sizeof(Sprite*) * totalSprites);

		if (allSprites)
		{
			size_t current = 0;
			for(int i = 1; i < argc; ++i)
			{
				for(size_t j = 0; j < fileSprite[i-1].numSprite; ++j)
				{
					allSprites[current] = fileSprite[i-1].sprites + j;
					++current;
				}
			}

			qsort(allSprites, totalSprites, sizeof(Sprite*), spriteComp);
#if 0
			for(size_t i = 0; i < totalSprites; ++i)
			{
				printf("h: %u w: %u\n", allSprites[i]->h, allSprites[i]->w);
			}
			printf("\n");
#endif
			uint32_t numSheetsRequired = arrange(allSprites, totalSprites);
#if 0
			for(size_t i = 0; i < totalSprites; ++i)
			{
				printf("dx:%u dy:%u w:%u h:%u\n", allSprites[i]->destX, allSprites[i]->destY, allSprites[i]->w, allSprites[i]->h);
			}
#endif
			free(allSprites);
			if(numSheetsRequired > 0)
			{
				/* rows, then columns, then sheets */
				Pixel* bitmapData = malloc(sizeof(Pixel) * DEST_SHEET_SIZE * DEST_SHEET_SIZE * numSheetsRequired);
				if(bitmapData)
				{
					memset(bitmapData, 0xAAU, sizeof(Pixel) * DEST_SHEET_SIZE * DEST_SHEET_SIZE * numSheetsRequired);
					for(int i = 1; i < argc; ++i)
					{
						loadBitmap(fileSprite + (i-1), bitmapData);
					}
					dumpBitmap(bitmapData, numSheetsRequired);
					dumpJson(fileSprite, argc-1);
					free(bitmapData);
				}
				else
				{
					TRACE("Failed to allocate temporary output buffers\n");
				}
			}
			else
			{
				TRACE("Error arranging\n");
			}
		}
		else
		{
			TRACE("Failed to allocate aggregate sprite list\n");
		}

		/* free resources */
		for(int i = 1; i < argc; ++i)
		{
			for(size_t j = 0; j < fileSprite[i-1].numSprite; ++j)
			{
				free((void*)fileSprite[i-1].sprites[j].name);
			}
			free((void*)fileSprite[i-1].sprites);
			free((void*)fileSprite[i-1].fileStub);
		}
		free(fileSprite);
	}
	else
	{
		TRACE("Allocation failure\n");
	}
}
