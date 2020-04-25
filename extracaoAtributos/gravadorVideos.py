import sys
sys.path.append('..')
sys.path.append('nic')
from extratorAtributos import ExtratorAtributos
from nic.captioner import Captioner
from entidades.video import Video
from entidades.tomada import Tomada
import numpy as np
import pickle
from pathlib import Path

class GravadorVideos:
    videos = []
    limiteTomadas = 10
    capitioner = None
    customFeatures = None

    def __init__(self, limiteTomadas=10, customFeatures=None):
        self.limiteTomadas = limiteTomadas
        self.capitioner = Captioner()
        self.customFeatures = customFeatures


    def addVideo(self, videoFile, imagesFiles, tempos, thumbPath):
        video = Video(str(videoFile), len(imagesFiles))

        imgsPaths = []
        strip = int(len(imagesFiles)/self.limiteTomadas)
        for i in range(0, len(imagesFiles)):
            index = strip * i if strip > 0 else i
            fileImage = imagesFiles[index]
            tomada = Tomada()

            imgs = [fileImage]

            tomada.imgs = imgs
            if self.customFeatures != None:
                tomada.atributosImg = self.customFeatures[fileImage]
            else:
                tomada.atributosImg = ExtratorAtributos.histCor3(fileImage)
            tomada.atributosCor = ExtratorAtributos.conceitos(fileImage)
            if tempos != None:
                tomada.tempo = tempos[index] 

            imgsPaths.append(fileImage)
            video.addTomada(tomada)

            if len(video.tomadas) >= self.limiteTomadas:
                break
        
        #captioning
        self.capitioner.generateCaptioning(imgsPaths)

        capts = []
        for i in range(0, len(video.tomadas)):
            t = video.tomadas[i]
            t.caption = self.capitioner.getCaptioning(t.imgs[0])
            capts.append(t.caption)
            
            #relative path imgs
            t.imgs = [str(Path(i).relative_to(thumbPath)) for i in t.imgs]


        #captioning embeding
        vetors = ExtratorAtributos.elmo_vectors(capts)
        
        for i in range(0, len(video.tomadas)):
            t = video.tomadas[i]
            t.captionVect = vetors[i]

        video.normalizar(self.limiteTomadas)
        #self.gerarCaracteristicas(video)
        self.videos.append(video)

    def saveVideos(self, file):
        pickle_out = open(file,"wb")
        pickle.dump(self.videos, pickle_out)
        pickle_out.close()

    '''def gerarCaracteristicas(self, video):
        arrCaracTom = []
        for t in video.tomadas:
            c = ExtratorAtributos.conceitosFinal(t.imgs[0])
            arrCaracTom.append(c)
        sumV = np.sum(arrCaracTom, axis=0) #/ len(video.tomadas)
        sumV[sumV > 1] = 1
        video.caracteristicas = sumV'''

