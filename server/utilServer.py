from pathlib import Path
import os
import sys

CPATH = Path(os.path.dirname(os.path.abspath(__file__))).parent / 'cluster'
sys.path.append(str(CPATH))

from scipy import spatial
import numpy as np
import json
import shutil
from gerarDados import gerarDados

def getMimeType(path):
    if path.endswith(".html"):
        return 'text/html'
    elif path.endswith(".png"):
        return 'image/png'
    elif path.endswith(".jpg"):
        return 'image/jpg'
    elif path.endswith(".gif"):
        return 'image/gif'
    elif path.endswith(".js"):
        return 'application/javascript'
    elif path.endswith(".css"):
        return 'text/css'
    elif path.endswith(".json"):
        return 'application/json'
    elif path.endswith(".mp4"):
        return 'video/mp4'
    else:
        return ""

def chi2_distance(histA, histB, eps = 1e-10):
		d = 0.5 * np.sum([((a - b) ** 2) / (a + b + eps)
			for (a, b) in zip(histA, histB)])
		return d

def salvarResults(videos, folderResult, limit):
    if os.path.isdir(folderResult): 
        shutil.rmtree(folderResult)
    os.mkdir(folderResult)
    json_data = open(folderResult.parent / "data_1.json")
    data1 = json.load(json_data)
    heatQtd = len(data1)
    heatQtdVideos = limit if limit < heatQtd else heatQtd
    gerarDados(videos, heatQtdVideos, folderResult, similarity=True)

def updateData(videos, folderData, categories=[], catOptions={}):
    json_data = open(folderData / "data_1.json")
    data1 = json.load(json_data)
    heatQtd = len(data1)
    
    if os.path.isdir(folderData): 
        shutil.rmtree(folderData)
    os.mkdir(folderData)

    gerarDados(videos, heatQtd, folderData, similarity=False, categories=categories, catOptions=catOptions)

def cosine_distance(vect1, vect2):
    return spatial.distance.cosine(vect1, vect2)