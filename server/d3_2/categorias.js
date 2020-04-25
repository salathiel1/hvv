import {setIdArvore, getIdArvore} from './script/exploration.js'
import {getLastSelectedLabel} from './script/explorationTable.js'
import {upCollection} from './script/collection.js'
import {openTab} from '../tab.js'

var COOKIESEP = "|";

var colors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#0D00FF", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#ff006d", "#7f7f7f", "#fff000", "#bcbd22", "#99FF00", "#17becf", "#637939"];
var empty = false;
var sugestion = true;
var catCounter = {};
var dictCat = {};
var dictColor = {};
var colorI = 0;

window.newElement = newElement;

//salvar arquvivos dict e count

export function getColorCategory(videoName){
	var category = getVideoCategory(videoName);
	if(category == ""){
		return "black"
	}else if(dictColor[category] !== undefined){
		return dictColor[category];
	}else{
		var cookieDictColor = getDictColor();
		if(Object.keys(cookieDictColor).length > 0){
			dictColor = cookieDictColor;
			return dictColor[category];
		}else{
			dictColor[category] = colors[colorI % colors.length];
			colorI = colorI + 1;
			return dictColor[category];
		}
	}
}

export function getVideoCategory(name){
	if (Object.keys(dictCat).length === 0)
		dictCat = getDictCookie();
	if (Object.keys(dictCat).length === 0)
		updateDictCategories();
	if(dictCat[name] !== undefined)
		return dictCat[name];
	else
		return ""
}

