import {getDataFolder} from '../main.js'
import {getIdArvore, setIdArvore, TYPETREE} from './exploration.js'

var formatNumber = d3.format(",d");
var margin = {top: 24, right: 0, bottom: 0, left: 0};

//cache for transitioning
var transitioning;
var x, y;
var backing = false;

function plotArvoreTreemap(svgtm, arvFile, width, height){

	 x = d3.scaleLinear()
	.domain([0, width])
	.range([0, width]);

	 y = d3.scaleLinear()
	.domain([0, height - margin.top - margin.bottom])
	.range([0, height - margin.top - margin.bottom]);

	var color = d3.scaleOrdinal()
	.range(d3.schemeCategory10
	.map(function(c) { c = d3.rgb(c); c.opacity = 0.6; return c; }));
	//var color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

	var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); };
	var treemap;

	updateDrillDown();

	function updateDrillDown() {
      svg = svgtm.attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.bottom - margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
        .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");      
        
      var grandparent = svg.append("g")
      .attr("class", "grandparent");
          
      grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);
          
      grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");      
         
     treemap = d3.treemap()
    .tile(d3.treemapResquarify.ratio(height / width * 0.5 * (1 + Math.sqrt(5))))
    .size([width, height])
    .round(false)
    .paddingInner(1);
	              
	d3.json(arvFile, function(data2) {
	   var root = d3.hierarchy(data2);

	   root.eachBefore(function(d) { d.id = (d.parent ? d.parent.id + "." : "") + d.data.vid; })
	     .sum((d) => d.qtd)
	     .sort(function(a, b) {
	     return b.height - a.height || b.value - a.value;
	    });
	          
	  initialize(root);
	  accumulate(root);
	  layout(root);
	  treemap(root);
	  display(root, svg);

	 });
	};

	function initialize(root) {
	  root.x = root.y = 0;
	  root.x1 = width;
	  root.y1 = height;
	  root.depth = 0;
	 }

	function accumulate(d) {
	  return (d._children = d.children)
	     ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0) : d.value;
	  }

	function layout(d) {
	  if (d._children) {
	    d._children.forEach(function(c) {  
	      c.x0 = d.x0 + c.x0 * d.x1;
	      c.y0 = d.y0 + c.y0 * d.y1;
	      c.x1 *= (d.x1 - d.x0);
	      c.y1 *= (d.y1 - d.y0);
	      c.parent = d;
	      layout(c);
	    });
	  }
	}

}

function display(d, g) {

  var svg = g;

  var g1 = svg.insert("g", ".grandparent")
    .datum(d)
    .attr("class", "depth");

  var grandparent = svg.select(".grandparent")

  grandparent
    .datum(d.parent)
    .on("click", function(d) {transition(d, svg);})
    .select("text")
    .text(name(d));

  var g = g1.selectAll("g")
    .data(d._children)
    .enter().append("g");
 
  g.filter(function(d) { return d._children; })
    .classed("children", true)
    .on("click", function(d) {transition(d, svg);});
  
  var children = g.selectAll(".tmchild")
    .data(function(d) { return d._children || [d]; })
    .enter().append("g");

    children.append("svg:image")
    .attr("class", "tmchild")
    .call(rect)
    .attr("xlink:href", function (d) { return d.data.imgs.split(":")[4] })
    .attr('preserveAspectRatio', "none"); //xMidYMid meet, xMidYMid slice, none

  g.append("svg:image")
    .attr("class", "tmparent")
    .call(rect)
    .attr("xlink:href", function (d) { return d.data.imgs.split(":")[4] })
    .attr('preserveAspectRatio', "none"); //xMidYMid meet, xMidYMid slice, none
  
    var t = g.append("text")
      .attr("class", "ptext")
      .attr("dy", ".75em")

  t.append("tspan")
      .attr("dy", "1.0em")
      .text(function(d) { return formatNumber(d.value); });
  
    t.call(text);
    
  return g;
}

/*function name(d) {
  return d.parent ? name(d.parent) + " / " + d.data.vid + " (" + formatNumber(d.value) + ")" : d.data.vid + " (" + formatNumber(d.value) + ")";
}*/

