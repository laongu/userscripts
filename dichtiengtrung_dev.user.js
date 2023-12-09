// ==UserScript==
// @name         Dịch tiếng Trung dev
// @namespace    http://tampermonkey.net/
// @version      0.2
// @match        *://*/*
// @require      https://laongu.github.io/qt.js
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  /* sử lý phần storage Names */

  // Create a button to open/close the textarea
  var openCloseButton = document.createElement('button');
  openCloseButton.textContent = 'Mở Names';
  openCloseButton.style.position = 'fixed';
  openCloseButton.style.top = '10px';
  openCloseButton.style.right = '10px';
  document.body.appendChild(openCloseButton);

  // Create a button to save the textarea content
  var saveButton = document.createElement('button');
  saveButton.textContent = 'Lưu Names';
  saveButton.style.position = 'fixed';
  saveButton.style.top = '10px';
  saveButton.style.right = '120px';
  saveButton.style.display = 'none';
  document.body.appendChild(saveButton);

  // Create a toggle button for a feature
  var toggleButton = document.createElement('button');
  toggleButton.textContent = 'Bật/tắt dev';
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '40px';
  toggleButton.style.right = '10px';
  document.body.appendChild(toggleButton);

  // Create a textarea
  var myTextarea = document.createElement('textarea');
  myTextarea.style.position = 'fixed';
  myTextarea.style.top = '80px';
  myTextarea.style.right = '10px';
  myTextarea.rows = 10;
  myTextarea.cols = 30;
  myTextarea.style.display = 'none';
  document.body.appendChild(myTextarea);

  // Flag to track the state of the feature (0: off, 1: on)
  var featureState = parseInt(localStorage.getItem('devVietPhrase')) || 0;

  // Load text from local storage
  myTextarea.value = localStorage.getItem('VietPhrase') || '';

  // Toggle textarea visibility and save feature state when the open/close button is clicked
  openCloseButton.addEventListener('click', function() {
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
  saveButton.addEventListener('click', function() {
    var textToSave = myTextarea.value;
    localStorage.setItem('VietPhrase', textToSave);
    alert('Lưu thành công!');
  });

  // Toggle the feature and update the feature state when the toggle button is clicked
  toggleButton.addEventListener('click', function() {
    featureState = 1 - featureState; // Toggle the state (0 to 1 or 1 to 0)
    localStorage.setItem('devVietPhrase', featureState);
    alert('Dev: ' + (featureState === 1 ? 'Bật' : 'Tắt'));
  });


  /* sử lý phần dịch */
  let translatedText;

  // Thêm Names tại đây
  const names = localStorage.getItem('VietPhrase') || '=';
  console.log(names);

  class CustomDictionary extends Dictionary {
    async init() {
      // Thêm dữ liệu từ names vào cây Trie
      this.processLines(names, (key, value) => {
        this.insert(key, value);
      });

      // Thêm dữ liệu từ các nguồn khác nhau vào cây Trie
      await this.loadDictionaries();
    }
  }

  const dictionary = new CustomDictionary();

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
      await dictionary.init();

      if (featureState === 1) {
        const splitText = dictionary.tokenize(chineseText);

        const translations = splitText.map(word => {
            let translation = '';
            let phienAm = [];

            // Tìm kiếm từ trong từ điển
            const searchResult = dictionary.search(word);

            // Nếu tìm thấy, sử dụng nghĩa đầu tiên (nếu có)
            if (searchResult) {
                phienAm = word.split('').map(char => dictionary.phienAmDictionary.get(char));
                translation = searchResult.split('/')[0].trim();
            } else {
                // Nếu không tìm thấy, thử tìm trong từ điển phát âm
                const phienAmResult = dictionary.phienAmDictionary.get(word);

                // Nếu tìm thấy trong từ điển phát âm, sử dụng kết quả đó
                if (phienAmResult) {
                    phienAm = word.split('').map(char => dictionary.phienAmDictionary.get(char));
                    translation = phienAmResult;
                } else {
                    // Nếu không tìm thấy ở cả hai nơi, sử dụng từ gốc
                    phienAm = [];
                    translation = word;
                }
            }

            // Trả về chuỗi "{translation} {word} {phienAm.join(' ')}"
            return `{${translation} ${word} ${phienAm.join(' ')}}`;
        });

        translatedText = translations.join(' ');
      } else {
        translatedText = dictionary.translate(chineseText);
      }
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
})();
