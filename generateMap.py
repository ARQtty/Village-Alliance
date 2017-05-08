from PIL import Image, ImageDraw

mapImage = Image.open('media/map.bmp', 'r')
mapPixels = mapImage.load()

def processColors(arr):
	''' Matches pixels value to app texture codes '''

	colorCodes = { '(15, 154, 255)': 2, # water
				   '(76, 255, 0)': 3, # house
				   '(150, 60, 50)': 1, # road
				   '(150, 62, 53)': 1, # same road
				   '(151, 62, 53)': 1, # same road
				   '(255, 255, 255)': 0} #grass
	textureCodes = []

	for color in arr:
		textureCodes += [colorCodes[str(color)]]

	return textureCodes


with open('media/map.json', 'w') as jsonMap:
	jsonMap.write('[')
	
	# For every image line
	for i in range(mapImage.size[0]):
		row = []

		# Loop for j index wich needed for PIL lib 
		for j in range(mapImage.size[0]):
			row += [mapPixels[i, j]]

		row = processColors(row)

		# If first string		
		if i == 0:
			jsonMap.write(str(row) + ',\n')
		# If last string
		elif i == mapImage.size[0] - 1:
			jsonMap.write(' ' + str(row))	
		
		else:
			jsonMap.write(' ' + str(row) + ',\n')

	jsonMap.write(']')