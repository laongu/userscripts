// ==UserScript==
// @name         Dịch tiếng Trung
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        *://*/*
// @require      https://laongu.github.io/qt.js
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  let translatedText;

  const dev = true;

  // Thêm Names tại đây
  const content = `
李奥=Lý Áo
江离=Giang Ly
  `;

  class CustomDictionary extends Dictionary {
    async init() {
      // Thêm dữ liệu từ content vào cây Trie
      this.processLines(content, (key, value) => {
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

      if (dev) {
        const splitText = dictionary.tokenize(chineseText);

        const translations = splitText.map(word => {
          let translation = '';

          // Tìm kiếm từ trong từ điển
          const searchResult = dictionary.search(word);

          // Nếu tìm thấy, sử dụng nghĩa đầu tiên (nếu có)
          if (searchResult) {
            translation = searchResult.split('/')[0].trim();
          } else {
            // Nếu không tìm thấy, thử tìm trong từ điển phát âm
            const phienAmResult = dictionary.phienAmDictionary.get(word);

            // Nếu tìm thấy trong từ điển phát âm, sử dụng kết quả đó
            if (phienAmResult) {
              translation = phienAmResult;
            } else {
              // Nếu không tìm thấy ở cả hai nơi, sử dụng từ gốc
              translation = word;
            }
          }

          // Trả về chuỗi "word {translation}"
          return `{${translation} ${word}}`;
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
