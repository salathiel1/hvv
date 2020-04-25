

/*const distanciaCor = (rect1, rect2) => {
	var corRGB1 = rect1.__data__.value.split(",");
	var corRGB2 = rect2.__data__.value.split(",");
	var cor1H = d3.hsl(d3.rgb(corRGB1[0],corRGB1[1],corRGB1[2])).h;
	var cor2H = d3.hsl(d3.rgb(corRGB2[0],corRGB2[1],corRGB2[2])).h;
	return Math.abs(cor1H - cor2H);
}*/

/*const distanciaCor = (rect1, rect2) => {
	var corRGB1 = rect1.__data__.value.split(",");
	var corRGB2 = rect2.__data__.value.split(",");
	return Math.sqrt( ((corRGB1[0]-corRGB2[0])**2) +  ((corRGB1[1]-corRGB2[1])**2)  + ((corRGB1[2]-corRGB2[2])**2) );
}*/

function distanciaCor(rect1, rect2){
	var corRGB1 = rect1.__data__.value.split(",");
	var corRGB2 = rect2.__data__.value.split(",");
	return Math.sqrt( ((corRGB1[0]-corRGB2[0])**2) +  ((corRGB1[1]-corRGB2[1])**2) );
}



function recContorno(rectIni, table, visitados, i, j, lenLinhas, lenColunas){
	var contFinal = [];

	if(visitados[i][j] == 0){
		visitados[i][j] = 1
		var borda = [];
		
		//esquerda
		if(j-1 >= 0){
			if(visitados[i][j-1] == 0){
				if(distanciaCor(rectIni, table[i][j-1]) < threshCor){
					var r = recContorno(rectIni, table, visitados, i, j-1, lenLinhas, lenColunas);
					contFinal.push(...r);
				}
				else
					borda.push('e');
			}
		}else{
			borda.push('e');
		}

		//direita
		if(j+1 < lenColunas){
			if(visitados[i][j+1] == 0){
				if(distanciaCor(rectIni, table[i][j+1]) < threshCor){
					var r = recContorno(rectIni, table, visitados, i, j+1, lenLinhas, lenColunas);
					contFinal.push(...r);
				}
				else
					borda.push('d');
			}
		}else{
			borda.push('d');
		}

		//cima
		if(i-1 >= 0){
			if(visitados[i-1][j] == 0){
				if(distanciaCor(rectIni, table[i-1][j]) < threshCor){
					var r = recContorno(rectIni, table, visitados, i-1, j, lenLinhas, lenColunas);
					contFinal.push(...r);
				}
				else
					borda.push('c');
			}
		}else{
			borda.push('c');
		}

		//baixo
		if(i+1 < lenLinhas){
			if(visitados[i+1][j] == 0){
				if(distanciaCor(rectIni, table[i+1][j]) < threshCor){
					var r = recContorno(rectIni, table, visitados, i+1, j, lenLinhas, lenColunas);
					contFinal.push(...r);
				}
				else
					borda.push('b');
			}
		}else{
			borda.push('b');
		}

		var rectPos = table[i][j].getBoundingClientRect();
		var posBody = document.getElementsByTagName("BODY")[0].getBoundingClientRect(); 
		contFinal.push([ {x : rectPos.x-posBody.x, y : rectPos.y-posBody.y, w : rectPos.width, h : rectPos.height}, borda]);

	}

	return contFinal;
}

//.__data__.value.split(",")

export function drawContornos(svg, contornos){

	for(var i = 0; i < contornos.length; i++){
		var rect = contornos[i][0];
		var borda = contornos[i][1];
		var x = rect.x-11;
		var y = rect.y-92;
		var w = rect.w;
		var h = rect.h;
		var cor = "red";
		var tamanho = 2;

		for(var j = 0; j < borda.length; j++){
			if(borda[j] == 'e'){
				svg.append("line")
				.attr("x1", x)
				.attr("y1", y)
				.attr("x2", x)
				.attr("y2", y+h)
				.attr("stroke-width", tamanho)
				.attr("stroke", cor);
			}else if(borda[j] == 'd'){
				svg.append("line")
				.attr("x1", x+w)
				.attr("y1", y)
				.attr("x2", x+w)
				.attr("y2", y+h)
				.attr("stroke-width", tamanho)
				.attr("stroke", cor);
			}else if(borda[j] == 'c'){
				svg.append("line")
				.attr("x1", x)
				.attr("y1", y)
				.attr("x2", x+w)
				.attr("y2", y)
				.attr("stroke-width", tamanho)
				.attr("stroke", cor);
			}else if(borda[j] == 'b'){
				svg.append("line")
				.attr("x1", x)
				.attr("y1", y+h)
				.attr("x2", x+w)
				.attr("y2", y+h)
				.attr("stroke-width", tamanho)
				.attr("stroke", cor);
			}
		}
	}
}

export function getContornos(table, rect){
	var arrRects = table.selectAll('.row').selectAll('rect')._groups;
	var qtdLinhas = table.selectAll('.row')._groups[0].length;
	var qtdColunas = table.selectAll('.row')._groups[0][0].__data__.values.length;

	var visitados = [];
	for(var i=0; i<qtdLinhas; i++) {
	    visitados[i] = [];
	    for(var j=0; j<qtdColunas; j++) {
	        visitados[i][j] = 0;
	    }
	}

	var indexs = getIJIndexs(rect, arrRects, qtdLinhas, qtdColunas);
	var i = indexs[0];
	var j = indexs[1];
	console.log(arrRects[i][j]);

	return recContorno(arrRects[i][j], arrRects, visitados, i, j, qtdLinhas, qtdColunas);
}

function getIJIndexs(rect, arrRects, qtdLinhas, qtdColunas){
	for(var i=0; i<qtdLinhas; i++) {
	    for(var j=0; j<qtdColunas; j++) {
	        
	        if(JSON.stringify(rect) === JSON.stringify(d3.select(arrRects[i][j])) )
	        	return[i, j]
	    }
	}
	return [-1,-1];
}

var threshCor = 60;