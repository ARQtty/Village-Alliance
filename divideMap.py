from PIL import Image, ImageDraw

colorTextureCodes  = {(255, 255, 255): 0, # grass
                      (151,  62,  53): 1, # road
                      ( 15, 154, 255): 2} # water

buildingCodes= {( 76, 255,   0): 3, # house
                (250, 210,   0): 4} # enemy house

class parsingException(Exception):
  pass

mapImageFileName = 'media/map_little.png'
mapTextureFileName = 'media/textureMap.png'
mapBuildingsFileName = 'media/buildingsMap.png'

sizeX = Image.open(mapImageFileName,     'r').size[0]
sizeY = Image.open(mapImageFileName,     'r').size[1]
mapPixels = Image.open(mapImageFileName, 'r').load()

textureMap = Image.new('RGB', (sizeX, sizeY), (255, 255, 255))
buildingsMap=Image.new('RGB', (sizeX, sizeY), (255, 255, 255))

drawTexture = ImageDraw.Draw(textureMap)
drawBuilds  = ImageDraw.Draw(buildingsMap)

for i in range(sizeX):
   for j in range(sizeY):
      pixVal = mapPixels[i, j][:-1]
      if pixVal in colorTextureCodes.keys():
         drawTexture.point((i, j), pixVal)
      elif pixVal in buildingCodes.keys():
         drawBuilds.point((i, j), pixVal)
      elif pixVal != (255, 255, 255):
         raise parsingException(pixVal)

textureMap.save(mapTextureFileName)
buildingsMap.save(mapBuildingsFileName)