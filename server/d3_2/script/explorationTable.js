import {getDataFolder} from '../main.js'
import {getColorCategory} from '../categorias.js'
import {getAspectRatio, setIdArvore, getIdArvore, upExplorator} from './exploration.js'
import {setSubTreeNodes} from './tree.js'
import {drawContornos, getContornos} from './contorno.js'
import {openVideo, closeVideo, loadVideo} from '../video.js'
import {setVideoFocus} from '../tab.js'
import {getSearchMode} from '../pesquisa.js'

var paddingRect = 2;
var preloadedAllImages = true;
var selectedCell = null;
var contornos = [];
var mousePosition;
var fileNc = true;
var fileImg = true;
var similarity = false;
var lastSelectedLabel = null;

export function getLastSelectedLabel(){
	return lastSelectedLabel;
}

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
function plotDataTable(heatmap, dataFile, heatmapWidth, heatmapHeight, linkHeight, margin){
	d3.json(dataFile, function(tableData) {

	    var nCols = tableData[0].values.length;
	    var nRows = tableData.length;
	    var bandX = d3.scaleBand()
	        .domain(d3.range(nCols))
	        .range([0, heatmapWidth]);
	    var bandY = d3.scaleBand()
	        .domain(d3.range(nRows))
	        .range([0, heatmapHeight]);

	    //var heatColor = d3.scaleLinear().domain([0.0, 1.0]).range(['#00ff00', '#ff0000']);
	    var table = heatmap.append('g').attr('class', 'table')
	        .attr('transform', 'translate(' + (linkHeight + margin) + ',' + (linkHeight + margin) + ')');
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
	        //.style('fill', function (d) {c = d.value.split(","); return d3.hsl(parseInt(c[0]), 0.5, 0.5 )})
	        .style('opacity', 0.7)
	        .attr('x', function(d, i) {return bandX(i);})
	        .attr('width', bandX.bandwidth()-paddingRect)
	        .attr('height', bandY.bandwidth()-paddingRect)
	});
}

function preloadImages(srcs) {
    if (!preloadImages.cache) {
        preloadImages.cache = [];
    }
    var img;
    for (var i = 0; i < srcs.length; i++) {
        img = new Image();
        img.src = srcs[i];
        preloadImages.cache.push(img);
    }
}

//Matriz de dados de imagens
function plotDataTableImage(heatmap, dataFile, heatmapWidth, heatmapHeight, linkHeight, margin){
	d3.json(dataFile, function(tableData) {

	    var nCols = tableData[0].values.length;
	    var nRows = tableData.length;
	    var bandX = d3.scaleBand()
	        .domain(d3.range(nCols))
	        .range([0, heatmapWidth]);
	    var bandY = d3.scaleBand()
	        .domain(d3.range(nRows))
	        .range([0, heatmapHeight]);

	    //var heatColor = d3.scaleLinear().domain([0.0, 0.5, 1.0]).range(['#00ff00', '#ff0000', 'black']);
	    var table = heatmap.append('g').attr('class', 'table')
	        .attr('transform', 'translate(' + (linkHeight + margin) + ',' + (linkHeight + margin) + ')');
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
	        .style('opacity', 1.0)
	        .attr('preserveAspectRatio', getAspectRatio()) //xMidYMid meet, xMidYMid slice, none
	        .attr('x', function(d, i) {return bandX(i);})
	        .attr("xlink:href", function (d) {return d.value.split(":")[0] })
	        .attr('width', bandX.bandwidth()-paddingRect)
	        .attr('height', bandY.bandwidth()-paddingRect)
	        .each(function(d) {
	        	if(!preloadedAllImages){
		        	imgs = d.value.split(":");
		        	newImgs = []
		        	imgs.forEach(function(entry) {
		        		newImgs.push(entry);
		        	});
					preloadImages(newImgs);
				}
			})
	});
}


