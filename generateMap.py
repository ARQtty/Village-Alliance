from PIL import Image, ImageDraw
import random

class parsingException(Exception):
  def __init__(self, val):
    self.value=val
  def __str__(self):
    return repr(self.value)


sizeX = Image.open('media/textureMap.png',     'r').size[0]
sizeY = Image.open('media/textureMap.png',     'r').size[1]
mapPixels = Image.open('media/textureMap.png', 'r').load()
firstStrFlag = True
"""
Const colors used to decode map data from .png file
"""
colorCodes  = { (255, 255, 255): 0, # grass
                (151,  62,  53): 1, # road
                ( 15, 154, 255): 2, # water
                ( 76, 255,   0): 3, # house
                (250, 210,   0): 4} # enemy house
buildingsIDCounter = 0

with open('media/map.json', 'w') as jsonMap:
  jsonMap.write('[')
  
  # For every image line
  for i in range(sizeX):

    try:
      # Don't forget to crop brightness part (4th in tuple)
       row = [colorCodes[mapPixels[i, x]] for x in range(sizeY)]
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


sizeX = Image.open('media/buildingsMap.png',     'r').size[0]
sizeY = Image.open('media/buildingsMap.png',     'r').size[1]
mapPixels = Image.open('media/buildingsMap.png', 'r').load()
firstStrFlag = True

with open('media/buildings.json', 'w') as buildings:
  buildings.write('[')

  # For every image line
  for i in range(sizeX):

    try:
      # Don't forget to crop brightness part (4th in tuple)
       row = [colorCodes[mapPixels[i, x]] for x in range(sizeY)]
    except KeyError:
      for j in range(sizeY):
        if mapPixels[i, j][:-1] not in colorCodes.keys():
           raise parsingException('Error at parsing map image at (%d, %d). Pixel value is %s' % (i, j, str(mapPixels[i, j])))

    for b in range(len(row)):
      if row[b] >= 3:   # Is building

        ID = '"b_h_'+ '0'*(4 - len(str(buildingsIDCounter))) + str(buildingsIDCounter) + '"'
        buildingsIDCounter += 1
        owner = '"ARQ"' if row[b] == 3 else '"SomeOne"'

        if firstStrFlag:
          buildings.write(str(
                           '{"x":  %s,\n'+
                          '  "y":  %s,\n'+
                          '  "id": %s,\n'+
                          '  "owner": %s,\n'+
                          '  "pursuers": [],\n'+
                          '  "code": %s,\n'+
                          '  "characts": {"HP": 300}\n'+
                           '}\n') % (i, b, ID, owner, row[b]))
          firstStrFlag = False
        else:
          buildings.write(str(
                          ',{"x":  %s,\n'+
                          '  "y":  %s,\n'+
                          '  "id": %s,\n'+
                          '  "owner": %s,\n'+
                          '  "pursuers": [],\n'+
                          '  "code": %s,\n'+
                          '  "characts": {"HP": 300}\n'+
                           '}\n') % (i, b, ID, owner, row[b]))
  buildings.write(']')