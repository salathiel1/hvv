import {getDataFolder} from '../main.js'
import {getColorCategory} from '../categorias.js'
import {tableInterationImage, tableInteration, toolTipInteration} from './explorationTable.js'
import {getSearchMode} from '../pesquisa.js'

var preloadedAllImages = false;
var fileNcAll = true;
var fileImgAll = true;
var scaleHeight = 1;
var contornosAll = [];
var linkHeightY = 50;
var paddingRect = 2;
var similarity = false;

function fillColorTable(d){
	if(similarity == true){
		var heatColor = d3.scaleLinear().domain([0.0, 1.0]).range(['#ff0000', '#0000ff']);
		return heatColor(d.value)
	}else{
		var c = d.value.split(","); 
		return d3.lab(20, parseInt(c[0]), parseInt(c[1]));
	} 
}

//Matriz de dados
function plotDataTableAll(svg, heatmap, dataFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight){

	d3.json(dataFile, function(tableData) {
	    var nCols = tableData[0].values.length;
	    var nRows = tableData.length;

	    var heatmapHeight = videoHeight * nRows;
	    svg.attr('height', heatmapHeight+100);

	    var bandX = d3.scaleBand()
	        .domain(d3.range(nCols))
	        .range([0, heatmapWidth]);
	    var bandY = d3.scaleBand()
	        .domain(d3.range(nRows))
	        .range([0, heatmapHeight*scaleHeight]);

	    //var heatColor = d3.scaleLinear().domain([0.0, 0.5, 1.0]).range(['#00ff00','#ffff00', '#ff0000']);
	    var heatColor = d3.scaleLinear().domain([0.0, 1.0]).range(['#00ff00', '#ff0000']);
	    var table = heatmap.append('g').attr('class', 'table')
	        .attr('transform', 'translate(' + (linkHeightY + margin) + ',' + ( linkHeightX + margin) + ')');
	    var rows = table.selectAll('.row')
	        .data(tableData)
	        .enter().append('g')
	        .attr('class', 'row')
	        .attr('transform', function(d, i) {
	            return 'translate(0, ' + bandY(i) + ')';
	        });


	    rows.selectAll('rect')
	        .data(function(d) {d.values.map(function(i) {return i.parent = d.key}); return d.values; })
	        .enter().append('rect')
	        //.style('fill', function (d) {return heatColor(d.value)})
	        //.style('fill', function (d) {c = d.value.split(","); return d3.lab(parseInt(c[0]), parseInt(c[1]), parseInt(c[2]) )})
	        .style('fill', fillColorTable)
	        .style('opacity', 0.7)
	        .attr('x', function(d, i) {return bandX(i);})
	        .attr('width', bandX.bandwidth()-paddingRect)
	        .attr('height', bandY.bandwidth()-paddingRect)
	});
}

//Matriz de dados de imagens
function plotDataTableImageAll(svg, heatmap, dataFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight){
	d3.json(dataFile, function(tableData) {

	    var nCols = tableData[0].values.length;
	    var nRows = tableData.length;

	    var svgHeight = videoHeight * nRows;
	    svg.attr('height', svgHeight+100);

	    var bandX = d3.scaleBand()
	        .domain(d3.range(nCols))
	        .range([0, heatmapWidth]);
	    var bandY = d3.scaleBand()
	        .domain(d3.range(nRows))
	        .range([0, svgHeight*scaleHeight]);

	    //var heatColor = d3.scaleLinear().domain([0.0, 0.5, 1.0]).range(['#00ff00', '#ff0000', 'black']);
	    var table = heatmap.append('g').attr('class', 'table')
	        .attr('transform', 'translate(' + (linkHeightY + margin) + ',' + (linkHeightX + margin) + ')');
	    var rows = table.selectAll('.row')
	        .data(tableData)
	        .enter().append('g')
	        .attr('class', 'row')
	        .attr('transform', function(d, i) {
	            return 'translate(0, ' + bandY(i) + ')';
	        });


	    rows.selectAll('rect')
	        .data(function(d) {d.values.map(function(i) {return i.parent = d.key}); return d.values; })
	        .enter().append('svg:image')
	        //.style('fill', function (d) {return heatColor(d.value)})
	        .style('opacity', 0.9)
	        .attr('preserveAspectRatio', 'none')
	        .attr('x', function(d, i) {return bandX(i);})
	        .attr("xlink:href", function (d) {return d.value.split(":")[0] })
	        .attr('width', bandX.bandwidth()-paddingRect)
	        .attr('height', bandY.bandwidth()-paddingRect);
	        /*.each(function(d) {
	        	if(!preloadedAllImages){
		        	imgs = d.value.split(":");
		        	newImgs = []
		        	imgs.forEach(function(entry) {
		        		newImgs.push(entry);
		        	});
					preloadImages(newImgs);
					preloadedAllImages = true;
				}
			})*/
	});
}


