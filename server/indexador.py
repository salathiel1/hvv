from entidades.video import Video
from entidades.tomada import Tomada
from extracaoAtributos.extratorAtributos import ExtratorAtributos
from utilServer import chi2_distance, cosine_distance
import numpy as np
import pickle
import cv2
import json
import operator

class Indexador:

    videos = []

    def __init__(self, arqVideos):
        pickle_in = open(arqVideos,"rb")
        self.videos = pickle.load(pickle_in)
        ExtratorAtributos.inicializarModel()

    def pesquisaImagem(self, image, limit=10):
        cv2.imwrite("tmp.png", image)
        queryF = ExtratorAtributos.conceitos("tmp.png")
        
        results = {}

        for i in range(0, len(self.videos)):
            v = self.videos[i]
            for j in range(0, len(v.tomadas)):
                baseF = v.tomadas[j].atributosCor
                results[(i,j)] = cosine_distance(baseF, queryF)
                v.tomadas[j].similarity = results[(i,j)]

        return self.getBestVideos(results, limit)

    def pesquisaTexto(self, texto, limit=10):
        X = [texto]
        textoVect = ExtratorAtributos.elmo_vectors(X)[0]

        results = {}

        for i in range(0, len(self.videos)):
            v = self.videos[i]
            for j in range(0, len(v.tomadas)):
                baseF = v.tomadas[j].captionVect
                results[(i,j)] = cosine_distance(baseF, textoVect)
                v.tomadas[j].similarity = results[(i,j)]

        return self.getBestVideos(results, limit)


    def getBestVideos(self, results, limit):
        sorted_results = sorted(results.items(), key=operator.itemgetter(1))
        result_videos = []

        limit = limit if limit < len(self.videos) else len(self.videos)
        
        for i in range(0, len(sorted_results)):
            r = sorted_results[i] #[ ((i,j) d), ...]
            video = self.videos[r[0][0]]
            
            if video not in result_videos:
                result_videos.append(video)

            if len(result_videos) >= limit:
                break

        return result_videos