//Dendograma do eixo y
function plotYDen(heatmap, yDenFile, heatmapWidth, heatmapHeight, linkHeight, margin){
	d3.json(yDenFile, function(yRootData) {

	    var yRoot = d3.hierarchy(yRootData)
	        .sum(function(d) {
	            return d.length;
	        });

	    setYLinkScaledY(yRoot, yRoot.data.length = 0, linkHeight / yRoot.data.totalLength );
	    function setYLinkScaledY(d, y0, k) {
	        d.yLinkScaledY = (y0 += d.data.length) * k;
	        if (d.children) d.children.forEach(function(d) { setYLinkScaledY(d, y0, k); });
	    }

	    var yCluster = d3.cluster()
	        .size([heatmapHeight, linkHeight])
	        .separation(function() {return 1;});

	    yCluster(yRoot);

	    var total = yRoot.children[0].data.qtd + yRoot.children[1].data.qtd;

	    var yLinks = heatmap.append('g').attr('class', 'ylinks')
	        .attr('transform', 'translate(' + 0 + ',' + (linkHeight + margin) + ')');
	    yLinks.selectAll('.link')
	        .data(yRoot.descendants().slice(1))
	        .enter()
	        .append('path')
	        .attr("id", function(d) {return 'lid'+d.data.id})
	        .attr('class', 'link')
	        .attr("d", function(d) {
	            return "M" + (d.children === undefined ? 50 : d.yLinkScaledY) + "," + d.x
	                    + "L" + d.parent.yLinkScaledY + "," + d.x
	                    + " " + d.parent.yLinkScaledY + "," + d.parent.x;
	        }).style('stroke-width', function(d) {return (8*(d.data.qtd/total))+1 ; });
	        
	        //texto com quantidade nos
	        /*var thing = heatmap.append("g")
    		.attr("id", "thing")
    		.attr("class", "numberDendo")

	        thing.selectAll("text")
	        .data(yRoot.descendants().slice(1))
	        .enter()
	        .append("text")
    		.attr('x', function(d){ return d.parent.yLinkScaledY + 2})
    		.attr('y', function(d){ return d.x + linkHeight })
    		.text(function(d){ return d.data.qtd });*/

	    //Texto descricao do eixo y
	    var yNodes = heatmap.append('g').attr('class', 'ynodes')
	        .attr('transform', 'translate(' + (heatmapWidth + margin + 10) + ',' + (linkHeight + margin + 4) + ')');
	    yNodes.selectAll('.y-node')
	        .data(yRoot.descendants())
	        .enter().append('text')
	        .attr('class', function(d) {return 'y-node ' + (d.data.key ? d.data.key : '')})
	        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; })
	        .text(function(d) { return d.children ? '' : /*d.data.key + '('+*/ d.data.totalt/*+')'*/ })
	        .style('fill', function(d) { return getColorCategory(d.data.vid); });
	        //.attr('fill', function(d){ if (isVIDinResultImage(d.data.vid)) { return "yellow" } else { return "black" }  });
	        //.text(function(d) { return d.children ? '' : d.data.totalt });


	    //Atualiza lista de nos da arvore
	    setSubTreeNodes([]);
	    var nosArvore = [];
	    var desc = yRoot.descendants();
	   	for(var i = 0; i < desc.length; i++){
	   		//if(desc[i].data.key)
	   		nosArvore[desc[i].data.id] = true;
	   	}
	   	setSubTreeNodes(nosArvore);

	});
}

//Dendograma do eixo x
function plotXDen(heatmap, xDenFile, heatmapWidth, heatmapHeight, linkHeight, margin){
	d3.json(xDenFile, function(xRootData) {

	    var xRoot = d3.hierarchy(xRootData)
	        .sum(function(d) {
	            return d.length;
	        });

	    setXLinkScaledY(xRoot, xRoot.data.length = 0, linkHeight / xRoot.data.totalLength);

	    function setXLinkScaledY(d, y0, k) {
	        d.xLinkScaledY = (y0 += d.data.length) * k;
	        if (d.children) d.children.forEach(function(d) { setXLinkScaledY(d, y0, k); });
	    }
	    var xCluster = d3.cluster()
	        .size([heatmapWidth, linkHeight])
	        .separation(function() {return 1;});

	    xCluster(xRoot);

	    var xLinks = heatmap.append('g').attr('class', 'xlinks')
	        .attr('transform', 'translate(' + (linkHeight + margin) + ',' + 0 + ')');
	    
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
	    var xNodes = heatmap.append('g').attr('class', 'xnodes')
	        .attr('transform', 'translate(' + (linkHeight + margin - 5) + ',' + (heatmapHeight + margin + 20) + ')');
	    xNodes.selectAll('.x-node')
	        .data(xRoot.descendants())
	        .enter().append('text')
	        .attr('class', 'x-node')
	        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	        .text(function(d) { return d.children ? '' : d.data.key });

	});
}


