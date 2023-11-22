// ==UserScript==
// @name         Dịch tiếng trung
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        *://*/*
// @require      https://laongu.github.io/qt.js
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  // code by Lão Ngũ
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
      await dictionary.initialize();
      const translatedText = dictionary.translate(chineseText);
      console.log(translatedText);
      
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
