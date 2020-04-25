import argparse
from pathlib import Path, PurePath
from os import walk
import cv2 as cv
import numpy as np
import json

def extractFeature(fileImg):
    img = cv.imread(str(fileImg))
    chans = cv.split(img)
    colors = ("b", "g", "r")
    features = []

    for (chan, _) in zip(chans, colors): #(chan,color)
        hist = cv.calcHist([chan], [0], None, [256], [0, 256])
        features.extend(hist)

    return (np.array(features).flatten().astype(int)).tolist()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("folderImages", help="folder with images")
    parser.add_argument("fileOut", help="output file (.json)")
    args = parser.parse_args()

    dic = {}
    folderImages = Path(args.folderImages).absolute()
    fileOut = Path(args.fileOut).absolute()
    for path, subdirs, files in walk(folderImages):
        for name in files:
            file = PurePath(path, name)
            feature = extractFeature(file)
            dic[str(file)] = feature

    with open(fileOut, 'w') as json_file:
        json.dump(dic, json_file)
    

if __name__ == '__main__':
	main()