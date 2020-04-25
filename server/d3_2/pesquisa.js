import {getDataFolder, setDataFolder} from '../main.js'
import {openTab} from '../tab.js'
import {setIdArvore} from './script/exploration.js'
import {upCollection} from './script/collection.js'

var resultImagem = [];//not used
var searchMode = false;

window.limparPesquisa = limparPesquisa;

$("#imagem_form").submit(function(event){
    event.preventDefault(); //prevent default action 
    if ($('#limit').val() > 1){
        $("#submitImage").attr("disabled", true);
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
            $("#bcleansearch").attr("disabled", false);
            $("#submitImage").attr("disabled", false);
            $("#responseImage").text(response);
            setSearchModeArv(true);
            openTab(null, 'Videos');
            //updateArv()
        });
    }else{
        $("#responseImage").text("Error: Limit <= 1");
    }
});


$("#texto_form").submit(function(event){
    event.preventDefault(); //prevent default action 
    if ($('#tlimit').val() > 1){
        $("#submitText").attr("disabled", true);
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
            $("#bcleansearch").attr("disabled", false);
            $("#submitText").attr("disabled", false);
            $("#responseText").text(response);
            setSearchModeArv(true);
            openTab(null, 'Videos');
            //updateArv()
        });
    }else{
        $("#responseText").text("Error: Limit <= 1");
    }
});

export function limparPesquisa() {
    setSearchModeArv(false);
    $("#responseImage").text("");
    $("#responseText").text("");
    $("#bcleansearch").attr("disabled", true);
    //resultImagem = [];
    //updateArv();
}

export function getSearchMode(){
    return searchMode;
}

function setSearchModeArv(search){
    if(search)
        setDataFolder("data/search/");
    else
        setDataFolder("data/");

    searchMode = search;
    setIdArvore(1);
    setTimeout(function(){
        upCollection();
    }, 500);
}

//tree.js (not used)
function isVIDinResultImage(vid) {
    for (var i = 0; i < resultImagem.length; i++){
        var result = resultImagem[i];
        var loc = result[0];
        var dist = result[1];
        var rVid = loc[0];
        var rTomada = loc[1];

        if(rVid === vid)
            return true; 
    }

    return false;
}