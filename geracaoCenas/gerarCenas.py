from os import listdir, scandir, system, mkdir, remove
from os.path import isfile, join, isdir
import sys
import csv
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("folderVideos", help="a folder with videos")
parser.add_argument("folderOut", help="folder to save generated scenes")
parser.add_argument("-v", "--verbose", help="increase output verbosity", action="store_true")
args = parser.parse_args()

folder = Path(args.folderVideos)
folderOut = Path(args.folderOut)
folderScenes = folderOut / "thumbnails"
folderMsb = folderOut / "msb"
videosFile = [f for f in listdir(folder) if isfile(join(folder, f))]
videosFile.sort()
videosFile.sort(key = lambda s: len(s))

for fileVideo in videosFile:
	videoName = fileVideo.split(".")[0]
	cenaFolder = folderScenes / videoName
	verbose = "" if args.verbose else " -v none"
	cmd = "scenedetect" + verbose + " --input " + str(folder / fileVideo) + " --output " + str(cenaFolder) + " detect-content -t 10 list-scenes save-images -f '$SCENE_NUMBER' -n 1 -q 90"
	system(cmd)

	csvFile = cenaFolder / (videoName + "-Scenes.csv")
	tsvStr = "startframe\tstarttime\tendframe\tendtime\n"
	with open(csvFile) as csv_file:
		csv_reader = csv.reader(csv_file, delimiter=',')
		line_count = 0
		for row in csv_reader:
			line_count += 1
			if line_count > 2:
				tsvStr = tsvStr + row[1]+"\t"+row[3]+"\t"+row[4]+"\t"+row[6] + "\n"

	if not isdir(folderMsb):
		mkdir(folderMsb)

	with open(folderMsb / (videoName+".tsv"), 'w') as file:
		file.write(tsvStr)

	remove(csvFile)
	
