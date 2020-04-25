from os import system, chdir, mkdir
from os.path import isdir
from pathlib import Path
import argparse	

parser = argparse.ArgumentParser()

parser.add_argument("--preprocessing", help="preprocessing videos mode", action="store_true")
parser.add_argument("-i", "--folderVideos", help="a folder with videos")
parser.add_argument("-o", "--folderOut", help="folder to save data used by server")
parser.add_argument("-s", "--numberScenes", type=int, help="number of scenes considered when extracting attributes")
parser.add_argument("-n", "--numberVideos", type=int, help="maximum amount of videos that will be shown in exploratory mode")

parser.add_argument("--server", help="preprocessing videos mode", action="store_true")
parser.add_argument("-p", "--port", type=int, help="server port")
parser.add_argument("-d", "--folderData", help="folder with preprocessed data videos")

parser.add_argument("-v", "--verbose", help="increase output verbosity", action="store_true")
args = parser.parse_args()

if args.preprocessing and args.server:
	parser.error('cant use --preprocessing and --server')

if not args.preprocessing and not args.server:
	parser.error('have use --preprocessing or --server')

verbose = "-v" if args.verbose else ""

if args.preprocessing:
	if args.folderVideos == None or args.folderOut == None:
		parser.error('specify input and output folder')
	print("Generating scenes...")
	folderVideos = Path(args.folderVideos).absolute()
	folderOut = Path(args.folderOut).absolute()
	chdir("geracaoCenas")
	cmd = "python gerarCenas.py {} {} {}".format(folderVideos, folderOut, verbose)
	system(cmd)
	chdir("..")
	
	print("Extracting features...")
	folderThumb = Path(args.folderOut).absolute() / "thumbnails"
	fileOut = Path(args.folderOut).absolute() / "attr.pi"
	folderMSB = Path(args.folderOut).absolute() / "msb"
	numberScenes = 10 if args.numberScenes == None else args.numberScenes
	chdir("extracaoAtributos")
	cmd = "python geraAtributos.py {} {} {} {} --msb {} {}".format(Path(args.folderVideos).absolute(), folderThumb, fileOut, numberScenes, folderMSB, verbose)
	system(cmd)
	chdir("..")

	print("Generating data server...")
	folderData = Path(args.folderOut).absolute() / "data"
	if not isdir(folderData):
		mkdir(folderData)
	chdir("cluster")
	cmd = "python gerarDados.py {} {} {}".format(fileOut, args.numberVideos, folderData)
	system(cmd)
	chdir("..")

elif args.server:
	if args.folderData == None:
		parser.error('specify data folder')
	
	print("Initializing server...")
	port = 12345 if args.port == None else args.port
	featureFile = Path(args.folderData).absolute() / "attr.pi"
	folderData = Path(args.folderData).absolute() / "data"
	folderThumb = Path(args.folderData).absolute() / "thumbnails"
	chdir("server")
	cmd = "python server.py {} {} {} {}".format(port, featureFile, folderData, folderThumb)
	system(cmd)
	chdir("..")