function name(d) {
  return d.parent ? name(d.parent) + " / " + formatNumber(d.value) : formatNumber(d.value);
}

function text(text) {
  text.selectAll("tspan")
    .attr("x", function(d) { return x(d.x0) + 6; })
  text.attr("x", function(d) { return x(d.x0) + 6; })
    .attr("y", function(d) { return y(d.y0) + 3; })
    .style("opacity", function(d) {
       var w = x(d.x1) - x(d.x0);
       return this.getComputedTextLength() < w - 6 ? 1 : 0; });
}

function rect(rect) {
  rect.attr("x", function(d) { return x(d.x0); })
    .attr("y", function(d) { return y(d.y0); })
    .attr("width", function(d) {
      var w = x(d.x1) - x(d.x0);
        return w;
    })
    .attr("height", function(d) { 
      var h = y(d.y1) - y(d.y0);
        return h;
    });
}

function transition(d, g, setId=true, time=750) {
	if (transitioning || !d) return;

	transitioning = true;
	var g1 = g.select(".depth");
	var g2 = display(d, g),
	t1 = g1.transition().duration(time),
	t2 = g2.transition().duration(time);

	x.domain([d.x0, d.x0 + (d.x1 - d.x0)]);
	y.domain([d.y0, d.y0 + (d.y1 - d.y0)]);

	g.style("shape-rendering", null);

	g.selectAll(".depth").sort(function(a, b) { 
	return a.depth - b.depth; });

	g2.selectAll("text").style("fill-opacity", 1); //0

	t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
	t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
	t1.selectAll("image").call(rect);
	t2.selectAll("image").call(rect);

	t1.remove().on("end", function() {
		g.style("shape-rendering", "crispEdges");
		transitioning = false;
	});

	if(d.depth == 0 && setId)
	    setIdArvore(1, TYPETREE.TREEMAP);

	if(d.data.qtd > 1 && setId)
	    setIdArvore(d.data.id, TYPETREE.TREEMAP);
}

function findPath(node, id) {
  
    if(node == undefined || !node.children)
        return [];

    var path = [];
    path.push(node);

    var dir = node.children[0];
    var esq = node.children[1];

    if(node.data.id == id){
    	return path;
    }else{
    	var pd = findPath(dir, id);
    	var pe = findPath(esq, id);
    	
    	if(pd.length > 0){
    		path = path.concat(pd);
    		return path;
    	}

    	if(pe.length > 0){
    		path = path.concat(pe);
    		return path;
    	}
    }

    return [];
}

function backToRoot(g, node){
	if(node.parent != null){
		transition(node.parent, g, false, 0);
		setTimeout(function(){
			backToRoot(g, node.parent);
		}, 100);
	}else{
		backing = false;
	}
}

function pathToNode(svgT){
	if(!backing){
		var g = svgT.select("g");
		var noded = d3.select(svgT.select(".depth").selectAll(".children").nodes()[0]).data()[0];
		var nodee = d3.select(svgT.select(".depth").selectAll(".children").nodes()[1]).data()[0];
		var pd = findPath(noded, getIdArvore());
		var pe = findPath(nodee, getIdArvore());
		var path = pd.length > 0 ? pd : pe;

		path.forEach(function(item, index){
			setTimeout(function(){
				transition(item, g, false, 0);
			}, 100*(index+1) );
		});
	}else{
		setTimeout(function(){
			pathToNode(svgT);
		}, 100);
	}
}

export function updateTreemap(svgArvTreemap){
	if(getIdArvore() == 1){
		svgArvTreemap.selectAll("*").remove();
		createArvTreemap(svgArvTreemap, getDataFolder()+"arvore.json")
	}else{
		createArvTreemap(svgArvTreemap, getDataFolder()+"arvore.json", true);
	}
}

export function createArvTreemap(svgT, arvFile, zoom=false){
	var width = 1300,
    height = 700;

    if(!zoom){
		  plotArvoreTreemap(svgT, arvFile, width, height);
    }else{
    	var g = svgT.select("g");
    	var node = d3.select(svgT.select(".depth").select("g").nodes()[0]).data()[0];
    	backing = true;
    	backToRoot(g, node);
    	pathToNode(svgT);
	}
}
