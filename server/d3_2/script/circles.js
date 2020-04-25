import {getDataFolder} from '../main.js'
import {getIdArvore, setIdArvore, TYPETREE} from './exploration.js'
import {plotToolTipArv, toolTipArvInteration} from './tree.js'


var view = null;

function plotArvoreCirculos(svg, arvFile, width, height, diameter, margin){
	svg.attr('width', width).attr('height', height);

	var g = svg.append("g").attr("transform", "translate(" + (diameter - (diameter/6)) + "," + diameter / 2 + ")");

	/*var color = d3.scaleLinear()
	.domain([-1, 5])
	.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
	.interpolate(d3.interpolateHcl);*/

	/*var color = d3.scaleSequential()
	.domain([10, 0])
	.interpolator(d3.interpolateCool);*/
	//interpolateWarm, interpolatePlasma, interpolateMagma, interpolateCool

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	/*var color = d3.scaleLinear()
    .domain([0, 10])
    .range(["green", "red"])
    .interpolate(d3.interpolateHcl);*/

	var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.json(arvFile, function(error, root) {
	if (error) throw error;

	root = d3.hierarchy(root)
	  .sum(function(d) { return d.qtd; })
	  .sort(function(a, b) { return b.value - a.value; });

	var focus = root,
	  nodes = pack(root).descendants(),
	  view;

	var circle = g.selectAll("circle")
	.data(nodes)
	.enter().append("circle")
	  .attr("class", function(d) { return d.parent ? d.children ? "nodeC" : "nodeC nodeC--leaf" : "nodeC nodeC--root"; })
	  .style("fill", function(d) { return d.children ? color(d.depth) : null; })
	  .on("click", function(d) { if (focus !== d) zoom(d, diameter, svg, margin), d3.event.stopPropagation(); });

	var text = g.selectAll("text")
	.data(nodes)
	.enter().append("text")
	  .attr("class", "labelC")
	  .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
	  .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
	  .text(function(d) { return d.data.qtd; });

	//svg.style("background", color(-1)).on("click", function() { zoom(root, diameter, svg, margin); });
	svg.on("click", function() { zoom(root, diameter, svg, margin); });

	zoomTo([root.x, root.y, root.r * 2 + margin], diameter, svg);

	});
}

const arvCZoomId = (id, svgC, diameter, margin) => {
	var d = svgC.select("g").selectAll("circle")
	.filter(function(d) {return d.data.id == id});
	
	zoom(d.data()[0], diameter, svgC, margin, false);
}


function zoom(d, diameter, svgC, margin, changeId=true) {
	var focus0 = focus; focus = d;

	if(changeId){
		if(d.data.qtd > 1)
	        setIdArvore(d.data.id, TYPETREE.CIRCULOS);

	    //raiz
	    if(d.depth == 0)
	    	setIdArvore(1, TYPETREE.CIRCULOS);
	}

	var transition = d3.transition()
	    .duration(d3.event.altKey ? 7500 : 750)
	    .tween("zoom", function(d) {
	      var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
	      return function(t) { zoomTo(i(t), diameter, svgC); };
	    });

	transition.selectAll("text")
	  .filter(function(d) {return (typeof d !== 'undefined')})
	  .filter(function(d) {return d.parent === focus || this.style.display === "inline"; })
	    .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
	    .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
	    .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}

function zoomTo(v, diameter, svgC) {
	var node = svgC.select("g").selectAll("circle,text");
	var circle = svgC.select("g").selectAll("circle")
	var k = diameter / v[2]; view = v;
	node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
	circle.attr("r", function(d) { return d.r * k; });
}

export function updateCirculos(svgArvCirculos){
	if(getIdArvore() == 1){
		svgArvCirculos.selectAll("*").remove();
		createArvCiculos(svgArvCirculos, getDataFolder()+"arvore.json")
	}else{
		createArvCiculos(svgArvCirculos, getDataFolder()+"arvore.json", true);
	}
}

export function createArvCiculos(svgC, arvFile, zoom=false){
	var width = 1300,
    height = 700,
    diameter = 700,
    margin = 20;

    if(!zoom){
		plotArvoreCirculos(svgC, arvFile, width, height, diameter, margin);
		var toolTipImg = plotToolTipArv(svgC);
		setTimeout(function(){
			toolTipArvInteration(svgC, toolTipImg, ".nodeC");
		}, 1000);
    }else{
		arvCZoomId(getIdArvore(), svgC, diameter, margin);
    }

}