import {setNcImgArv} from './script/explorationTable.js'
import {upExplorator} from './script/exploration.js'
import {setNcImgAll} from './script/collectionTable.js'
import {upCollection, initCollection} from './script/collection.js'
import {getSearchMode} from './pesquisa.js'

var upKey = true;
var noCol = {};
var useImg = {};
var similarity = {};
var colectionInit = false;
noCol['Arvore'] = true;
noCol['Videos'] = true;
useImg['Arvore'] = true;
useImg['Videos'] = true;
similarity['Arvore'] = false;
similarity['Videos'] = false;

var selectTab = "Arvore";
var event = null;

document.getElementById(selectTab).style.display = "block";
document.getElementById("Padrao").style.display = "block";

export function openTab(evt, tabName) {
	var i, tabcontent, tablinks;
	
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	
	document.getElementById(tabName).style.display = "block";
	if(evt != null)
		evt.currentTarget.className += " active";
	else{
		if(tabName == 'Arvore') d3.select("#tabExploration").classed('active',true);
		else if (tabName == 'Videos') d3.select("#tabCollection").classed('active',true);
	}
	selectTab = tabName;

	if(selectTab == 'Pesquisa' || selectTab == 'Categorias')
		hidenButtons();
	else
		showButtons();

	if(selectTab == 'Videos' && !colectionInit){
		initCollection();
		colectionInit = true;
	}

	upBtStatus();
}

export function openTabArv(evt, tabName) {
	var i, tabcontent, tablinks;
	
	tabcontent = document.getElementsByClassName("tabarv");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	
	tablinks = document.getElementsByClassName("tablinksarv");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	
	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
}

export function setVideoFocus(videoId) {
	openTab(null, 'Videos');
	var classVideo = "y-nodeAll " + videoId;
	var element = document.getElementsByClassName(classVideo)[0];
	element.focus();
	var b = element.getBoundingClientRect();
	window.scrollBy(b.x, b.y-100);
	d3.select(element)
		.transition()
		.duration(500)
		.delay(500)
		.style("font-size", function(d) { return (parseInt(d3.select(this).style("font-size"), 10) + 6) + "px"; } )
		.on("end", function(d){
            d3.select(this)
            .transition()
            .duration(5000)
            .style("font-size", function(d) { return (parseInt(d3.select(this).style("font-size"), 10) - 6) + "px"; } )
        });
}

function upTab() {
	if(selectTab == 'Arvore'){
		setNcImgArv(noCol['Arvore'], useImg['Arvore'], similarity['Arvore']);
		upExplorator();
	}else if (selectTab == 'Videos'){
		setNcImgAll(noCol['Videos'], useImg['Videos'], similarity['Videos']);
		upCollection();
	}

	upBtStatus();
}

function upBtStatus(){
	d3.select("#btImg").classed('active',useImg[selectTab]);
	d3.select("#btCor").classed('active',!useImg[selectTab]);
	d3.select("#btDraw").classed('active',!noCol[selectTab]);
	d3.select("#btSimilarity").classed('active',similarity[selectTab]);
	if (similarity[selectTab]) d3.select("#btCor").classed('active',false);
}

d3.select("#btDraw").on('click', function(d) {
	d3.select(this).classed('active',noCol[selectTab]);
	noCol[selectTab] = !noCol[selectTab];
	upTab();
});

d3.select("#btCor").on('click', function(d) {
	useImg[selectTab] = false;
	similarity[selectTab] = false;
	upTab();
});

d3.select("#btImg").on('click', function(d) {
	useImg[selectTab] = true;
	similarity[selectTab] = false;
	upTab();
});

d3.select("#btSimilarity").on('click', function(d) {
	similarity[selectTab] = true;
	useImg[selectTab] = false;
	upTab();
});

document.body.addEventListener('keydown', function(e) {
	if(upKey){
		if(e.key == 'c') {
			upKey = false;
			useImg[selectTab] = false;
			similarity[selectTab] = false;
			upTab();	
		}else if(e.key == 't'){ 
			upKey = false;
			useImg[selectTab] = true;
			similarity[selectTab] = false;
			upTab();
		}else if(e.key == 'h'){ 
			upKey = false;
			noCol[selectTab] = !noCol[selectTab];
			upTab();
		}else if(e.key == 's'){ 
			upKey = false;
			similarity[selectTab] = true;
			useImg[selectTab] = false;
			upTab();
		}
	}
});

document.body.addEventListener('keyup', function(e) {
	if(e.key == 'c' || e.key == 't' || e.key == 'h' || e.key == 'v' || e.key == 's') {
		upKey = true;
	}
});

function hidenButtons(){
	document.getElementById("btDraw").style.display = "none";
	document.getElementById("btCor").style.display = "none";
	document.getElementById("btImg").style.display = "none";
	document.getElementById("btSimilarity").style.display = "none";
}

function showButtons(){
	document.getElementById("btDraw").style.display = "";
	document.getElementById("btCor").style.display = "";
	document.getElementById("btImg").style.display = "";
	if(getSearchMode()) document.getElementById("btSimilarity").style.display = "";
}