from PIL import Image, ImageDraw

class parsingException(Exception):
  def __init__(self, val):
    self.value=val
  def __str__(self):
    return repr(self.value)


sizeX = Image.open('media/map.png', 'r').size[0]
sizeY = Image.open('media/map.png', 'r').size[1]
mapPixels = Image.open('media/map.png', 'r').load()

"""
Const colors used to decode map data from .png file
"""
colorCodes = { (255, 255, 255): 0, # grass
               (151, 62, 53):   1, # road
               (15, 154, 255):  2, # water
               (76, 255, 0):    3, # house
               (250, 210, 0):   4} # enemy house


with open('media/map.json', 'w') as jsonMap:
    jsonMap.write('[')
    
    # For every image line
    for i in range(sizeX):
        
        try:
          # Don't forget to crop brightness part (4th in tuple)
           row = [colorCodes[mapPixels[i, x][:-1]] for x in range(sizeY)]
        except KeyError:
          for j in range(sizeY):
            if mapPixels[i, j][:-1] not in colorCodes.keys():
               raise parsingException('Error at parsing map image at (%d, %d). Pixel value is %s' % (i, j, str(mapPixels[i, j])))

        # If first string        
        if i == 0:
            jsonMap.write(str(row) + ',\n')
        # If last string
        elif i == sizeX - 1:
            jsonMap.write(' ' + str(row))    
        
        else:
            jsonMap.write(' ' + str(row) + ',\n')

    jsonMap.write(']')
