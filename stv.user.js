// ==UserScript==
// @name         Sangtacviet dich
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tách từ tiện ích sangtacviet api
// @author       Fnooub
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

function g(i){
    return document.getElementById(i);
}
function q(i){
    return document.querySelectorAll(i);
}
function checkOverflow(el,stl)
{
    stl = stl || getComputedStyle(el)
    var curOverflow = stl.overflow;
    if(curOverflow == "auto" || curOverflow=="hidden" ){
        return false;
    }
    return el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
}
function containFloatAndAbsolute(el){
    for(var i=0;i<el.children.length;i++){
        var stl = getComputedStyle(el.children[i]);
        if( stl.display=="absolute")return true;
    }
    return false;
}
function isIgnore(el){
    if(el.id=="surf-menubar" || el.id=="mainbar"){
        return true;
    }
    return false;
}
function textScaling(basetext,newtext){

}
function showBtn() {
    if (setting.showbtn) { // Kiểm tra giá trị của setting.showbtn
        var btn = document.createElement("button");
        btn.setAttribute("style", "display:block;position:fixed;bottom:20%;right:5px; width:40px;height:40px;background-color:#eaeaea80;border-radius:50%;font-size:12px;text-align:center;");
        btn.innerHTML = "Dịch";
        btn.onclick = function () {
            realtimeTranslate(true, true);
        };
        document.body.appendChild(btn);
    }
}

// Gán giá trị mặc định cho setting
var setting = {
    enable: true,
    heightauto: true,
    widthauto: false,
    scaleauto: true,
    enableajax: false,
    enablescript: true,
    strictarial: false,
    stvserver: "sangtacviet.com",
    showbtn: false,
    namedata: ""
};

// Gọi hàm bắt đầu sau khi đã thiết lập giá trị
startScript();

var namedata = "";
var namedatacache = null;
function replaceName(text){
    var t = text;

    return t;
}

function insertClearfix(node){
    var clearfix = document.createElement("div");
    clearfix.setAttribute("calculated", "true");
    clearfix.setAttribute("style", "clear:both");
    node.appendChild(clearfix);
}
function countChild(node) {
    var c=node.children.length;
    for(var i=0;i<node.children.length;i++){
        c += countChild(node.children[i]);
    }
    return c;
}

