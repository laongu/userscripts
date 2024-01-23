// ==UserScript==
// @name         VietPhrase Nodejs API
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Đọc và sửa Names VietPhrase từ api Nodejs
// @author       laongu
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/gh/mozilla/Readability/Readability.js
// @grant        none
// ==/UserScript==
// Hàm chính

const svApi = 'https://15a55519-8990-4be7-81d7-23f87ada944f-00-3hj9mgvt3ehon.pike.replit.dev/translate';


/* xử lý site đặc biệt */
const currentUrl = window.location.href;

if (currentUrl.includes('m.sinodan.link/view')) {
    document.body.innerHTML = fixText(document.body.innerHTML);
}

const documentClone = document.cloneNode(true);
const article = new Readability(documentClone).parse();

// const originalTextContent = article.textContent;
// console.log(originalTextContent);

let originalTextContent = '';

if (article.title) {
    originalTextContent = article.title + '\n\n' + html2text(article.content);
} else {
    originalTextContent = html2text(article.content)
}

// thêm Names tại đây
const namedata = localStorage.getItem('VietPhrase') || '=';
console.log(namedata);
let namedatacache = null;

async function translateText(inputText, type = false) {
    try {
        let requestBody;
        if (type) {
            requestBody = { type: type, text: inputText };
        } else {
            requestBody = { text: inputText };
        }

        const body = JSON.stringify(requestBody);

        const response = await fetch(svApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Lỗi khi dịch văn bản:', error);
        return null;
    }
}

function html2text(html, noBr = false) {
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/(div|p|li|dd|h[1-6])>/gi, '\n');
    html = html.replace(/<(br|hr)\s*[/]?>/gi, '\n');
    html = html.replace(/<li>/ig, '+ ');
    html = html.replace(/<[^>]+>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    if (noBr) html = html.replace(/\n+/g, ' ');
    return html;
}

function fixText(str) {
    // Kiểm tra nếu URL chứa "m.sinodan.link"
    if (window.location.href.includes("m.sinodan.link")) {
        const emMappings = {
          n_1: '男', n_2: '人', n_3: '啊', n_4: '爱', n_5: '按',
          n_6: '暴', n_7: '臀', n_8: '逼', n_9: '擦', n_10: '潮',
          n_11: '操', n_12: '插', n_13: '吃', n_14: '抽', n_15: '处',
          n_16: '床', n_17: '春', n_18: '唇', n_19: '刺', n_20: '粗',
          n_21: '大', n_22: '洞', n_23: '逗', n_24: '硬', n_25: '儿',
          n_26: '反', n_27: '犯', n_28: '峰', n_29: '妇', n_30: '抚',
          n_31: '夫', n_32: '腹', n_33: '干', n_34: '搞', n_35: '根',
          n_36: '公', n_37: '宫', n_38: '勾', n_39: '股', n_40: '狠',
          n_41: '花', n_42: '滑', n_43: '坏', n_44: '魂', n_45: '鸡',
          n_46: '激', n_47: '夹', n_48: '奸', n_49: '交', n_50: '叫',
          n_51: '娇', n_52: '姐', n_53: '禁', n_54: '精', n_55: '进',
          n_56: '紧', n_57: '菊', n_58: '渴', n_59: '口', n_60: '裤',
          n_61: '胯', n_62: '快', n_63: '浪', n_64: '力', n_65: '接',
          n_66: '乱', n_67: '裸', n_68: '妈', n_69: '毛', n_70: '迷',
          n_71: '靡', n_72: '妹', n_73: '摸', n_74: '嫩', n_75: '母',
          n_76: '娘', n_77: '尿', n_78: '咛', n_79: '女', n_80: '哦',
          n_81: '趴', n_82: '喷', n_83: '婆', n_84: '屁', n_85: '气',
          n_86: '枪', n_87: '窃', n_88: '骑', n_89: '妻', n_90: '情',
          n_91: '亲', n_92: '裙', n_93: '热', n_94: '日', n_95: '肉',
          n_96: '揉', n_97: '乳', n_98: '软', n_99: '润', n_100: '入',
          n_101: '塞', n_102: '骚', n_103: '色', n_104: '上', n_105: '舌',
          n_106: '射', n_107: '身', n_108: '深', n_109: '湿', n_110: '兽',
          n_111: '受', n_112: '舒', n_113: '爽', n_114: '水', n_115: '睡',
          n_116: '酥', n_117: '死', n_118: '烫', n_119: '痛', n_120: '舔',
          n_121: '天', n_122: '体', n_123: '挺', n_124: '头', n_125: '腿',
          n_126: '脱', n_127: '味', n_128: '慰', n_129: '吻', n_130: '握',
          n_131: '喔', n_132: '污', n_133: '下', n_134: '小', n_135: '性',
          n_136: '胸', n_137: '血', n_138: '穴', n_139: '阳', n_140: '痒',
          n_141: '药', n_142: '腰', n_143: '夜', n_144: '液', n_145: '野',
          n_146: '衣', n_147: '姨', n_148: '吟', n_149: '淫', n_150: '荫',
          n_151: '幽', n_152: '诱', n_153: '尤', n_154: '欲', n_155: '吁',
          n_156: '玉', n_157: '吮', n_158: '窄', n_159: '占', n_160: '征',
          n_161: '汁', n_162: '嘴', n_163: ',', n_164: '.', n_165: '...',
          n_166: '慾', n_167: '丢', n_168: '弄'
        };

        Object.entries(emMappings).forEach(([emClass, chineseChar]) => {
            const emTag = `<em class="${emClass}"></em>`;
            str = str.replaceAll(emTag, chineseChar);
        });
    }

    // Các xử lý khác nếu cần thiết cho các trang web khác

    return str;
}

function replaceName(text) {
    if (namedatacache) {
      // Thực hiện thay thế từ cache nếu đã có
      namedatacache.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, ` ${replacement} `);
      });
    } else {
      // Nếu chưa có cache, tạo cache và thực hiện thay thế
      namedatacache = [];

      namedata.split("\n").forEach(line => {
        const [pattern, replacement] = line.trim().split("=");
        if (pattern && replacement) {
          const regexPattern = new RegExp(pattern, "g");
          namedatacache.push([regexPattern, replacement]);
          text = text.replace(regexPattern, ` ${replacement} `);
        }
      });
    }

    return text;
}

