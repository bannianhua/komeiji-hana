/* ============================================================
 * 梦眠馆 · 古明地华 —— 单页应用主逻辑
 * hash 路由 / 页面渲染 / 梦眠小屋互动 / 画廊灯箱 / 留言板 / 摇篮曲
 * 纯静态，双击 index.html 即可运行。
 * ============================================================ */
(function () {
  'use strict';

  var H = window.HANA || {};
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- 小工具 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function seedOf(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rngOf(seed) {
    var s = seed >>> 0;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function pick(arr, seed) {
    if (!arr || !arr.length) return '';
    var r = rngOf(seed === undefined ? Date.now() : seed);
    return arr[Math.floor(r() * arr.length)];
  }
  function store(key, val) {
    try {
      if (val === undefined) { var v = localStorage.getItem(key); return v == null ? null : v; }
      localStorage.setItem(key, String(val));
    } catch (e) { /* file:// 或隐私模式下忽略 */ }
    return null;
  }
  function num(key, dft) {
    var v = parseFloat(store(key));
    return isNaN(v) ? dft : v;
  }
  function fmtNow() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, '0'); };
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function attr(k, v) {
    return '<div class="attr"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
  }
  function entry(href, ico, title, desc, en) {
    return '<a class="entry" href="' + href + '"><span class="e-ico">' + ico + '</span>' +
      '<h3>' + title + '</h3><p>' + desc + '</p><span class="e-en">' + en + '</span></a>';
  }
  function sec(title) { return '<div class="sec-h">' + title + '</div>'; }

  /* ---------------- 背景：心、星星与 Zzz ---------------- */
  function buildFx() {
    var fx = $('fx');
    if (!fx || fx.dataset.built) return;
    fx.dataset.built = '1';
    var html = '';
    var i, n = 16;
    for (i = 0; i < n; i++) {
      var left = (Math.random() * 100).toFixed(2);
      var size = (7 + Math.random() * 12).toFixed(1);
      var dur = (13 + Math.random() * 14).toFixed(1);
      var delay = (-Math.random() * 22).toFixed(1);
      var hue = Math.random() < 0.55 ? 'h' : 'z';
      html += '<span class="fx-' + hue + '" style="left:' + left + '%;--s:' + size + 'px;--dur:' + dur + 's;--delay:' + delay + 's">' +
        (hue === 'h' ? '♥' : 'z') + '</span>';
    }
    for (i = 0; i < 12; i++) {
      html += '<span class="fx-star" style="left:' + (Math.random() * 100).toFixed(2) + '%;top:' + (Math.random() * 100).toFixed(2) +
        '%;--dur:' + (3 + Math.random() * 5).toFixed(1) + 's;--delay:' + (-Math.random() * 6).toFixed(1) + 's;--size:' + (2 + Math.random() * 4).toFixed(1) + 'px"></span>';
    }
    fx.innerHTML = html;
  }
  function popText(text, x, y, cls) {
    var s = document.createElement('span');
    s.className = 'pop ' + (cls || '');
    s.textContent = text;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    document.body.appendChild(s);
    setTimeout(function () { s.remove(); }, 1600);
  }

  /* ---------------- 提示气泡 ---------------- */
  var toastTimer = null;
  function toast(text, ms) {
    var t = $('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.innerHTML = '<span class="toast-eye">👁</span><span>' + text + '</span>';
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, ms || 4200);
  }

  /* ============================================================
     主页
     ============================================================ */
  function dailyFortune() {
    var r = rngOf(seedOf('fortune-' + dayKey()));
    return Math.floor(r() * H.fortunes.length);
  }
  var fortuneIdx = dailyFortune();

  function pgHome() {
    var f = H.fortunes[fortuneIdx % H.fortunes.length];
    var quote = pick(H.quotes, seedOf('quote-' + dayKey()));
    var stats = [
      ['25', '每天想睡的小时'],
      ['1', '只第三只眼'],
      ['2', '位姐姐'],
      ['4', '处心形饰片'],
      ['100%', '说话拖长音'],
      ['0', '本月早起次数']
    ];
    return '' +
      '<section class="hero">' +
        '<div class="hero-txt">' +
          '<span class="hero-kicker">👁 SATORI YOUKAI · 古明地家三妹</span>' +
          '<h1>古明地 华</h1>' +
          '<p class="hero-sub">こめいじ はな · Komeiji Hana</p>' +
          '<p class="hero-desc">住在旧地狱地灵殿的觉妖怪，古明地家的三妹。' +
            '拥有读心的能力，却把听见的心声当作摇篮曲——所以常常读着读着就睡着了。' +
            '第三只眼长在左胸心口，蓝色表皮、蓝色瞳孔，管子缠着心形扣子和鞋饰，' +
            '像一件会呼吸的睡衣。<em>一天想睡二十五小时</em>，说话尾音会拖得长长的～～</p>' +
          '<div class="hero-act">' +
            '<a class="btn solid" href="#/profile">看完整角色设定</a>' +
            '<a class="btn" href="#/dream">去梦眠小屋</a>' +
            '<a class="btn" href="#/gallery">看看立绘</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-art">' +
          '<figure class="polaroid">' +
            '<div class="polaroid-img"><img src="assets/hana-full-thumb.webp" alt="古明地华全身立绘" loading="eager"></div>' +
            '<figcaption>古明地华 · 睡衣与心口的第三只眼</figcaption>' +
            '<span class="p-badge b1">Zzz…</span><span class="p-badge b2">读心</span><span class="p-badge b3">♥</span>' +
          '</figure>' +
        '</div>' +
      '</section>' +

      '<div class="stats">' + stats.map(function (s) {
        return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
      }).join('') + '</div>' +

      sec('今日睡眠运势 · ' + dayKey()) +
      '<div class="fortune card" id="fortune-card">' +
        '<div class="fortune-lv">' + f.lv + '</div>' +
        '<div class="fortune-body">' +
          '<h3><span class="f-tag">' + f.lv + '</span>' + f.name + '</h3>' +
          '<p>' + f.text + '</p>' +
          '<p class="f-tip">→ ' + f.tip + '</p>' +
        '</div>' +
        '<button class="btn sm" id="fortune-again" type="button">再抽一签</button>' +
      '</div>' +

      sec('地灵殿的三姐妹') +
      '<div class="sisters-row">' + H.sisters.map(function (s) {
        return '<a class="sister-mini ' + s.color + '" href="#/family">' +
          '<span class="sm-eye">' + (s.key === 'hana' ? '👁' : s.key === 'satori' ? '👁' : '—') + '</span>' +
          '<b>' + s.name + '</b><span>' + s.role + '</span>' +
          '<em>' + s.tags[0] + ' · ' + s.tags[2] + '</em>' +
        '</a>';
      }).join('') + '</div>' +

      sec('今日梦话') +
      '<div class="quote-bubble">' +
        '<div class="q-avatar"><img src="assets/hana-avatar.webp" alt="古明地华头像"></div>' +
        '<div class="q-text"><p>「' + quote + '」</p><span>—— 古明地华 · ' + dayKey() + '</span></div>' +
      '</div>' +

      sec('在梦眠馆里走走') +
      '<div class="entries">' +
        entry('#/profile', '👁', '角色设定', '姓名、种族、能力、外貌与性格，全部资料一次看完。', 'PROFILE') +
        entry('#/family', '🏯', '古明地家', '觉姐姐、恋姐姐、地灵殿与第三只眼的种种。', 'FAMILY') +
        entry('#/dream', '💤', '梦眠小屋', '哄华睡觉、抽一枚梦境碎片、听一首摇篮曲。', 'DREAM') +
        entry('#/gallery', '🖼', '画廊', '立绘与设定草图，可放大细看。', 'GALLERY') +
        entry('#/board', '✉', '留言板', '给华留一句话吧——睡着的时候她也听得见哦。', 'BOARD') +
      '</div>' +

      sec('关于这座梦眠馆') +
      '<div class="card prose">' +
        '<p>梦眠馆是古明地华的角色小屋。她不是地灵殿里最勤快的那一个，也不是最擅长说话的那一个；' +
        '但她记得每一个来过地灵殿的人，因为……「就算睡着了，心声也还是会飘过来嘛～～」</p>' +
        '<p>这里收集了华的全部设定、古明地姐妹与地灵殿的二创设定、几张立绘和设定图鉴，' +
        '以及一间可以一起打盹的「梦眠小屋」。请把这里当成一个能放心犯困的地方——' +
        '<b>地灵殿的被窝，分你一半。</b></p>' +
      '</div>';
  }

  function initHome() {
    var btn = $('fortune-again');
    if (btn) btn.addEventListener('click', function () {
      fortuneIdx = (fortuneIdx + 1) % H.fortunes.length;
      var f = H.fortunes[fortuneIdx];
      var card = $('fortune-card');
      if (!card) return;
      var lv = card.querySelector('.fortune-lv');
      var h3 = card.querySelector('h3');
      var p = card.querySelector('p');
      var tip = card.querySelector('.f-tip');
      var tag = card.querySelector('.f-tag');
      lv.textContent = f.lv;
      lv.className = 'fortune-lv lv-' + f.lv;
      h3.innerHTML = '<span class="f-tag">' + f.lv + '</span>' + f.name;
      p.textContent = f.text;
      tip.textContent = '→ ' + f.tip;
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
      toast('华翻了个身：「换一个也没关系哦～～」');
    });
  }

  /* ============================================================
     角色设定
     ============================================================ */
  function pgProfile() {
    return '' +
      '<h2 class="p-title">角色设定</h2>' +
      '<p class="p-sub">古明地 华 · <b>こめいじ はな</b> · 读心的觉妖怪，睡觉是第一位的</p>' +

      '<div class="chara card">' +
        '<div class="c-art">' +
          '<div class="avatar-frame"><img src="assets/hana-avatar.webp" alt="古明地华头像"></div>' +
          '<div class="c-art-note">「呼啊～～」</div>' +
        '</div>' +
        '<div class="c-body">' +
          '<div class="chara-hd"><h3>古明地 华</h3><span class="c-alias">Komeiji Hana · 古明地家三妹 · 地灵殿的睡神</span></div>' +
          '<div class="attrs">' + H.profile.map(function (r) { return attr(r[0], r[1]); }).join('') + '</div>' +
        '</div>' +
      '</div>' +

      sec('外貌拆解') +
      '<div class="appear-grid">' + H.appearance.map(function (a) {
        return '<div class="appear card"><span class="a-ico">' + a.icon + '</span><h4>' + a.title + '</h4><p>' + a.text + '</p></div>';
      }).join('') + '</div>' +

      sec('能力 · 读心') +
      '<div class="ability card">' +
        '<div class="ab-left">' +
          '<div class="ab-eye">👁️</div>' +
          '<h3>读心</h3>' +
          '<p class="ab-sub">第三只眼看见的，是「心声」</p>' +
        '</div>' +
        '<div class="ab-right">' +
          '<p>作为觉妖怪，华能听见附近人们心里的声音。不同的是，她的第三只眼长在左胸心口，' +
            '离心脏最近——所以每一句心声，都像贴着耳朵说出来的悄悄话。</p>' +
          '<p>华的心声感知范围不大，大概只有一间房间那么远；如果对方睡着了，她反而听得更清楚，' +
            '因为梦话是不设防的。她自己睡着的时候，第三只眼会半闭起来，' +
            '只剩下一点点「嘀嘀咕咕」的梦话在管子里流动。</p>' +
          '<p>被读心的时候，很多人会紧张；但华通常只是打个哈欠，然后说：' +
            '<b>「嗯——我听见啦。放心，我很快就忘了，因为我马上就睡着了～～」</b></p>' +
          '<button class="btn solid" id="read-mind" type="button">👁 试试看被华读心</button>' +
          '<p class="mind-out" id="mind-out">（华还在睡……要现在试试吗？）</p>' +
        '</div>' +
      '</div>' +

      sec('性格数值（娱乐向）') +
      '<div class="traits card">' + H.traits.map(function (t) {
        var w = Math.min(100, t.value);
        return '<div class="trait">' +
          '<div class="t-line"><b>' + t.label + '</b><span>' + t.value + '%</span></div>' +
          '<div class="t-bar"><i style="--w:' + w + '%"></i></div>' +
          '<small>' + t.note + '</small>' +
        '</div>';
      }).join('') + '</div>' +

      sec('口癖与日常台词') +
      '<div class="quotes-grid">' + H.quotes.map(function (q) {
        return '<div class="quote-item">「' + q + '」</div>';
      }).join('') + '</div>' +

      sec('喜欢 / 不擅长') +
      '<div class="two-col">' +
        '<div class="card like"><h3>♥ 喜欢</h3><ul>' +
          '<li>睡觉，以及睡觉之前的准备工作</li>' +
          '<li>被窝、枕头、以及被太阳晒过的被子</li>' +
          '<li>姐姐们的膝枕（觉姐姐的尤其软）</li>' +
          '<li>温牛奶和甜甜的梦</li>' +
          '<li>地灵殿里暖和的地方，包括炉子旁边和阿空的身边</li>' +
          '<li>被人轻轻拍着背</li>' +
        '</ul></div>' +
        '<div class="card dislike"><h3>× 不擅长</h3><ul>' +
          '<li>早起（无论几点起床都算早起）</li>' +
          '<li>太吵的声音、太急的人</li>' +
          '<li>需要站着做的事情</li>' +
          '<li>把第三只眼从暖和的地方解开</li>' +
          '<li>解释「为什么又睡着了」</li>' +
          '<li>被子被掀开的那一瞬间</li>' +
        '</ul></div>' +
      '</div>' +

      sec('二创小设定') +
      '<div class="card prose small">' +
        '<p>※ 以下为角色二次创作设定，不是东方Project原作内容：</p>' +
        '<ul class="dots">' +
          '<li>华的第三只眼长在心口，是因为她觉得心声太吵，想把它抱在离心脏最近的地方——' +
            '结果听着听着就睡着了，第三只眼便再也没有挪回去。</li>' +
          '<li>她睡着时，第三只眼会半闭。姐姐们说，那是「华在做梦」的信号。</li>' +
          '<li>管子会自己寻找温暖的地方，冬天地灵殿最暖的炉边常常盘着一小团管子。</li>' +
          '<li>华的读心对姐姐们几乎无效——觉姐姐的心声太清楚，像在耳边念书；' +
            '恋姐姐则安静得像被窝里的另一团温暖，只能感觉到，听不见。</li>' +
          '<li>地灵殿的宠物们一致认为：华是整座地灵殿里最好睡的抱枕。</li>' +
        '</ul>' +
      '</div>';
  }

  function initProfile() {
    var btn = $('read-mind');
    var out = $('mind-out');
    if (!btn || !out) return;
    var i = Math.floor(Math.random() * H.mindRead.length);
    btn.addEventListener('click', function (e) {
      i = (i + 1) % H.mindRead.length;
      out.textContent = '华：「' + H.mindRead[i] + '」';
      out.classList.remove('flash');
      void out.offsetWidth;
      out.classList.add('flash');
      var r = btn.getBoundingClientRect();
      popText('👁', r.left + r.width / 2, r.top, 'pop-eye');
      if (i === H.mindRead.length - 1) toast('第三只眼困得闭上了……');
    });
  }

  /* ============================================================
     古明地家
     ============================================================ */
  function pgFamily() {
    return '' +
      '<h2 class="p-title">古明地家</h2>' +
      '<p class="p-sub">地灵殿的三姐妹 · 觉妖怪与第三只眼的故事</p>' +

      '<div class="ftree card">' +
        '<div class="ftree-row">' + H.sisters.map(function (s, i) {
          return (i ? '<span class="ftree-link"></span>' : '') +
            '<a class="ftree-node ' + s.color + '" href="#/family">' +
              '<span class="fn-eye">' + (s.key === 'koishi' ? '－' : '👁') + '</span>' +
              '<b>' + s.name + '</b><small>' + s.role + '</small>' +
            '</a>';
        }).join('') + '</div>' +
        '<p class="ftree-cap">地灵殿 · 古明地家 —— 长姐觉、二姐恋、三妹华</p>' +
      '</div>' +

      sec('三姐妹档案') +
      H.sisters.map(function (s) {
        return '<div class="sister-card card ' + s.color + '">' +
          '<div class="sc-head">' +
            '<span class="sc-eye">' + (s.key === 'koishi' ? '－' : '👁') + '</span>' +
            '<div><h3>' + s.name + '<small>' + s.jp + '</small></h3>' +
            '<p class="sc-role">' + s.role + ' · ' + s.alias + '</p></div>' +
          '</div>' +
          '<div class="sc-tags">' + s.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
          '<p class="sc-intro">' + s.intro + '</p>' +
          '<p class="sc-note">' + s.note + '</p>' +
        '</div>';
      }).join('') +

      sec('第三只眼对照表') +
      '<div class="compare card">' +
        '<div class="cmp-row cmp-head"><span></span><b class="rose">觉</b><b class="green">恋</b><b class="blue">华</b></div>' +
        H.compare.map(function (r) {
          return '<div class="cmp-row"><span class="cmp-k">' + r.k + '</span>' +
            '<span>' + r.s + '</span><span>' + r.k2 + '</span><span>' + r.h + '</span></div>';
        }).join('') +
      '</div>' +

      sec('地灵殿与觉妖怪') +
      '<div class="two-col lore">' +
        '<div class="card"><h3>🏯 地灵殿</h3>' +
          '<p>地灵殿位于旧地狱 / 地底世界，是古明地觉的居所。殿里住着许多被觉收留的动物，' +
          '也住着火焰猫燐、灵乌路空等伙伴。</p>' +
          '<p>对华来说，地灵殿最重要的三个地点是：<b>自己的被窝</b>、<b>炉子旁边</b>、' +
          '以及<b>觉姐姐的膝枕</b>。她偶尔也会去书库，但通常翻到第三页就睡着了。</p></div>' +
        '<div class="card"><h3>👁 觉妖怪与第三只眼</h3>' +
          '<p>觉是栖息在地底的妖怪，拥有读心的能力。她们的第三只眼能看见他人的心声，' +
          '也正因如此，觉妖怪常常被地上的人们疏远、畏惧。</p>' +
          '<p>但动物们并不在意读心，所以觉姐姐身边总围着一群宠物；' +
          '而华则发现，睡着的人的心声最温柔——她把那些碎碎念当作摇篮曲，' +
          '于是读心这件事，在她这里变成了一种安眠的方式。</p></div>' +
      '</div>' +

      sec('地灵殿的日常 · 小剧场') +
      '<div class="timeline">' + H.dailyScenes.map(function (d) {
        return '<div class="tl-item card">' +
          '<div class="tl-time">' + d.time + '</div>' +
          '<h4>' + d.title + '</h4><p>' + d.text + '</p>' +
        '</div>';
      }).join('') + '</div>' +

      '<div class="card canon-note">' +
        '<b>关于原作：</b>古明地觉、古明地恋、地灵殿、觉妖怪与第三只眼的设定出自东方Project（上海爱丽丝幻乐团）。' +
        '古明地华为本网站的二次创作原创角色，与姐姐们的地灵殿日常属于同人设定。' +
      '</div>';
  }

  /* ============================================================
     梦眠小屋
     ============================================================ */
  var zzz = num('hana_zzz', 0);
  var sheep = num('hana_sheep', 0);
  var soundOn = false;

  function sleepLevel() { return Math.max(0, Math.min(100, zzz / 12 * 100)); }

  function pgDream() {
    var lv = H.levelLines[Math.min(H.levelLines.length - 1, Math.floor(zzz / 2))];
    var asleep = zzz >= 12;
    return '' +
      '<h2 class="p-title">梦眠小屋</h2>' +
      '<p class="p-sub">嘘——华已经躺好啦 · 轻一点，再轻一点～</p>' +

      '<div class="night card' + (asleep ? ' asleep' : '') + '" id="night">' +
        '<div class="night-sky" aria-hidden="true">' +
          '<span class="moon">🌙</span><span class="st s1">✦</span><span class="st s2">✧</span>' +
          '<span class="st s3">✦</span><span class="st s4">✧</span><span class="st s5">✦</span>' +
        '</div>' +
        '<div class="bed">' +
          '<div class="bed-hana">' +
            '<img src="assets/hana-avatar.webp" alt="睡着的古明地华">' +
            '<span class="zzz z1">z</span><span class="zzz z2">Z</span><span class="zzz z3">Z</span>' +
          '</div>' +
          '<div class="bed-cover"></div>' +
        '</div>' +
        '<div class="night-side">' +
          '<h3>' + (asleep ? '华已经睡着啦 Zzz……' : '华正在努力入睡……') + '</h3>' +
          '<p class="night-line" id="night-line">华：「' + lv + '」</p>' +
          '<div class="sleep-bar"><i id="sleep-bar" style="--w:' + sleepLevel() + '%"></i></div>' +
          '<p class="sleep-count">睡意值 <b id="zzz-num">' + zzz + '</b> / 12　' +
            '<span id="zzz-state">' + (asleep ? '已进入梦乡' : '还差一点点') + '</span></p>' +
          '<div class="night-btns">' +
            '<button class="btn sm" data-act="pat" type="button">拍拍她</button>' +
            '<button class="btn sm" data-act="blanket" type="button">盖好被子</button>' +
            '<button class="btn sm" data-act="light" type="button">关掉第三只眼的灯</button>' +
            '<button class="btn sm" data-act="music" type="button">放摇篮曲</button>' +
            '<button class="btn sm ghost" data-act="reset" type="button">让她重新睡</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="dream-grid">' +
        '<div class="card dream-draw">' +
          '<h3>🌙 梦境碎片</h3>' +
          '<p class="dd-tip">轻轻点一下月亮，看看华今晚梦见了什么。</p>' +
          '<button class="dream-bubble" id="draw-dream" type="button"><span>点我抽一枚梦</span></button>' +
          '<div class="dream-text" id="dream-text">今晚的梦还没有开始……</div>' +
        '</div>' +
        '<div class="card sheep-card">' +
          '<h3>🐑 数羊计数器</h3>' +
          '<p class="dd-tip">华说，数到一百只就可以睡了（但她通常数不到十只）。</p>' +
          '<div class="sheep-num"><b id="sheep-num">' + sheep + '</b><span>只羊</span></div>' +
          '<button class="btn solid" id="count-sheep" type="button">跳一只羊</button>' +
          '<button class="btn sm ghost" id="reset-sheep" type="button">重新数</button>' +
          '<p class="sheep-line" id="sheep-line">羊群还在排队……</p>' +
        '</div>' +
        '<div class="card sleep-calc">' +
          '<h3>⏰ 和华比一比睡眠</h3>' +
          '<p class="dd-tip">填一下你的睡觉时间和起床时间，让华点评一下。</p>' +
          '<div class="calc-row"><label>睡觉 <input type="time" id="sleep-at" value="23:00"></label>' +
            '<label>起床 <input type="time" id="wake-at" value="07:00"></label></div>' +
          '<button class="btn solid" id="calc-sleep" type="button">计算</button>' +
          '<p class="calc-out" id="calc-out">华的目标是 25 小时；你可以先填一个正常的数字。</p>' +
        '</div>' +
      '</div>' +

      '<div class="card tips">' +
        '<h3>💤 华的睡前小贴士</h3>' +
        '<ul class="dots">' +
          '<li>睡前把第三只眼放在心口，让管子自然垂下来，不要缠住脖子。</li>' +
          '<li>温牛奶要慢慢喝，喝太快会烫到舌头，然后就会睡不着——这是经验之谈。</li>' +
          '<li>如果睡不着，可以听觉姐姐念书；她的声音很稳，三页之内一定睡着。</li>' +
          '<li>不要数羊数得太认真，羊也是有脾气的。</li>' +
          '<li>最重要的：明天的事情，交给明天的自己。今天的你，只负责睡觉～～</li>' +
        '</ul>' +
      '</div>';
  }

  function paintSleep() {
    var bar = $('sleep-bar');
    var n = $('zzz-num');
    var state = $('zzz-state');
    var line = $('night-line');
    var night = $('night');
    if (!bar || !night) return;
    var asleep = zzz >= 12;
    bar.style.setProperty('--w', sleepLevel() + '%');
    n.textContent = zzz;
    state.textContent = asleep ? '已进入梦乡' : (zzz >= 6 ? '开始迷糊了' : '还差一点点');
    night.classList.toggle('asleep', asleep);
    var lv = H.levelLines[Math.min(H.levelLines.length - 1, Math.floor(zzz / 2))];
    line.textContent = '华：「' + lv + '」';
    night.querySelector('h3').textContent = asleep ? '华已经睡着啦 Zzz……' : '华正在努力入睡……';
  }

  function initDream() {
    var night = $('night');
    if (!night) return;
    night.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var act = b.dataset.act;
        var r = b.getBoundingClientRect();
        if (act === 'reset') {
          zzz = 0; store('hana_zzz', zzz); paintSleep();
          toast('华翻了个身：「唔……刚才睡到哪了～～」');
          return;
        }
        if (zzz < 12) zzz += 1;
        store('hana_zzz', zzz);
        if (act === 'music') {
          toggleMusic();
          toast('华：「' + pick(H.musicLines, Date.now()) + '」');
        } else {
          var pool = act === 'pat' ? H.patLines : act === 'blanket' ? H.blanketLines : H.lightLines;
          toast('华：「' + pick(pool, Date.now() + zzz) + '」');
        }
        var sym = act === 'pat' ? '♥' : act === 'blanket' ? '🛏' : act === 'light' ? '🌙' : '♪';
        popText(sym, r.left + r.width / 2, r.top, 'pop-soft');
        paintSleep();
        if (zzz === 12) {
          setTimeout(function () {
            toast('华睡着了。第三只眼慢慢闭上，管子安静下来——晚安～～', 6000);
          }, 500);
        }
      });
    });

    var draw = $('draw-dream');
    if (draw) {
      var di = Math.floor(Math.random() * H.dreams.length);
      draw.addEventListener('click', function (e) {
        di = (di + 1) % H.dreams.length;
        var t = $('dream-text');
        t.textContent = '「' + H.dreams[di] + '」';
        t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
        draw.querySelector('span').textContent = '再抽一枚';
        var r = draw.getBoundingClientRect();
        popText('🌙', r.left + r.width / 2, r.top, 'pop-soft');
      });
    }

    var sb = $('count-sheep');
    if (sb) {
      sb.addEventListener('click', function (e) {
        sheep += 1; store('hana_sheep', sheep);
        $('sheep-num').textContent = sheep;
        var r = sb.getBoundingClientRect();
        popText('🐑', r.left + r.width / 2, r.top, 'pop-sheep');
        if (sheep === 100) {
          $('sheep-line').textContent = '华：「一……一百只啦！奖励自己睡一觉～～」';
          toast('恭喜！华达成了「数到一百只羊」的成就（然后秒睡）。', 6000);
        } else if (sheep % 5 === 0) {
          $('sheep-line').textContent = '华：「' + pick(H.sheepLines, sheep) + '」';
        } else {
          $('sheep-line').textContent = '第 ' + sheep + ' 只羊跳过去了……';
        }
      });
      var rs = $('reset-sheep');
      if (rs) rs.addEventListener('click', function () {
        sheep = 0; store('hana_sheep', sheep);
        $('sheep-num').textContent = sheep;
        $('sheep-line').textContent = '羊群重新排好了队……';
      });
    }

    var calc = $('calc-sleep');
    if (calc) {
      calc.addEventListener('click', function () {
        var a = $('sleep-at').value || '23:00';
        var b = $('wake-at').value || '07:00';
        var toMin = function (s) { var p = s.split(':'); return (+p[0]) * 60 + (+p[1]); };
        var d = toMin(b) - toMin(a);
        if (d <= 0) d += 24 * 60;
        var hours = d / 60;
        var out;
        if (hours < 5) out = '只睡了 ' + hours.toFixed(1) + ' 小时……不行不行，快回去躺好，华把被子分你一半～～';
        else if (hours < 7) out = hours.toFixed(1) + ' 小时，勉强及格啦。不过华的标准是「睡到自然醒」哦～～';
        else if (hours <= 9) out = hours.toFixed(1) + ' 小时，很不错嘛！要不要来地灵殿，被窝分你一半～～';
        else if (hours <= 12) out = '哇，' + hours.toFixed(1) + ' 小时！你也是同道中人。华说：明天可以再多睡一点点～';
        else out = hours.toFixed(1) + ' 小时……你比华还厉害！华决定把「地灵殿睡神」的称号让给你～～';
        $('calc-out').textContent = '华：「' + out + '」';
        toast('华认真地读完了你的睡眠时间，然后打了个哈欠。');
      });
    }
  }

  /* ============================================================
     画廊
     ============================================================ */
  var gFilter = 'all';
  var gList = [];
  var gCur = -1;

  function filteredGallery() {
    return H.gallery.filter(function (g) { return gFilter === 'all' || g.tag === gFilter; });
  }

  function pgGallery() {
    var tags = [['all', '全部'], ['art', '立绘'], ['design', '设定']];
    return '' +
      '<h2 class="p-title">画廊</h2>' +
      '<p class="p-sub">立绘与设定草图 · 点击可放大</p>' +
      '<div class="filters" id="g-filters">' + tags.map(function (t) {
        return '<button type="button" data-f="' + t[0] + '" class="' + (gFilter === t[0] ? 'on' : '') + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="grid-g" id="g-grid"></div>';
  }

  function paintGallery() {
    gList = filteredGallery(); gCur = -1;
    var grid = $('g-grid');
    if (!grid) return;
    grid.classList.toggle('few', gList.length > 0 && gList.length <= 2);
    if (!gList.length) { grid.innerHTML = '<p class="empty">这里空空的……华也不知道画去哪了～～</p>'; return; }
    grid.innerHTML = gList.map(function (g, i) {
      return '<figure class="shard" data-i="' + i + '" tabindex="0" role="button" aria-label="查看' + esc(g.title) + '">' +
        '<img src="' + g.thumb + '" alt="' + esc(g.title) + '" loading="lazy">' +
        '<figcaption class="s-meta"><span class="s-no">' + esc(g.title) + '</span><span>' + esc(g.tagName) + '</span></figcaption>' +
        '</figure>';
    }).join('');
  }

  function initGallery() {
    paintGallery();
    var bar = $('g-filters');
    if (bar) bar.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      gFilter = b.dataset.f;
      $$('#g-filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
      paintGallery();
    });
    var grid = $('g-grid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var f = e.target.closest('.shard');
        if (f) openLb(parseInt(f.dataset.i, 10));
      });
      grid.addEventListener('keydown', function (e) {
        var f = e.target.closest('.shard');
        if (f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLb(parseInt(f.dataset.i, 10)); }
      });
    }
  }

  /* ---------------- 灯箱 ---------------- */
  function openLb(i) {
    if (i < 0 || i >= gList.length) return;
    gCur = i;
    var g = gList[i];
    $('lb-img').src = g.src;
    $('lb-img').alt = g.title;
    $('lb-title').textContent = g.title;
    $('lb-tag').textContent = g.tagName;
    $('lb-desc').textContent = g.desc;
    $('lb').classList.add('on');
    document.body.classList.add('locked');
  }
  function closeLb() {
    $('lb').classList.remove('on');
    document.body.classList.remove('locked');
  }
  function stepLb(d) {
    if (gCur < 0 || !gList.length) return;
    gCur = (gCur + d + gList.length) % gList.length;
    openLb(gCur);
  }
  function initLightbox() {
    $('lb-x').addEventListener('click', closeLb);
    $('lb-prev').addEventListener('click', function () { stepLb(-1); });
    $('lb-next').addEventListener('click', function () { stepLb(1); });
    $('lb').addEventListener('click', function (e) { if (e.target === $('lb')) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!$('lb').classList.contains('on')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
    });
  }

  /* ============================================================
     留言板（本地版，保存在浏览器里）
     ============================================================ */
  var K_BOARD = 'hana_board_msgs';
  var K_NICK = 'hana_board_nick';

  function boardUserMsgs() {
    try { return JSON.parse(store(K_BOARD) || '[]') || []; } catch (e) { return []; }
  }
  function boardSave(list) { store(K_BOARD, JSON.stringify(list)); }

  function avatarColor(nick) {
    var h = seedOf(nick) % 360;
    return 'linear-gradient(135deg,hsl(' + h + ' 72% 72%),hsl(' + ((h + 48) % 360) + ' 76% 64%))';
  }

  function boardItemHTML(m, preset) {
    var initial = esc((m.nick || '旅').slice(0, 1));
    return '<div class="mb-item' + (preset ? ' preset' : '') + '">' +
      '<div class="mb-av" style="background:' + (preset ? (m.color || '#9bb8e8') : avatarColor(m.nick)) + '">' + initial + '</div>' +
      '<div class="mb-body">' +
        '<div class="mb-top"><b>' + esc(m.nick) + '</b>' +
          (m.role ? '<span class="mb-role">' + esc(m.role) + '</span>' : '') +
          '<time>' + esc(m.time) + '</time>' +
          (preset ? '<span class="mb-preset">地灵殿住人</span>' : '<span class="mb-preset mine">本机留言</span>') +
        '</div>' +
        '<p>' + esc(m.text).replace(/\n/g, '<br>') + '</p>' +
      '</div>' +
    '</div>';
  }

  function paintBoard() {
    var box = $('mb-list');
    if (!box) return;
    var mine = boardUserMsgs();
    var html = mine.map(function (m) { return boardItemHTML(m, false); }).join('') +
      H.boardPresets.map(function (m) { return boardItemHTML(m, true); }).join('');
    box.innerHTML = html;
    var count = $('mb-count');
    if (count) count.textContent = (mine.length + H.boardPresets.length) + ' 条';
  }

  function pgBoard() {
    return '' +
      '<h2 class="p-title">留言板</h2>' +
      '<p class="p-sub">给华留一句话 · 睡着的时候她也听得见哦 · 当前 <b id="mb-count">0 条</b></p>' +
      '<div class="board card">' +
        '<div class="mb-form">' +
          '<input class="mb-nick" id="mb-nick" maxlength="12" placeholder="你的昵称（可以不填）" value="' + esc(store(K_NICK) || '') + '">' +
          '<textarea class="mb-text" id="mb-text" maxlength="140" rows="3" placeholder="想对华说些什么呢……（140 字以内）"></textarea>' +
          '<div class="mb-actions">' +
            '<span class="mb-count" id="mb-len">0 / 140</span>' +
            '<button class="btn sm" id="mb-clear" type="button">清空本机留言</button>' +
            '<button class="btn solid" id="mb-send" type="button">发表留言</button>' +
          '</div>' +
          '<p class="mb-note">※ 这是离线版留言板：你写的内容只保存在当前浏览器的 localStorage 里，不会上传到任何地方。' +
            '上面的「地灵殿住人」留言是预设的小剧场。</p>' +
        '</div>' +
        '<div class="mb-list" id="mb-list"></div>' +
      '</div>';
  }

  function initBoard() {
    var nick = $('mb-nick'), text = $('mb-text'), len = $('mb-len');
    if (!nick || !text) return;
    paintBoard();
    text.addEventListener('input', function () { len.textContent = text.value.length + ' / 140'; });
    $('mb-send').addEventListener('click', function () {
      var n = nick.value.trim() || '路过的旅人';
      var t = text.value.trim();
      if (t.length < 2) { toast('华迷迷糊糊地说：「再多写两个字嘛～～」'); text.focus(); return; }
      var list = boardUserMsgs();
      list.unshift({ nick: n, text: t, time: fmtNow() });
      boardSave(list);
      store(K_NICK, n);
      text.value = ''; len.textContent = '0 / 140';
      paintBoard();
      toast('留言写好啦。华在梦里翻了个身，好像听见了～～');
      text.focus();
    });
    $('mb-clear').addEventListener('click', function () {
      if (!boardUserMsgs().length) { toast('本机还没有留言哦～～'); return; }
      if (confirm('要清空保存在这台设备上的留言吗？（预设留言不会消失）')) {
        boardSave([]); paintBoard(); toast('本机留言已经清空啦。');
      }
    });
  }

  /* ============================================================
     摇篮曲（Web Audio 合成，无需任何音频文件）
     ============================================================ */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ac = null, musicTimer = null, musicStep = 0;
  /* C 大调五声音阶的摇篮曲，3/4 拍，循环 16 步 */
  var MELODY = [72, 76, 79, 81, 79, 76, 74, 76, 72, 67, 72, 74, 76, 74, 72, 72];
  var BASS = [48, 48, 43, 45];
  var STEP_MS = 620;

  function freq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function playNote(midi, when, dur, vol, type) {
    if (!ac) return;
    var f = freq(midi);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    var o1 = ac.createOscillator();
    o1.type = type || 'sine'; o1.frequency.setValueAtTime(f, when);
    var o2 = ac.createOscillator();
    o2.type = 'triangle'; o2.frequency.setValueAtTime(f * 2, when);
    var g2 = ac.createGain(); g2.gain.setValueAtTime(0.28, when);
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(ac.destination);
    o1.start(when); o2.start(when);
    o1.stop(when + dur + 0.05); o2.stop(when + dur + 0.05);
  }

  function musicTick() {
    if (!ac || !soundOn) return;
    var t = ac.currentTime + 0.04;
    var m = MELODY[musicStep % MELODY.length];
    playNote(m, t, 1.35, 0.075, 'sine');
    playNote(m + 12, t + 0.02, 0.7, 0.012, 'triangle');
    if (musicStep % 4 === 0) {
      var b = BASS[(musicStep / 4) % BASS.length];
      playNote(b, t, 2.0, 0.05, 'sine');
    }
    musicStep++;
  }

  function startMusic() {
    if (!AC) { toast('这个浏览器好像不支持 Web Audio……那华就自己哼给你听～～'); return; }
    try {
      if (!ac) ac = new AC();
      if (ac.state === 'suspended') ac.resume();
    } catch (e) {
      toast('摇篮曲没有播放出来……那华就自己哼给你听～～');
      return;
    }
    soundOn = true;
    musicTick();
    musicTimer = setInterval(musicTick, STEP_MS);
    var b = $('music-btn');
    if (b) { b.classList.add('playing'); b.querySelector('.mb-txt').textContent = '摇篮曲 · 播放中'; }
  }
  function stopMusic() {
    soundOn = false;
    clearInterval(musicTimer); musicTimer = null;
    var b = $('music-btn');
    if (b) { b.classList.remove('playing'); b.querySelector('.mb-txt').textContent = '摇篮曲'; }
  }
  function toggleMusic() { if (soundOn) stopMusic(); else startMusic(); }

  function initMusicBtn() {
    var b = $('music-btn');
    if (b) b.addEventListener('click', toggleMusic);
  }

  /* ============================================================
     路由
     ============================================================ */
  var RENDER = { home: pgHome, profile: pgProfile, family: pgFamily, dream: pgDream, gallery: pgGallery, board: pgBoard };
  var AFTER = { home: initHome, profile: initProfile, dream: initDream, gallery: initGallery, board: initBoard };
  var TITLES = {
    home: '梦眠馆 · 古明地华 | 古明地家三妹的角色小屋',
    profile: '角色设定 · 梦眠馆 · 古明地华',
    family: '古明地家 · 梦眠馆 · 古明地华',
    dream: '梦眠小屋 · 梦眠馆 · 古明地华',
    gallery: '画廊 · 梦眠馆 · 古明地华',
    board: '留言板 · 梦眠馆 · 古明地华'
  };
  var curRoute = '';

  function routeName() {
    var h = (location.hash || '#/').replace(/^#\/?/, '').split('?')[0];
    return RENDER[h] ? h : 'home';
  }

  function go() {
    var r = routeName();
    if (r === curRoute && $('pg-' + r).dataset.ready) return;
    curRoute = r;
    var page = $('pg-' + r);
    if (!page) return;
    $$('.page').forEach(function (p) { p.classList.toggle('on', p === page); });
    $$('#nav a').forEach(function (a) { a.classList.toggle('on', a.dataset.r === r); });
    page.innerHTML = RENDER[r]();
    page.dataset.ready = '1';
    if (AFTER[r]) AFTER[r]();
    document.title = TITLES[r] || TITLES.home;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    buildFx();
    initLightbox();
    initMusicBtn();
    window.addEventListener('hashchange', go);
    go();
    setTimeout(function () {
      if (curRoute === 'home') toast('呼啊～～欢迎来到梦眠馆……被窝也可以借你躺一下哦～～', 5600);
    }, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
