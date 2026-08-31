/*
  EconomyBrief — shared UI component injector + icon registry.
  Usage: tag a placeholder element with data-eb="<component>" (plus any
  data-* options below) and include this script + assets/css/common.css.
  On DOMContentLoaded, each placeholder's outerHTML is replaced with the
  component's markup.

  Components:
    data-eb="status-bar-dynamic"   (no options) — 50px dynamic-island status bar
    data-eb="status-bar-simple"    (no options) — 62px simple status bar
    data-eb="header-row-main"      (no options) — "ECONOMY BRIEF" logo + search/notification icons
    data-eb="nav-header"           data-title="라벨"(optional) data-back="url"(optional, omit for no back button)
                                    data-right="share|bookmark|text|none"(default "share") data-right-label="편집"(for right="text")
                                    data-short="true"(48px height variant)
    data-eb="tab-bar"              data-active="home|feed|token|mypage"

  Icon registry:
    Defined in assets/js/icons.js (load that script before this one) — it maps every
    registered name to its assets/img/icons/<name>.svg file and preserves each icon's
    native ratio when sized. Use window.EB.icon('<name>', {size, alt, class}) to get an
    <img> tag string, e.g. EB.icon('bookmark', { size: 18, alt: '북마크' }).

  Glossary (내 용어장), localStorage-backed:
    EB.glossary.getAll()            -> [{term, definition, category, date}]
    EB.glossary.count()             -> number shown as "저장된 용어"
    EB.glossary.save({term, definition, category}) -> {added, entry}; dedupes by
                                        the term name before any "(", so "HBM" and
                                        "HBM (High Bandwidth Memory)" are the same entry
    EB.glossary.remove(term)        -> removes by exact term string
*/
(function () {
  // icons.js (loaded before this script) owns the registry + ratio-preserving renderer.
  var icon = window.EB_ICONS.icon;
  var iconSrc = window.EB_ICONS.iconSrc;

  // Figma's GNB always uses the filled glyph for every tab — active vs. inactive
  // is communicated by color/weight alone (see .gnb-tab-bar .tab-item.active in
  // common.css), not by swapping to an outline icon.
  var TAB_ICONS = {
    home: 'home-fill',
    feed: 'newsmode-fill',
    mypage: 'account-circle-fill'
  };

  // token has no separate fill/line glyph in Figma — same "e-coin-2d" symbol
  // (verified against the actual exported vectors: a solid disc recolored via
  // currentColor, sized 19px and inset within the 24px box, with a fixed-white
  // "E" mark on top) — so it stays an inline SVG rather than the img registry.
  var TOKEN_ICON_SVG = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="11.5" cy="11.5" r="9.5" fill="currentColor"/><g transform="translate(8 7)" fill="#fff"><path d="M1.22061 0H0.69749C0.312277 0 0 0.312277 0 0.69749V8.893C0 9.27821 0.312277 9.59049 0.69749 9.59049H1.22061C1.60582 9.59049 1.9181 9.27821 1.9181 8.893V0.69749C1.9181 0.312277 1.60582 0 1.22061 0Z"/><path d="M6.62616 0H0.69749C0.312277 0 0 0.312277 0 0.69749V1.39498C0 1.78019 0.312277 2.09247 0.69749 2.09247H6.62616C7.01137 2.09247 7.32365 1.78019 7.32365 1.39498V0.69749C7.32365 0.312277 7.01137 0 6.62616 0Z"/><path d="M5.0568 3.66126H0.69749C0.312277 3.66126 0 3.97354 0 4.35875V5.05624C0 5.44146 0.312277 5.75373 0.69749 5.75373H5.0568C5.44202 5.75373 5.75429 5.44146 5.75429 5.05624V4.35875C5.75429 3.97354 5.44202 3.66126 5.0568 3.66126Z"/><path d="M6.62616 7.4994H0.69749C0.312277 7.4994 0 7.81168 0 8.19689V8.89438C0 9.27959 0.312277 9.59187 0.69749 9.59187H6.62616C7.01137 9.59187 7.32365 9.27959 7.32365 8.89438V8.19689C7.32365 7.81168 7.01137 7.4994 6.62616 7.4994Z"/></g></svg>';

  var TABS = [
    { key: 'home', href: 'main.html', label: '홈' },
    { key: 'feed', href: 'newsfeed.html', label: '뉴스피드' },
    { key: 'token', href: 'token.html', label: '토큰' },
    { key: 'mypage', href: 'mypage.html', label: '마이페이지' }
  ];

  var COMPONENTS = {
    'status-bar-dynamic': function () {
      return (
        '<div class="status-bar-dynamic"><div class="row">' +
        '<div class="time">9:41</div><div class="island-spacer"></div>' +
        '<div class="levels">' +
        icon('status-cellular', { size: 18, class: 'cellular' }) +
        icon('status-wifi', { size: 18, class: 'wifi' }) +
        icon('status-battery', { size: 20, class: 'battery' }) +
        '</div></div></div>'
      );
    },
    'status-bar-simple': function () {
      return (
        '<div class="status-bar-simple"><div class="time">9:41</div>' +
        '<div class="levels"><img src="' + iconSrc('status-levels') + '" alt="" /></div></div>'
      );
    },
    'header-row-main': function () {
      return (
        '<div class="header-row-main"><div class="logo">Economy Brief</div>' +
        '<div class="icons">' + icon('search', { alt: '검색' }) + icon('notifications', { alt: '알림' }) + '</div></div>'
      );
    },
    'nav-header': function (el) {
      var title = el.getAttribute('data-title') || '';
      var back = el.getAttribute('data-back');
      var right = el.getAttribute('data-right') || 'share';
      var short = el.getAttribute('data-short') === 'true';
      var backHtml = back
        ? '<a class="icon-btn" href="' + back + '">' + icon('arrow-back-ios-new', { alt: '뒤로' }) + '</a>'
        : '<div class="icon-spacer"></div>';
      var rightHtml = '<div class="icon-spacer"></div>';
      if (right === 'share') rightHtml = '<button type="button" class="icon-btn">' + icon('share', { alt: '공유' }) + '</button>';
      if (right === 'bookmark') rightHtml = '<button type="button" class="icon-btn">' + icon('bookmark', { alt: '북마크' }) + '</button>';
      if (right === 'text') {
        var label = el.getAttribute('data-right-label') || '';
        rightHtml = '<button type="button" class="nav-text-btn">' + label + '</button>';
      }
      return (
        '<div class="nav-header-common' + (short ? ' short' : '') + '">' +
        backHtml +
        (title ? '<div class="title">' + title + '</div>' : '<div></div>') +
        rightHtml +
        '</div>'
      );
    },
    'tab-bar': function (el) {
      var active = el.getAttribute('data-active') || 'home';
      var html = '<div class="gnb-tab-bar">';
      TABS.forEach(function (t) {
        var isActive = t.key === active;
        var iconHtml;
        if (t.key === 'token') {
          iconHtml = TOKEN_ICON_SVG;
        } else {
          iconHtml = icon(TAB_ICONS[t.key], { size: 24 });
        }
        html += '<a class="tab-item' + (isActive ? ' active' : '') + '" href="' + t.href + '">' +
          iconHtml + '<span>' + t.label + '</span></a>';
      });
      html += '</div>';
      return html;
    }
  };

  // ---- glossary (내 용어장): shared sessionStorage-backed term store ----
  // Term tooltips call EB.glossary.save({term, definition, category}) from their
  // "용어저장" button; glossary.html reads EB.glossary.getAll() to list them.
  // sessionStorage (not localStorage) so edits made on glossary.html stay in
  // sync with mypage.html's "저장한 용어" count while navigating between pages
  // in the same tab, but a hard reload resets everything back to the seed
  // list below — see the reload check right after GLOSSARY_SEED.
  var GLOSSARY_KEY = 'eb-glossary-v1';
  var GLOSSARY_SEED = {
    terms: [
      { term: 'HBM (High Bandwidth Memory)', definition: '여러 개의 D램을 수직으로 쌓아 데이터 처리 속도와 대역폭을 높인 고성능 메모리', category: '반도체', date: '05.20' },
      { term: '데이터 센터', definition: '대규모 데이터를 저장하고 처리하기 위한 서버와 네트워크 장비가 모여 있는 시설', category: 'IT 인프라', date: '05.20' },
      { term: 'CAPEX (설비 투자)', definition: '기업이 장기적인 성장을 위해 설비, 장비, 건물 등에 투자하는 비용', category: '기업 재무', date: '05.20' },
      { term: '생성형 AI', definition: '텍스트, 이미지, 음성 등 새로운 콘텐츠를 스스로 생성할 수 있는 인공지능 기술', category: 'AI', date: '05.20' },
      { term: '온디바이스 AI', definition: '데이터를 클라우드로 보내지 않고 기기 자체에 AI 연산을 수행하는 기술', category: 'AI', date: '05.20' },
      { term: '기준금리', definition: '중앙은행이 시중 은행에 자금을 빌려줄 때 적용하는 기준이 되는 정책금리', category: '금리', date: '05.19' },
      { term: '환율', definition: '한 나라의 통화를 다른 나라의 통화로 교환할 때 적용되는 비율', category: '환율', date: '05.19' },
      { term: '인플레이션', definition: '물가 수준이 지속적으로 상승해 화폐의 실질 구매력이 떨어지는 현상', category: '거시경제', date: '05.18' },
      { term: '스태그플레이션', definition: '경기 침체와 물가 상승이 동시에 나타나는 현상', category: '거시경제', date: '05.18' },
      { term: 'GDP (국내총생산)', definition: '한 나라 안에서 일정 기간 동안 생산된 재화와 서비스의 총합', category: '거시경제', date: '05.17' },
      { term: '양적완화', definition: '중앙은행이 국채 등을 매입해 시중에 유동성을 직접 공급하는 통화정책', category: '금리', date: '05.17' },
      { term: '파운드리', definition: '반도체 설계 없이 위탁받아 생산만 전문적으로 담당하는 사업 방식', category: '반도체', date: '05.16' },
      { term: '팹리스', definition: '반도체 생산 설비 없이 설계와 개발만 전문으로 하는 기업', category: '반도체', date: '05.16' },
      { term: '서브프라임 모기지', definition: '신용도가 낮은 차주를 대상으로 하는 비우량 주택담보대출', category: '부동산', date: '05.15' },
      { term: 'PIR (소득 대비 주택가격 비율)', definition: '가구의 연소득 대비 주택 가격이 몇 배인지를 나타내는 지표', category: '부동산', date: '05.15' },
      { term: '리츠 (REITs)', definition: '다수의 투자자에게 자금을 모아 부동산에 투자하고 수익을 배당하는 상품', category: '부동산', date: '05.14' },
      { term: 'ETF (상장지수펀드)', definition: '특정 지수나 자산의 움직임을 추종하도록 거래소에 상장된 펀드', category: '주식시장', date: '05.14' },
      { term: '공매도', definition: '주식을 빌려서 먼저 판 뒤 가격이 내리면 다시 사서 갚아 차익을 얻는 투자 기법', category: '주식시장', date: '05.13' },
      { term: '서킷 브레이커', definition: '주가가 급락할 때 일시적으로 거래를 정지시키는 시장 안정화 장치', category: '주식시장', date: '05.13' },
      { term: '무역수지', definition: '일정 기간 동안 한 나라의 수출액에서 수입액을 뺀 차액', category: '무역', date: '05.12' },
      { term: '관세', definition: '국경을 통과하는 상품에 부과되는 세금', category: '무역', date: '05.12' },
      { term: '유가', definition: '원유 1배럴을 거래할 때 형성되는 국제 시장 가격', category: '에너지', date: '05.11' },
      { term: '실업률', definition: '경제활동인구 중 일자리를 구하지 못한 사람이 차지하는 비율', category: '노동시장', date: '05.11' },
      { term: '소비자물가지수 (CPI)', definition: '가계가 소비하는 상품과 서비스 가격의 평균적인 변동을 측정하는 지표', category: '거시경제', date: '05.10' }
    ]
  };

  // A hard reload (F5 / Ctrl+R) clears the saved-terms session so the demo
  // always comes back to the full seed list, instead of staying stuck on
  // whatever was deleted earlier. A normal link click between pages (e.g.
  // glossary.html -> mypage.html) is a different navigation type, so
  // sessionStorage survives that and the two pages stay in sync.
  (function resetGlossaryOnReload() {
    try {
      var navEntries = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation');
      var isReload = navEntries && navEntries.length ? navEntries[0].type === 'reload'
        : !!(window.performance && performance.navigation && performance.navigation.type === 1);
      if (isReload) sessionStorage.removeItem(GLOSSARY_KEY);
    } catch (e) { /* Storage/Performance APIs may be unavailable, e.g. in private browsing. */ }
  })();

  function glossaryLoad() {
    try {
      var raw = sessionStorage.getItem(GLOSSARY_KEY);
      if (raw) return JSON.parse(raw);
      sessionStorage.setItem(GLOSSARY_KEY, JSON.stringify(GLOSSARY_SEED));
    } catch (e) { /* Storage may be unavailable, for example in private browsing. */ }
    return GLOSSARY_SEED;
  }

  function glossaryPersist(data) {
    try {
      sessionStorage.setItem(GLOSSARY_KEY, JSON.stringify(data));
    } catch (e) { /* Keep the in-memory result usable when storage is unavailable. */ }
  }

  function baseName(term) {
    return term.split('(')[0].trim().toLowerCase();
  }

  function glossaryGetAll() {
    return glossaryLoad().terms;
  }

  function glossaryCount() {
    return glossaryGetAll().length;
  }

  // Returns { added: boolean, entry } — added is false when the term (matched by
  // its name before any parenthesis) was already saved, so the caller can show
  // "이미 저장됨" instead of "저장되었습니다".
  function glossarySave(entry) {
    var data = glossaryLoad();
    var already = data.terms.some(function (t) { return baseName(t.term) === baseName(entry.term); });
    if (already) return { added: false, entry: entry };

    var today = new Date();
    var stamped = {
      term: entry.term,
      definition: entry.definition,
      category: entry.category || '기타',
      date: entry.date || (String(today.getMonth() + 1).padStart(2, '0') + '.' + String(today.getDate()).padStart(2, '0'))
    };
    data.terms.unshift(stamped);
    glossaryPersist(data);
    return { added: true, entry: stamped };
  }

  function glossaryRemove(term) {
    var data = glossaryLoad();
    var before = data.terms.length;
    data.terms = data.terms.filter(function (t) { return t.term !== term; });
    if (data.terms.length < before) {
      glossaryPersist(data);
    }
  }

  var APP_STATE_KEY = 'economybrief-app-v1';
  var APP_STATE_DEFAULT = {
    tokens: 14,
    briefingRewarded: false,
    sponsorGiftClaimed: false,
    keywords: [],
    briefingProgress: null
  };

  function normalizeAppState(value) {
    var state = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    var normalized = Object.assign({}, APP_STATE_DEFAULT, state);
    normalized.tokens = Number.isFinite(Number(normalized.tokens)) ? Number(normalized.tokens) : APP_STATE_DEFAULT.tokens;
    normalized.briefingRewarded = Boolean(normalized.briefingRewarded);
    normalized.sponsorGiftClaimed = Boolean(normalized.sponsorGiftClaimed);
    normalized.keywords = Array.isArray(normalized.keywords)
      ? normalized.keywords.filter(function (keyword) { return typeof keyword === 'string' && keyword.trim(); })
      : [];
    var progress = normalized.briefingProgress;
    normalized.briefingProgress = (progress && Number.isFinite(Number(progress.current)) && Number.isFinite(Number(progress.total)))
      ? { current: Number(progress.current), total: Number(progress.total) }
      : null;
    return normalized;
  }

  function appStateLoad() {
    try {
      var stored = JSON.parse(localStorage.getItem(APP_STATE_KEY) || '{}');
      return normalizeAppState(stored);
    } catch (e) {
      return normalizeAppState();
    }
  }

  function appStateSave(state) {
    var normalized = normalizeAppState(state);
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(normalized));
    } catch (e) { /* The page can still show the updated in-memory value. */ }
    return normalized;
  }

  function updateAppState(mutator) {
    var state = appStateLoad();
    mutator(state);
    return appStateSave(state);
  }

  function rewardBriefing() {
    var rewarded = false;
    var state = updateAppState(function (next) {
      next.briefingProgress = null;
      if (next.briefingRewarded) return;
      next.briefingRewarded = true;
      next.tokens += 5;
      rewarded = true;
    });
    return { rewarded: rewarded, state: state };
  }

  // Called when the user backs out of daily-briefing.html mid-read, so main.html's
  // .ai-card can pick up where they left off instead of always showing a fresh start.
  function saveBriefingProgress(progress) {
    return updateAppState(function (next) {
      next.briefingProgress = { current: progress.current, total: progress.total };
    });
  }

  function claimSponsorGift() {
    var claimed = false;
    var state = updateAppState(function (next) {
      if (next.sponsorGiftClaimed) return;
      next.sponsorGiftClaimed = true;
      next.tokens += 1;
      claimed = true;
    });
    return { claimed: claimed, state: state };
  }

  // Deducts `amount` tokens if the current balance covers it. spent is false
  // (and the balance untouched) when the balance is insufficient, so callers
  // can gate a follow-up action on it without any extra state of their own.
  function spendTokens(amount) {
    var spent = false;
    var state = updateAppState(function (next) {
      if (next.tokens < amount) return;
      next.tokens -= amount;
      spent = true;
    });
    return { spent: spent, state: state };
  }

  function mount() {
    document.querySelectorAll('[data-eb]').forEach(function (el) {
      var name = el.getAttribute('data-eb');
      var factory = COMPONENTS[name];
      if (!factory) return;
      var html = factory.length ? factory(el) : factory();
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      el.replaceWith(wrapper.firstElementChild);
    });
  }

  // ---- per-article media (thumbnail + source logo), with a shared
  // placeholder for anything data/news.json hasn't gotten a real asset for
  // yet. Any page that renders a list of article cards should resolve the
  // article by data-article-id and call EB.media.apply(cardEl, article)
  // instead of hand-rolling its own null-check — that's what kept
  // newsfeed.html's timeline thumbnails from falling back to a placeholder
  // the same way main.html's cards already did. See assets/css/common.css
  // for the shared .eb-thumb-placeholder / .eb-logo-placeholder look; each
  // page still sets its own width/height on those two classes to match its
  // own thumb/logo size. ----
  function showThumbPlaceholder(img, filename) {
    if (!img || img.dataset.ebPlaceholderApplied) return;
    img.dataset.ebPlaceholderApplied = 'true';
    img.style.display = 'none';
    var box = document.createElement('div');
    box.className = 'eb-thumb-placeholder';
    if (img.closest('.image-wrap')) {
      img.closest('.image-wrap').classList.add('eb-placeholder');
    }
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', filename || '');
    box.innerHTML = '<span class="gicon" role="img" aria-label="">image</span>';
    img.insertAdjacentElement('afterend', box);
  }

  function showLogoPlaceholder(img, filename) {
    if (!img || img.dataset.ebPlaceholderApplied) return;
    img.dataset.ebPlaceholderApplied = 'true';
    img.style.display = 'none';
    var badge = document.createElement('span');
    badge.className = 'eb-logo-placeholder';
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', filename || '');
    img.insertAdjacentElement('afterend', badge);
  }

  // cardEl is any article-card element containing a thumb/logo image (or
  // just a thumb — not every card shows a source logo, e.g. newsfeed.html's
  // timeline cards). Missing elements are silently skipped.
  function applyArticleMedia(cardEl, article) {
    var img = cardEl.querySelector('.thumb, .image-wrap img.bg, .tl-thumb');
    if (img) {
      if (article.image) img.src = article.image;
      else showThumbPlaceholder(img, article.imagePlaceholder);
    }
    var logo = cardEl.querySelector('.source-logo, .byline img');
    if (logo) {
      if (article.sourceLogo) logo.src = article.sourceLogo;
      else if (article.sourceLogoPlaceholder) showLogoPlaceholder(logo, article.sourceLogoPlaceholder);
    }
  }

  window.EB = {
    icon: icon,
    iconSrc: iconSrc,
    media: {
      apply: applyArticleMedia,
      showThumbPlaceholder: showThumbPlaceholder,
      showLogoPlaceholder: showLogoPlaceholder
    },
    glossary: {
      getAll: glossaryGetAll,
      count: glossaryCount,
      save: glossarySave,
      remove: glossaryRemove
    },
    appState: {
      load: appStateLoad,
      saveKeywords: function (keywords) {
        return updateAppState(function (state) { state.keywords = Array.isArray(keywords) ? keywords.slice() : []; });
      },
      rewardBriefing: rewardBriefing,
      claimSponsorGift: claimSponsorGift,
      spendTokens: spendTokens,
      saveBriefingProgress: saveBriefingProgress
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