function insertStorage(key, keyValueToUpdate) {
  const currentString = localStorage.getItem(key) || "";
  const keyValueArray = currentString.split('\n').map(entry => {
    const [key, value] = entry.split('=');
    // Kiểm tra nếu key không rỗng mới thêm vào mảng
    if (key !== undefined && key.trim() !== "") {
      return { key, value };
    }
  }).filter(Boolean); // Loại bỏ các giá trị undefined trong mảng

  const [keyToUpdate, newValue] = keyValueToUpdate.split('=');

  const existingEntryIndex = keyValueArray.findIndex(entry => entry.key === keyToUpdate);

  if (existingEntryIndex !== -1) {
    keyValueArray[existingEntryIndex].value = newValue;
    const [updatedEntry] = keyValueArray.splice(existingEntryIndex, 1);
    keyValueArray.unshift(updatedEntry);
  } else {
    keyValueArray.unshift({ key: keyToUpdate, value: newValue });
  }

  const resultString = keyValueArray.map(entry => `${entry.key}=${entry.value}`).join('\n');

  localStorage.setItem(key, resultString);
}


// Phương thức chuyển đổi dấu câu Trung Quốc sang chữ La-tinh
function convertPunctuation(text) {
    const mapping = {
        "。": ".", "，": ",", "、": ",", "；": ";", "！": "!", "？": "?",
        "：": ":", "（": "(", "）": ")", "〔": "[", "〕": "]", "【": "[",
        "】": "]", "｛": "{", "｝": "}", "『": "“", "』": "”", "～": "~",
        "〖": "[", "〗": "]", "〘": "[", "〙": "]", "〚": "[",
        "〛": "]", "　": " "
    };

    // Chuyển đổi từng ký tự trong văn bản dựa trên bảng ánh xạ
    return text.split('').map(char => mapping[char] || char).join('');
}

