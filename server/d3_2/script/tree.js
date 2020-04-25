import {getDataFolder} from '../main.js'
import {getColorCategory} from '../categorias.js'
import {getIdArvore, setIdArvore, upExplorator} from './exploration.js'

var backTranformArv = null;
var mousePosition = null;
var nosArvore = [];//index i guarda true se o no i pertencer a subarvore mostrada
var timeOutImgs;

export function plotToolTipArv(svg){
	var tooltipArv = svg.append("svg:image")
	.attr('x', 0)
	.attr('y', 0)
	.attr('width', 0)
	.attr('height', 0)
	.attr("xlink:href", "teste.jpg")
	.style('opacity', 0);

	return tooltipArv;
}

function plotArvore(svg, arvFile, width, height){
	svg.attr('width', width).attr('height', height);
	
	var g = svg.append("g");
	if(backTranformArv == null) 
		g.attr("transform", "translate(10,0)");
	else
		g.attr("transform", backTranformArv);

	function myDelta() {
	  return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / 5000;
	}

	var zoom = d3.zoom().wheelDelta(myDelta).on("zoom", function () {
		g.attr("transform", d3.event.transform)
		backTranformArv = g.attr("transform");
 	})

	svg.call(zoom);

	var treemap = d3.tree()
	    .size([height+1000, width]);

	d3.json(arvFile, function(data) {
		var nodes = d3.hierarchy(data, function(d) {
			return d.children;
		});

		//no raiz com id 1
		nodes["data"]["id"] = 1

		nodes = treemap(nodes);

		var link = g.selectAll(".linkArv")
		.data( nodes.descendants().slice(1))
		.enter().append("path")
		.attr("class", "linkArv")
		.style("stroke", function(d){ 
			if (nosArvore[d.data.id] == true) 
				return "#f00"
			else
				return "#ccc"
		})
		.attr("d", function(d) {
		   return "M" + d.y + "," + d.x
		     + "C" + (d.y + d.parent.y) / 2 + "," + d.x
		     + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
		     + " " + d.parent.y + "," + d.parent.x;
		});

		var node = g.selectAll(".nodeArv")
		.data(nodes.descendants())
		.enter().append("g")
		.attr("class", "nodeArv")
		.attr("transform", function(d) { 
		  return "translate(" + d.y + "," + d.x + ")"; 
		});

		var noSize = 4

		node.append("circle")
		.attr("r", function(d) {
			if(d.data.id == getIdArvore()) return noSize * 2.5;
			else return noSize;
		})
		.style("fill", function(d){
			if(d.data.id == 1) return "gray"
			else return getColorCategory(d.data.vid);
		}).on("mouseover", function(d) {
			d3.select(this).attr('r', noSize * 2);
		}).on("mouseout", function(d){
			d3.select(this).attr('r', function(d) {
				if(d.data.id == getIdArvore()) return noSize * 2.5;
				else return noSize;
			});
		});

		/*node.append("text")
		.attr("dy", ".35em")
		.attr("x", function(d) { return d.children ? -noSize -4 : noSize+4 })
		.style("text-anchor", function(d) { 
			return d.children ? "end" : "start"; 
		})
		.text(function(d) { return d.data.key; })
		.style("font-size", "10px");*/
	});
}



//Barra de descrição
export const toolTipArvInteration = (svgArv, tooltipImg, classNode=".nodeArv") => {
	svgArv
	.on('mouseover', function() {
	    mousePosition = d3.mouse(this);
	})

	svgArv.selectAll(classNode)
	.on('mouseover', function(d) {
		if(d.depth > 0){
			var imgs = d.data.imgs.split(":");
			tooltipImg.attr('width', 150);
			tooltipImg.attr('height', 150);
			tooltipImg.attr("xlink:href", function (p) {return imgs[0] })
		    tooltipImg.attr('transform', 'translate(' + (mousePosition[0] - (150 / 2) + 10) + ',' + (mousePosition[1] + 20) + ')');
		    tooltipImg.style('opacity', 1);
		    timeOutImgs = setTimeout(function(){
		    	changeImgToolTipArv(tooltipImg, imgs, 1);
		    }, 500);
		}
	})
	.on('mouseout', function(d) {
		clearTimeout(timeOutImgs);
		tooltipImg.attr('width', 0);
		tooltipImg.attr('height', 0);
		tooltipImg.attr('transform', 'translate(0,0)');
        tooltipImg.style('opacity', 0);
    });
}

const changeImgToolTipArv = (tooltipImg, imgs, i) => {
	tooltipImg.attr("xlink:href", function (p) {return imgs[i] })
	timeOutImgs = setTimeout(function(){
    	changeImgToolTipArv(tooltipImg, imgs, (i+1)%(imgs.length) );
    }, 500);
}

const arvInteration = (svgArv) => {
    svgArv.selectAll(".nodeArv")
    .on('click', function(d) {
    	if(d.data.qtd > 1)
            setIdArvore(d.data.id);

    	//raiz
    	if(d.depth == 0)
    		setIdArvore(1);
    })
}

function paintNodes(svgA){
	svgA.selectAll(".nodeArv")
	.select("circle")
	.style("fill", function(d){
			if(d.data.id == getIdArvore()){
				return "red"
			}else{
				if(nosArvore[d.data.id] == true)
					return "green"
				else
					return "blue"
			}
		});
}

export function setSubTreeNodes(_nosArvore){
	nosArvore = _nosArvore;
}

export function updateTree(svgA){
	svgA.selectAll("*").remove();
	createArv(svgA, getDataFolder()+"arvore.json");
}

export function createArv(svgA, arvFile){

	var width = 1340,
    height = 700;
    var toolTipImg;

    setTimeout(function(){
		plotArvore(svgA, arvFile, width, height);
		toolTipImg = plotToolTipArv(svgA);
	}, 100);

	
	//Interacao
	setTimeout(function(){

		arvInteration(svgA);
		toolTipArvInteration(svgA, toolTipImg);
		//paintNodes(svgA);
	}, 1000);

}