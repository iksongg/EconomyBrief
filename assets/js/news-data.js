/*
  Shared article data + template-based "AI" text generation.
  No network calls, no API key: every string here is derived only from the
  fields already present in data/news.json for the given article (title,
  description, category, keywords). Nothing is invented per article, so this
  is safe to reuse across every article without fabricating facts/numbers.

  The article list itself is loaded from window.EB_NEWS_SOURCE, set by
  assets/js/news-data-source.js (a plain <script> — must be loaded before
  this file). That file is the exact same JSON as data/news.json, just
  assigned to a JS variable instead of served as a bare .json resource:
  a fetch('data/news.json') call fails under file:// (no server, so no
  CORS-allowed response) — the previous cause of every article page
  showing "기사를 찾을 수 없습니다" for anyone opening these HTML files
  directly instead of through a local server. A <script src> tag has no
  such restriction, so this loads identically over file:// and http(s)://.
*/
(function () {
  var STORAGE_KEY = 'eb-current-article-id';
  var articlesPromise = null;

  function loadArticles() {
    if (!articlesPromise) {
      var source = window.EB_NEWS_SOURCE;
      articlesPromise = Promise.resolve(source && source.articles ? source.articles : []);
    }
    return articlesPromise;
  }

  function getById(id) {
    if (!id) return Promise.resolve(null);
    return loadArticles().then(function (articles) {
      var found = null;
      for (var i = 0; i < articles.length; i++) {
        // String() on both sides so a numeric id in the URL (?id=3) still
        // matches a string id in the data (or vice versa).
        if (String(articles[i].id) === String(id)) { found = articles[i]; break; }
      }
      return found;
    });
  }

  // URL query param is the source of truth; sessionStorage is only a refresh-safe
  // backup (deep-research.html can restore the same article after a reload).
  function resolveCurrentId() {
    var fromQuery = new URLSearchParams(window.location.search).get('id');
    if (fromQuery) {
      try { sessionStorage.setItem(STORAGE_KEY, fromQuery); } catch (e) {}
      return fromQuery;
    }
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function rememberId(id) {
    try { sessionStorage.setItem(STORAGE_KEY, id); } catch (e) {}
  }

  function buildSummary(article) {
    var bullets = [];
    bullets.push(article.description);
    bullets.push('이 소식은 ‘' + article.category + '’ 분야의 이슈로 분류됩니다.');
    if (article.keywords && article.keywords.length) {
      bullets.push('관련 키워드: ' + article.keywords.join(', '));
    }
    bullets.push('관련 업계와 시장 참여자들의 반응에 관심이 모이고 있습니다.');

    var qna = [
      {
        q: '무슨 일이 있었나요?',
        a: article.description
      },
      {
        q: '왜 중요한가요?',
        a: '‘' + article.category + '’ 분야에서 나온 소식으로, 관련 산업과 시장 참여자들에게 영향을 줄 수 있는 사안으로 평가됩니다.'
      },
      {
        q: '앞으로 어떻게 될까요?',
        a: '관련 동향이 어떻게 전개될지는 향후 발표되는 추가 소식을 통해 확인할 필요가 있습니다.'
      }
    ];

    return { bullets: bullets, qna: qna };
  }

  function buildDeepAnalysis(article) {
    var category = article.category;
    var keywords = article.keywords || [];

    return {
      conclusion: article.title + '. 이는 ‘' + category + '’ 관련 동향으로 평가됩니다.',
      whatHappened: article.description,
      whyItMatters: '‘' + category + '’ 분야에서 나온 소식으로, 관련 산업과 시장 참여자들에게 영향을 줄 수 있는 사안으로 평가됩니다.',
      economicImpact: '‘' + category + '’ 관련 이슈이므로 관련 산업 전반에 영향을 줄 수 있다고 분석됩니다. 다만 구체적인 영향 규모는 후속 발표되는 자료를 통해 추가로 확인할 필요가 있습니다.',
      outlook: '관련 동향이 어떻게 전개될지는 향후 발표되는 추가 소식과 지표를 통해 확인할 필요가 있습니다.',
      risks: '예상과 다른 방향으로 전개될 가능성도 있으므로, 후속 지표와 발표를 지속적으로 확인하는 것이 중요합니다.',
      keywords: keywords.length ? keywords : [category]
    };
  }

  window.EBNews = {
    loadArticles: loadArticles,
    getById: getById,
    resolveCurrentId: resolveCurrentId,
    rememberId: rememberId,
    buildSummary: buildSummary,
    buildDeepAnalysis: buildDeepAnalysis
  };
})();