function processText(text) {
    const trimmedText = text
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/ +([,.?!\]\>:};)])/g, '$1 ')
        .replace(/ +([”’])/g, '$1')
        .replace(/([<\[(“‘{]) +/g, ' $1')
        .replace(/(^\s*|[“‘”’.!?\[-]\s*)(\p{Ll})/gmu, (_, p1, p2) => p1 + p2.toUpperCase())
        .replace(/ +/g, ' ');

    return trimmedText;
}

async function enTrans(text) {
    try {
        const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${text}`;
        const response = await fetch(apiUrl);
        const jsonData = await response.json();
        const translation = jsonData[0][0][0];
        return translation;
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

// Hàm đếm số lần xuất hiện của các từ trùng lặp trong một chuỗi văn bản
function countRepeatWords(text = 'hello', minWordLength = 2, maxWordLength = 10, minFrequency = 3, limit = 100) {
    // Loại bỏ khoảng trắng ở đầu và cuối chuỗi văn bản
    text = text.trim();

    // Biểu thức chính quy tách dấu câu, ký tự đặc biệt, dòng mới, tab và carriage return
    //const regex = /[\p{P}\n\t\r]/ug;
    const regex = /[\p{P}\n\t\r的了著]/ug;
    const wordsArray = text.split(regex).map((item) => item.trim()).filter(Boolean);

    // Tìm các từ duy nhất có độ dài từ minWordLength đến maxWordLength
    let uniqueWords = new Set();
    for (let i = 0; i < wordsArray.length; i++) {
        for (let j = 0; j < wordsArray[i].length; j++) {
            for (let k = minWordLength; k <= maxWordLength; k++) {
                if (j + k > wordsArray[i].length) continue;
                let word = wordsArray[i].slice(j, j + k).trim();
                if (word.length >= minWordLength) uniqueWords.add(word);
            }
        }
    }

    // Tạo một mảng từ tập hợp các từ duy nhất
    let uniqueWordsArray = Array.from(uniqueWords);

    // Đếm tần suất xuất hiện của từng từ trong chuỗi văn bản
    let result = [];
    for (let i = 0; i < uniqueWordsArray.length; i++) {
        let frequency = text.split(uniqueWordsArray[i]).length - 1;
        if (frequency > minFrequency) {
            result.push({ 'word': uniqueWordsArray[i], 'freq': frequency });
        }
    }

    // Sắp xếp kết quả theo tần suất xuất hiện giảm dần và độ dài từ giảm dần
    result.sort((a, b) => { 
        return b.freq - a.freq || b.word.length - a.word.length;
    });

    //return result;
    // Giới hạn kết quả chỉ lấy limit phần tử đầu tiên
    return result.slice(0, limit);
}


(async function () {
    'use strict';
/* Dịch web */
  function containsChinese(text) {
    // Hàm kiểm tra xem chuỗi có chứa ký tự tiếng Trung hay không
    const chineseRegex = /[\u4E00-\u9FA5]/;
    return chineseRegex.test(text);
  }

  async function translateNode(domNode) {
    const excludedTags = new Set(['SCRIPT', 'STYLE', 'BR', 'HR']);
    const stackToStockThings = [];

    function traverseDOM(node) {
      if (node.nodeType === Node.TEXT_NODE && containsChinese(node.nodeValue)) {
        stackToStockThings.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE && !excludedTags.has(node.tagName.toUpperCase())) {
        for (const childNode of node.childNodes) {
          traverseDOM(childNode);
        }
      }
    }

    traverseDOM(domNode);

    const chineseText = stackToStockThings.map(node => node.nodeValue).join('---|---');

    try {
      const translatedText = await translateText(replaceName(chineseText));
      // console.log(translatedText);
      
      const translatedArr = translatedText.split('---|---');
      for (let i = 0; i < stackToStockThings.length; i++) {
        stackToStockThings[i].nodeValue = translatedArr[i];
      }
    } catch (error) {
      console.error('Lỗi Dịch:', error);
    }
  }

    try {
        var isChinese = document.title.match(/[\u3400-\u9FBF]/);
        if (isChinese) {
            await translateNode(document.body);
        } else {
            console.log('Trang không chứa tiếng Trung. Không cần dịch.');
            return;
        }
    } catch (error) {
        console.error('Lỗi Dịch:', error);
    }

    // Phần 2: Gọi hàm tạo button
    createButton();
})();

// Hàm tạo button và thực hiện phần 2
function createButton() {
    var button = document.createElement('button');
    button.innerText = 'Names';
    button.style.position = 'fixed';
    button.style.top = '50px';
    button.style.right = '10px';
    button.style.background = '#fff';
    button.addEventListener('click', handleButtonClick);
    document.body.appendChild(button);
}

// Hàm xử lý khi button được nhấp
async function handleButtonClick() {
        try {
            // Loại khoảng trắng đầu dòng
            let textContent = originalTextContent.split('\n').map(line => line.trim()).join('\n');
            textContent = replaceName(textContent);

            // Tạo một tab mới và hiển thị nội dung văn bản
            var newTab = window.open();

            // Sử dụng hàm
            const translatedText = await translateText(originalTextContent, 'edit');

            const translationResult = translatedText.map(([h, v, hv]) => {
                if (h.includes('\n')) {
                    return h.replace(/\n/g, '<br>');
                } else if (h === '的' || h === '了' || h === '著' || h === '地') {
                    return `<i style="color:#ced6dd; font-size: 8px;" h="${h}" v="${v}" hv="${hv}">${v}</i>`;
                } else {
                    return `<i h="${h}" v="${v}" hv="${hv}">${v.split('/')[0]}</i>`;
                }

            }).join(' ').trim();


            var htmlContent = `
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Tách văn bản</title>
                  <style>
                  /* CSS Styles */
                    body {
                      background: #e9eef2;
                      max-width: 980px;
                      margin: 20px auto;
                      font-size: x-large;
                    }
                    #content {
                        border: 2px solid #88C6E5;
                        padding: 20px;
                    }
                    #content i {
                      font-style: normal;
                    }

                    #dialog {
                        position: absolute;
                        background-color: #17a2b8;
                        border: 1px solid #ccc;
                        padding: 10px;
                        width: 256px;
                        display: none;
                    }

                    .form input {
                        padding: 5px;
                        width: 143px;
                        font-size: 13px;
                    }

                    .form span {
                        width: 20px;
                        display: inline-block;
                        font-size: 15px;
                    }

                    .focus {
                        color: red !important;
                        font-weight: bold;
                    }

                    #tuLappopupDialog {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        border: 1px solid #ccc;
                        background-color: #fff;
                        padding: 20px;
                        z-index: 99;
                        overflow: auto;
                        max-height: 80vh;
                    }

                    .tuLapdialog-content {
                        text-align: center;
                    }
                  </style>
                </head>
                <body>
                  <div id="content">${translationResult}</div>
                    <!-- Cửa sổ hiển thị thông tin -->
                    <div id="dialog">
                        <div class="form">
                            <span>HV:</span>
                            <input type="text" id="hv">
                            <button id="addName">HV</button>
                            <button id="enName">EN</button><br>
                            <span>H:</span>
                            <input type="text" id="h"><br>
                            <span>V:</span>
                            <input type="text" id="v">
                        </div>
                        <hr>

                        <!-- Control Buttons -->
                        <div style="display: flex; justify-content: space-between;">
                            <button id="preBtnHandle"> &lt;- Trái </button>
                            <button id="afterBtnHandle"> Phải -&gt; </button>
                            <button id="closeDialog"> Đóng </button>
                        </div>

                    </div>

                    <button id="tuLapopenDialogBtn" style="position: fixed; top: 50px; right: 10px; background: #fff; z-index: 100;">Từ lặp</button>
                    <button id="openCloseButton" style="position: fixed; top: 80px; right: 10px; background: #fff; z-index: 100;">Mở Names</button>
                    <button id="saveButton" style="position: fixed; top: 80px; right: 120px; display: none; background: #fff; z-index: 100;">Lưu Names</button>
                    <textarea id="namedich" rows="10" cols="30" style="position: fixed; top: 130px; right: 10px; display: none; background: #fff4d6; z-index: 100;"></textarea>

                    <div id="tuLappopupDialog">
                        <div id="tuLapdialog-content">
                        </div>
                    </div>
                </body>
              </html>`;

            newTab.document.write(htmlContent);

            /* Phần Lưu Names */
            var myTextarea = newTab.document.getElementById('namedich');
            var openCloseButton = newTab.document.getElementById('openCloseButton');
            var closeDialogBtn = newTab.document.getElementById('closeDialogBtn');
            var saveButton = newTab.document.getElementById('saveButton');

            myTextarea.value = localStorage.getItem('VietPhrase') || '';

            openCloseButton.addEventListener('click', function () {
                var displayStyle = myTextarea.style.display === 'none' ? 'block' : 'none';
                myTextarea.style.display = displayStyle;
                saveButton.style.display = displayStyle;
                openCloseButton.textContent = displayStyle === 'none' ? 'Mở Names' : 'Đóng Names';
            });

            saveButton.addEventListener('click', function () {
                localStorage.setItem('VietPhrase', myTextarea.value);
                newTab.alert('Lưu thành công!');
            });



var tuLapopenBtn = newTab.document.getElementById('tuLapopenDialogBtn');
var tuLapdialog = newTab.document.getElementById('tuLappopupDialog');
var openTulap = false;

tuLapopenBtn.addEventListener('click', function () {
    if (openTulap) {
        // Nếu đang mở, đóng
        tuLapdialog.style.display = 'none';
    } else {
        // Nếu đang đóng, mở
        tuLapdialog.style.display = 'block';

        // Gọi hàm countRepeatWords và hiển thị kết quả
        const tuLap = countRepeatWords(originalTextContent, 2, 5, 2, 100);
        displayResult(tuLap);

        // Loại bỏ sự kiện click trước khi thêm một sự kiện mới
        newTab.document.removeEventListener('click', handleAddTulap);
        newTab.document.addEventListener('click', handleAddTulap);
        newTab.document.removeEventListener('click', handleAddEnTulap);
        newTab.document.addEventListener('click', handleAddEnTulap);
    }
    openTulap = !openTulap; // Đảo ngược trạng thái
});


function handleAddTulap(event) {
    if (event.target.classList.contains('addTulap')) {
        const han = event.target.dataset.han;
        const hanviet = event.target.dataset.hanviet;
        addTulap(han, hanviet);
    }
}

function handleAddEnTulap(event) {
    if (event.target.classList.contains('addEnTulap')) {
        const han = event.target.dataset.han;
        const hanviet = event.target.dataset.hanviet;
        enNameTulap(han, hanviet);
    }
}

async function displayResult(tuLap) {
    const resulttuLap = newTab.document.getElementById('tuLapdialog-content');

    const tuLapString = tuLap.map(item => `${item.word} = ${item.freq}`).join('---|---');
    const tuLapTransArray = await translateText(tuLapString, 'edit');
    const processArrays = processAndTranslateArrays(tuLapTransArray);

    // Lặp qua mỗi mảng con
    const tuLapJoin = processArrays.map(([h, v, hv, w]) => {
      // Kiểm tra nếu phần tử thứ tư là 0
      if (w === 0) {
        // Chỉ lấy phần tử đầu tiên
        return h;
      } else {
        // Ngược lại, giữ nguyên mảng con
        return `${h} = ${v} = ${hv}`;
      }
    }).join(' ');

    const tachTulap = tuLapJoin.split('---|---');

    //console.log(tachTulap);
    
    const resultContent = tachTulap.map((item) => {
      const [h, v, hv, f] = item.split('=').map(part => part.trim());

      return `<div>${f} : ${h} = ${v} = ${hv} <button class="addTulap" data-han="${h}" data-hanviet="${hv}">HV</button> <button class="addEnTulap" data-han="${h}" data-hanviet="${hv}">EN</button></div>`;
    }).join('<hr>');

    resulttuLap.innerHTML = resultContent;
}

function addTulap(han, hanviet) {
    var newNames = `${han}=${capitalizeFirstChar(hanviet)}`;
    insertStorage('VietPhrase', newNames);
    updateName(newNames);
    console.log(newNames);
}

async function enNameTulap(han, hanviet) {
    try {
        let enName = await enTrans(han);
        enName = capitalizeFirstChar(enName);
        const newNames = `${han}=${enName}`;
        insertStorage('VietPhrase', newNames);
        updateName(newNames);
        console.log(newNames);
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

function translateMultiArray(arrays) {
  var result = [];

  for (var i = 0; i < arrays[0].length; i++) {
    var currentElement = [];

    for (var j = 0; j < arrays.length; j++) {
      currentElement.push(arrays[j][i]);
    }

    if (i === 1) {
      // Thêm ký tự ngăn cách phù hợp cho phần tử thứ 2
      result.push(currentElement.join(' | '));
    } else if (i === 2) {
      // Thêm một khoảng trắng vào giữa các phần tử
      result.push(currentElement.join(' '));
    } else {
      result.push(currentElement.join(''));
    }
  }

  return result.length === 1 ? result[0] : result;
}


function processAndTranslateArrays(arrays) {
  const result = [];
  let currentArray = [];

  for (const array of arrays) {
    if (array[3] !== 0) {
      currentArray.push(array);
    } else {
      if (currentArray.length > 0) {
        result.push(translateMultiArray(currentArray));
        currentArray = [];
      }
      result.push(array);
    }
  }

  if (currentArray.length > 0) {
    result.push(translateMultiArray(currentArray));
  }

  return result;
}



            /* Phần sửa Names */
  // Các biến theo dõi trạng thái và dữ liệu của trang
  let current;
  let pre;
  let after;
  let dialog;
  let hanviet;
  let han;
  let viet;
  let repElements = [];

  // Sự kiện khi trang đã tải xong
  newTab.document.addEventListener('DOMContentLoaded', function (event) {
    // Lấy tham chiếu đến phần tử content và dialog
    const content = newTab.document.getElementById('content');
    dialog = newTab.document.getElementById('dialog');

    // click nút
    newTab.document.getElementById('addName').addEventListener('click', function () {
        addName();
    });
    newTab.document.getElementById('preBtnHandle').addEventListener('click', function () {
        preBtnHandle();
    });
    newTab.document.getElementById('afterBtnHandle').addEventListener('click', function () {
        afterBtnHandle();
    });
    newTab.document.getElementById('closeDialog').addEventListener('click', function () {
        newTab.document.getElementById('dialog').style.display = 'none';
    });
    newTab.document.getElementById('enName').addEventListener('click', function () {
        enName();
    });


    // Sự kiện click cho phần tử content
    content.addEventListener('click', function (event) {
      // Xử lý khi phần tử <i> được nhấp vào
      var element = event.target;
      if (element.tagName === 'I') {
        // Xóa lớp 'focus' khỏi các phần tử khác
        newTab.document.querySelectorAll('i').forEach(el => {
          if (el.classList.contains('focus')) {
            el.classList.remove('focus');
          }
        });

        // Đặt lại giá trị của repElements thành một mảng rỗng
        repElements = [];

        // Cập nhật các biến theo dõi
        current = element;
        pre = current.previousElementSibling;
        after = current.nextElementSibling;
        current.classList.add('focus');

        // Lấy thông tin Hán Việt và Tiếng Hán của phần tử <i> được chọn
        const hv = current.getAttribute('hv');
        const h = current.getAttribute('h');
        const v = current.getAttribute('v');

        hanviet = hv || '';
        han = h || '';
        viet = v || '';

        repElements.push({
          hv: hv,
          h: h
        });
        // Cập nhật và hiển thị dialog
        updateDialogPosition();
      }
    });

  });




  // Hàm xử lý khi nhấn nút " <- "
  function preBtnHandle() {
      // Cập nhật dữ liệu và vị trí của dialog khi điều hướng qua lại
      current = pre;
      pre = current.previousElementSibling;
      current.classList.add('focus');

      const hv = current.getAttribute('hv');
      const h = current.getAttribute('h');
      const v = current.getAttribute('v');
      hanviet = hv + " " + hanviet;
      han = h + han;
      viet = v + " | " + viet;

      repElements.push({
        hv: hv,
        h: h
      });
      // Cập nhật và hiển thị dialog
      updateDialogPosition();
  }

  // Hàm xử lý khi nhấn nút " -> "
  function afterBtnHandle() {
      // Cập nhật dữ liệu và vị trí của dialog khi điều hướng qua lại
      current = after;
      after = current.nextElementSibling;
      current.classList.add('focus');

      const hv = current.getAttribute('hv');
      const h = current.getAttribute('h');
      const v = current.getAttribute('v');
      hanviet = hanviet + " " + hv;
      han = han + h;
      viet = viet + " | " + v;

      repElements.push({
        hv: hv,
        h: h
      });

      // Cập nhật và hiển thị dialog
      updateDialogPosition();
  }

  function addName() {
    var newNames = `${han}=${capitalizeFirstChar(hanviet)}`;
    insertStorage('VietPhrase', newNames);
    replaceContent();
    updateName(newNames);
    console.log(newNames);
  }

  async function enName() {
    try {
        let enName = await enTrans(han);
        enName = capitalizeFirstChar(enName);
        newTab.document.getElementById('hv').value = enName;
        const newNames = `${han}=${enName}`;
        insertStorage('VietPhrase', newNames);
        replaceContent();
        updateName(newNames);
        console.log(newNames);
    } catch (error) {
        console.error('Lỗi:', error);
    }
  }

function updateName(newNames) {
  // Lấy ra element textarea
  var textarea = newTab.document.getElementById("namedich");

  // Chèn dữ liệu mới lên đầu textarea
  textarea.value = newNames + '\n' + textarea.value;
}

  // Hàm thực hiện thay thế nội dung của các phần tử <i>
  function replaceContent() {
    const iElements = newTab.document.querySelectorAll('#content i');

    // Thay thế thông tin Hán Việt trong các phần tử được chọn
    repElements.forEach(({ hv: replacementText, h: originalText }) => {
      iElements.forEach((iElement) => {
        if (iElement.getAttribute('h') === originalText) {
          iElement.setAttribute('hv', replacementText);
          iElement.innerHTML = capitalizeFirstChar(replacementText);
          iElement.classList.add('focus');
        }
      });
    });
  }

  // Hàm chuyển đổi ký tự đầu tiên của mỗi từ thành chữ hoa
  function capitalizeFirstChar(str) {
    var words = str.split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }

  // Hàm cập nhật vị trí và hiển thị của dialog
            function updateDialogPosition() {
                // Update Position and Display Dialog
                newTab.document.getElementById("hv").value = capitalizeFirstChar(hanviet);
                newTab.document.getElementById("h").value = han;
                newTab.document.getElementById("v").value = viet;

                const topPosition = current.offsetTop;
                const rect = current.getBoundingClientRect();
                const screenWidth = window.innerWidth;
                let leftPosition = rect.left;
                const offsetWidth = 320;

                if (leftPosition + offsetWidth > screenWidth) {
                    leftPosition = screenWidth - offsetWidth;
                }

                if (leftPosition < 0) {
                    leftPosition = 0;
                }

                dialog.style.top = (topPosition + 30) + 'px';
                dialog.style.left = leftPosition + 'px';
                dialog.style.display = 'block';
            }



        } catch (error) {
            console.error("Error:", error);
            newTab.document.write('<html><head><title>Error</title></head><body><div>Đã xảy ra lỗi trong quá trình dịch.</div></body></html>');
        } finally {
            newTab.document.close();
        }
}
