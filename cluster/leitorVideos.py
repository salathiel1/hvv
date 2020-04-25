import pickle
import numpy as np
import sys
sys.path.append('..')
from entidades.video import Video
from entidades.tomada import Tomada
from util import f3

class LeitorVideos:


    @staticmethod
    def loadVideos(arqVideos):
        pickle_in = open(arqVideos,"rb")
        return pickle.load(pickle_in)

    @staticmethod
    def getVideosAtributosCorArray(videos):
        Varr = []
        for v in videos:
            tArr = []
            for t in v.tomadas:
                tArr.append(t.atributosCor)
            Varr.append(tArr)
        return Varr

    @staticmethod
    def getVideosAtributosImgArray(videos):
        Varr = []
        for v in videos:
            tArr = []
            for t in v.tomadas:
                tArr.append(t.atributosImg)
            Varr.append(tArr)
        return Varr

    @staticmethod
    def getVideosAtributosCaptionArray(videos):
        Varr = []
        for v in videos:
            tArr = []
            for t in v.tomadas:
                tArr.append(t.captionVect)
            Varr.append(tArr)
        return Varr

    @staticmethod
    def getVideosAtributosFArray(videos):
        fArray = []
        for v in videos:
            r = []
            for t in v.tomadas:
                r.append(f3(t.atributosCor))
            fArray.append(r)
        nFMatrix = np.matrix(fArray)
        nFMatrix = nFMatrix / nFMatrix.max()
        return np.asarray(nFMatrix)


    @staticmethod
    def getVideosCaracteristicas(videos, qtdPrincipais):
        caracteristicas = []
        for v in videos:
            caracteristicas.append(v.caracteristicas)
        
        sClasses = np.sum(caracteristicas, axis=0)
        maxIndicesCols = sClasses.ravel().argsort()[::-1][:qtdPrincipais]
        principaisCaracs = []
        for c in caracteristicas:
            principaisCaracs.append( [c[i] for i in maxIndicesCols] )
        
        principaisCaracs = principaisCaracs / np.max(np.array(principaisCaracs) )
        
        return principaisCaracs, maxIndicesCols
