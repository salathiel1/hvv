import {getDataFolder} from '../main.js'
import {getIdArvore, setIdArvore, TYPETREE} from './exploration.js'
import {plotToolTipArv, toolTipArvInteration} from './tree.js'

var changeIdSunburst = true;

function plotArvoreSunburst(svg, arvFile, width, height){

	svg.attr('width', width).attr('height', height);

	var radius = (Math.min(width, height) / 2) - 10;

	var formatNumber = d3.format(",d");

	var x = d3.scaleLinear()
	    .range([0, 2 * Math.PI]);

	var y = d3.scaleSqrt()
	    .range([0, radius]);

	var color = d3.scaleOrdinal(d3.schemeCategory20);

	var partition = d3.partition();

	var arc = d3.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


	svg = svg.append("g")
	    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

	d3.json(arvFile, function(error, root) {
	  if (error) throw error;
	  
	  root = d3.hierarchy(root);
	  root.sum(function(d) { return d.qtd; });
	  svg.selectAll("path")
	      .data(partition(root).descendants())
	    .enter().append("path")
	      .attr("class", "nodeSun")
	      .attr("d", arc)
	      .style("fill", function(d) { return color((d.children ? d : d.parent).data.vid); })
	      .on("click", click)
	    .append("title")
	      .text(function(d) { return d.data.vid + "\n" + formatNumber(d.value); });
	});

	function click(d) {
	  if(changeIdSunburst){
		  if(d.data.qtd > 1)
	        setIdArvore(d.data.id, TYPETREE.SUNBURST);
		  
		  if(d.depth == 0)
	    	setIdArvore(1, TYPETREE.SUNBURST);
      }
      changeIdSunburst = true;
	  svg.transition()
	      .duration(750)
	      .tween("scale", function() {
	        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
	            yd = d3.interpolate(y.domain(), [d.y0, 1]),
	            yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
	        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
	      })
	    .selectAll("path")
	      .attrTween("d", function(d) { return function() { return arc(d); }; });
	}

	d3.select(self.frameElement).style("height", height + "px");
}


function zoomIDSunbust(svgS, id){
	var path = svgS.select("g").selectAll("path")
	.filter(function(d) {return d.data.id == id})
	
	changeIdSunburst = false;
	
	path.dispatch('click');
}

export function updateSunburst(svgArvSunburst){
	if(getIdArvore() == 1){
		svgArvSunburst.selectAll("*").remove();
		createArvSunburst(svgArvSunburst, getDataFolder()+"arvore.json")
	}else{
		createArvSunburst(svgArvSunburst, getDataFolder()+"arvore.json", true);
	}
}

export function createArvSunburst(svgS, arvFile, zoom=false){
	var width = 960,
    height = 700;

    if(!zoom){
		plotArvoreSunburst(svgS, arvFile, width, height);
		var toolTipImg = plotToolTipArv(svgS);
		setTimeout(function(){
			toolTipArvInteration(svgS, toolTipImg, ".nodeSun");
		}, 1000);
    }else{
		zoomIDSunbust(svgS, getIdArvore());
	}
}
