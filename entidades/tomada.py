class Tomada:
    atributosImg = None
    atributosCor = None
    imgs = None
    tempo = '0'
    caption = ''
    captionVect = None
    similarity = 0

    def __init__(self, atributosImg=None, atributosCor=None, imgs=None, captionVect=None):
        self.atributosImg = atributosImg if atributosImg is not None else []
        self.atributosCor = atributosCor if atributosCor is not None else []
        self.imgs = imgs if imgs is not None else []
        self.captionVect = captionVect if captionVect is not None else []