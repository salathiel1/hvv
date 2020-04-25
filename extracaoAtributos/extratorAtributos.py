import numpy as np
import cv2 as cv
from PIL import Image
from keras.applications.vgg16 import VGG16
from keras.preprocessing.image import load_img
from keras.preprocessing.image import img_to_array
from keras.applications.vgg16 import preprocess_input
from keras.applications.vgg16 import decode_predictions
from keras import backend as K
from keras.models import Model
import tensorflow_hub as hub
import tensorflow as tf

#GPU Warning
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

class ExtratorAtributos:
    
    #ModelNN = VGG16()
    Model = None
    Elmo = None
    graph = None

    @staticmethod
    def histCor(fileImg):
        img = cv.imread(fileImg)
        chans = cv.split(img)
        colors = ("b", "g", "r")
        features = []

        for (chan, _) in zip(chans, colors): #(chan,color)
            hist = cv.calcHist([chan], [0], None, [256], [0, 256])
            features.extend(hist)

        return np.array(features).flatten().astype(int)

    @staticmethod
    def histCor2(fileImg):
        img = cv.imread(fileImg)
        image = cv.cvtColor(img, cv.COLOR_BGR2HSV) #COLOR_BGR2LAB
        hist = cv.calcHist([image], [0, 1, 2], None, (8, 12, 12), [0, 255, 0, 255, 0, 255])
        #cv.normalize(hist, hist).flatten() #problema com alturas da arvore (visualizacao)
        
        return np.array(hist).flatten().astype(int)

    @staticmethod
    def histCor3(fileImg):
        img = cv.imread(fileImg)
        img = cv.cvtColor(img, cv.COLOR_BGR2HLS)
        h,l,s = cv.split(img)

        histH, _ = np.histogram(h, np.linspace(0, 255, 13).astype(int))
        histS, _ = np.histogram(s, np.linspace(0, 255, 7).astype(int))
        histL, _ = np.histogram(l, np.linspace(0, 255, 4).astype(int))
        histH = histH / np.sum(histH)
        histS = histS / np.sum(histS)
        histL = histL / np.sum(histL)

        return np.append(np.append(histH,histS), histL).flatten()

    @staticmethod
    def inicializarModel():
        ExtratorAtributos.Model = VGG16()
        ExtratorAtributos.Model.layers.pop()
        ExtratorAtributos.Model.outputs = [ExtratorAtributos.Model.layers[-1].output]
        ExtratorAtributos.Model.layers[-1].outbound_nodes = []

    @staticmethod
    def conceitos(fileImg):
        if ExtratorAtributos.Model == None:
            ExtratorAtributos.inicializarModel()
        image = load_img(fileImg, target_size=(224, 224))
        image = img_to_array(image)
        image = image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
        image = preprocess_input(image)
        yhat = ExtratorAtributos.Model.predict(image)
        return np.array(yhat).flatten()

    @staticmethod
    def elmo_vectors(X):
        if ExtratorAtributos.graph == None:
            ExtratorAtributos.graph = tf.Graph()
        embeddings = None
        with tf.Session(graph = ExtratorAtributos.graph) as session:
            if ExtratorAtributos.Elmo == None:
                ExtratorAtributos.Elmo = hub.Module(os.path.dirname(os.path.abspath(__file__))+"/elmo", trainable=True)
            embeddings = ExtratorAtributos.Elmo(X, signature="default", as_dict=True)["elmo"]

        with tf.Session(graph = ExtratorAtributos.graph) as sess:
            sess.run(tf.global_variables_initializer())
            sess.run(tf.tables_initializer())
            # return average of ELMo features
            return sess.run(tf.reduce_mean(embeddings,1))

    '''@staticmethod
    def conceitos(fileImg):
        #ExtratorAtributos.Model.layers.pop()
        #ExtratorAtributos.Model.outputs = [ExtratorAtributos.Model.layers[-1].output]
        #ExtratorAtributos.Model.layers[-1].outbound_nodes = []
        model = Model(inputs=ExtratorAtributos.ModelNN.input, outputs=ExtratorAtributos.ModelNN.get_layer("fc2").output)
        #ExtratorAtributos.Model.outputs = [ExtratorAtributos.Model.layers[-2].output]
        #print("1=", ExtratorAtributos.Model.outputs)
        image = load_img(fileImg, target_size=(224, 224))
        image = img_to_array(image)
        image = image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
        image = preprocess_input(image)
        yhat = model.predict(image)
        return np.array(yhat).flatten()

    @staticmethod
    def conceitosFinal(fileImg):
        model = Model(inputs=ExtratorAtributos.ModelNN.input, outputs=ExtratorAtributos.ModelNN.get_layer("predictions").output)
        #ExtratorAtributos.Model.outputs = [ExtratorAtributos.Model.layers[-1].output]
        #print("2=", ExtratorAtributos.Model.outputs)
        image = load_img(fileImg, target_size=(224, 224))
        image = img_to_array(image)
        image = image.reshape((1, image.shape[0], image.shape[1], image.shape[2]))
        image = preprocess_input(image)
        yhat = model.predict(image)
        return np.array(yhat).flatten()
'''
    @staticmethod
    def entropia(fileImg):
        colorIm = Image.open(fileImg) #fromarray(imgCV)
        greyIm=colorIm.convert('L')
        greyIm=np.array(greyIm)
        signal = greyIm.flatten()
        lensig=signal.size
        symset=list(set(signal))
        propab=[np.size(signal[signal==i])/(1.0*lensig) for i in symset]
        ent=np.sum([p*np.log2(1.0/p) for p in propab])
        return [ent / 8]
