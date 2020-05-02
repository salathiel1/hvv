# hvv

## Installing

### Requirements
* Anaconda https://www.anaconda.com/
* Python (recommended version: 3.6.9) https://www.python.org/
* scenedetect https://pypi.org/project/scenedetect/

### Instaling enviroment

1. Create enviroment in conda

```bash
conda env create -f environment.yml
```

2. Activate enviroment

```bash
conda activate servidor
```

3. Install cocoapi, from folder *cocoapi/PythonAPI* run:

```bash
pip install -e .
```

4. Download NIC model and copy to *extracaoAtributos/nic/result*. Link: https://drive.google.com/file/d/12OuDuiNkJ_sAhEy2MI7bLW8vLK_9kXyS/view

5. Download ELMO model and copy to *extracaoAtributos/elmo/variables*. Link:
https://drive.google.com/file/d/12UR8A1DOu8QJUbq0lzNeK1BKUL7OQf9w/view

## Using

### Quick test:

To test the tool with sample videos (from TRECVID 2019 V3C1) use:

```bash
python main.py --server -d ./baseTeste
```
### Preprocessing:

```bash
python main.py --preprocessing -i FOLDER_VIDEOS -o FOLDER_OUT -s NUMBER_SCENES -n NUMBER_VIDEOS --verbose
```

**FOLDER_VIDEOS**: a folder with videos to be processed (only videos)

**FOLDER_OUT**: folder to save data used by server

**NUMBER_SCENES**: number of scenes considered when extracting attributes (number of scenes that will be shown by the interface). Default value is 10.

**NUMBER_VIDEOS**: maximum amount of videos that will be shown in exploratory mode (must be less or equal than the total amount of videos).

### Server:

```bash
python main.py --server -p PORT -d FOLDER_DATA
```

**PORT**: server port. Default value is 12345.

**FOLDER_DATA**: folder with preprocessed data videos (same as FOLDER_OUT)


### Example:

Preprocessing videos in */home/salathiel/test* and save data in */home/salathiel/testOut* with *10* scenes each video and showing a maximum of *5* videos in exploratory mode:

```bash
python main.py --preprocessing -i /home/salathiel/test -o /home/salathiel/testOut -s 10 -n 5 --verbose
```

Using the data from preprocessing to start the server at port *12345*:

```bash
python main.py --server -p 12345 -d /home/salathiel/testOut
```
