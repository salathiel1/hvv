import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.manifold import TSNE 
from nltk.tokenize import RegexpTokenizer
from nltk.corpus import stopwords 
from collections import Counter
from scipy import spatial
from extracaoAtributos.extratorAtributos import ExtratorAtributos

def getColorArray(videos):
    tomadasAttrCor = []
    for v in videos:
        for t in v.tomadas:
            tomadasAttrCor.append(t.atributosCor)
    
    dim = 2 
    tsne = TSNE(n_components=dim, random_state=np.random.RandomState(8), n_iter=10000)
    x = StandardScaler().fit_transform(tomadasAttrCor)
    principalComponents = tsne.fit_transform(x)
    print("Kullback-Leibler divergence:", tsne.kl_divergence_ )
    #print(pca.explained_variance_ratio_.sum())
    #print("v=", pca.explained_variance_ratio_)
    principalComponents = principalComponents + abs(np.min(principalComponents))
    principalComponents = principalComponents / np.max(principalComponents)
    principalComponents = principalComponents * 320
    #principalComponents = principalComponents - 50
    principalComponents = principalComponents - 160
    #principalComponents[:, 0] += 50
    qtTomadasVid = len(videos[0].tomadas)
    return principalComponents.reshape(len(videos), qtTomadasVid, dim)

def cosine_distance(vect1, vect2):
    return spatial.distance.cosine(vect1, vect2)

def generateVideosCategories(videos, maxCategories=10):
    texts = []
    for v in videos:
        for t in v.tomadas:
            texts.append(t.caption)
    texts = " ".join(texts)
    stop_words = set(stopwords.words('english')) 
    tokenizer = RegexpTokenizer(r'\w+')
    word_tokens = tokenizer.tokenize(texts)
    filtered_sentence = [w for w in word_tokens if not w in stop_words]
    counts = Counter(filtered_sentence)
    categories = [ c[0] for c in counts.most_common(maxCategories)]
    return categories

def updateVideoCategories(videos, categories, catOptions={}):
    vects = ExtratorAtributos.elmo_vectors(categories)
    
    catVet = []
    for i in range(0, len(categories)):
        catVet.append( [categories[i], vects[i], 0] )
    catVet.append( ["unknown", [], 0] ) #unknown category, not use in comparation

    dictCat = {}

    thresh = 0.65
    if 'threshold' in catOptions:
        thresh = catOptions['threshold']

    for v in videos:
        distsV = []
        for t in v.tomadas:
            distsT = []
            for i in range(0, len(catVet)-1):
                c = catVet[i]
                d = cosine_distance(t.captionVect, c[1])
                distsT.append(d)
            distsV.append(distsT)
        sumDists = np.sum(np.array(distsV), axis=0)  / len(v.tomadas)
        #sumDists = [sum(i) / (len(catVet)-1) for i in zip(*distsV)] 
        minDist = min(sumDists)

        if minDist > thresh: #"unknown"
            dictCat[v.nome] = catVet[len(catVet)-1][0]
            catVet[len(catVet)-1][2] = catVet[len(catVet)-1][2] + 1
        else:    
            iMinDist = sumDists.tolist().index(minDist)
            catVet[iMinDist][2] = catVet[iMinDist][2] + 1
            dictCat[v.nome] = catVet[iMinDist][0]

    jsonCatCounter = {}
    for c in catVet:
        jsonCatCounter[c[0]] = c[2]

    return jsonCatCounter, dictCat
