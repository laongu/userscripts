// ==UserScript==
// @name         Dịch tiếng trung
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';


  /* sử lý phần storage Names */

  // Create a button to open/close the textarea
  var openCloseButton = document.createElement('button');
  openCloseButton.textContent = 'Mở Names';
  openCloseButton.style.position = 'fixed';
  openCloseButton.style.top = '50px';
  openCloseButton.style.right = '10px';
  document.body.appendChild(openCloseButton);

  // Create a button to save the textarea content
  var saveButton = document.createElement('button');
  saveButton.textContent = 'Lưu Names';
  saveButton.style.position = 'fixed';
  saveButton.style.top = '50px';
  saveButton.style.right = '120px';
  saveButton.style.display = 'none';
  document.body.appendChild(saveButton);

  // Create a toggle button for a feature
  var toggleButton = document.createElement('button');
  toggleButton.textContent = 'Bật/tắt dịch';
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '90px';
  toggleButton.style.right = '10px';
  document.body.appendChild(toggleButton);

  // Create a textarea
  var myTextarea = document.createElement('textarea');
  myTextarea.style.position = 'fixed';
  myTextarea.style.top = '130px';
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
    alert('Dịch: ' + (featureState === 1 ? 'Bật' : 'Tắt'));
  });

  // Tùy chọn để bật/tắt dịch thuật
  if (featureState === 0) {
    // Thoát ngay không tác động gì cả
    return;
  }


  let namedata = localStorage.getItem('VietPhrase') || '=';
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

  function sendPostRequest(url, data) {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    }).then(response => response.text());
  }

  async function translateNode(domNode) {
    const excludedTags = new Set(['SCRIPT', 'STYLE', 'BR', 'HR']);
    const stackToStockThings = [];

    function traverseDOM(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        stackToStockThings.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE && !excludedTags.has(node.tagName.toUpperCase())) {
        for (const childNode of node.childNodes) {
          traverseDOM(childNode);
        }
      }
    }

    traverseDOM(domNode);

    const text = stackToStockThings.map(node => node.nodeValue).join('---||---');

    try {
      const translatedText = await sendPostRequest("https://sangtacviet.com/", "sajax=trans&content=" + encodeURIComponent(replaceName(text)));
      const translatedArr = translatedText.split('---||---');
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
