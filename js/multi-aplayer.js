// 多曲播放器：一个 APlayer 实例吃一串 QQ 音乐 songmid
//
// 为什么需要它：meting 标签一次只能接一个 id（单曲或歌单），
// 想把"某个主题的十几首歌"放进一个播放器它做不到。
// 用法（文章里直接写 HTML）：
//   <div class="aplayer-multi" data-ids="id1,id2,id3" data-folded="false"></div>
//
// data-ids 逗号分隔的 songmid；data-server 默认 tencent；data-folded 是否默认折叠列表
(function () {
  var CDN = {
    css: 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css',
    js: 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js'
  };

  function api(server, type, id) {
    var tpl = window.meting_api || 'https://api.injahow.cn/meting/?server=:server&type=:type&id=:id&r=:r';
    return tpl
      .replace(':server', server)
      .replace(':type', type)
      .replace(':id', id)
      .replace(':r', Math.random());
  }

  // APlayer 资源只在页面出现过 meting/aplayer 标签时才会注入，自己 new 的话得先补齐
  function ensureAPlayer(done) {
    if (window.APlayer) return done();
    var pending = document.querySelector('script.aplayer-script-marker');
    if (pending) {
      pending.addEventListener('load', done);
      pending.addEventListener('error', done);
      return;
    }
    if (!document.querySelector('link.aplayer-style-marker')) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = '/assets/css/APlayer.min.css';
      css.onerror = function () { css.href = CDN.css; };
      document.head.appendChild(css);
    }
    var js = document.createElement('script');
    js.src = '/assets/js/APlayer.min.js';
    js.onload = done;
    js.onerror = function () { js.src = CDN.js; };
    document.head.appendChild(js);
  }

  function build() {
    var boxes = document.querySelectorAll('.aplayer-multi');
    Array.prototype.forEach.call(boxes, function (box) {
      var ids = (box.dataset.ids || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!ids.length || box.dataset.loaded) return;
      box.dataset.loaded = '1';

      var server = box.dataset.server || 'tencent';
      // 一首一个请求，串行跑上百首会很慢；限并发逐批走
      var CONC = 6;
      var out = new Array(ids.length);
      var cursor = 0;
      function worker() {
        if (cursor >= ids.length) return Promise.resolve();
        var i = cursor++, id = ids[i];
        return fetch(api(server, 'song', id))
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var s = Array.isArray(d) ? d[0] : d;
            if (s && s.url && s.name) {
              out[i] = { name: s.name, artist: s.artist || '', url: s.url, cover: s.pic || '', lrc: s.lrc || '' };
            }
          })
          .catch(function () {})
          .then(worker);
      }
      Promise.all(Array.apply(null, Array(Math.min(CONC, ids.length))).map(worker))
        .then(function () { return out.filter(Boolean); })
        .then(function (list) {
          if (!list.length) {
            box.innerHTML = '<p class="aplayer-multi-empty">这几首歌暂时取不到，可能音源下架了。</p>';
            return;
          }
        // 注意：这版 APlayer 只吃单对象参数 {container, audio}，不支持 new APlayer(el, opts)
        new APlayer({
          container: box,
          audio: list,
          lrcType: 3,
          mutex: true,
          theme: '#3f72af',
          listMaxHeight: '320px',
          listFolded: box.dataset.folded === 'true'
        });
      });
    });
  }

  ensureAPlayer(build);
})();
