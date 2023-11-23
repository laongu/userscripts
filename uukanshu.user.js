// ==UserScript==
// @name            uukanshu tải txt
// @author          Lão Ngũ
// @match           https://www.uukanshu.com/b/*/
// @require         https://code.jquery.com/jquery-3.5.1.min.js
// @require         https://unpkg.com/jszip@3.1.5/dist/jszip.min.js
// @require         https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require         https://unpkg.com/ejs@2.7.4/ejs.min.js
// @require         https://unpkg.com/jepub/dist/jepub.min.js
// @require         https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @require         https://laongu.github.io/qt.js
// @noframes
// @connect         self
// @run-at          document-end
// @grant           GM_xmlhttpRequest
// @grant           GM.xmlHttpRequest
// ==/UserScript==

(function($, window, document, undefined) {
  'use strict';

  /**
   * Enable logging in Console
   * @type {Number} 0 : Disable
   *                1 : Error
   *                2 : Info + Error
   */
  var debugLevel = 0;

  function html2text(html) {
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/(div|p|li|dd|h[1-6])>/gi, '\n');
    html = html.replace(/<(br|hr)\s*[/]?>/gi, '\n');
    html = html.replace(/<li>/ig, '+ ');
    html = html.replace(/<[^>]+>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    return html;
  }

  function downloadFail(err) {
    $downloadStatus('red');
    titleError.push(chapTitle);
    
    txt += LINE2 + url + LINE2;

    if (debugLevel == 2) console.log('%cError: ' + url, 'color:red;');
    if (debugLevel > 0) console.error(err);
  }

  function saveEbook() {
    if (endDownload) return;
    endDownload = true;

    var ebookTitle = $('h1').text().trim(),
      translatedEbookTitle = dictionary.translate(ebookTitle),
      fileName = translatedEbookTitle + '.txt',
      beginEnd = '',
      blob;

    if (titleError.length) {

      titleError = LINE + 'Các chương lỗi: ' + titleError.join(', ') + LINE;
      if (debugLevel > 0) console.warn('Các chương lỗi:', titleError);

    } else {
      titleError = '';
    }

    if (begin !== end) beginEnd = 'Từ [' + begin + '] đến [' + end + ']';

    // data
    txt = translatedEbookTitle + LINE + txt;

    blob = new Blob([txt], {
      encoding: 'UTF-8',
      type: 'text/plain; charset=UTF-8'
    });

    $download.attr({
      href: window.URL.createObjectURL(blob),
      download: fileName
    }).text('Tải xong, click để tải về').off('click');
    $downloadStatus('greenyellow');

    $win.off('beforeunload');

    document.title = '[⇓] ' + translatedEbookTitle;
    if (debugLevel === 2) console.log('%cDownload Finished!', 'color:blue;');
    if (debugLevel > 0) console.timeEnd('TXT Downloader');
  }

  function getContent() {
    if (endDownload) return;
    chapId = chapList[count];
    //chapTitle = chapList[count][1];

    $.get(chapId)
      .done(function (response) {

        var $data = $(response),
          $chapter = $data.find('#contentbox'),
          $notContent = $chapter.find('iframe, script, style, div');

        if (endDownload) return;
        
        chapTitle = $data.find('h1').text().trim();

        if ($notContent.length) $notContent.remove();

        var translatedText = LINE2 + chapTitle + LINE + html2text($chapter.html().replace('&nbsp;', ''));

        txt += dictionary.translate(translatedText);

        count++;

        if (debugLevel === 2) console.log('%cComplete: ' + chapId, 'color:green;');

        if (count === 1) begin = chapTitle;
        end = chapTitle;

        $download.text('Đang tải chương: ' + count + '/' + chapListSize);
        document.title = '[' + count + '] ' + pageName;

        if (count >= chapListSize) {
          saveEbook();
        } else {
          getContent();
        }

      })
      .fail(function (err) {
        chapTitle = null;
        downloadFail(err);
        saveEbook();
      });
  }

  // INDEX
  var pageName = document.title,
    $win = $(window),

    $download = $('<a>', {
      style: 'background-color:lightblue;',
      href: '#download',
      text: 'Tải xuống'
    }),
    $downloadStatus = function(status) {
      $download.css("background-color", "").css("background-color", status);
    },
    endDownload = false,

    LINE = '\n\n',
    LINE2 = '\n\n\n\n',

    txt = '',
    url = '',
    count = 0,
    begin = '',
    end = '',

    chapId = '',
    chapTitle = '',
    chapList = [],
    chapListSize = 0,
    titleError = [];

  $download.insertAfter('h1');

  // tạo từ điển
  const dictionary = new Dictionary();
  dictionary.initialize();

  $download.one('click contextmenu', function (e) {
    e.preventDefault();
    document.title = '[...] Vui lòng chờ trong giây lát';

    var $chapList = $('#chapterList a');
    if ($chapList.length)
    $chapList.each(function () {
      chapList.push($(this).attr('href'));
    });

    // dao nguoc mang
    chapList.reverse();

    console.log(chapList);

    if (e.type === 'contextmenu') {
      $download.off('click');
      var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', chapList[0]);
      startFrom = chapList.indexOf(startFrom.replace(location.href, ''));
      if (startFrom !== -1) chapList = chapList.slice(startFrom);
    } else {
      $download.off('contextmenu');
    }

    chapListSize = chapList.length;
    if (chapListSize > 0) {
      getContent();

      $win.on('beforeunload', function() {
        return 'Truyện đang được tải xuống...';
      });

      $download.one('click', function(e) {
        e.preventDefault();
        saveEbook();
      });
    }

  });


})(jQuery, window, document);
