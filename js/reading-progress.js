// 阅读进度条：显示当前文章读到百分之几
// 固定满宽 + scaleX 缩放，避免百分比转像素时的亚像素缝隙
(function () {
  if (document.querySelector('.reading-progress')) return;

  var bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.appendChild(bar);

  var ticking = false;

  // 可见高度优先取 visualViewport：
  // 手机端滑动时地址栏收起（进入沉浸式），布局视口 clientHeight 与 scrollTop 不同步，
  // 会留下约一个地址栏高度的误差；visualViewport.height 是实时可见高度，能正确触底。
  function visibleHeight() {
    var vv = window.visualViewport;
    if (vv && vv.height) return vv.height;
    return window.innerHeight || document.documentElement.clientHeight;
  }

  function update() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop || 0;
    var vh = visibleHeight();
    var scrollable = doc.scrollHeight - vh;
    var ratio = scrollable > 0 ? scrollTop / scrollable : 1;
    // 兜底：个别内核在地址栏动画中间态仍会差一点，用像素容差抹平
    var tolerance = Math.max(24, vh * 0.08);
    if (scrollable - scrollTop <= tolerance) ratio = 1;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('orientationchange', onScroll);
  window.addEventListener('load', onScroll);

  // 地址栏收起/展开时 visualViewport 会派发 resize，必须跟上
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onScroll);
    window.visualViewport.addEventListener('scroll', onScroll);
  }

  // 页面高度事后变化（图片解码、字体加载、代码高亮重排）时同步重算
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    ro.observe(document.documentElement);
  }

  update();
})();