function removeOverflow(){
    if(setting.heightauto || setting.widthauto)
    q("div:not([calculated]), nav, main:not([calculated]), section:not([calculated])").forEach(function(e){
        e.setAttribute("calculated", "true");
        var stl = getComputedStyle(e);
        if(checkOverflow(e,stl)
            && !isIgnore(e)){
            if(setting.heightauto){
                if(stl.maxHeight == 'none'){
                    e.style.maxHeight = (parseInt(stl.height) * 2)+"px";
                }
                if(parseInt(stl.height) + "px" == stl.height)
                    e.style.minHeight=stl.height;
                if(stl.overflowY == 'auto' || stl.overflowY == 'scroll'){

                }else{
                    e.style.height="auto";
                }

            }
            if(setting.widthauto){
                if(parseInt(stl.width) + "px" == stl.width)
                    e.style.minWidth=stl.width;
                e.style.width="auto";
            }
        }
        if(e.tagName=="NAV"){
            e.style.fontSize = (parseInt(stl.fontSize) * 0.75) + "px";
            e.style.overflow = 'hidden';
        }
    });
    if(setting.heightauto || setting.widthauto)
    q("ul").forEach(function(e){
        if(checkOverflow(e)
            && !isIgnore(e)){
            var stl = getComputedStyle(e);
            if(setting.heightauto){
                if(parseInt(stl.height) + "px" == stl.height)
                    e.style.minHeight=stl.height;
                e.style.height="auto";
            }
            if(setting.widthauto||stl.position == 'absolute'){
                if(parseInt(stl.width) + "px" == stl.width)
                    e.style.minWidth=stl.width;
                e.style.width="auto";
            }
        }
        e=e.parentElement;
        if(e&&checkOverflow(e)
            && !isIgnore(e)){
            var stl = getComputedStyle(e);
            if(setting.heightauto){
                if(parseInt(stl.height) + "px" == stl.height)
                    e.style.minHeight=stl.height;
                if(stl.overflowY == 'auto' || stl.overflowY == 'scroll'){

                }else{
                    e.style.height="auto";
                }
            }
            if(stl.position == 'absolute'||setting.widthauto){
                if(parseInt(stl.width) + "px" == stl.width)
                    e.style.minWidth=stl.width;
                e.style.width="auto";
            }
        }
    });
    if(setting.scaleauto)
    q("pp:not([calculated]),a:not([calculated]),label:not([calculated]),"+
        "button:not([calculated]), [type=\"submit\"]:not([calculated]),"+
        "li:not([calculated]), span:not([calculated]), i:not([calculated]),"+
        "h3:not([calculated]),h2:not([calculated]),h1:not([calculated]),h4:not([calculated])").forEach(function(e){
        e.setAttribute("calculated", "true");
        if(e.tagName=="A"){
            if(!(e.className.match(/btn|click|button/i))){
                if(e.children.length>1){
                    return;
                }
            }
        }
        if(e.tagName=="LABEL"){
            if(e.children.length>1){
                return;
            }
        }
        if(e.tagName=="LI"){
            if(countChild(e)<3){
                e.style.whiteSpace = 'nowrap';
            }
            e.style.wordBreak = 'keep-all';
        }
        if(checkOverflow(e)
            && !isIgnore(e)){
            var stl = getComputedStyle(e);
            var fontsize = parseInt(stl.fontSize) ;
            var pd = parseInt(stl.paddingLeft) ;

            var multiply =1;
            var multiply2 =1;

            if(fontsize > 26){
                multiply = 5;
            }else
            if(fontsize > 22){
                multiply = 3;
            }else
            if(fontsize >= 16){
                multiply = 2;
            }else
            if(fontsize > 14){
                multiply = 2;
            }else
            if(fontsize > 12){
                multiply = 1;
            }
            if(fontsize - multiply < 10){
                e.style.fontSize="10px";
            }else
            e.style.fontSize=(fontsize- multiply) +"px";


            if(pd > 30){
                multiply2 = 20;
            }else
            if(pd > 20){
                multiply2 = 16;
            }else
            if(pd > 10){
                multiply2 = 7;
            }else
            if(pd > 5){
                multiply2 = 3;
            }

            if(fontsize - multiply < 10){
                e.style.fontSize="10px";
            }else
            e.style.fontSize=(fontsize - multiply) +"px";
            if(pd>0){
                if(pd - multiply2 < 0){
                    e.style.paddingLeft="0px";
                    e.style.paddingRight="0px";
                }else{
                    e.style.paddingRight=(pd - multiply2) +"px";
                    e.style.paddingLeft=(pd - multiply2) +"px";
                }
            }
            if(checkOverflow(e)){
                if(fontsize - multiply*2 < 10){
                    e.style.fontSize="10px";
                    e.style.textOverflow = 'ellipsis';
                }else
                e.style.fontSize = (fontsize -  multiply*2) + "px";
                //e.clientHeight;
                if(checkOverflow(e)){
                    if(fontsize - multiply*3< 10){
                        e.style.fontSize="10px";
                        e.style.textOverflow = 'ellipsis';
                    }else
                    e.style.fontSize = (fontsize -  multiply*3) + "px";
                    //e.clientHeight;
                    if(checkOverflow(e)){
                        if(fontsize - multiply*5< 10){
                            e.style.fontSize="10px";
                            e.style.textOverflow = 'ellipsis';
                        }else
                        e.style.fontSize = (fontsize -  multiply*5) + "px";
                    }
                }
            }
        }
    });
}

var realtimeTranslateLock = false;
var chineseRegex = /[\u3400-\u9FBF]/;
function recurTraver(node,arr,tarr){
    if(!node)return;
    for(var i=0;i<node.childNodes.length;i++){
        if(node.childNodes[i].nodeType == 3){
            if(chineseRegex.test(node.childNodes[i].textContent)){
                arr.push( node.childNodes[i] );
                tarr.push( node.childNodes[i].textContent );
            }
        }else{
            if(node.childNodes[i].tagName!="SCRIPT")
            recurTraver(node.childNodes[i],arr,tarr);
        }
    }
}
function translatePlaceholder(arr,tarr){
    var listNode = q("input[type=\"submit\"], [placeholder], [title]");
    for(var i=0;i<listNode.length;i++){
        var flag=false;
        var nodeid=0;
        if(listNode[i].type=="submit" && listNode[i].value.match(/[\u3400-\u9FBF]/)){
            if(!flag){
                flag=true;
                arr.push(listNode[i]);
                nodeid=arr.length-1;
            }
            tarr.push(nodeid+"<obj>btnval<obj>"+listNode[i].value);
        }
        if(listNode[i].placeholder && listNode[i].placeholder.match(/[\u3400-\u9FBF]/)){
            if(!flag){
                flag=true;
                arr.push(listNode[i]);
                nodeid=arr.length-1;
            }
            tarr.push(nodeid+"<obj>plchd<obj>"+listNode[i].placeholder);
        }
        if(listNode[i].title && listNode[i].title.match(/[\u3400-\u9FBF]/)){
            if(!flag){
                flag=true;
                arr.push(listNode[i]);
                nodeid=arr.length-1;
            }
            tarr.push(nodeid+"<obj>title<obj>"+listNode[i].title);
        }
    }
}
var isChinese = document.title.match(/[\u3400-\u9FBF]/);
var oldSend = XMLHttpRequest.prototype.send;
var translateDelay = 120;
var deferDelay = 200;
var enableRemoveOverflow=true;
if(setting.heightauto == false && setting.widthauto==false && setting.scaleauto==false){
    enableRemoveOverflow=false;
}
function poporgn(){
    var t = "";
    for(var i=0;i<this.childNodes.length;i++){
        if(this.childNodes[i].nodeType==3){
            t+=this.childNodes[i].orgn||"";
        }
    }
    this.setAttribute("title", t);
}

