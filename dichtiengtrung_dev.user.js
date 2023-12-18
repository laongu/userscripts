// ==UserScript==
// @name         Viet Phrase Editor
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Tách văn bản từ trang hiện tại và mở trong các tab mới
// @author       You
// @match        *://*/*
// @require      https://laongu.github.io/qt.js
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    var originalTextContent = document.body.innerText;

    // thêm Names tại đây
    const namedata = localStorage.getItem('VietPhrase') || '=';
    console.log(namedata);

    let namedatacache = null;

    function replaceName(text) {
    if (namedatacache) {
      // Thực hiện thay thế từ cache nếu đã có
      namedatacache.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, replacement);
      });
    } else {
      // Nếu chưa có cache, tạo cache và thực hiện thay thế
      namedatacache = [];

      namedata.split("\n").forEach(line => {
        const [pattern, replacement] = line.trim().split("=");
        if (pattern && replacement) {
          const regexPattern = new RegExp(pattern, "g");
          namedatacache.push([regexPattern, replacement]);
          text = text.replace(regexPattern, replacement);
        }
      });
    }

    return text;
    }

    // Khởi tạo đối tượng CustomDictionary một lần
    const dictionary = new Dictionary();

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
            await dictionary.init(); // Tải toàn bộ từ điển một lần
            const translatedText = dictionary.translate(replaceName(chineseText));

            const translatedArr = translatedText.split('---|---');
            for (let i = 0; i < stackToStockThings.length; i++) {
                stackToStockThings[i].nodeValue = translatedArr[i];
            }
        } catch (error) {
            console.error('Lỗi Dịch:', error);
        }
    }

    try {
        await translateNode(document.body);
    } catch (error) {
        console.error('Lỗi Dịch:', error);
    }

    // Tạo một button để kích hoạt tách văn bản
    var button = document.createElement('button');
    button.innerText = 'Names';
    button.style.position = 'fixed';
    button.style.top = '50px';
    button.style.right = '10px';
    button.style.background = '#fff';
    button.addEventListener('click', async function () {

        // Lấy nội dung văn bản từ trang
        let textContent = originalTextContent;

        // Tạo một tab mới và hiển thị nội dung văn bản
        var newTab = window.open();

        try {

            // Ghi đè hàm translate
            dictionary.translate = async function (text) {
                const splitText = this.tokenize(text);

                const translations = splitText.map(word => {
                    let translation = '';
                    let phienAm = [];

                    // Tìm kiếm từ trong từ điển
                    const searchResult = this.search(word);

                    // Nếu tìm thấy, sử dụng nghĩa đầu tiên (nếu có)
                    if (searchResult) {
                        phienAm = word.split('').map(char => this.phienAmDictionary.get(char));
                        translation = searchResult.split('/')[0].trim();
                    } else {
                        // Nếu không tìm thấy, thử tìm trong từ điển phát âm
                        const phienAmResult = this.phienAmDictionary.get(word);

                        // Nếu tìm thấy trong từ điển phát âm, sử dụng kết quả đó
                        if (phienAmResult) {
                            phienAm = word.split('').map(char => this.phienAmDictionary.get(char));
                            translation = phienAmResult;
                        } else {
                            // Nếu không tìm thấy ở cả hai nơi, sử dụng từ gốc
                            phienAm = [];
                            translation = word;
                        }
                    }

                    // Trả về chuỗi "{translation} {word} {phienAm.join(' ')}"
                    return {
                        h: phienAm.join(' '),
                        t: word,
                        v: translation
                    };
                });

                return translations;
            };

            let translatedText;
            try {
                // Loại khoảng trắng đầu dòng
                textContent = textContent.split('\n').map(line => line.trim()).join('\n');
                // Đợi cho Promise được giải quyết
                const translationResult = await dictionary.translate(replaceName(textContent));
                translatedText = translationResult.map(obj => {
                    if (obj.t.includes('\n')) {
                        return obj.t.replace(/\n/g, '<br>');
                    } else if (obj.t === '的' || obj.t === '了' || obj.t === '著' || obj.t === '地') {
                        return `<i style="color:blue" h="${obj.h}" t="${obj.t}" v="${obj.v}">${obj.v}</i>`;
                    } else {
                        return `<i h="${obj.h}" t="${obj.t}" v="${obj.v}">${obj.v}</i>`;
                    }
                }).join(' ').trim();
            } catch (error) {
                console.error('Lỗi Dịch:', error);
            }

            var htmlContent = `
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Tách văn bản</title>
                  <style>
                    body {
                      background: #e9eef2;
                      max-width: 900px;
                      margin: 20px auto;
                    }

                    #content *:not(.highlight) {
                      all: initial;
                    }

                    #dialog {
                      display: none;
                      position: fixed;
                      top: 60%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      padding: 20px;
                      background: #fff;
                      border: 1px solid #ccc;
                      z-index: 1000;
                    }

                    .highlight {
                      color: red !important;
                    }
                  </style>
                </head>
                <body>
                  <div id="content">${translatedText}</div>
                  <div id="dialog">
                    <h3 id="result">Names: </h3>
                    <div id="dialogContent"></div>
                    <button id="nextButton">Mở rộng sang trái</button>
                    <button id="addName">Thêm Name</button>
                    <button id="closeDialogBtn">Đóng dialog</button>
                  </div>

                  <button id="openCloseButton" style="position: fixed; top: 50px; right: 10px; background: #fff;">Mở Names</button>
                  <button id="saveButton" style="position: fixed; top: 50px; right: 120px; display: none; background: #fff;">Lưu Names</button>
                  <textarea id="namedich" rows="10" cols="30" style="position: fixed; top: 80px; right: 10px; display: none; background: #fff4d6;"></textarea>
                </body>
              </html>`;

            newTab.document.write(htmlContent);

            // Reference to the textarea
            var myTextarea = newTab.document.getElementById('namedich');

            // Load text from local storage
            myTextarea.value = localStorage.getItem('VietPhrase') || '';

            // Reference to the open/close button (replace 'yourButtonId' with the actual ID of your button)
            var openCloseButton = newTab.document.getElementById('openCloseButton');

            var dialog = newTab.document.getElementById('dialog');
            var closeDialogBtn = newTab.document.getElementById('closeDialogBtn');

            // Reference to the save button (replace 'yourSaveButtonId' with the actual ID of your button)
            var saveButton = newTab.document.getElementById('saveButton');

            // Toggle textarea visibility and save feature state when the open/close button is clicked
            openCloseButton.addEventListener('click', function () {
                if (myTextarea.style.display === 'none') {
                    // Open the textarea
                    myTextarea.style.display = 'block';
                    saveButton.style.display = 'block';
                    openCloseButton.textContent = 'Đóng Names';
                } else {
                    // Close the textarea
                    myTextarea.style.display = 'none';
                    saveButton.style.display = 'none';
                    openCloseButton.textContent = 'Mở Names';
                }
            });

            // Save text to local storage when the save button is clicked
            saveButton.addEventListener('click', function () {
                var textToSave = myTextarea.value;
                localStorage.setItem('VietPhrase', textToSave);
                newTab.alert('Lưu thành công!');
            });

            closeDialogBtn.addEventListener('click', function () {
                dialog.style.display = 'none';
            });


            /*PHẦN DIALOG*/

            function insertStorage(key, newString) {
                // Lấy chuỗi hiện tại từ localStorage (nếu có)
                let currentString = localStorage.getItem(key) || "";

                // Chèn chuỗi mới vào đầu và thêm \n
                let updatedString = newString + "\n" + currentString;

                // Lưu chuỗi đã cập nhật vào localStorage
                localStorage.setItem(key, updatedString);
            }

            var selectedElements = [];  // Mảng lưu trữ các phần tử đã chọn
            var resultParagraph = newTab.document.getElementById('result');

            function showInfo(element) {
                var h = capitalizeFirstChar(element.getAttribute('h'));
                var t = element.getAttribute('t');
                var v = element.getAttribute('v');
                var p = element.getAttribute('p');

                var dialogContent = `<strong>Hán:</strong> ${t}<br>
                                     <strong>Việt:</strong> ${v}<br>
                                     <strong>Hán Việt:</strong> ${h}`;

                var dialog = newTab.document.getElementById('dialog');
                var dialogContentElement = newTab.document.getElementById('dialogContent');
                dialogContentElement.innerHTML = dialogContent;
                dialog.style.display = 'block';
            }

            function capitalizeFirstChar(str) {
                // Kiểm tra xem str có tồn tại và là chuỗi không
                if (str && typeof str === 'string') {
                    // Tách chuỗi thành mảng các từ dựa trên khoảng trắng
                    var words = str.split(' ');

                    // Duyệt qua mỗi từ trong mảng
                    for (var i = 0; i < words.length; i++) {
                        // Chuyển đổi chữ cái đầu tiên của từ thành chữ hoa và nối với phần còn lại của từ
                        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
                    }

                    // Kết hợp các từ thành một chuỗi mới, cách nhau bởi khoảng trắng
                    return words.join(' ');
                } else {
                    // Xử lý trường hợp str là null hoặc undefined
                    // Trong trường hợp này, bạn có thể quyết định trả về giá trị mặc định hoặc str chính nó, tùy thuộc vào nhu cầu sử dụng của bạn
                    return ''; // Hoặc có thể trả về str như nó, tùy thuộc vào nhu cầu sử dụng
                }
            }

            newTab.document.getElementById('content').addEventListener('click', function (event) {
                var element = event.target;
                console.log(element.textContent);
                selectedElements = [{
                    element: element,
                    h: element.getAttribute('h'),
                    t: element.getAttribute('t')
                }];
                updateResult();
                highlightSelectedElements();
                showInfo(element);
            });

            newTab.document.getElementById('nextButton').addEventListener('click', function () {
                if (selectedElements.length > 0) {
                    var currentElement = selectedElements[selectedElements.length - 1].element;
                    var nextElement = currentElement.nextElementSibling;

                    if (nextElement !== null) {
                        selectedElements.push({
                            element: nextElement,
                            h: nextElement.getAttribute('h'),
                            t: nextElement.getAttribute('t')
                        });
                        updateResult();
                        highlightSelectedElements();
                        showInfo(nextElement);
                    } else {
                        console.log("Không có phần tử kế tiếp.");
                    }
                } else {
                    console.log("Chưa chọn phần tử nào.");
                }
            });

            newTab.document.getElementById('addName').addEventListener('click', function () {
                // Tạo hai mảng riêng lẻ cho thuộc tính 'h' và 't'
                var hArray = selectedElements.map(function (item) {
                    return capitalizeFirstChar(item.h);
                });

                var tArray = selectedElements.map(function (item) {
                    return item.t;
                });

                // console.log(selectedElements);

                if (tArray) {
                    // Thêm thuộc tính 'h' vào localStorage khi click nút "Thêm Name"
                    var newNames = `${tArray.join("")}=${hArray.join(" ")}`;
                    insertStorage('VietPhrase', newNames);

                    // thay thế element
                    flexibleReplace(selectedElements);
                }
            });

            function updateResult() {
                // Cập nhật nội dung hiển thị với chữ cái đầu tiên được viết hoa
                resultParagraph.textContent = "Names: " + capitalizeFirstChar(selectedElements.map(function (item) {
                    return item.h;
                }).join(" "));
            }

            function highlightSelectedElements() {
                // Loại bỏ highlight từ tất cả các phần tử
                newTab.document.querySelectorAll('#content i').forEach(function (element) {
                    element.classList.remove('highlight');
                });

                // Thêm highlight cho các phần tử được chọn
                selectedElements.forEach(function (item) {
                    item.element.classList.add('highlight');
                });
            }


            function flexibleReplace(replacements) {
              const iElements = newTab.document.querySelectorAll('#content i');

              replacements.forEach(({ h: replacementText, t: originalText }) => {
                iElements.forEach((iElement) => {
                  if (iElement.getAttribute('t') === originalText) {
                    iElement.setAttribute('h', replacementText);
                    iElement.innerHTML = capitalizeFirstChar(replacementText);
                  }
                });
              });
            }

        } catch (error) {
            console.error("Error:", error);
            newTab.document.write('<html><head><title>Error</title></head><body><div>Đã xảy ra lỗi trong quá trình dịch.</div></body></html>');
        } finally {
            newTab.document.close();
        }

    });

    // Thêm button vào body của trang
    document.body.appendChild(button);
})();
