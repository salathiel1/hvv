class Video:
    nome = ""
    totalTomadas = 0
    tomadas = None
    caracteristicas = None
    
    def __init__(self, nome, totalTomadas=0, tomadas=None, caracteristicas=None):
        self.nome = nome
        self.totalTomadas = totalTomadas
        self.tomadas = tomadas if tomadas is not None else []
        self.caracteristicas = caracteristicas if caracteristicas is not None else []

    def addTomada(self, tomada):
        self.tomadas.append(tomada)

    def normalizar(self, limiteTomadas):
        tam = len(self.tomadas)

        if tam < limiteTomadas:
            resto = limiteTomadas - tam
            
            if resto > tam:
                vezes = int(resto / tam) 
                resto -= vezes * tam
                for _ in range(0, vezes):
                    self.tomadas.extend(self.tomadas[0:tam])

            self.tomadas.extend(self.tomadas[0:resto])