async function realtimeTranslate(defered,btn){
    if(!btn)
    if(realtimeTranslateLock || !setting.enable){
        return;
    }
    //console.log(setting);
    realtimeTranslateLock = true;
    setTimeout(function(){
        realtimeTranslateLock = false;
    }, translateDelay);
    if(isChinese){
        attachAjaxRoot();
    }
    //console.log('Checking for realtimeTranslate');
    var totranslist =[];
    var transtext =[];
    var currnode = document.body;
    recurTraver(q("title")[0],totranslist,transtext);
    recurTraver(currnode,totranslist,transtext);
    if(totranslist.length > 0){
        var transtext2 = transtext.join("=|==|=");
        realtimeTranslate(true);
        if(!isChinese){
            var newlen = transtext2.replace(/[\u3400-\u9FBF]+/g,"").length;
            if(transtext2.length - newlen > 200){
                isChinese=true;
            }
        }
        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var translateds = this.responseText.split("=|==|=");
                for(var i=0;i<totranslist.length;i++){
                    totranslist[i].textContent = translateds[i];
                    totranslist[i].orgn = transtext[i];
                    if(totranslist[i].parentElement && !totranslist[i].parentElement.popable){
                        totranslist[i].parentElement.addEventListener("mouseenter", poporgn);
                        totranslist[i].parentElement.popable = true;
                    }
                }
                if(isChinese){
                    if(enableRemoveOverflow)
                        removeOverflow();
                    invokeOnChinesePage();
                }
            }
        };
        ajax.open("POST", "//"+setting.stvserver+"/", true);
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        oldSend.apply(ajax,[ "sajax=trans&content="+encodeURIComponent( replaceName(transtext2) ) ]);
    }
    var totranslist2 =[];
    var transtext3 =[];
    translatePlaceholder( totranslist2,transtext3 );
    if(totranslist2.length > 0){
        var transtext4 = transtext3.join("=|==|=");
        var ajax2 = new XMLHttpRequest();
        ajax2.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var translateds = this.responseText.split("=|==|=");
                for(var i=0;i<translateds.length;i++){
                    var obj=translateds[i].split("<obj>");
                    if(obj[1]=="title"){
                        totranslist2[obj[0]].title = obj[2];
                    }else
                    if(obj[1]=="btnval"){
                        totranslist2[obj[0]].value = obj[2];
                    }else
                    if(obj[1]=="plchd"){
                        totranslist2[obj[0]].placeholder = obj[2];
                    }
                }
            }
        };
        ajax2.open("POST", "//"+setting.stvserver+"/", true);
        ajax2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        oldSend.apply(ajax2,[ "sajax=trans&content="+encodeURIComponent( replaceName(transtext4) ) ]);
    }
}


function attachAjax(){
    var oldSend2 = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(){
        this.onloadend=function(){
            if(this.responseText.length>10){
                document.dispatchEvent(new CustomEvent('CallTranslator',{}));
            }
        }
        oldSend2.apply(this, arguments);
    }
}
function attachAjaxRoot(fun){
    if(!setting.enableajax)return;
    var script = document.createElement('script');
    script.textContent = attachAjax.toString()+"attachAjax()";
    (document.head||document.documentElement).appendChild(script);
    script.remove();
    document.addEventListener('CallTranslator', function () {
        setTimeout(realtimeTranslate, 0);
    });

    attachAjaxRoot=function(){};
}
function runOnMainContext(s){
    var script = document.createElement('script');
    script.textContent = s;
    (document.head||document.documentElement).appendChild(script);
    script.remove();
}
function invokeOnChinesePage(){
    if(isChinese && setting.enablescript){
        var MutationLock = false;
        var DeferedCheck = false;
        const observer = new MutationObserver(function(mutationsList){
            if(MutationLock){
                if(!DeferedCheck){
                    DeferedCheck=true;
                }
                return;
            }
            setTimeout(function(){
                MutationLock = false;
                if(DeferedCheck){
                    DeferedCheck=false;
                    realtimeTranslate();
                }
            }, deferDelay);
            realtimeTranslate();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true } );
    }
    if(isChinese){
        var css = document.createElement("style");
        if(setting.strictarial){
            css.textContent=":not(i){font-family: arial !important;word-break:break-word;text-overflow:ellipsis;}";
        }
            css.textContent=":not(i){font-family: arial;word-break:break-word;text-overflow:ellipsis;}";
        document.head.appendChild(css);
    }

    window.invokeOnChinesePage=function() {}
}
function startScript(){
    if(!setting.enable){
        return;
    }
    realtimeTranslate();
    showBtn();
}
startScript();

})();