//Barra de descrição
function plotToolTipGroup(svg){
	var tooltipGroup = svg.append('g').attr('class', 'tooltip');
	var tooltip = tooltipGroup.append('rect')
	        .attr('x', 0)
	        .attr('y', 0)
	        .attr('width', 250)
	        .attr('height', 30)
	        .style('opacity', 0)
	        .style('stroke-width', 1)
	        .style('fill', 'rgba(255, 255, 255, 0.9');
	return tooltipGroup;
}

function plotToolTipText(tooltipGroup){
	var tooltipText = tooltipGroup.append('text')
		        .attr('x', 0)
		        .attr('y', 0)
		        .attr('dx', 10)
		        .attr('dy', 20)
	return tooltipText;
}

function plotHeatmap(svg, dataFile, yDenFile, xDenFile, drawImage){

	var width = 1340,
    height = 700,
    linkHeight = 50,
    margin = 5,
    heatX = 30,
    heatY = 30,
    marginHeatX = heatX + 80,
    marginHeatY = heatY + 80,
    heatmapWidth = width - (linkHeight + marginHeatX),
    heatmapHeight = height - (linkHeight + marginHeatY);

    svg.attr('width', width).attr('height', height);

	//Heatmap e translacao para o centro
	var heatmap = svg.append('g').attr('class', 'heatmap')
	    .attr('transform', 'translate('+heatX+','+heatY+')');

	//Matriz de dados
	if(drawImage == true)
		plotDataTableImage(heatmap, dataFile, heatmapWidth, heatmapHeight, linkHeight, margin);
	else	
		plotDataTable(heatmap, dataFile, heatmapWidth, heatmapHeight, linkHeight, margin);

	//Dendograma do eixo y
	plotYDen(heatmap, yDenFile, heatmapWidth, heatmapHeight, linkHeight, margin);

	//Dendograma do eixo x
	if(xDenFile != null){
		plotXDen(heatmap, xDenFile, heatmapWidth, heatmapHeight, linkHeight, margin);
	}

	return heatmap;

}

function labelInteration (heatmap){
    var yLabels = heatmap.selectAll('.y-node');

    yLabels.on('mouseover', function(d) {
        d3.select(this).style('font-size', '14px');
    });

    yLabels.on('mouseout', function(d) {
        yLabels.style('font-size', '12px');
    });

    yLabels.on('click', function(d) {
        console.log(d.data.key);
        setVideoFocus(d.data.key)
    });

    yLabels.on('contextmenu', function(d) {

    	if (d3.event.pageX || d3.event.pageY) {
	          var x = d3.event.pageX;
	          var y = d3.event.pageY;
	      } else if (d3.event.clientX || d3.event.clientY) {
	          var x = d3.event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	          var y = d3.event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	      }
	    d3.select('#menulabel')
	      .style('position', 'absolute')
	      .style('left', x-100 + "px")
	      .style('top', y + "px")
	      .style('display', 'block');

	    lastSelectedLabel = d3.select(this);
	    d3.event.preventDefault();
    });

}

//Interacao com tabela
export function tableInteration(heatmap, tooltip){
	var rows = heatmap.select('.table').selectAll('.row');
	rows.selectAll('rect')
	.on('mouseover', function(d) {
        selectedCell = {row: d.parent, col: d.key, value: d.value};
        tooltip.select('rect').style('opacity', 1);
        d3.select(this)
            .style('opacity', 1)
            .style('stroke', '#000');;
            //.style('stroke-width', 2);
    })
	.on('mouseout', function(d) {
        selectedCell = null;
        tooltip.select('rect').style('opacity', 0);
        d3.select(this)
            .style('opacity', 0.7)
            .style('stroke-width', 0);
    });
}

//Interacao com tabela imagem
export function tableInterationImage(heatmap){
    var rows = heatmap.select('.table').selectAll('.row');
    rows.selectAll('image')
    /*.on('mouseover', function(d) {
        d3.select(this)
        .attr("xlink:href", function (d) {return d.value.split(":")[1] })
        .transition()
        .delay(500)
        .on("end", function(d){
            d3.select(this).attr("xlink:href", function (d) {return d.value.split(":")[2] })
        });
    })
    .on('mouseout', function(d) {
        d3.select(this)
        .attr("xlink:href", function (d) {return d.value.split(":")[0] });
    });*/

    rows.selectAll('image')
    .on('click', function(d) {
    	console.log(d.video + " " + d.tempo);
        openVideo();
        loadVideo(d.video, d.tempo);
    });
}

