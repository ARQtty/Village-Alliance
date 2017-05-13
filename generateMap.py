from PIL import Image, ImageDraw

mapImageSize = Image.open('media/map.bmp', 'r').size[0] # Square
mapPixels = Image.open('media/map.bmp', 'r').load()

colorCodes = { (255, 255, 255): 0, # grass
               (151, 62, 53):   1, # road
               (15, 154, 255):  2, # water
               (76, 255, 0):    3, # house
               (255, 0, 0):     4, # zombie
               (255, 216, 0):   5} # snake

with open('media/map.json', 'w') as jsonMap:
    jsonMap.write('[')
    
    # For every image line
    for i in range(mapImageSize):
        
        try:
        	row = [colorCodes[mapPixels[i, x]] for x in range(mapImageSize)]
        except KeyError:
        	print('Error at parsing map image at row %d' % i)

        # If first string        
        if i == 0:
            jsonMap.write(str(row) + ',\n')
        # If last string
        elif i == mapImageSize - 1:
            jsonMap.write(' ' + str(row))    
        
        else:
            jsonMap.write(' ' + str(row) + ',\n')

    jsonMap.write(']')