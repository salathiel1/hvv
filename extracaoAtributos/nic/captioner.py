#!/usr/bin/env python
#! encoding=UTF-8


import glob
import os

import sys
sys.path.append( os.path.dirname(os.path.abspath(__file__)) )

import numpy as np
from PIL import Image
import json

import chainer
from chainer import serializers

import datasets
from model import ImageCaptionModel

from pathlib import Path

class Captioner():

    vocab = None
    ivocab = None
    model = None
    results = dict()

    def __init__(self):
        basePath = Path(os.path.dirname(os.path.abspath(__file__)))

        # Set path to annotation files
        train_anno = basePath / "data/annotations/captions_train2014.json"
        val_anno =  basePath / "data/annotations/captions_val2014.json"
        mscoco_root = 'data'
        dataset_name = 'mscoco'
        rnn = 'nsteplstm'
        amodel = basePath / "result/model_50000"

        # Load the dataset to obtain the vocabulary, which is needed to convert
        # predicted tokens into actual words
        train, _ = datasets.get_mscoco(
            mscoco_root, train_anno=train_anno, val_anno=val_anno, dataset_name=dataset_name)
        
        self.vocab = train.vocab
        self.ivocab = {v: k for k, v in self.vocab.items()}
        self.model = ImageCaptionModel(len(train.vocab), rnn=rnn)
        serializers.load_npz(amodel, self.model)



    def generateCaptioning(self, imgPaths, batch_size=8, max_caption_length=30):
        self.results = dict()
        img_paths = sorted(imgPaths)

        if not img_paths:
            raise IOError('No images found for the given path')

        img_paths = np.random.permutation(img_paths)
        for i in range(0, len(img_paths), batch_size):
            img_paths_sub = img_paths[i:i + batch_size]
            imgs = []
            for img_path in img_paths_sub:
                img = Image.open(img_path)
                img = self.model.prepare(img)
                imgs.append(img)
            imgs = np.asarray(imgs)

            bos = self.vocab['<bos>']
            eos = self.vocab['<eos>']
            with chainer.using_config('train', False), \
                    chainer.no_backprop_mode():
                captions = self.model.predict(
                    imgs, bos=bos, eos=eos, max_caption_length=max_caption_length)
            captions = chainer.backends.cuda.to_cpu(captions)

            # Predicted captions
            for file_name, caption in zip(img_paths_sub, captions):
                caption = ' '.join(self.ivocab[token] for token in caption)
                caption = caption.replace('<bos>', '')
                end = caption.find('<eos>')
                caption = caption[:end].strip()
                # caption = caption.replace('<bos>', '').replace('<eos>', '').strip()
                self.results[file_name] = caption

    def getCaptioning(self, imgPath):
        return self.results[imgPath]