export function changeCategory(name, newCategory){
	var lastCat = dictCat[name];
	dictCat[name] = newCategory;
	catCounter[lastCat] = catCounter[lastCat] - 1
	catCounter[newCategory] = catCounter[newCategory] + 1
	updateCookies(dictCat, catCounter);
	footDiv.selectAll("g").remove();
	plotCategoriesFooter(footDiv);
	setIdArvore(getIdArvore());
	upCollection();
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

//footer and menu
function plotCategoriesFooter(div){
	if (Object.keys(catCounter).length > 0){
			div.style("display", "block");
		    var ml = d3.select("#menulabel").select("ul");

		    var categories = Object.keys(catCounter);

		    categories.forEach(function(c) {
		    	var count = catCounter[c];

		    	if(!(!empty && count == 0)){
		    		var color = d3.rgb(dictColor[c]);
				    div.append('g')
				        .attr('class', 'cat')
				        .text(function(d) { return c + " ("+catCounter[c]+") "} )
				        .append("input")
				        .attr("type", "color")
				        .attr("value", function(d) { return rgbToHex(color.r, color.g, color.b); } )
				        .on("change", function(d){
				        	dictColor[c] = d3.event.target.value;
				        	updateCookies(null, null, dictColor);
				        	setIdArvore(getIdArvore());
							upCollection();
				        });
				        //.attr('class', 'square')
				        //.style('background-color', function(d) {return dictColor[c] } );

				        //<input type="color" name="favcolor" value="#ff0000">
			    }

			    ml.append("li")
					.attr('class', 'menu-option')
					.text(c)
					.on('click', function(d) {
						var videoName = getLastSelectedLabel().data()[0].data.vid;
						changeCategory(videoName, d3.select(this).text());
					});
		    });
	}
}

function plotCategoriesList(div, fileSugestionCategories){
	if(Object.keys(catCounter).length === 0){
		d3.json(fileSugestionCategories, function(error, sugData) {
			if(!error){
				sugData.forEach(function(d) {
					if(d != "unknown")
						addLI(div, d);
				});
			}
		});
	}else{
		var categories = Object.keys(catCounter);
		categories.forEach(function(c) {
			if(c != "unknown")
				addLI(div, c);
		});
	}
}

function addLI(listDiv, text){
	listDiv.append("li")
		.text(text)
		.append("span")
		.attr("class", "close")
		.text("\u00D7")
		.on('click', function(d) {
			d3.select(this.parentNode).remove();
		});
}

function newElement() {
	var inputValue = document.getElementById("myInput").value;
	
	if (inputValue === '') 
		alert("You must write something!");
	else 
		addLI(listElem, inputValue);

	document.getElementById("myInput").value = "";
}

function updateFormList(){
	formElem.selectAll(".inpOptCat").remove();
	var itens = listElem.selectAll("li");
	itens.each(function(d) {
		var catName = d3.select(this).text()
		catName = catName.substring(0, catName.length-1);
		formElem.append("input")
			.attr("name", "item")
			.attr("type", "hidden")
			.attr("class", "inpOptCat")
			.attr("value", catName);
	});
}

function updateDictCategories(){
	$.ajax({
    	dataType: "json",
	  	url: "data/dictcategories.json",
	  	async: false
	}).done(function(data){ 
	  	dictCat = data;
	  	updateCookies(dictCat, null);
	});
}

function initCountCategories(){
	catCounter = getCountCookie();

	if (Object.keys(catCounter).length === 0){
		$.ajax({
	    	dataType: "json",
		  	url: "data/categories.json",
		  	async: false
		}).done(function(data){ 
		  	catCounter = data;
		  	updateCookies(null, catCounter);
		});
	}

	plotCategoriesFooter(footDiv);
	plotCategoriesList(listElem, "data/sug_categories.json");
}

function getLastCookies(){
	var last = "{}"+COOKIESEP+"{}"+COOKIESEP+"{}";
	if(document.cookie.length > 0)
		last = document.cookie;

	return last.split(COOKIESEP);
}

function updateCookies(dict, count, color){
	var list = getLastCookies();

	if(count != null)
		document.cookie = list[0] + COOKIESEP + JSON.stringify(count) + COOKIESEP + list[2];
	

	list = getLastCookies();

	if(dict != null)
		document.cookie = JSON.stringify(dict) + COOKIESEP + list[1] + COOKIESEP + list[2];
	

	list = getLastCookies();

	if(color != null)
		document.cookie = list[0] + COOKIESEP + list[1] + COOKIESEP + JSON.stringify(color);
}

function getDictCookie(){
	var dictJ = document.cookie.split(COOKIESEP)[0];
	if(dictJ !== undefined && dictJ.length > 0)
		return JSON.parse(dictJ);
	else
		return {};
}

function getCountCookie(){
	var countJ = document.cookie.split(COOKIESEP)[1];
	if(countJ !== undefined && countJ.length > 0)
		return JSON.parse(countJ);
	else
		return {};
}

function getDictColor(){
	var colorC = document.cookie.split(COOKIESEP)[2];
	if(colorC !== undefined && colorC.length > 0)
		return JSON.parse(colorC);
	else
		return {};
}

function finishCluster(){
	$("#btncatCluster").attr("disabled", false);
    setIdArvore(1);
	upCollection();
	footDiv.selectAll("g").remove();
	listElem.selectAll("li").remove();
	initCountCategories();
	openTab(null, 'Arvore');
}

function sizeVisibleCategories(){
	var size = 0;
	var categories = Object.keys(catCounter);
	categories.forEach(function(c) {
		var count = catCounter[c];
		if(count > 0) size = size + 1;
	});

	return size;
}

d3.select("#emptycat").on("change",function(d){
	if(d3.select("#emptycat").property("checked")) empty = true
	else empty = false;
	var div = d3.select("#catdiv");
	div.selectAll(".cat").remove();
	if( (!empty && sizeVisibleCategories() > 6) || (empty && Object.keys(catCounter).length > 6)) 
		div.style("top", "87%");
	else
		div.style("top", "95%");
	plotCategoriesFooter(div);
});

$("#cluster_form").submit(function(event){
    event.preventDefault(); //prevent default action 
    $("#btncatCluster").attr("disabled", true);
    updateFormList();

    var post_url = $(this).attr("action"); //get form action url
    var request_method = $(this).attr("method"); //get form GET/POST method
    var form_data = new FormData(this); //Creates new FormData object
    $.ajax({
        url : post_url,
        type: request_method,
        data : form_data,
        contentType: false,
        cache: false,
        processData:false
    }).done(function(response){ 
    	updateDictCategories();
		finishCluster();
    });
});

window.addEventListener("click", e => {
  d3.selectAll('.menu').style('display', 'none');
});

window.addEventListener("scroll", e => {
  d3.selectAll('.menu').style('display', 'none');
});

var listElem = d3.select("#myUL");
var footDiv = d3.select("#catdiv");
var formElem = d3.select("#cluster_form");

export function initCategorias(){
	setTimeout(function(){
		initCountCategories();
	}, 1000);
}