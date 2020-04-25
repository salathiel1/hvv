import copy
from collections import deque

class Arvore :
    __lastId = 1

    direita = None
    esquerda = None
    distanciaDir = 0
    distanciaEsq = 0
    folhaId = -1
    qtdFolha = 0
    iD = 0

    def __init__(self):
        self.iD = Arvore.__lastId
        Arvore.__lastId += 1

    @staticmethod
    def setLastId(lastId):
        Arvore.__lastId = lastId

    @staticmethod
    def gerarArvore(raiz, Z, X):
        arvore = Arvore()
        arvoreDir = Arvore()
        arvoreEsq = Arvore()
        arvore.distanciaDir = raiz[2]
        arvore.distanciaEsq = raiz[2]

        esqId = raiz[0]
        dirId = raiz[1]
        if(esqId >= len(X)):
            raizEsq = Z[int(esqId - len(X))]
            #arvore.distanciaEsq -= raizEsq[2]
            arvoreEsq = Arvore.gerarArvore(raizEsq, Z, X)
        else:
            arvoreEsq.folhaId = int(esqId)
            
        if(dirId >= len(X)):
            raizDir = Z[int(dirId - len(X))]
            #arvore.distanciaDir -= raizDir[2]
            arvoreDir = Arvore.gerarArvore(raizDir, Z, X)
        else:
            arvoreDir.folhaId = int(dirId)
        
        arvore.direita = arvoreDir
        arvore.esquerda = arvoreEsq

        return arvore

    def isFolha(self):
    	return self.direita == None and self.esquerda == None

    def maxAltura(self):
        return max(self.distanciaEsq, self.distanciaDir)

    def getLeafsInOrder(self):
        arr = []
        if self.esquerda != None:
            arr.extend(self.esquerda.getLeafsInOrder())
        if self.isFolha():
            arr.append(int(self.folhaId))
        if self.direita != None:
            arr.extend(self.direita.getLeafsInOrder())
        return arr

    def getNumLeafs(self):
        if self.isFolha():
            return 1
        else:
            num = 0
            if(self.direita != None):
                num += self.direita.getNumLeafs()
            if(self.esquerda != None):
                num += self.esquerda.getNumLeafs()
            return num
    
    def normalizaAltura(self, maxAltura):
        if(self.esquerda != None):
            self.distanciaEsq = self.distanciaEsq - self.esquerda.maxAltura()
        if(self.direita != None): 
            self.distanciaDir = self.distanciaDir - self.direita.maxAltura()

        if maxAltura != 0:
            self.distanciaDir = (self.distanciaDir/maxAltura) * 0.8
            self.distanciaEsq = (self.distanciaEsq/maxAltura) * 0.8
        else:
            self.distanciaDir = 0
            self.distanciaEsq = 0

        if(self.esquerda != None):
            self.esquerda.normalizaAltura(maxAltura)
        if(self.direita != None): 
            self.direita.normalizaAltura(maxAltura)

    def zeraAlturaLeafs(self):
        if self.esquerda != None:
            self.esquerda.zeraAlturaLeafs()
        if self.direita == None and self.esquerda == None:
            self.distanciaDir = 0
            self.distanciaEsq = 0
        if self.direita != None:
            self.direita.zeraAlturaLeafs()

    def internTrees(self):
        if self.direita == None and self.esquerda == None:
            return []
        elif self.direita != None and self.esquerda == None:
            return self.direita.internTrees() + [self]
        elif self.direita == None and self.esquerda != None:
            return self.esquerda.internTrees() + [self]
        elif self.direita != None and self.esquerda != None:
            return self.esquerda.internTrees() + self.direita.internTrees() + [self]

    def ajustaIndexs(self, indexs):
        if self.esquerda != None:
            self.esquerda.ajustaIndexs(indexs)
        if self.direita == None and self.esquerda == None:
            self.folhaId = indexs[int(self.folhaId)]
        if self.direita != None:
            self.direita.ajustaIndexs(indexs)

    def countLeafs(self):
        if (self.direita != None and self.esquerda != None):
            self.qtdFolha = self.getNumLeafs()
            self.direita.countLeafs()
            self.esquerda.countLeafs()
        elif (self.direita == None and self.esquerda == None):
            self.qtdFolha = 1

    def treePart(self, qtdFolhas):
        arv2 = Arvore()
        q = deque()
        q.append( (self, arv2) )

        while q:
            node, node2 = q.popleft()
            node2.folhaId = node.folhaId
            node2.distanciaDir = node.distanciaDir
            node2.distanciaEsq = node.distanciaEsq
            node2.qtdFolha = node.qtdFolha
            node2.iD = node.iD

            if node.esquerda != None and arv2.getNumLeafs() != qtdFolhas:
                node2.esquerda = Arvore()
                q.append( (node.esquerda, node2.esquerda) )
            if node.direita != None and arv2.getNumLeafs() != qtdFolhas:
                node2.direita = Arvore()
                q.append( (node.direita, node2.direita) )
        
        return arv2

    def copiaNormalizada(self):
        arvCopy = copy.deepcopy(self)
        arvCopy.normalizaAltura(self.maxAltura())
        arvCopy.zeraAlturaLeafs()
        return arvCopy

    def display(self):
        lines, _, _, _ = self._display_aux()
        for line in lines:
            print(line)

    def _display_aux(self):
       # No child.
        if self.direita is None and self.esquerda is None:
            line = '%s' % self.folhaId + " |" + str(self.iD)
            width = len(line)
            height = 1
            middle = width // 2
            return [line], width, height, middle

        # Only left child.
        if self.direita is None:
            lines, n, p, x = self.esquerda._display_aux()
            s = '%s' % self.folhaId + " |" + str(self.iD)
            u = len(s)
            first_line = (x + 1) * ' ' + (n - x - 1) * '_' + s
            second_line = x * ' ' + '/' + (n - x - 1 + u) * ' '
            shifted_lines = [line + u * ' ' for line in lines]
            return [first_line, second_line] + shifted_lines, n + u, p + 2, n + u // 2

        # Only right child.
        if self.esquerda is None:
            lines, n, p, x = self.direita._display_aux()
            s = '%s' % self.folhaId + " |" + str(self.iD)
            u = len(s)
            first_line = s + x * '_' + (n - x) * ' '
            second_line = (u + x) * ' ' + '\\' + (n - x - 1) * ' '
            shifted_lines = [u * ' ' + line for line in lines]
            return [first_line, second_line] + shifted_lines, n + u, p + 2, u // 2

        # Two children.
        left, n, p, x = self.esquerda._display_aux()
        right, m, q, y = self.direita._display_aux()
        s = '%s' % str(self.folhaId) + " |" + str(self.iD)
        u = len(s)
        first_line = (x + 1) * ' ' + (n - x - 1) * '_' + s + y * '_' + (m - y) * ' '
        second_line = x * ' ' + '/' + (n - x - 1 + u + y) * ' ' + '\\' + (m - y - 1) * ' '
        if p < q:
            left += [n * ' '] * (q - p)
        elif q < p:
            right += [m * ' '] * (p - q)
        zipped_lines = zip(left, right)
        lines = [first_line, second_line] + [a + u * ' ' + b for a, b in zipped_lines]
        return lines, n + m + u, max(p, q) + 2, n + u // 2