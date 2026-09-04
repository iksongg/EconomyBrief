/*
  Renders article.html for whichever article id is in the URL (?id=...),
  falling back to sessionStorage so a refresh keeps showing the same article.
  If no valid id resolves, the page shows the not-found state instead of any
  other article's content — there is no shared fallback article.
*/
(function () {
  var FLAGSHIP_ID = 'ai-data-investment';

  // The original hand-written example content, including the interactive HBM
  // glossary term. Kept verbatim only for this one article; every other
  // article uses the generic per-article template in news-data.js instead.
  var FLAGSHIP_SUMMARY_BULLETS_HTML = [
    '빅테크 기업들이 AI 데이터센터 투자를 하고 있습니다.',
    'AI 서버에 필요한 <button type="button" class="term" data-term="hbm">HBM</button> 수요가 증가하고 있습니다.',
    '반도체 기업들의 실적 개선 기대감도 높아지고 있습니다.',
    'AI 인프라 투자가 향후 수년간 지속될 가능성이 높다고 전망했습니다.'
  ];
  var FLAGSHIP_QNA = [
    { q: '무슨 일이 있었나요?', a: '글로벌 빅테크 기업들이 AI 서비스 확대를 위해 데이터센터 투자를 늘리고 있습니다. 이에 따라 AI 서버에 필요한 HBM 등 고성능 메모리 수요도 함께 증가하고 있습니다.' },
    { q: '왜 중요한가요?', a: '국내 반도체 기업들은 HBM과 메모리 기술 경쟁력을 갖추고 있어 AI 투자 확대의 수혜가 기대됩니다. AI 인프라 투자가 이어질수록 관련 산업 전반의 성장 가능성도 커질 것으로 전망됩니다.' },
    { q: '앞으로 어떻게 될까요?', a: '전문가들은 AI 데이터센터 투자가 당분간 지속될 것으로 보고 있습니다. 다만 투자 경쟁이 심화되면서 기술 경쟁력과 생산 능력이 기업 성과를 좌우할 것으로 예상됩니다.' }
  ];
  var FLAGSHIP_TERMS = {
    hbm: {
      title: 'HBM(고대역폭메모리)',
      desc: '여러 개의 D램을 수직으로 쌓아 데이터 처리 속도를 크게 높인 고성능 메모리로, AI 서버·GPU에 주로 쓰입니다.',
      category: '반도체'
    }
  };

  function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Wraps the first occurrence of term.word inside text with the same
  // clickable .term button the flagship article's HBM term already uses.
  // Returns { html, embedded } — embedded is false (html is just the escaped
  // text) if the word isn't actually present in this particular string.
  function embedTermButton(text, term) {
    var idx = text.indexOf(term.word);
    if (idx === -1) return { html: escapeHtml(text), embedded: false };
    var before = escapeHtml(text.slice(0, idx));
    var word = escapeHtml(text.slice(idx, idx + term.word.length));
    var after = escapeHtml(text.slice(idx + term.word.length));
    return {
      html: before + '<button type="button" class="term" data-term="term">' + word + '</button>' + after,
      embedded: true
    };
  }

  function renderNotFound() {
    document.body.classList.add('article-missing');
  }

  // Real other articles (never invented content): "관련된 뉴스" pulls same-category
  // articles first, "관심 키워드로 추천된 뉴스" fills from whatever's left — the same
  // "exclude self, same category" pattern deep-research-ai.js's renderSourcesTab uses.
  function renderNewsList(containerId, articles) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    articles.forEach(function (a) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'news-item';
      btn.setAttribute('data-article-id', a.id);

      var info = document.createElement('div');
      info.className = 'news-info';
      var titleEl = document.createElement('div');
      titleEl.className = 'news-title';
      titleEl.textContent = a.title;
      var byline = document.createElement('div');
      byline.className = 'news-byline';
      byline.innerHTML = '<span></span><span>·</span><span></span>';
      byline.children[0].textContent = a.source;
      byline.children[2].textContent = a.date;
      info.appendChild(titleEl);
      info.appendChild(byline);

      var thumb = document.createElement('img');
      thumb.className = 'news-thumb';
      thumb.alt = '';
      thumb.loading = 'lazy';

      btn.appendChild(info);
      btn.appendChild(thumb);
      container.appendChild(btn);

      if (a.image) {
        thumb.src = a.image;
      } else {
        EB.media.showThumbPlaceholder(thumb, a.imagePlaceholder);
      }

      btn.addEventListener('click', function () {
        window.location.href = 'article.html?id=' + encodeURIComponent(a.id);
      });
    });
  }

  function renderRelatedNews(article, allArticles) {
    var others = (allArticles || []).filter(function (a) { return a.id !== article.id; });
    var related = others.filter(function (a) { return a.category === article.category; }).slice(0, 3);
    var relatedIds = related.map(function (a) { return a.id; });
    var recommend = others.filter(function (a) { return relatedIds.indexOf(a.id) === -1; }).slice(0, 3);
    renderNewsList('related-news-list', related);
    renderNewsList('recommend-news-list', recommend);
  }

  function renderArticle(article, allArticles) {
    document.title = '이코노미브리프 - ' + article.title;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-date').textContent = article.date;
    var heroImage = document.getElementById('article-hero-image');
    var heroPlaceholder = document.getElementById('article-hero-placeholder');
    if (article.image) {
      heroImage.src = article.image;
      heroImage.alt = article.title;
      heroImage.style.display = '';
      heroPlaceholder.style.display = 'none';
    } else {
      // No dedicated image asset yet for this article — show a neutral
      // placeholder instead of stretching an unrelated category icon.
      // imagePlaceholder (when set) names the file to drop into
      // assets/img/news/ later; article.image just needs to point at it.
      heroImage.style.display = 'none';
      // .hero-placeholder's CSS default is display:none (so it stays hidden
      // until JS decides it's needed) — clearing the inline style with ''
      // just falls back to that none, never actually showing the box. It
      // needs the explicit visible value (flex, matching its align/justify/
      // flex-direction rules) to actually appear.
      heroPlaceholder.style.display = 'flex';
      document.getElementById('article-hero-placeholder-filename').textContent = article.imagePlaceholder || '';
    }

    var sourceEl = document.getElementById('article-source');
    sourceEl.innerHTML = '';
    if (article.sourceLogo) {
      var logo = document.createElement('img');
      logo.src = article.sourceLogo;
      logo.alt = '';
      sourceEl.appendChild(logo);
    } else if (article.sourceLogoPlaceholder) {
      // No verified logo for this outlet yet — a plain gray badge instead
      // of a mismatched stock logo. sourceLogoPlaceholder names the file
      // to drop into assets/img/logos/ later.
      var logoPlaceholder = document.createElement('span');
      logoPlaceholder.className = 'source-logo-placeholder';
      logoPlaceholder.setAttribute('role', 'img');
      logoPlaceholder.setAttribute('aria-label', article.sourceLogoPlaceholder);
      sourceEl.appendChild(logoPlaceholder);
    }
    sourceEl.appendChild(document.createTextNode(article.source));

    var isFlagship = article.id === FLAGSHIP_ID;
    var bulletsHtml, qnaHtml;
    var currentTerms = { hbm: FLAGSHIP_TERMS.hbm };

    if (isFlagship) {
      bulletsHtml = FLAGSHIP_SUMMARY_BULLETS_HTML;
      qnaHtml = FLAGSHIP_QNA.map(function (item) { return { q: item.q, html: escapeHtml(item.a) }; });
    } else if (article.aiSummary && article.whatHappened && article.whyImportant && article.whatNext) {
      // Hand-authored per-article content from data/news.json — preferred path.
      var rawBullets = article.aiSummary;
      var rawQna = [
        { q: '무슨 일이 있었나요?', a: article.whatHappened },
        { q: '왜 중요한가요?', a: article.whyImportant },
        { q: '앞으로 어떻게 될까요?', a: article.whatNext }
      ];

      // Embed this article's one glossary term wherever its word first
      // appears — AI summary bullets are checked before the QnA answers —
      // so exactly one clickable term shows up per article, never HBM.
      var termEmbedded = false;
      bulletsHtml = rawBullets.map(function (text) {
        if (!termEmbedded && article.term) {
          var result = embedTermButton(text, article.term);
          if (result.embedded) { termEmbedded = true; return result.html; }
        }
        return escapeHtml(text);
      });
      qnaHtml = rawQna.map(function (item) {
        if (!termEmbedded && article.term) {
          var result = embedTermButton(item.a, article.term);
          if (result.embedded) { termEmbedded = true; return { q: item.q, html: result.html }; }
        }
        return { q: item.q, html: escapeHtml(item.a) };
      });

      if (termEmbedded && article.term) {
        currentTerms.term = {
          title: article.term.word,
          desc: article.term.definition,
          category: article.category
        };
      }
    } else {
      // Fallback for any article missing the hand-authored fields.
      var summary = window.EBNews.buildSummary(article);
      bulletsHtml = summary.bullets.map(escapeHtml);
      qnaHtml = summary.qna.map(function (item) { return { q: item.q, html: escapeHtml(item.a) }; });
    }

    var summaryList = document.getElementById('ai-summary-list');
    summaryList.innerHTML = '';
    bulletsHtml.forEach(function (html) {
      var li = document.createElement('li');
      li.innerHTML = html;
      summaryList.appendChild(li);
    });

    var qnaBlock = document.getElementById('qna-block');
    qnaBlock.innerHTML = '';
    qnaHtml.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'qna-item';
      div.innerHTML =
        '<div class="qna-q"><span class="gicon" role="img" aria-label="">check</span><span></span></div>' +
        '<p class="qna-a"></p>';
      div.querySelector('.qna-q span:last-child').textContent = item.q;
      div.querySelector('.qna-a').innerHTML = item.html;
      qnaBlock.appendChild(div);
    });

    var hashtagsEl = document.getElementById('article-hashtags');
    hashtagsEl.innerHTML = '';
    (article.keywords || []).forEach(function (kw) {
      var span = document.createElement('span');
      span.textContent = '#' + kw;
      hashtagsEl.appendChild(span);
    });

    document.getElementById('deep-research-btn').addEventListener('click', function () {
      var result = EB.appState.spendTokens(3);
      if (!result.spent) return;
      window.location.href = 'deep-research.html?id=' + encodeURIComponent(article.id);
    });

    renderRelatedNews(article, allArticles);
    wireTermTooltips(currentTerms);
  }

  function wireTermTooltips(terms) {
    var termOverlayBg = document.getElementById('term-overlay-bg');
    var termPopup = document.getElementById('term-popup');
    var termPopupTitle = document.getElementById('term-popup-title');
    var termPopupDesc = document.getElementById('term-popup-desc');
    var activeTermKey = null;

    function openTermPopup(key) {
      var term = terms[key];
      if (!term) return;
      activeTermKey = key;
      termPopupTitle.textContent = term.title;
      termPopupDesc.textContent = term.desc;
      document.querySelector('.ts-save').textContent = '용어저장';
      termOverlayBg.classList.add('visible');
      termPopup.classList.add('visible');
    }
    function closeTermPopup() {
      termOverlayBg.classList.remove('visible');
      termPopup.classList.remove('visible');
    }

    document.querySelectorAll('.term').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        openTermPopup(el.getAttribute('data-term'));
      });
    });
    termOverlayBg.addEventListener('click', closeTermPopup);
    document.querySelector('.ts-save').addEventListener('click', function () {
      var term = terms[activeTermKey];
      if (!term) { closeTermPopup(); return; }
      var result = EB.glossary.save({ term: term.title, definition: term.desc, category: term.category });
      var btn = document.querySelector('.ts-save');
      btn.textContent = result.added ? '저장완료 ✓' : '이미 저장됨';
      setTimeout(closeTermPopup, 700);
    });
  }

  // article.html?id=... is the normal entry point (clicked from a card
  // elsewhere), but the page can also be opened with no id at all — directly
  // by URL, a fresh tab with nothing in sessionStorage yet, etc. Rather than
  // dead-ending on the not-found state there, fall back to the flagship
  // article so the page always has something real to show. A truly unknown
  // id (stale/typo'd link) falls back the same way; only the flagship itself
  // failing to load still shows the not-found state, as a last resort.
  var currentId = window.EBNews.resolveCurrentId() || FLAGSHIP_ID;
  window.EBNews.loadArticles().then(function (allArticles) {
    function findById(id) {
      for (var i = 0; i < allArticles.length; i++) {
        if (String(allArticles[i].id) === String(id)) return allArticles[i];
      }
      return null;
    }
    var article = findById(currentId);
    if (article) { renderArticle(article, allArticles); return; }
    if (currentId === FLAGSHIP_ID) { renderNotFound(); return; }
    var fallback = findById(FLAGSHIP_ID);
    if (fallback) renderArticle(fallback, allArticles); else renderNotFound();
  }).catch(function () {
    renderNotFound();
  });
})();
