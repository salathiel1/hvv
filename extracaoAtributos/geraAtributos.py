import numpy as np
import pandas as pd
import cv2 as cv
import colorsys
import sys
from PIL import Image
from sklearn.cluster import KMeans
from collections import Counter
from os import listdir
#from os import scandir
from os.path import isfile, join, splitext, isdir
from gravadorVideos import GravadorVideos
from pathlib import Path
import argparse
import json

def loadImagesFiles(cenasFolder):
	if not isdir(cenasFolder):
		return []
	imagesFiles = [f for f in listdir(cenasFolder) if isfile(join(cenasFolder, f))]
	imagesFiles.sort()
	imagesFiles.sort(key = lambda s: len(s))
	imagesFiles = [ str(cenasFolder / i) for i in imagesFiles]
	return imagesFiles

def loadTempos(csvFile):
	df = None
	try:
		df = pd.read_csv(csvFile, sep='\t')
	except Exception as e:
		print(e)

		return None
	return list(df['starttime'])

def main():

	parser = argparse.ArgumentParser()

	parser.add_argument("folderVideos", help="folder with videos relative to extracted scenes")
	parser.add_argument("folderThumb", help="folder with scenes thumbnails, there should be a subfolder for each video (with the same name as the video) with thumbnails")
	parser.add_argument("fileOut", help="output file with extracted features")
	parser.add_argument("numberScenes", type=int, help="number of scenes considered when extracting attributes")
	parser.add_argument("--msb", help="folder with .tsv files specifying the timing of the scenes, there should be a file for each video (with the same name as the video)")
	parser.add_argument("--customFeatures", help="file (.json) specifying features used to cluster")
	parser.add_argument("-v", "--verbose", help="increase output verbosity", action="store_true")
	
	args = parser.parse_args()	

	arqSaida = Path(args.fileOut).absolute()
	limiteTomadas = args.numberScenes
	videoFolder = Path(args.folderVideos).absolute()
	thumbFolder = Path(args.folderThumb).absolute()
	
	customFeatures = None
	if (args.customFeatures != None):
		customFeaturesFile = Path(args.customFeatures)
		with open(customFeaturesFile, encoding='utf-8') as fh:
			customFeatures = json.load(fh)
		#customFeatures = json.loads(str(customFeaturesFile))
	
	if(args.msb != None):
		msbFolder = Path(args.msb)

	gravador = GravadorVideos(limiteTomadas, customFeatures=customFeatures)
	videosFiles = [f for f in listdir(videoFolder) if isfile(join(videoFolder, f))]
	
	i = 0
	lenv = len(videosFiles)
	tempos = None

	for video in videosFiles:
		videoName = splitext(video)[0]
		cenasFolder = thumbFolder / videoName
		imagesFiles = loadImagesFiles(cenasFolder)

		if(args.msb != None):
			csvFile = str(msbFolder / (videoName + ".tsv") )
			tempos = loadTempos(csvFile)

		if len(imagesFiles) < 1:
			continue 

		gravador.addVideo(videoFolder / video, imagesFiles, tempos, thumbFolder)
		
		if args.verbose:
			i += 1
			print(str(i)+'/'+str(lenv), end='\r', flush=True)
	
	gravador.saveVideos(arqSaida)

if __name__ == '__main__':
	main()