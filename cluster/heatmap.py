import numpy as np
from gravadorJson import GravadorJson
from leitorVideos import LeitorVideos
from hcluster import HCluster
from util import subArray
from util import veticalExtendArray
from labels import labels

class Heatmap:

    folderOut = ""

    def __init__(self, folderOut):
        self.folderOut = folderOut

    def gerarSimpleCorHeatMap(self, arv, arvCol, fArray, g, useLabels=False, indexsLabels=None):
        orderr = arv.getLeafsInOrder()
        orderc = arvCol.getLeafsInOrder()
        tempSeq = np.arange(len(fArray[0])).tolist()
        arvCopy = arv.copiaNormalizada()
        GravadorJson.saveArvoreJsonSimple(arvCopy, self.folderOut / "yden"+g+".json")
        if useLabels == True:
            GravadorJson.saveArvoreJsonSimple(arvCol, self.folderOut / "xden"+g+".json", labels=labels, indexsLabels=indexsLabels)
        else:
            GravadorJson.saveArvoreJsonSimple(arvCol, self.folderOut / "xden"+g+".json")
        GravadorJson.saveDataTableCor(fArray, orderr, orderc, self.folderOut / "data"+g+".json")
        GravadorJson.saveDataTableCor(fArray, orderr, tempSeq, self.folderOut / "dataNC"+g+".json")

    def gerarFullHeatMap(self, arv, arvCol, videos, g=None, similarity=False):
        if arv.getNumLeafs() > 1:
            arvCopy = arv.copiaNormalizada()
            GravadorJson.gerarDataHeatMapArv(videos, arvCopy, arvCol, self.folderOut, g, similarity=similarity)