//Dendograma
function dendoInteration(heatmap){
    //Eixo y
    var yLinks = heatmap.selectAll('.ylinks');
    
    //Mouse sobre
    yLinks.on('mouseout', function(d) {
        yLinks.selectAll('.link').style('stroke-opacity',0.7);
    });

    yLinks.selectAll('.link').on('mouseover', function(p) {
        yLinks.selectAll('.link').filter(function(d) {
            if(p.descendants().indexOf(d) !== -1) return true;
        })
        .style('stroke-opacity', 1);
    });

    //Click
    yLinks.selectAll('.link').on('click', function(p) {
        yLinks.selectAll('.link').filter(function(d) {
            if(p.descendants().indexOf(d) !== -1) return true;
        }).call(function(d) {
            if (d.data()[0].data.qtd > 1)
                setIdArvore(d.data()[0].data.id); 
        });
    });

    //Eixo x
    var xLinks = heatmap.selectAll('.xlinks');
    
    //Mouse sobre
    xLinks.on('mouseout', function(p) {
        xLinks.selectAll('.link').style('stroke-opacity',0.7);
    });

    xLinks.selectAll('.link').on('mouseover', function(p) {
        xLinks.selectAll('.link').filter(function(d) {
            if(p.descendants().indexOf(d) !== -1) return true;
        }).style('stroke-opacity', 1);
    });
}

//Barra de descrição
export function toolTipInteration(svg, tooltipGroup, tooltipText){
	svg.on('mousemove', function() {
	    mousePosition = d3.mouse(this);
	    tooltipGroup.attr('transform', 'translate(' + (mousePosition[0] - (150 / 2) + 10) + ',' + (mousePosition[1] + 20) + ')');
	    tooltipText.text(function() {
	        return selectedCell ? '(' + selectedCell.col + ', ' + selectedCell.row + '): value: ' + selectedCell.value : ''
	    });
	});
}

function contornosArvInteration (heatmap){
	var rows = heatmap.select('.table').selectAll('.row');
	rows.selectAll('rect')
	.on('click', function(d){
    	contornos = getContornos(heatmap.select('.table'), d3.select(this));
    	upExplorator();
    });
}

export function setContornosArv(c){
	contornos = c;
}

export function setNcImgArv(fn, fi, simil=false){
	if(fileNc != fn) contornos = [];
	fileNc = fn;
	fileImg = fi;
	similarity = simil;
}

export function updateExplorator(svg){
	var dataFile = getDataFolder();
	
	if(getSearchMode() == false) similarity = false;
	if(similarity == true) dataFile = dataFile+"dataS"
	else dataFile = dataFile+"data"

	if(fileImg == true)
		dataFile = dataFile + "Img";
	if(fileNc == true)
		dataFile = dataFile + "NC";
	dataFile = dataFile + "_" + getIdArvore() + ".json";
	var yDenFile = getDataFolder()+"yden_"+getIdArvore()+".json";
	var xDenFile = getDataFolder()+"xden_"+getIdArvore()+".json";
	svg.selectAll("*").remove();
	createHeatArv(svg, dataFile, yDenFile, fileNc == false ? xDenFile : null, fileImg);
}

export function createHeatArv(svg, dataFile, yDenFile, xDenFile, drawImage){

	var heatmap = plotHeatmap(svg, dataFile, yDenFile, xDenFile, drawImage);

	drawContornos(svg, contornos);

	//Barra de descrição
	var toolTipGroup = plotToolTipGroup(svg);

	var toolTipText = plotToolTipText(toolTipGroup);

	//Interacao
	setTimeout(function(){
		if(drawImage){
			tableInterationImage(heatmap);
		}else{
			tableInteration(heatmap, toolTipGroup);
			contornosArvInteration(heatmap);
			toolTipInteration(svg, toolTipGroup, toolTipText);
		}
		dendoInteration(heatmap);
		labelInteration(heatmap);
	}, 1000);	
}
