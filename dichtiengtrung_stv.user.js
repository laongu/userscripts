// ==UserScript==
// @name         Dịch tiếng trung
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async function () {
  'use strict';

  function fixText(str) {
    // sinodan
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

    return str;
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
      const translatedText = await sendPostRequest("https://sangtacviet.com/", "sajax=trans&content=" + encodeURIComponent(text));
      const translatedArr = translatedText.split('---||---');
      for (let i = 0; i < stackToStockThings.length; i++) {
        stackToStockThings[i].nodeValue = translatedArr[i];
      }
    } catch (error) {
      console.error('Lỗi Dịch:', error);
    }
  }

  try {
    document.body.innerHTML = fixText(document.body.innerHTML);
    await translateNode(document.body);
  } catch (error) {
    console.error('Lỗi Dịch:', error);
  }
})();
