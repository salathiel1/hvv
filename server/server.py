from sys import argv
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from utilServer import getMimeType, salvarResults, updateData
import cgi
import numpy as np
import cv2
import os
from pathlib import Path
from indexador import Indexador
import argparse
import urllib.parse

HTML_FOLDER = Path("d3_2/")

parser = argparse.ArgumentParser()

parser.add_argument("port", type=int, help="server port")
parser.add_argument("featuresFile", help="file with extracted features")
parser.add_argument("dataFolder", help="folder with json files")
parser.add_argument("thumbFolder", help="folder with videos thumbnails")

args = parser.parse_args()	

class S(BaseHTTPRequestHandler):

    indexador = Indexador(args.featuresFile)
    
    def _set_response(self, mimetype="text/html", path=None, redirect=False):
        if redirect:
            self.send_response(301)
            self.send_header('Location', "http://localhost:"+args.port)
        else:
            self.send_response(200)

        if path != None:
            self.send_header('Last-Modified', self.date_time_string(os.path.getmtime(path)) )
            self.send_header('Content-Length', os.path.getsize(path))

        self.send_header('Content-type', mimetype)
        
        self.end_headers()

    def do_GET(self):
        if self.path == "/":
            self.path="/index.html"

        try:
            mimetype = getMimeType(self.path)
            if mimetype == "":
                return

            pathWeb = Path( urllib.parse.unquote(self.path) ).relative_to("/")
            
            #find in html, data, thumb and video folders
            filePath = HTML_FOLDER /  pathWeb
            if not filePath.is_file():
                filePath = Path(args.dataFolder).parent / pathWeb
            if not filePath.is_file():
                filePath = Path(args.thumbFolder) / pathWeb
            if not filePath.is_file():
                filePath = '/' / pathWeb


            if filePath.is_file():
                f = open(filePath, "rb")
                self._set_response(mimetype, filePath)
                self.wfile.write(f.read())
                f.close()
            else:
                self.send_error(404, self.path)


        except IOError:
            self.send_error(404, self.path)

    def send_file(self, filePath, mimetype):
        f = open(filePath, "rb")
        self._set_response(mimetype, filePath)
        self.wfile.write(f.read())
        f.close()

    def do_POST(self):
        form = cgi.FieldStorage(
                fp=self.rfile, 
                headers=self.headers,
                environ={'REQUEST_METHOD':'POST',
                            'CONTENT_TYPE':self.headers['Content-Type'],
            })

        if self.path=="/pesquisa_img":
            imageFormStr = form["imagem"].value
            limite = int(form["limit"].value)
            decoded = cv2.imdecode(np.frombuffer(imageFormStr, np.uint8), -1) # [:,:,::-1] RGB-> BGR
            videos = self.indexador.pesquisaImagem(decoded, limite)
            resposta = "Error"
            if limite > 1:
                salvarResults(videos, Path(args.dataFolder) / 'search', limite)
                resposta = "OK"
            self._set_response()
            self.wfile.write(resposta.encode('utf-8'))

        if self.path=="/pesquisa_text":
            pesquisa = form["pesquisa"].value
            limite = int(form["tlimit"].value)
            print("P:", pesquisa, " L:", limite)
            videos = self.indexador.pesquisaTexto(pesquisa, limite)
            resposta = "Error"
            if limite > 1:
                salvarResults(videos, Path(args.dataFolder) / 'search', limite)
                resposta = "OK"
            self._set_response()
            self.wfile.write(resposta.encode('utf-8'))

        if self.path=="/cluster_cat":
            formCats = form.getlist("item")
            if "unknown" in formCats:
                formCats.remove("unknown")
            resposta = "Error"
            print(formCats)
            
            if len(formCats) > 1:
                catOptions = {'threshold': float(form["threshold"].value)}
                print(catOptions);
                updateData(self.indexador.videos, Path(args.dataFolder), categories=formCats, catOptions=catOptions)
                resposta = "OK"
            
            self._set_response()
            self.wfile.write(resposta.encode('utf-8'))

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass

def run(server_class=ThreadedHTTPServer, handler_class=S, port=12345):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    try:
        print("Server online at port", port, "!")
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    
if __name__ == '__main__':

    run(port=args.port)