//ver csv parse, carregar arquivos em variaveis (para memoria)
//https://github.com/d3/d3-dsv#csvParse

import {getDataFolder} from '../main.js'
import {createHeatArv, setContornosArv, updateExplorator} from './explorationTable.js'
import {createArv, updateTree} from './tree.js'
import {createArvCiculos, updateCirculos} from './circles.js'
import {createArvSunburst, updateSunburst} from './sunburst.js'
import {createArvTreemap, updateTreemap} from './treemap.js'

var upKey = true;
var aspectRatio = "none";
var idArvore = 1
var pilhaGrupo = [];
pilhaGrupo.push(idArvore);

//fontes de mudanca do id da arvore
export const TYPETREE = {
  PADRAO: 0,
  CIRCULOS: 1,
  SUNBURST: 2,
  TREEMAP: 3
}

export function getAspectRatio(){
	return aspectRatio;
}

export function setAspectRatio(_aspectRatio){
	aspectRatio = _aspectRatio;
}

export function getIdArvore(){
	return idArvore;
}

export function setIdArvore(id, font=TYPETREE.PADRAO){
	setContornosArv([]);
	
	pilhaGrupo.push(idArvore);
	idArvore = id
	console.log("id: " + idArvore);
	
	upExplorator();

	upTree();

	if(font != TYPETREE.CIRCULOS)
		updateCirculos(svgArvCirculos);
	
	if(font != TYPETREE.SUNBURST)
		updateSunburst(svgArvSunburst);

	if(font != TYPETREE.TREEMAP)
		updateTreemap(svgArvTreemap);
}

export function upExplorator(){
	updateExplorator(svg);
}

export function upTree(){
	updateTree(svgArv);
}

export function upCirculos(){
	updateCirculos(svgArvCirculos);
}

export function upSunburst(){
	updateSunburst(svgArvSunburst);
}

export function upTreemap(){
	updateTreemap(svgArvTreemap);
}

export function upAllTree(){
	updateTree(svgArv);
	updateCirculos(svgArvCirculos);
	updateSunburst(svgArvSunburst);
	updateTreemap(svgArvTreemap);
}

function backExp(){
	if(pilhaGrupo.length > 0){
		idArvore = pilhaGrupo.pop();
		console.log("id: " + idArvore);
		setContornosArv([]);
		upExplorator();
		upAllTree();
	}
}

d3.select("#btBackGN").on('click', backExp);

d3.select("#btAspectRatio").on('click', function(d) {
	if(aspectRatio == 'none')
		aspectRatio = "xMidYMid meet"
	else
		aspectRatio = 'none'
	upExplorator();
	updateTreemap(svgArvTreemap);
});

document.body.addEventListener('keydown', function(e) {
	if(upKey){
		if(e.key == 'b')
			backExp();
	}
});

document.body.addEventListener('keyup', function(e) {
	if(e.key == 'b') {
		upKey = true;
	}
});


//exploration table
var svg = d3.select('svg');

//tree
var svgArv = d3.select('#svgArv');

//cicle packing
var svgArvCirculos = d3.select('#svgArvCirculos');

//sunburst
var svgArvSunburst = d3.select('#svgArvSunburst');

//treemap
var svgArvTreemap = d3.select('#svgArvTreemap');

export function initExploration(){
	createHeatArv(svg, "data/dataImgNC_1.json", "data/yden_1.json", null, true);
	createArv(svgArv, "data/arvore.json");
	createArvCiculos(svgArvCirculos, "data/arvore.json");
	createArvSunburst(svgArvSunburst, "data/arvore.json");
	createArvTreemap(svgArvTreemap, "data/arvore.json");
}