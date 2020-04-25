import pandas as pd 
import numpy as np
import json
import sys
import os.path
from arvore import Arvore
from leitorVideos import LeitorVideos
from gravadorJson import GravadorJson
from hcluster import HCluster
from heatmap import Heatmap
from util import extendArray, subArray
from pathlib import Path
import argparse
from postProcess import generateVideosCategories, updateVideoCategories

#json_tree2 usando folhaid para indexar videos
#arvore de videos

def main():

	parser = argparse.ArgumentParser()

	parser.add_argument("fileFeatures", help="file with features")
	parser.add_argument("numberVideos", type=int, help="maximum amount of videos that will be shown in exploratory mode")
	parser.add_argument("folderOut", help="output data folder (json files)")
	
	args = parser.parse_args()

	heatQtdVid = args.numberVideos
	folderOut = Path(args.folderOut)

	videos = LeitorVideos.loadVideos(args.fileFeatures)
	categories = generateVideosCategories(videos)
	GravadorJson.saveObject(categories, folderOut / "sug_categories.json")

	gerarDados(videos, heatQtdVid, folderOut)

def gerarDados(videos, heatQtdVid, folderOut, similarity=False, categories=[], catOptions={}):
	atributosImgArray = LeitorVideos.getVideosAtributosImgArray(videos)
	
	if(len(categories) > 0):
		atributosImgArray = LeitorVideos.getVideosAtributosCaptionArray(videos)
		jsonCatCounter, dictCat = updateVideoCategories(videos, categories, catOptions=catOptions)
		GravadorJson.saveObject(jsonCatCounter, folderOut / "categories.json")
		GravadorJson.saveObject(dictCat, folderOut / "dictcategories.json")

	#zerando algumas var globais
	GravadorJson.fArray = []
	Arvore.setLastId(1)

	#cluster heatmap princiapl
	hCluster = HCluster(atributosImgArray)
	arv = hCluster.dendoArvore()
	preencherMedoidsArv(atributosImgArray, arv)
	
	#arvore localizacao
	GravadorJson.saveArvoreJson(arv, videos, folderOut / "arvore.json", saveScenes=True)

	heatmap = Heatmap(folderOut)

	#heatmap todos videos
	arvCol = hCluster.arvColuna(arv)
	heatmap.gerarFullHeatMap(arv, arvCol, videos, g="all", similarity=similarity)

	#heatmaps arvores
	allTreesPart = hCluster.allArvPart(arv, heatQtdVid)
	for arvHeat,arvCol in allTreesPart:
		heatmap.gerarFullHeatMap(arvHeat, arvCol, videos, similarity=similarity)

	#heatmap caracteristicas
	#hCluster = HCluster(caracteristicas)
	#arv = hCluster.dendoArvore()
	#arvCol = hCluster.arvColuna(arv)
	#heatmap.gerarSimpleCorHeatMap(arv, arvCol, caracteristicas, "Caracs", useLabels=True, indexsLabels=maxIndicesCols)


def preencherMedoidsArv(atributosArrayVideos, arv):
	if arv != None and not arv.isFolha():
		indexsArv = arv.getLeafsInOrder()
		sVideoArray = subArray(atributosArrayVideos, indexsArv)
		hCluster = HCluster(sVideoArray)
		medoid, _ = hCluster.medoidCluster(1)
		medoidReal = indexsArv[medoid[0]]
		arv.folhaId = medoidReal
		preencherMedoidsArv(atributosArrayVideos, arv.direita)
		preencherMedoidsArv(atributosArrayVideos, arv.esquerda)

if __name__ == '__main__':
	main()