//Dendograma do eixo y
function plotYDenAll(svg, heatmap, yDenFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight){
	d3.json(yDenFile, function(yRootData) {

	    var yRoot = d3.hierarchy(yRootData)
	        .sum(function(d) {
	            return d.length;
	        });

	    var nRows = yRoot.descendants().filter(function(d){return d.children;}).length + 1;
	   	var heatmapHeight = (videoHeight * nRows)*scaleHeight;

	    setYLinkScaledY(yRoot, yRoot.data.length = 0, linkHeightY / yRoot.data.totalLength);
	    function setYLinkScaledY(d, y0, k) {
	        d.yLinkScaledY = (y0 += d.data.length) * k;
	        if (d.children) d.children.forEach(function(d) { setYLinkScaledY(d, y0, k); });
	    }

	    var yCluster = d3.cluster()
	        .size([heatmapHeight, linkHeightY])
	        .separation(function() {return 1;});

	    yCluster(yRoot);

	    var yLinks = heatmap.append('g').attr('class', 'ylinks')
	        .attr('transform', 'translate(' + 0 + ',' + (linkHeightX + margin) + ')');
	    yLinks.selectAll('.link')
	        .data(yRoot.descendants().slice(1))
	        .enter()
	        .append('path')
	        .attr("id", function(d) {return 'lid'+d.data.id})
	        .attr('class', 'link')
	        .attr("d", function(d) {
	            return "M" + d.yLinkScaledY + "," + d.x
	                    + "L" + d.parent.yLinkScaledY + "," + d.x
	                    + " " + d.parent.yLinkScaledY + "," + d.parent.x;
	        })
	        
	        //texto com quantidade nos
	        /*var thing = heatmap.append("g")
    		.attr("id", "thing")
    		.style("fill", "navy");

	        thing.selectAll("text")
	        .data(yRoot.descendants().slice(1))
	        .enter()
	        .append("text")
    		.style("font-size", "10px")
    		.attr('x', function(d){ return d.parent.yLinkScaledY + 2})
    		.attr('y', function(d){ return d.x + 50 })
    		.text(function(d){ return d.data.qtd });*/

    	//tamanho fonte
    	var fontSize = 12 * scaleHeight;

	    //Texto descricao do eixo y
	    var yNodes = heatmap.append('g').attr('class', 'ynodes')
	        .attr('transform', 'translate(' + (heatmapWidth + margin + 10) + ',' + ( margin + linkHeightX) + ')');
	    yNodes.selectAll('.y-nodeAll')
	        .data(yRoot.descendants())
	        .enter().append('text')
	        .attr('class', function(d) {return 'y-nodeAll ' + (d.data.key > -1 ? d.data.key : '')})
	        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
	        .text(function(d) { return d.children ? '' : d.data.key + '('+ d.data.totalt+')' })
	        //.text(function(d) { return d.children ? '' : d.data.totalt })
	        .style('fill', function(d) { return d.children ? '' : getColorCategory(d.data.vid); })
	        .style("font-size", fontSize+"px");

	});
}

//Dendograma do eixo x
function plotXDenAll(svg, heatmap, xDenFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin){
	d3.json(xDenFile, function(xRootData) {
		var xRoot = d3.hierarchy(xRootData)
	        .sum(function(d) {
	            return d.length;
	        });

	    setXLinkScaledY(xRoot, xRoot.data.length = 0, linkHeightX / xRoot.data.totalLength);

	    function setXLinkScaledY(d, y0, k) {
	        d.xLinkScaledY = (y0 += d.data.length) * k;
	        if (d.children) d.children.forEach(function(d) { setXLinkScaledY(d, y0, k); });
	    }
	    var xCluster = d3.cluster()
	        .size([heatmapWidth, linkHeightX])
	        .separation(function() {return 1;});

	    xCluster(xRoot);

	    var xLinks = heatmap.append('g').attr('class', 'xlinks')
	        .attr('transform', 'translate(' + (linkHeightY + margin) + ',' + 0 + ')');
	    
	    xLinks.selectAll('.link')
	        .data(xRoot.descendants().slice(1))
	        .enter().append('path')
	        .attr('class', 'link')
	        .attr("d", function(d) {
	            return "M" + d.x + "," + d.xLinkScaledY
	                    + "L" + d.x + "," + d.parent.xLinkScaledY
	                    + " " + d.parent.x + "," + d.parent.xLinkScaledY;
	        })


	    //Texto descricao do eixo x
	    /*var xNodes = heatmap.append('g').attr('class', 'xnodes')
	        .attr('transform', 'translate(' + (linkHeight + margin - 5) + ',' + (heatmapHeight + margin + 20) + ')');
	    xNodes.selectAll('.x-node')
	        .data(xRoot.descendants())
	        .enter().append('text')
	        .attr('class', 'x-node')
	        .style("text-anchor", 'start')
	        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	        .text(function(d) { return d.children ? '' : d.data.key });*/

	});
}

