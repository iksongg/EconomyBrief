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

  var TAB_ICONS = {
    home: { active: 'home-fill', inactive: 'home-line' },
    feed: { active: 'newsmode-fill', inactive: 'newsmode-line' },
    mypage: { active: 'account-circle-fill', inactive: 'account-circle-line' }
  };

  // token has no separate fill/line glyph in Figma — same "e-coin-2d" symbol,
  // recolored via currentColor, so it stays an inline SVG rather than the img registry.
  var TOKEN_ICON_SVG = '<svg viewBox="0 0 19 19" width="24" height="24"><path d="M9.5 0C14.7467 0 19 4.25329 19 9.5C19 14.7467 14.7467 19 9.5 19C4.25329 19 0 14.7467 0 9.5C0 4.25329 4.25329 0 9.5 0ZM9.5 1.5C5.08172 1.5 1.5 5.08172 1.5 9.5C1.5 13.9183 5.08172 17.5 9.5 17.5C13.9183 17.5 17.5 13.9183 17.5 9.5C17.5 5.08172 13.9183 1.5 9.5 1.5Z" fill="currentColor"/><g transform="translate(5.84 4.7)" fill="currentColor"><path d="M1.22061 0H0.69749C0.312277 0 0 0.312277 0 0.69749V8.893C0 9.27821 0.312277 9.59049 0.69749 9.59049H1.22061C1.60582 9.59049 1.9181 9.27821 1.9181 8.893V0.69749C1.9181 0.312277 1.60582 0 1.22061 0Z"/><path d="M6.62616 0H0.69749C0.312277 0 0 0.312277 0 0.69749V1.39498C0 1.78019 0.312277 2.09247 0.69749 2.09247H6.62616C7.01137 2.09247 7.32365 1.78019 7.32365 1.39498V0.69749C7.32365 0.312277 7.01137 0 6.62616 0Z"/><path d="M5.0568 3.66126H0.69749C0.312277 3.66126 0 3.97354 0 4.35875V5.05624C0 5.44146 0.312277 5.75373 0.69749 5.75373H5.0568C5.44202 5.75373 5.75429 5.44146 5.75429 5.05624V4.35875C5.75429 3.97354 5.44202 3.66126 5.0568 3.66126Z"/><path d="M6.62616 7.4994H0.69749C0.312277 7.4994 0 7.81168 0 8.19689V8.89438C0 9.27959 0.312277 9.59187 0.69749 9.59187H6.62616C7.01137 9.59187 7.32365 9.27959 7.32365 8.89438V8.19689C7.32365 7.81168 7.01137 7.4994 6.62616 7.4994Z"/></g></svg>';

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
          var pair = TAB_ICONS[t.key];
          iconHtml = icon(isActive ? pair.active : pair.inactive, { size: 24 });
        }
        html += '<a class="tab-item' + (isActive ? ' active' : '') + '" href="' + t.href + '">' +
          iconHtml + '<span>' + t.label + '</span></a>';
      });
      html += '</div>';
      return html;
    }
  };

  // ---- glossary (내 용어장): shared localStorage-backed term store ----
  // Term tooltips call EB.glossary.save({term, definition, category}) from their
  // "용어저장" button; glossary.html reads EB.glossary.getAll() to list them.
  var GLOSSARY_KEY = 'eb-glossary-v1';
  var GLOSSARY_SEED = {
    terms: [
      { term: 'HBM (High Bandwidth Memory)', definition: '여러 개의 D램을 수직으로 쌓아 데이터 처리 속도와 대역폭을 높인 고성능 메모리', category: '반도체', date: '05.20' },
      { term: '데이터 센터', definition: '대규모 데이터를 저장하고 처리하기 위한 서버와 네트워크 장비가 모여 있는 시설', category: 'IT 인프라', date: '05.20' },
      { term: 'CAPEX (설비 투자)', definition: '기업이 장기적인 성장을 위해 설비, 장비, 건물 등에 투자하는 비용', category: '기업 재무', date: '05.20' },
      { term: '생성형 AI', definition: '텍스트, 이미지, 음성 등 새로운 콘텐츠를 스스로 생성할 수 있는 인공지능 기술', category: 'AI', date: '05.20' },
      { term: '온디바이스 AI', definition: '데이터를 클라우드로 보내지 않고 기기 자체에 AI 연산을 수행하는 기술', category: 'AI', date: '05.20' }
    ]
  };

  function glossaryLoad() {
    try {
      var raw = localStorage.getItem(GLOSSARY_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(GLOSSARY_KEY, JSON.stringify(GLOSSARY_SEED));
    } catch (e) { /* Storage may be unavailable, for example in private browsing. */ }
    return GLOSSARY_SEED;
  }

  function glossaryPersist(data) {
    try {
      localStorage.setItem(GLOSSARY_KEY, JSON.stringify(data));
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
    keywords: []
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
      if (next.briefingRewarded) return;
      next.briefingRewarded = true;
      next.tokens += 5;
      rewarded = true;
    });
    return { rewarded: rewarded, state: state };
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

  window.EB = {
    icon: icon,
    iconSrc: iconSrc,
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
      claimSponsorGift: claimSponsorGift
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
