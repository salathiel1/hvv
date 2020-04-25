import numpy as np

def subArray(array, indexs):
    arr = []
    for i in indexs:
        arr.append(array[i])
    return arr

def extendArray(arr):
    array = np.array(arr)
    return array.reshape(array.shape[0],-1)

def veticalExtendArray(arr):
    array = np.array(arr)
    return array.reshape(array.shape[1],-1)

#error
def f1(atributos):
    num = 0
    for i in range(0, len(atributos)):
        num += pow( int(atributos[i]*10), i+1) #x10 -> aceita numeros entre 0 e 1
    return num/len(atributos)

def f2(atributos):
    num = 0.0
    for i in range(0, len(atributos)):
        num += atributos[i] * (i+1)
    return num/len(atributos)

def f3(atributos):
    return float(np.linalg.norm(atributos))