import {createAll, updateAll, setScaleHeight, setLinkHeightY} from './collectionTable.js'

var scaleHeight = 1;

export function upCollection(){
	updateAll(svgAll);
}

d3.select("#btZoomMore").on('click', function(d) {
    if(scaleHeight > 0.1){
		scaleHeight -= 0.1;
		scaleHeight = parseFloat(scaleHeight.toFixed(2));
		console.log(scaleHeight);
		setScaleHeight(scaleHeight);
		upCollection();
	}
});

d3.select("#btZoomLess").on('click', function(d) {
    if(scaleHeight < 1){
		scaleHeight += 0.1;
		scaleHeight = parseFloat(scaleHeight.toFixed(2));
		console.log(scaleHeight);
		setScaleHeight(scaleHeight);
		upCollection();
	}
});

//slider
var slider = document.getElementById("myRange");

slider.addEventListener('change', function () {
  setLinkHeightY(parseInt(slider.value));
  upCollection();
}, false);

//collection table
var svgAll = d3.select('#svg3');

export function initCollection(){
	createAll(svgAll, "data/dataImgNC_all.json", "data/yden_all.json", null, true, 100);
}