//Barra de descrição
function plotToolTipGroupAll(svg){
	var tooltipGroup = svg.append('g').attr('class', 'tooltip');
	var tooltip = tooltipGroup.append('rect')
	        .attr('x', 0)
	        .attr('y', 0)
	        .attr('width', 250)
	        .attr('height', 30)
	        .style('opacity', 0)
	        .style('stroke', '#000')
	        .style('stroke-width', 1)
	        .style('fill', 'rgba(255, 255, 255, 0.9');
	return tooltipGroup;
}

function plotToolTipTextAll(tooltipGroup){
	var tooltipText = tooltipGroup.append('text')
		        .attr('x', 0)
		        .attr('y', 0)
		        .attr('dx', 10)
		        .attr('dy', 20)
	return tooltipText;
}

function contornosAllInteration(heatmap){
	var rows = heatmap.select('.table').selectAll('.row');
	rows.selectAll('rect')
	.on('click', function(d){
    	var c = getContornos(heatmap.select('.table'), d3.select(this));
    	setContornosAll(c);
    	updateAll();
    });
}

function plotHeatmapAll(svg, dataFile, yDenFile, xDenFile, drawImage){

	var width = 1340,
    videoHeight = 60,
    linkHeightX = 50,
    margin = 5,
    heatX = 30,
    heatY = 30,
    marginHeatX = heatX + 80,
    heatmapWidth = width - (linkHeightY + marginHeatX);

    svg.attr('width', width);

	//Heatmap e translacao para o centro
	var heatmap = svg.append('g').attr('class', 'heatmap')
	    .attr('transform', 'translate(' + heatX + ',' + heatY + ')');

	//Matriz de dados
	if(drawImage == true)
		plotDataTableImageAll(svg, heatmap, dataFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight);
	else	
		plotDataTableAll(svg, heatmap, dataFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight);

	//Dendograma do eixo y
	plotYDenAll(svg, heatmap, yDenFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin, scaleHeight);

	//Dendograma do eixo x
	if(xDenFile != null){
		plotXDenAll(svg, heatmap, xDenFile, heatmapWidth, videoHeight, linkHeightX, linkHeightY, margin);
	}

	return heatmap;

}

export function setNcImgAll(fn, fi, simil=false){
	fileNcAll = fn;
	fileImgAll = fi;
	similarity = simil;
}

export function setContornosAll(c){
	contornosAll = c;
}

export function setScaleHeight(s){
	scaleHeight = s;
}

export function setLinkHeightY(lh){
	linkHeightY = lh;
}

export function updateAll(svgAll){
	var dataFile = getDataFolder();

	if(getSearchMode() == false) similarity = false;
	if(similarity == true) dataFile = dataFile+"dataS"
	else dataFile = dataFile+"data"

	if(fileImgAll == true)
		dataFile = dataFile + "Img";
	if(fileNcAll == true)
		dataFile = dataFile + "NC";
	dataFile = dataFile + "_all.json";
	var yDenFile = getDataFolder()+"yden_all.json";
	var xDenFile = getDataFolder()+"xden_all.json";
	svgAll.selectAll("*").remove();
	createAll(svgAll, dataFile, yDenFile, fileNcAll == false ? xDenFile : null, fileImgAll, linkHeightY);
	//drawContornos(svgAll, contornosAll);
}

export function createAll(svg, dataFile, yDenFile, xDenFile, drawImage){

	var heatmap = plotHeatmapAll(svg, dataFile, yDenFile, xDenFile, drawImage, linkHeightY);

	//Barra de descrição
	var toolTipGroup = plotToolTipGroupAll(svg);

	var toolTipText = plotToolTipTextAll(toolTipGroup);

	//Interacao
	setTimeout(function(){
		if(drawImage){
			tableInterationImage(heatmap);
		}else{
			tableInteration(heatmap, toolTipGroup);
			//contornosAllInteration(heatmap)
			toolTipInteration(svg, toolTipGroup, toolTipText);
		}
	}, 1000);
}