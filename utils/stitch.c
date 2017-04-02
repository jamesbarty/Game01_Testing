#include<stdio.h>
#include<stdint.h>
#include<string.h>
#include<stdlib.h>
#include<ctype.h>
#define STRHELPER2(a) #a
#define STRHELPER(a) STRHELPER2(a)

#define TRACE(...) printf(__FILE__ ":" STRHELPER(__LINE__) " -- " __VA_ARGS__)

const char MANGLE_SEP = '&';
const char* IMG_FILE_EXT = ".bmp";
const char* META_FILE_EXT = ".meta";

/**
 * @returns non-zero if current computer is big endian
 */
int isBigEndian()
{
	static const unsigned short a = 1U;
	return *((const char*)(&a)) == 0;
}

struct Pixel;
typedef struct Pixel Pixel;
struct Pixel { unsigned char r, g, b, a; };

struct Sprite;
typedef struct Sprite Sprite;
struct Sprite
{
	const char* name;
	unsigned int x, y, w, h; /* x is left edge; w is width */
};

struct SpriteList;
typedef struct SpriteList SpriteList;
struct SpriteList
{
	const char* fileStub;
	size_t numSprite;
	const Sprite* sprites;
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

/**
 * Loads a bitmap
 * @param data The entire file loaded in memory
 * @returns zero on success
 * @returns non-zero on failure
 */
int loadBitmap(const char* const data)
{
	if(data[0] != 'B')
	{
		TRACE("Unexpected file format (header -- expected BMP)\n");
		return 1;
	}
	if(data[1] != 'M')
	{
		TRACE("Unexpected file format (header -- expected BMP)\n");
		return 2;
	}

	uint32_t fileLength = 0U;
	readLittleEndian(&fileLength, data + 2, 4);

	uint32_t bitmapStartLoc = 0U;
	readLittleEndian(&bitmapStartLoc, data + 10, 4);

	uint32_t dibLen = 0U;
	readLittleEndian(&dibLen, data + 14, 4);

	if (dibLen != 40U)
	{
		TRACE("Unsupported file format (DIB header spec)\n");
		return 3;
	}

	int32_t bitmapWidth = 0;
	readLittleEndian(&bitmapWidth, data + 18, 4);

	int32_t bitmapHeight = 0;
	readLittleEndian(&bitmapHeight, data + 22, 4);

	uint16_t colorPlanes = 0U;
	readLittleEndian(&colorPlanes, data + 26, 2);
	if (colorPlanes != 1U)
	{
		TRACE("Unsupported file format (color planes)\n");
		return 4;
	}

	uint16_t bpp = 0U;
	readLittleEndian(&bpp, data + 28, 2);
	if (bpp == 24U)
	{
		TRACE("WARNING: 24 bpp detected; no alpha channel\n");
	}
	else if (bpp != 32U)
	{
		TRACE("Unsupported file format (bit per pixel)\n");
		return 5;
	}

	uint32_t compressionMethod = 0U;
	readLittleEndian(&compressionMethod, data + 30, 4);
	if (compressionMethod != 0U)
	{
		TRACE("Unsupported file format (compression method)\n");
		return 6;
	}

	uint32_t colorPaletteSize = 0U;
	readLittleEndian(&colorPaletteSize, data + 46, 4);

	uint32_t importantColors = 0U;
	readLittleEndian(&importantColors, data + 50, 4);

	const uint32_t rowSize = ((bpp * bitmapWidth + 31U) / 32U) * 4U;

	/* do work */

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

				if(res == 5)
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
		for(int i = 1; i < argc; ++i)
		{
			loadSpriteList(fileSprite + (i-1), argv[i]);
		}

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
