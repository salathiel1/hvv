from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import pairwise_distances
from arvore import Arvore
from leitorVideos import LeitorVideos
from util import subArray
from util import veticalExtendArray
from util import extendArray
import kmedoids

class HCluster:

    atributosArray = None
    atributosArrayExtend = None

    def __init__(self, atributosArray):
        self.atributosArray = atributosArray
        self.atributosArrayExtend = extendArray(atributosArray)

    def medoidCluster(self, k):
        data = self.atributosArrayExtend
        D = pairwise_distances(data, metric='euclidean')
        medoids, grupos = kmedoids.kMedoids(D, k)
        medoids = list(medoids)
        grupos = list(grupos.values())
        return medoids, grupos

    def dendoArvoreNormalizado(self, indexs=[]):
        X = self.atributosArrayExtend
        Z = linkage(X, 'ward')
        raiz = Z[len(Z)-1]
        maxAltura = raiz[2] if raiz[2] > 0 else 1
        arv = Arvore.gerarArvore(raiz, Z, X)
        arv.normalizaAltura(maxAltura)
        if len(indexs) > 0:
            arv.ajustaIndexs(indexs)
        return arv

    def dendoArvore(self):
        X = self.atributosArrayExtend
        Z = linkage(X, 'ward')
        raiz = Z[len(Z)-1]
        arv = Arvore.gerarArvore(raiz, Z, X)
        arv.countLeafs()
        return arv

    def arvColuna(self, arvDendo):
        indexs = arvDendo.getLeafsInOrder()
        subV = subArray(self.atributosArray, indexs)
        atributosArrayVerticalExtend = veticalExtendArray(subV)
        tmp = self.atributosArrayExtend
        self.atributosArrayExtend = atributosArrayVerticalExtend
        arvCol = self.dendoArvoreNormalizado()
        self.atributosArrayExtend = tmp
        return arvCol

    def allArvPart(self, arvDendo, heatQtdVid):
        subs = arvDendo.internTrees()
        partTrees = []

        if subs != None and len(subs) > 0:
            for sArv in subs:
                arvHeat = sArv.treePart(heatQtdVid)
                arvCol = self.arvColuna(arvHeat)
                partTrees.append( [arvHeat, arvCol] )

        return partTrees