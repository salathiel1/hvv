import json
import os
import numpy as np
from leitorVideos import LeitorVideos
from hcluster import HCluster
from postProcess import getColorArray

class GravadorJson:

    fArray = []

    @staticmethod
    def gerarDataHeatMapArv(videos, arv, arvCol, folderOut, g=None, similarity=False):
        if(g == None):
            g = arv.iD
        finalFileStr = "_"+str(g)+".json"

        #yden
        GravadorJson.saveArvoreJson(arv, videos, folderOut /  ("yden"+finalFileStr) )

        #ordem linha
        orderr = arv.getLeafsInOrder()

        #tabela sem ordem coluna
        tempSeq = np.arange(len(videos[0].tomadas)).tolist()
        GravadorJson.saveDataTableCorV(videos, orderr, tempSeq, folderOut / ("dataNC"+finalFileStr) )
        GravadorJson.saveDataTableImg(videos, orderr, tempSeq, folderOut / ("dataImgNC"+finalFileStr) )
        if similarity:
            GravadorJson.saveDataTableCorSimilarity(videos, orderr, tempSeq, folderOut / ("dataSNC"+finalFileStr))

        #xden
        GravadorJson.saveArvoreJson(arvCol, videos, folderOut / ("xden"+finalFileStr), xDen=True)

        #ordem coluna
        orderc = arvCol.getLeafsInOrder()

        #tabela
        GravadorJson.saveDataTableCorV(videos, orderr, orderc, folderOut / ("data"+finalFileStr) )
        GravadorJson.saveDataTableImg(videos, orderr, orderc, folderOut / ("dataImg"+finalFileStr) )
        if similarity:
            GravadorJson.saveDataTableCorSimilarity(videos, orderr, orderc, folderOut / ("dataS"+finalFileStr))

    @staticmethod
    def saveArvoreJson(arv, videos, outFile, xDen=False, saveScenes=False):
        yden = open(outFile,"w")
        yden.write(GravadorJson.jsonArvore(arv, videos, xDen, saveScenes))
        yden.close()

    @staticmethod
    def saveArvoreJsonSimple(arv, outFile, labels=None, indexsLabels=None):
        yden = open(outFile,"w")
        yden.write(GravadorJson.jsonArvoreSimple(arv, labels, indexsLabels))
        yden.close()

    @staticmethod
    def saveDataTableCorV(videos, orderRow, orderCol, fileOut):
        #fArray = LeitorVideos.getVideosAtributosFArray(videos)
        if( len(GravadorJson.fArray) <= 0):
            GravadorJson.fArray = getColorArray(videos)
        GravadorJson.saveDataTableCor(GravadorJson.fArray, orderRow, orderCol, fileOut)

    #fArray array com os valores dos floats (0.0 a 1.0) para todos os videos e tomadas
    @staticmethod
    def saveDataTableCor(fArray, orderRow, orderCol, fileOut):
        data = []
        for index in orderRow:
            values = []
            for col in orderCol:
                corV = ""
                if np.isscalar(fArray[index][col]) == True:
                    corV = str(round(fArray[index][col], 3))
                else:
                    corV = ",".join(str(i) for i in fArray[index][col].tolist())
                values.append({"key": col, "value": corV }) #round(fArray, 2)
            data.append({"key": int(index), "values" : values})
        dataf = open(fileOut,"w") 
        dataf.write(json.dumps(data))
        dataf.close()

    @staticmethod
    def saveDataTableImg(videos, orderRow, orderCol, fileOut):
        data = []
        for index in orderRow:
            values = []
            video = videos[index]
            for col in orderCol:
                tomada = video.tomadas[col] 
                imgs = ":".join(tomada.imgs)
                values.append({"key": col, "value": imgs, "video": video.nome, "tempo": tomada.tempo})
            data.append({"key": int(index), "values" : values})
        dataf = open(fileOut,"w") 
        dataf.write(json.dumps(data))
        dataf.close()


        #fArray array com os valores dos floats (0.0 a 1.0) para todos os videos e tomadas
    @staticmethod
    def saveDataTableCorSimilarity(videos, orderRow, orderCol, fileOut):
        data = []
        for index in orderRow:
            values = []
            video = videos[index]
            for col in orderCol:
                tomada = video.tomadas[col] 
                corV = str(round(tomada.similarity, 3))
                values.append({"key": col, "value": corV }) #round(fArray, 2)
            data.append({"key": int(index), "values" : values})
        dataf = open(fileOut,"w") 
        dataf.write(json.dumps(data))
        dataf.close()


    @staticmethod
    def json_tree2(raiz, videos, xDen=False, saveScenes=False):
        strFinal = ""
        #raiz.display()
        if(raiz != None and raiz.esquerda != None and raiz.direita != None):
            strFinal = strFinal + "\"children\":["
            strFinal = strFinal + "{"
            strFinal = strFinal + "\"length\":" + str(raiz.distanciaEsq) + ","
            if(xDen == False):
                vid = videos[int(raiz.esquerda.folhaId)]
                strFinal = strFinal + "\"id\":" + str(raiz.esquerda.iD) + ","
                strFinal = strFinal + "\"vid\": \"" + str(vid.nome) + "\","
                strFinal = strFinal + "\"qtd\":" + str(raiz.esquerda.qtdFolha) + ","
                if(saveScenes == True):
                    imgs = [t.imgs[0] for t in vid.tomadas]
                    strFinal = strFinal + "\"imgs\": \"" + str(":".join(imgs)) + "\","
            strFinal = strFinal + GravadorJson.json_tree2(raiz.esquerda, videos, xDen, saveScenes)
            strFinal = strFinal + "},"
            strFinal = strFinal + "{"
            strFinal = strFinal + "\"length\":" + str(raiz.distanciaDir) + ","
            if(xDen == False):
                vid = videos[int(raiz.direita.folhaId)]
                strFinal = strFinal + "\"id\":" + str(raiz.direita.iD) + ","
                strFinal = strFinal + "\"vid\": \"" + str(vid.nome) + "\","
                strFinal = strFinal + "\"qtd\":" + str(raiz.direita.qtdFolha) + ","
                if(saveScenes == True):
                    imgs = [t.imgs[0] for t in vid.tomadas]
                    strFinal = strFinal + "\"imgs\": \"" + str(":".join(imgs)) + "\","
            strFinal = strFinal + GravadorJson.json_tree2(raiz.direita, videos, xDen, saveScenes)
            strFinal = strFinal + "}"
            strFinal = strFinal + "]"
        elif(raiz != None and raiz.direita == None and raiz.esquerda == None):
            #print("i2=", raiz.folhaId, "id=", raiz.iD)
            strFinal = strFinal + "\"key\":" + str(raiz.folhaId)
            if(xDen == False):
                vid = videos[int(raiz.folhaId)]
                strFinal = strFinal + ", \"totalt\":" + str(vid.totalTomadas)
        return strFinal

    @staticmethod
    def jsonArvore(raiz, videos, xDen=False, saveScenes=False):
        strFinal = "{ \"totalLength\" : 0.8,"
        strFinal = strFinal + GravadorJson.json_tree2(raiz, videos, xDen, saveScenes)
        strFinal = strFinal + "}"
        return strFinal

    @staticmethod
    def json_tree_simple(raiz, labels=None, indexsLabels=None):
        strFinal = ""
        if(raiz != None and raiz.esquerda != None and raiz.direita != None):
            strFinal = strFinal + "\"children\":["
            strFinal = strFinal + "{"
            strFinal = strFinal + "\"length\":" + str(raiz.distanciaEsq) + ","
            strFinal = strFinal + GravadorJson.json_tree_simple(raiz.esquerda, labels, indexsLabels)
            strFinal = strFinal + "},"
            strFinal = strFinal + "{"
            strFinal = strFinal + "\"length\":" + str(raiz.distanciaDir) + ","
            strFinal = strFinal + GravadorJson.json_tree_simple(raiz.direita, labels, indexsLabels)
            strFinal = strFinal + "}"
            strFinal = strFinal + "]"
        elif(raiz != None and raiz.direita == None and raiz.esquerda == None):
            strFinal = strFinal + "\"key\":" + str(raiz.folhaId)
            if labels != None:
                strFinal = strFinal + ", \"label\": \"" + str(labels[indexsLabels[raiz.folhaId]].split(",")[0]) + "\""
        return strFinal

    @staticmethod
    def jsonArvoreSimple(raiz, labels=None, indexsLabels=None):
        strFinal = "{ \"totalLength\" : 0.8,"
        strFinal = strFinal + GravadorJson.json_tree_simple(raiz, labels, indexsLabels)
        strFinal = strFinal + "}"
        return strFinal

    @staticmethod
    def saveCategoriesCount(catCounter, outFile):
        cat = open(outFile,"w")
        jsonCat = []
        for c in catCounter:
            jsonCat.append([c[0], c[2]])
        cat.write(json.dumps(jsonCat))
        cat.close()

    @staticmethod
    def saveObject(array, outFile):
        cat = open(outFile,"w")
        cat.write(json.dumps(array))
        cat.close()