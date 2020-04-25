import {openTab, openTabArv} from "./tab.js"
import {initExploration} from './script/exploration.js'
import {initCategorias} from './categorias.js'

var dataFolder = "data/";


window.openTab = openTab
window.openTabArv = openTabArv


export function getDataFolder(){
	return dataFolder;
}

export function setDataFolder(_dataFolder){
	dataFolder = _dataFolder;
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

deleteAllCookies();
initExploration();
//initCollection();
initCategorias();