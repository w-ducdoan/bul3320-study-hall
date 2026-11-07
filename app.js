(function () {
  "use strict";

  var KEY = "bul3320-hall-v1";
  var DAY = 86400000;
  var REVIEW_STEPS = [1, 3, 7];
  var COLORS = ["#1d5fa8", "#0f6e56", "#993c1d", "#534ab7", "#993556", "#854f0b"];
  var EXAMS = window.EXAMS || [];
  var app = document.getElementById("app");

  // ---------- storage ----------
  function blank() { return { name: "", color: COLORS[0], concepts: {}, review: {}, mocks: {}, stats: {}, friend: null, exam: "exam3" }; }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); return Object.assign(blank(), s || {}); } catch (e) { return blank(); }
  }
  var S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep in memory */ } }

  // ---------- indexes ----------
  var Q = {};         // question id -> {q, exam, ch, concept}
  var CONCEPT = {};   // concept key -> {exam, ch, c}
  EXAMS.forEach(function (ex) {
    ex.chapters.forEach(function (ch) {
      (ch.concepts || []).forEach(function (c) {
        var key = ex.id + "." + ch.id + "." + c.id;
        CONCEPT[key] = { exam: ex, ch: ch, c: c, key: key };
        (c.checks || []).forEach(function (q, i) { Q[key + ".q" + i] = { q: q, exam: ex, ch: ch, c: c, key: key }; });
      });
    });
    (ex.mocks || []).forEach(function (m) {
      m.questions.forEach(function (q, i) {
        var key = ex.id + "." + q.concept, info = CONCEPT[key];
        Q[ex.id + ".mock" + m.id + ".q" + i] = { q: q, exam: ex, ch: findCh(ex, q.ch), c: info ? info.c : null, key: key, mock: m.id };
      });
    });
  });
  function findCh(ex, id) { return ex.chapters.filter(function (c) { return c.id === id; })[0] || { id: id, title: id }; }
  function getExam(id) { return EXAMS.filter(function (e) { return e.id === id; })[0] || EXAMS[0]; }

  // ---------- helpers ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function passMark(n) { return Math.ceil(n * 0.8); }
  // display order for a question's options; true/false keeps its natural order
  function order(q) {
    var idx = q.options.map(function (_, k) { return k; });
    if (q.options.length === 2 && q.options[0] === "True") return idx;
    // options that point at other options ("All of the above") keep their written order
    if (q.options.some(function (o) { return /\b(of the above|both [a-e]|[a-e] and [a-e])\b/i.test(o); })) return idx;
    return shuffle(idx);
  }
  // "A) " style label for multiple choice, nothing for true/false
  function letter(q, pos) { return q.options.length === 2 && q.options[0] === "True" ? "" : "ABCDE".charAt(pos) + ") "; }
  function conceptState(key) { var r = S.concepts[key]; if (!r) return "no"; return r.passed ? "ok" : "mid"; }
  function chapterPct(ex, ch) {
    var cs = ch.concepts || []; if (!cs.length) return null;
    var done = cs.filter(function (c) { return conceptState(ex.id + "." + ch.id + "." + c.id) === "ok"; }).length;
    return Math.round(100 * done / cs.length);
  }
  function dueIds(examId) {
    var now = Date.now();
    return Object.keys(S.review).filter(function (id) { return Q[id] && S.review[id].due <= now && (!examId || Q[id].exam.id === examId); });
  }
  function emphasisDone(ex, item) { return item.c ? conceptState(ex.id + "." + item.ch + "." + item.c) === "ok" : false; }
  function badge(st) { return { ok: '<span class="badge b-ok">Passed</span>', mid: '<span class="badge b-mid">In progress</span>', no: '<span class="badge b-no">Not started</span>' }[st]; }
  function todayISO() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  function miss(id) { S.review[id] = { due: Date.now() + REVIEW_STEPS[0] * DAY, step: 0 }; }
  function hit(id) {
    var r = S.review[id]; if (!r) return;
    r.step += 1;
    if (r.step >= REVIEW_STEPS.length) delete S.review[id]; else r.due = Date.now() + REVIEW_STEPS[r.step] * DAY;
  }

  // every answered question goes through here so the stats and the review queue stay in step
  function note(id, ok) {
    var r = S.stats[id] || (S.stats[id] = { seen: 0, miss: 0, last: 0, lastOk: true });
    r.seen++; if (!ok) r.miss++;
    r.last = Date.now(); r.lastOk = ok;
    if (ok) hit(id); else miss(id);
  }
  // misses from before stats existed still count
  Object.keys(S.review).forEach(function (id) { if (!S.stats[id]) S.stats[id] = { seen: 1, miss: 1, last: 0, lastOk: false }; });

  // ---------- adaptive practice ----------
  var KIND_LABELS = { tf: "True/false", number: "Numbers and deadlines", list: "EXCEPT and list questions", scenario: "Scenarios", definition: "Definitions" };
  var NUMBER_RE = /\$\d|\b\d+(\.\d+)?\s*(%|days?|weeks?|months?|years?|hours?|employees|workers|members|or more)/i;
  function isTF(q) { return q.options.length === 2 && q.options[0] === "True"; }
  function kindsOf(q) {
    var out = [];
    if (NUMBER_RE.test(q.q) || (!isTF(q) && NUMBER_RE.test(q.options[q.answer]))) out.push("number");
    if (isTF(q)) { out.push("tf"); return out; }
    if (/\bEXCEPT\b|\bNOT\b/.test(q.q) || q.options.some(function (o) { return /of the above/i.test(o); })) out.push("list");
    else if (q.q.length >= 85) out.push("scenario");
    else out.push("definition");
    return out;
  }
  function weakness(ex) {
    var con = {}, kin = {};
    Object.keys(S.stats).forEach(function (id) {
      var info = Q[id], r = S.stats[id];
      if (!info || info.exam !== ex || !info.key) return;
      var c = con[info.key] || (con[info.key] = { key: info.key, seen: 0, miss: 0, open: 0 });
      c.seen += r.seen; c.miss += r.miss; if (!r.lastOk) c.open++;
      kindsOf(info.q).forEach(function (k) {
        var e = kin[k] || (kin[k] = { kind: k, seen: 0, miss: 0 });
        e.seen += r.seen; e.miss += r.miss;
      });
    });
    var concepts = Object.keys(con).map(function (k) { con[k].rate = con[k].miss / con[k].seen; return con[k]; })
      .filter(function (c) { return c.open > 0 || c.rate >= 0.25; })
      .sort(function (a, b) { return b.open - a.open || b.rate - a.rate; });
    var kinds = Object.keys(kin).map(function (k) { kin[k].rate = kin[k].miss / kin[k].seen; return kin[k]; })
      .filter(function (e) { return e.seen >= 4; })
      .sort(function (a, b) { return b.rate - a.rate; });
    return { con: con, concepts: concepts, kinds: kinds, any: Object.keys(con).length > 0 };
  }
  function questionWeight(id, w) {
    var info = Q[id], r = S.stats[id], c = w.con[info.key], base = 1;
    if (c) base += 6 * c.miss / (c.seen + 1);
    kindsOf(info.q).forEach(function (k) {
      var e = w.kinds.filter(function (x) { return x.kind === k; })[0];
      if (e) base += 3 * e.rate;
    });
    if (!r) return base * 1.3;            // not seen yet
    if (!r.lastOk) return base * 4;       // got it wrong last time
    var days = (Date.now() - r.last) / DAY;
    return base * (days < 1 ? 0.15 : days < 3 ? 0.5 : 1);  // just got it right: rest it
  }
  // weighted sample without replacement; identical question text only appears once
  function weightedPick(ids, n, w) {
    var seen = {};
    return ids.map(function (id) { return { id: id, k: Math.pow(Math.random(), 1 / questionWeight(id, w)) }; })
      .sort(function (a, b) { return b.k - a.k; })
      .filter(function (x) { var t = Q[x.id].q.q; if (seen[t]) return false; seen[t] = 1; return true; })
      .slice(0, n).map(function (x) { return x.id; });
  }
  // mock questions stay out of practice until that mock has been taken, so the mocks stay fresh
  function practicePool(ex) {
    return Object.keys(Q).filter(function (id) {
      var i = Q[id];
      return i.exam === ex && (!i.mock || S.mocks[ex.id + "." + i.mock]);
    });
  }
  function toItems(ids) { return ids.map(function (id) { return { id: id, q: Q[id].q }; }); }
  function pct(x) { return Math.round(100 * x) + "%"; }

  function weakRows(ex, w, n) {
    return w.concepts.slice(0, n).map(function (c) {
      var info = CONCEPT[c.key];
      if (!info) return "";
      return '<a class="item" href="#/' + ex.id + "/" + info.ch.id + "/" + info.c.id + '"><span class="grow">' + esc(info.c.title) + '<br><span class="tiny">Ch. ' + info.ch.num + " · missed " + c.miss + " of " + c.seen + "</span></span>" +
        (c.open ? '<span class="badge b-mid">' + c.open + " still wrong</span>" : '<span class="badge b-ok">Improving</span>') + "</a>";
    }).join("");
  }
  function kindLine(w) {
    if (!w.kinds.length) return "";
    var top = w.kinds[0];
    if (top.rate === 0) return "";
    return '<p class="small muted" style="margin:10px 0 0">The kind of question you miss most: <b>' + esc(KIND_LABELS[top.kind]) + "</b> (" + pct(top.rate) + " missed). Practice sets lean toward these.</p>";
  }
  function weakCard(ex) {
    var w = weakness(ex);
    if (!w.concepts.length) return "";
    return '<div class="card"><h2 style="margin-top:0">What you keep missing</h2><div class="list">' + weakRows(ex, w, 3) + "</div>" + kindLine(w) +
      '<div class="actions"><a class="btn primary" href="#/' + ex.id + '/adapt">Train my weak spots</a></div></div>';
  }
  function viewAdapt(ex) {
    var w = weakness(ex);
    app.innerHTML = '<div class="crumbs"><a href="#/' + ex.id + '">' + esc(ex.short) + "</a> / Train my weak spots</div><h1>Train my weak spots</h1>" +
      '<p class="muted small">Every set is built fresh from your answers so far. Questions you got wrong come back, you get new questions on the same concepts, and the kinds of questions you miss most show up more. Questions you just got right take a rest.</p>' +
      (w.concepts.length ? '<div class="card"><h2 style="margin-top:0">Your weakest concepts</h2><div class="list">' + weakRows(ex, w, 8) + "</div>" + kindLine(w) + "</div>"
        : '<div class="card"><p>No misses to work from yet, so this set will mix all the chapters. It gets more personal as you answer more questions.</p></div>') +
      '<div class="card"><h2 style="margin-top:0">Start a set</h2><div class="actions"><button class="primary" data-n="10">10 questions</button><button data-n="20">20 questions</button><button data-n="40">40 questions</button></div></div>';
    [].forEach.call(app.querySelectorAll("button[data-n]"), function (b) {
      b.onclick = function () { runAdaptive(ex, +b.getAttribute("data-n")); };
    });
  }
  function runAdaptive(ex, n) {
    var ids = weightedPick(practicePool(ex), n, weakness(ex));
    runQuiz(toItems(ids), {
      title: "Weak spot training", showSource: true, back: '<a href="#/' + ex.id + '/adapt">Train my weak spots</a>',
      onDone: function (score, total, log) { showResult(ex, score, total, log, "#/" + ex.id + "/adapt", "Another set"); }
    });
  }
  function showResult(ex, score, total, log, href, label) {
    log.forEach(function (l) { note(l.id, l.ok); }); save();
    var byCh = {};
    log.forEach(function (l) { var c = Q[l.id].ch; byCh[c.id] = byCh[c.id] || [0, 0, c]; byCh[c.id][1]++; if (l.ok) byCh[c.id][0]++; });
    app.innerHTML = '<div class="card"><div class="result">' + score + " / " + total + '</div><div class="list">' + Object.keys(byCh).map(function (k) {
      var r = byCh[k];
      return '<div class="item"><span class="grow">Ch. ' + r[2].num + " " + esc(r[2].title) + '</span><span class="pct" style="width:60px">' + r[0] + "/" + r[1] + "</span></div>";
    }).join("") + '</div><div class="actions"><a class="btn primary" href="' + href + '">' + esc(label) + '</a><a class="btn" href="#/' + ex.id + '">Home</a></div><div id="drillslot"></div></div>';
    offerDrill(ex, log);
    window.scrollTo(0, 0);
  }
  // after any quiz: the questions just missed, plus fresh questions on the same concepts
  function offerDrill(ex, log) {
    var slot = document.getElementById("drillslot"), missed = log.filter(function (l) { return !l.ok; }).map(function (l) { return l.id; });
    if (!slot || !missed.length) return;
    var w = weakness(ex), concepts = {};
    missed.forEach(function (id) { if (Q[id].key) concepts[Q[id].key] = 1; });
    var answered = {};
    log.forEach(function (l) { answered[l.id] = 1; });
    var siblings = practicePool(ex).filter(function (id) { return concepts[Q[id].key] && !answered[id]; });
    var ids = missed.concat(weightedPick(siblings, Math.min(12, Object.keys(concepts).length * 2), w)).slice(0, 15);
    slot.innerHTML = '<p class="small muted" style="margin:14px 0 6px">You missed ' + missed.length + ". Try those again, plus new questions on the same concepts.</p>" +
      '<div class="actions" style="margin-top:0"><button class="primary" id="drill">Drill what I missed (' + ids.length + " questions)</button></div>";
    document.getElementById("drill").onclick = function () {
      runQuiz(toItems(shuffle(ids)), {
        title: "Drill", showSource: true, back: '<a href="#/' + ex.id + '">Home</a>',
        onDone: function (score, total, l2) { showResult(ex, score, total, l2, "#/" + ex.id + "/adapt", "Train my weak spots"); }
      });
    };
  }
  // a fresh 55-question mock: the usual chapter mix, tilted toward weak chapters and concepts
  function adaptiveMock(ex) {
    var w = weakness(ex), base = {}, weak = {}, baseTotal = 0, weakTotal = 0;
    ex.mocks[0].questions.forEach(function (q) { base[q.ch] = (base[q.ch] || 0) + 1; baseTotal++; });
    Object.keys(w.con).forEach(function (k) { var ch = CONCEPT[k] && CONCEPT[k].ch.id; if (ch) { weak[ch] = (weak[ch] || 0) + w.con[k].miss; weakTotal += w.con[k].miss; } });
    var pool = practicePool(ex), ids = [];
    ex.chapters.forEach(function (ch) {
      var share = 0.6 * (base[ch.id] || 0) / baseTotal + 0.4 * (weakTotal ? (weak[ch.id] || 0) / weakTotal : (base[ch.id] || 0) / baseTotal);
      var n = Math.max(4, Math.round(55 * share));
      ids = ids.concat(weightedPick(pool.filter(function (id) { return Q[id].ch.id === ch.id; }), n, w));
    });
    if (ids.length > 55) ids = shuffle(ids).slice(0, 55);
    if (ids.length < 55) ids = ids.concat(weightedPick(pool.filter(function (id) { return ids.indexOf(id) < 0; }), 55 - ids.length, w));
    return { id: "adaptive", title: "Adaptive mock (built from what you miss)", minutes: 60, items: toItems(shuffle(ids)) };
  }
  // what shows after an answer: the verdict, the answer, and the reasoning behind it
  function answerLine(q) { return isTF(q) ? "This statement is " + q.options[q.answer].toLowerCase() + "." : "The answer is: " + q.options[q.answer] + "."; }
  function teachHTML(id, q, ok) {
    var info = Q[id], link = "";
    if (info && info.key && CONCEPT[info.key]) {
      var cc = CONCEPT[info.key];
      link = '<a class="small" target="_blank" rel="noopener" href="#/' + cc.exam.id + "/" + cc.ch.id + "/" + cc.c.id + '">Reread this concept: ' + esc(cc.c.title) + "</a>";
    }
    return '<div class="teach ' + (ok ? "good" : "bad") + '"><p class="verdict"><b>' + (ok ? "Correct." : "Not quite.") + "</b> " + answerLine(q) + "</p>" +
      (q.explain ? "<p>" + q.explain + "</p>" : "") +
      (q.textbook ? '<p class="tiny">This detail comes from the textbook, not the slides.</p>' : "") + link + "</div>";
  }

  // ---------- header ----------
  function header() {
    var cur = S.exam;
    document.getElementById("examnav").innerHTML = EXAMS.map(function (e) {
      return '<a class="pill' + (e.id === cur ? " on" : "") + '" href="#/' + e.id + '">' + esc(e.short) + "</a>";
    }).join("");
    document.getElementById("who").innerHTML = S.name
      ? '<span class="dot" style="background:' + S.color + '"></span>' + esc(S.name) + ' · <a href="#/together">Study together</a>'
      : "";
  }

  // ---------- views ----------
  function viewSetup() {
    var sw = COLORS.map(function (c, i) { return '<button data-color="' + c + '" class="' + (i === 0 ? "sel" : "") + '" style="background:' + c + '" aria-label="Color ' + (i + 1) + '"></button>'; }).join("");
    app.innerHTML =
      '<div class="card"><h1>Welcome</h1><p class="muted">Your progress saves in this browser only. Each person uses their own device, and you can compare progress on the Study together page.</p>' +
      '<label class="small muted" for="nm">Your first name</label><input type="text" id="nm" maxlength="20" placeholder="Duc">' +
      '<div class="small muted" style="margin-top:12px">Pick a color</div><div class="swatches" id="sw">' + sw + "</div>" +
      '<div id="err" class="err"></div><div class="actions"><button class="primary" id="go">Start studying</button></div></div>';
    var color = COLORS[0];
    document.getElementById("sw").onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      color = b.getAttribute("data-color");
      [].forEach.call(this.children, function (x) { x.classList.toggle("sel", x === b); });
    };
    document.getElementById("nm").oninput = function () { document.getElementById("err").textContent = ""; };
    document.getElementById("go").onclick = function () {
      var n = document.getElementById("nm").value.trim();
      if (!n) { document.getElementById("err").textContent = "Enter your name first."; return; }
      S.name = n; S.color = color; save(); route();
    };
  }

  function viewHome(ex) {
    var dueN = dueIds(ex.id).length;
    var emph = ex.emphasis || [];
    var emphDone = emph.filter(function (it) { return emphasisDone(ex, it); }).length;
    var days = Math.ceil((new Date(ex.date) - Date.now()) / DAY);
    var plan = (ex.plan || []).filter(function (p) { return p.date === todayISO(); })[0];
    var chRows = ex.chapters.map(function (ch) {
      var pct = chapterPct(ex, ch);
      if (pct === null) return '<div class="item"><span class="grow">Ch. ' + ch.num + " " + esc(ch.title) + '</span><span class="badge b-no">' + esc(ch.coming || "Coming soon") + "</span></div>";
      return '<a class="item" href="#/' + ex.id + "/" + ch.id + '"><span class="grow">Ch. ' + ch.num + " " + esc(ch.title) + '</span><span class="bar"><i style="width:' + pct + '%"></i></span><span class="pct">' + pct + "%</span></a>";
    }).join("");
    var mockRows = (ex.mocks || []).length
      ? ex.mocks.map(function (m) {
          var r = S.mocks[ex.id + "." + m.id];
          return '<a class="item" href="#/' + ex.id + "/mock/" + m.id + '"><span class="grow">' + esc(m.title) + '<br><span class="tiny">' + m.questions.length + " questions · " + m.minutes + " minutes</span></span>" + (r ? '<span class="badge b-ok">Best ' + r.best + "/" + r.total + "</span>" : '<span class="badge b-no">Not taken</span>') + "</a>";
        }).join("")
      : '<div class="item"><span class="grow muted small">' + esc(ex.mocksComing || "Mock exams are coming soon.") + "</span></div>";

    app.innerHTML =
      "<h1>" + esc(ex.title) + "</h1><p class=\"muted small\">" + esc(ex.when) + "</p>" +
      '<div class="stats"><div class="stat"><b>' + (days > 0 ? days + (days === 1 ? " day" : " days") : "Today") + "</b><span>until the exam</span></div>" +
      '<a class="stat" href="#/' + ex.id + '/emphasis" style="color:inherit"><b>' + emphDone + " / " + emph.length + "</b><span>emphasis items passed</span></a>" +
      '<a class="stat" href="#/review/' + ex.id + '" style="color:inherit"><b>' + dueN + "</b><span>review cards due</span></a></div>" +
      (plan ? '<div class="plan"><b>Suggested for today</b> · ' + esc(plan.text) + "</div>" : "") +
      weakCard(ex) +
      '<div class="card"><h2 style="margin-top:0">Chapters</h2><p class="tiny" style="margin:0 0 4px">Start anywhere. Every chapter, concept and quick check is open.</p><div class="list">' + chRows + "</div></div>" +
      '<div class="card"><h2 style="margin-top:0">Practice</h2><div class="list">' +
        '<a class="item" href="#/' + ex.id + '/adapt"><span class="grow">Train my weak spots<br><span class="tiny">Built from what you miss, and it changes as you answer</span></span><span class="badge b-no">Open</span></a>' +
        '<a class="item" href="#/' + ex.id + '/practice"><span class="grow">Mixed practice<br><span class="tiny">Pick any chapters and get a random set of questions</span></span><span class="badge b-no">Open</span></a>' +
        '<a class="item" href="#/' + ex.id + '/emphasis"><span class="grow">Professor\'s emphasis list<br><span class="tiny">Every item links to the concept that covers it</span></span><span class="badge b-no">' + emphDone + "/" + emph.length + "</span></a>" +
        mockRows +
        '<a class="item" href="#/' + ex.id + '/mock/adaptive"><span class="grow">Adaptive mock<br><span class="tiny">A new 55-question exam each time, tilted toward what you miss</span></span>' + (S.mocks[ex.id + ".adaptive"] ? '<span class="badge b-ok">Best ' + S.mocks[ex.id + ".adaptive"].best + "/" + S.mocks[ex.id + ".adaptive"].total + "</span>" : '<span class="badge b-no">Not taken</span>') + "</a>" +
        "</div></div>" +
      '<div class="card"><h2 style="margin-top:0">Suggested plan (optional)</h2><div class="list">' + (ex.plan || []).map(function (p) {
        var isToday = p.date === todayISO();
        return '<div class="item"><span class="small" style="width:92px;flex:none' + (isToday ? ";color:var(--accent);font-weight:600" : "") + '">' + esc(p.label) + '</span><span class="grow small">' + esc(p.text) + "</span></div>";
      }).join("") + "</div></div>";
  }

  function viewChapter(ex, ch) {
    var rows = ch.concepts.map(function (c, i) {
      var key = ex.id + "." + ch.id + "." + c.id;
      return '<a class="item" href="#/' + ex.id + "/" + ch.id + "/" + c.id + '"><span class="grow"><span class="tiny">Concept ' + (i + 1) + " · " + esc(c.slides) + "</span><br>" + esc(c.title) + "</span>" + badge(conceptState(key)) + "</a>";
    }).join("");
    app.innerHTML = '<div class="crumbs"><a href="#/' + ex.id + '">' + esc(ex.short) + "</a> / Ch. " + ch.num + "</div><h1>Ch. " + ch.num + " " + esc(ch.title) + "</h1>" +
      '<p class="muted small">' + esc(ch.deck) + "</p>" + (ch.intro ? "<p>" + ch.intro + "</p>" : "") +
      '<div class="card"><div class="list">' + rows + "</div></div>";
  }

  function viewConcept(ex, ch, c) {
    var idx = ch.concepts.indexOf(c);
    var key = ex.id + "." + ch.id + "." + c.id;
    var r = S.concepts[key];
    var next = ch.concepts[idx + 1];
    app.innerHTML = '<div class="crumbs"><a href="#/' + ex.id + '">' + esc(ex.short) + '</a> / <a href="#/' + ex.id + "/" + ch.id + '">Ch. ' + ch.num + "</a> / Concept " + (idx + 1) + " of " + ch.concepts.length + "</div>" +
      '<div class="card"><div class="tiny">' + esc(c.slides) + "</div><h1>" + esc(c.title) + "</h1>" +
      '<div class="takeaway"><b>The one thing to remember</b><br>' + c.takeaway + "</div>" +
      (c.plain ? '<h2>In plain English</h2><div class="rule plain">' + c.plain + "</div><h2>The details from the slides</h2>" : "") +
      '<div class="rule">' + c.rule + "</div>" +
      (c.example ? '<div class="example"><b>Professor\'s example</b> · ' + c.example + "</div>" : "") +
      (c.textbook ? '<div class="tbnote">Textbook only (not on the slides): ' + c.textbook + "</div>" : "") +
      '<div class="actions"><a class="btn primary" href="#/' + ex.id + "/" + ch.id + "/" + c.id + '/check">Quick check (' + c.checks.length + " questions)</a>" +
      (next ? '<a class="btn" href="#/' + ex.id + "/" + ch.id + "/" + next.id + '">Next concept</a>' : '<a class="btn" href="#/' + ex.id + "/" + ch.id + '">Back to chapter</a>') + "</div>" +
      (r ? '<p class="tiny" style="margin-top:10px">Best quick check: ' + r.best + "/" + r.total + (r.passed ? " · passed" : " · need " + passMark(r.total) + " to pass") + "</p>" : "") +
      "</div>";
  }

  // generic question runner: items = [{id, q}], opts {title, back, onDone(score,total,details), instant:true}
  function runQuiz(items, opts) {
    var i = 0, score = 0, answered = false, log = [];
    function draw() {
      var it = items[i], q = it.q;
      var label = Q[it.id] ? "Ch. " + Q[it.id].ch.num + (Q[it.id].c ? " · " + Q[it.id].c.title : "") : "";
      app.innerHTML = '<div class="crumbs">' + opts.back + "</div>" +
        '<div class="card"><div class="progress"><span>' + esc(opts.title) + "</span><span>" + (i + 1) + " of " + items.length + "</span></div>" +
        (opts.showSource && label ? '<div class="tiny" style="margin-top:6px">' + esc(label) + "</div>" : "") +
        '<p class="q">' + q.q + "</p>" +
        order(q).map(function (k, pos) { return '<button class="opt" data-k="' + k + '">' + letter(q, pos) + q.options[k] + '<div class="why" hidden></div></button>'; }).join("") +
        '<div id="after"></div></div>';
      answered = false;
      [].forEach.call(app.querySelectorAll(".opt"), function (b) { b.onclick = function () { pick(+b.getAttribute("data-k")); }; });
    }
    function pick(k) {
      if (answered) return; answered = true;
      var it = items[i], q = it.q, ok = k === q.answer;
      if (ok) score++;
      log.push({ id: it.id, ok: ok });
      [].forEach.call(app.querySelectorAll(".opt"), function (b) {
        var j = +b.getAttribute("data-k");
        b.disabled = true;
        if (j === q.answer) b.classList.add("right"); else if (j === k) b.classList.add("wrong");
        // the reason each wrong choice fails; true/false and bare "Listed" notes add nothing to the explanation
        var w = q.why && q.why[j];
        if (w && j !== q.answer && !isTF(q) && !/^(Correct|Listed)/.test(w) && w.length >= 18) { var d = b.querySelector(".why"); d.textContent = "Why not: " + w; d.hidden = false; }
      });
      document.getElementById("after").innerHTML = teachHTML(it.id, q, ok) +
        '<div class="actions"><button class="primary" id="nx">' + (i + 1 < items.length ? "Next question" : "See result") + "</button></div>";
      document.getElementById("nx").onclick = function () { i++; if (i < items.length) draw(); else opts.onDone(score, items.length, log); };
    }
    draw();
  }

  function viewCheck(ex, ch, c) {
    var key = ex.id + "." + ch.id + "." + c.id;
    var items = c.checks.map(function (q, i) { return { id: key + ".q" + i, q: q }; });
    runQuiz(items, {
      title: "Quick check · " + c.title,
      back: '<a href="#/' + ex.id + "/" + ch.id + "/" + c.id + '">Back to the concept</a>',
      onDone: function (score, total, log) {
        log.forEach(function (l) { note(l.id, l.ok); });
        var prev = S.concepts[key];
        var passed = score >= passMark(total) || (prev && prev.passed);
        S.concepts[key] = { best: Math.max(score, prev ? prev.best : 0), total: total, passed: !!passed, at: Date.now() };
        save();
        var idx = ch.concepts.indexOf(c), next = ch.concepts[idx + 1];
        var nowPass = score >= passMark(total);
        app.innerHTML = '<div class="card"><div class="tiny">' + esc(c.title) + '</div><div class="result">' + score + " / " + total + "</div>" +
          "<p>" + (nowPass ? "Passed. Missed questions, if any, are in your review queue." : "Not yet. You need " + passMark(total) + " of " + total + ". Reread the card, then try again. Misses went to your review queue.") + "</p>" +
          '<div class="actions">' + (nowPass && next ? '<a class="btn primary" href="#/' + ex.id + "/" + ch.id + "/" + next.id + '">Next concept</a>' : "") +
          (!nowPass ? '<a class="btn primary" href="#/' + ex.id + "/" + ch.id + "/" + c.id + '">Reread the card</a>' : "") +
          '<a class="btn" href="#/' + ex.id + "/" + ch.id + '">Chapter list</a></div><div id="drillslot"></div></div>';
        offerDrill(ex, log);
      }
    });
  }

  function viewEmphasis(ex) {
    var rows = (ex.emphasis || []).map(function (it) {
      var ch = findCh(ex, it.ch);
      var st = it.c ? conceptState(ex.id + "." + it.ch + "." + it.c) : null;
      var href = it.c ? "#/" + ex.id + "/" + it.ch + "/" + it.c : null;
      var right = st ? badge(st) : '<span class="badge b-no">' + esc(ch.coming || "Coming soon") + "</span>";
      var inner = '<span class="grow">' + esc(it.label) + '<br><span class="tiny">Ch. ' + ch.num + " " + esc(ch.title) + "</span></span>" + right;
      return href ? '<a class="item" href="' + href + '">' + inner + "</a>" : '<div class="item">' + inner + "</div>";
    }).join("");
    app.innerHTML = '<div class="crumbs"><a href="#/' + ex.id + '">' + esc(ex.short) + "</a> / Emphasis list</div><h1>Professor's emphasis list</h1>" +
      '<p class="muted small">From Prof. Baugher\'s Exam 3 announcement. An item turns green when you pass the quick check for its concept.</p><div class="card"><div class="list">' + rows + "</div></div>";
  }

  function viewReview(examId) {
    var ids = shuffle(dueIds(examId)).slice(0, 20);
    if (!ids.length) {
      var all = Object.keys(S.review).filter(function (id) { return Q[id] && (!examId || Q[id].exam.id === examId); });
      var nextDue = all.map(function (id) { return S.review[id].due; }).sort()[0];
      app.innerHTML = '<div class="card"><h1>Review queue</h1><p>Nothing is due right now.' + (nextDue ? " Next card is due " + new Date(nextDue).toLocaleDateString(undefined, { weekday: "long" }) + "." : "") +
        '</p><p class="muted small">Every question you miss comes back after 1 day, then 3, then 7. Get it right three times and it leaves the queue.</p><div class="actions"><a class="btn" href="#/' + (examId || S.exam) + '">Home</a></div></div>';
      return;
    }
    runQuiz(ids.map(function (id) { return { id: id, q: Q[id].q }; }), {
      title: "Review queue", showSource: true,
      back: '<a href="#/' + (examId || S.exam) + '">Home</a>',
      onDone: function (score, total, log) {
        log.forEach(function (l) { note(l.id, l.ok); });
        save();
        app.innerHTML = '<div class="card"><div class="result">' + score + " / " + total + '</div><p>Correct cards move to a longer gap. Missed cards come back tomorrow.</p><div class="actions"><a class="btn primary" href="#/' + (examId || S.exam) + '">Home</a></div></div>';
      }
    });
  }

  function viewMock(ex, m) {
    var mkey = ex.id + "." + m.id;
    var qs = m.items || m.questions.map(function (q, i) { return { id: ex.id + ".mock" + m.id + ".q" + i, q: q }; });
    var ans = {}, flags = {}, cur = 0, end = Date.now() + m.minutes * 60000, timer;
    var orders = qs.map(function (it) { return order(it.q); });
    function draw() {
      var it = qs[cur], q = it.q;
      app.innerHTML = '<div class="card"><div class="progress"><span>' + esc(m.title) + " · question " + (cur + 1) + " of " + qs.length + '</span><span id="clock"></span></div>' +
        '<p class="q">' + q.q + "</p>" +
        orders[cur].map(function (k, pos) { return '<button class="opt' + (ans[cur] === k ? " picked" : "") + '" data-k="' + k + '">' + letter(q, pos) + q.options[k] + "</button>"; }).join("") +
        '<div class="actions"><button id="pv">Back</button><button id="fl">' + (flags[cur] ? "Unflag" : "Flag") + '</button><button id="nx" class="primary">' + (cur + 1 < qs.length ? "Next" : "Review and submit") + "</button></div>" +
        '<div class="grid">' + qs.map(function (_, j) { return '<button data-j="' + j + '" class="' + (ans[j] !== undefined ? "ans " : "") + (flags[j] ? "flag " : "") + (j === cur ? "cur" : "") + '">' + (j + 1) + "</button>"; }).join("") + "</div>" +
        '<div class="actions"><button id="sub">Submit exam</button></div><div id="err" class="err"></div></div>';
      [].forEach.call(app.querySelectorAll(".opt"), function (b) { b.onclick = function () { ans[cur] = +b.getAttribute("data-k"); draw(); }; });
      [].forEach.call(app.querySelectorAll(".grid button"), function (b) { b.onclick = function () { cur = +b.getAttribute("data-j"); draw(); }; });
      document.getElementById("pv").onclick = function () { if (cur > 0) { cur--; draw(); } };
      document.getElementById("fl").onclick = function () { flags[cur] = !flags[cur]; draw(); };
      document.getElementById("nx").onclick = function () { if (cur + 1 < qs.length) { cur++; draw(); } else confirmSubmit(); };
      document.getElementById("sub").onclick = confirmSubmit;
      tick();
    }
    function confirmSubmit() {
      var blank = qs.length - Object.keys(ans).length;
      if (blank > 0 && !window.confirm(blank + " questions are unanswered. Submit anyway?")) return;
      finish();
    }
    function tick() {
      var left = Math.max(0, end - Date.now()), el = document.getElementById("clock");
      if (el) el.textContent = Math.floor(left / 60000) + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0") + " left";
      if (left <= 0) finish();
    }
    function finish() {
      clearInterval(timer);
      var score = 0, byCh = {};
      qs.forEach(function (it, j) {
        var ok = ans[j] === it.q.answer, ch = Q[it.id].ch.id;
        byCh[ch] = byCh[ch] || [0, 0]; byCh[ch][1]++;
        note(it.id, ok); if (ok) { score++; byCh[ch][0]++; }
      });
      var prev = S.mocks[mkey];
      S.mocks[mkey] = { best: Math.max(score, prev ? prev.best : 0), last: score, total: qs.length, at: Date.now() };
      save();
      var chRows = Object.keys(byCh).map(function (c) { var ch = findCh(ex, c); return '<div class="item"><span class="grow">Ch. ' + ch.num + " " + esc(ch.title) + '</span><span class="pct" style="width:60px">' + byCh[c][0] + "/" + byCh[c][1] + "</span></div>"; }).join("");
      function reviewRow(it, j) {
        var ok = ans[j] === it.q.answer;
        return '<div class="card"><div class="tiny">Question ' + (j + 1) + "</div><p>" + it.q.q + "</p>" +
          (ok ? "" : '<p class="small"><b>Your answer:</b> ' + (ans[j] === undefined ? "blank" : it.q.options[ans[j]]) + "</p>") + teachHTML(it.id, it.q, ok) + "</div>";
      }
      var missRows = qs.map(function (it, j) { return ans[j] === it.q.answer ? "" : reviewRow(it, j); }).join("");
      var rightRows = qs.map(function (it, j) { return ans[j] === it.q.answer ? reviewRow(it, j) : ""; }).join("");
      var log = qs.map(function (it, j) { return { id: it.id, ok: ans[j] === it.q.answer }; });
      app.innerHTML = '<div class="card"><div class="tiny">' + esc(m.title) + '</div><div class="result">' + score + " / " + qs.length + " (" + Math.round(100 * score / qs.length) + '%)</div><p class="small muted">Every miss is now in your review queue.</p><div class="list">' + chRows + "</div></div>" +
        '<div class="card"><div id="drillslot"></div><div class="actions"><a class="btn" href="#/' + ex.id + '/mock/adaptive">Take an adaptive mock</a><a class="btn" href="#/' + ex.id + '">Home</a></div></div>' +
        (missRows ? "<h2>What you missed</h2>" + missRows : "<p>No misses.</p>") +
        (rightRows ? "<details><summary>Show the " + score + " you got right, with explanations</summary>" + rightRows + "</details>" : "");
      offerDrill(ex, log);
      window.scrollTo(0, 0);
    }
    app.innerHTML = '<div class="card"><h1>' + esc(m.title) + "</h1><p>" + qs.length + " questions · " + m.minutes + " minutes · multiple choice and true/false.</p>" +
      '<p class="muted small">Like the real exam: no feedback until you submit. You can flag questions and jump around with the number grid.</p>' + (m.items ? '<p class="muted small">Built just now from your results: the usual chapter mix, tilted toward what you miss. You get a different exam every time.</p>' : "") + '<div class="actions"><button class="primary" id="st">Start the clock</button><a class="btn" href="#/' + ex.id + '">Not now</a></div></div>';
    document.getElementById("st").onclick = function () { end = Date.now() + m.minutes * 60000; timer = setInterval(tick, 1000); window.__mockTimer = timer; draw(); };
  }

  function viewPractice(ex) {
    var built = ex.chapters.filter(function (ch) { return (ch.concepts || []).length; });
    app.innerHTML = '<div class="crumbs"><a href="#/' + ex.id + '">' + esc(ex.short) + "</a> / Mixed practice</div><h1>Mixed practice</h1>" +
      '<p class="muted small">Random quick-check questions from whichever chapters you pick, with instant feedback. Misses go to your review queue.</p>' +
      '<div class="card"><div class="list" id="chs">' + built.map(function (ch) {
        var n = ch.concepts.reduce(function (a, c) { return a + c.checks.length; }, 0);
        return '<label class="item"><input type="checkbox" value="' + ch.id + '" checked><span class="grow">Ch. ' + ch.num + " " + esc(ch.title) + '</span><span class="tiny">' + n + " questions</span></label>";
      }).join("") + '</div><div class="actions"><button class="primary" data-n="10">10 questions</button><button data-n="20">20 questions</button><button data-n="40">40 questions</button></div><div id="err" class="err"></div></div>';
    document.getElementById("chs").onchange = function () { document.getElementById("err").textContent = ""; };
    [].forEach.call(app.querySelectorAll("button[data-n]"), function (b) {
      b.onclick = function () {
        var picked = [].map.call(app.querySelectorAll("#chs input:checked"), function (i) { return i.value; });
        if (!picked.length) { document.getElementById("err").textContent = "Pick at least one chapter."; return; }
        var pool = Object.keys(Q).filter(function (id) { return Q[id].exam.id === ex.id && !Q[id].mock && picked.indexOf(Q[id].ch.id) >= 0; });
        var ids = shuffle(pool).slice(0, +b.getAttribute("data-n"));
        runQuiz(ids.map(function (id) { return { id: id, q: Q[id].q }; }), {
          title: "Mixed practice", showSource: true, back: '<a href="#/' + ex.id + '/practice">Mixed practice</a>',
          onDone: function (score, total, log) {
            log.forEach(function (l) { note(l.id, l.ok); }); save();
            var byCh = {};
            log.forEach(function (l) { var c = Q[l.id].ch; byCh[c.id] = byCh[c.id] || [0, 0, c]; byCh[c.id][1]++; if (l.ok) byCh[c.id][0]++; });
            app.innerHTML = '<div class="card"><div class="result">' + score + " / " + total + '</div><div class="list">' + Object.keys(byCh).map(function (k) { var r = byCh[k]; return '<div class="item"><span class="grow">Ch. ' + r[2].num + " " + esc(r[2].title) + '</span><span class="pct" style="width:60px">' + r[0] + "/" + r[1] + "</span></div>"; }).join("") +
              '</div><div class="actions"><a class="btn primary" href="#/' + ex.id + '/practice">Another set</a><a class="btn" href="#/' + ex.id + '">Home</a></div><div id="drillslot"></div></div>';
            offerDrill(ex, log);
          }
        });
      };
    });
  }

  // ---------- study together ----------
  function myCode() {
    var p = {};
    Object.keys(S.concepts).forEach(function (k) { if (S.concepts[k].passed) p[k] = 1; });
    var payload = { n: S.name, c: S.color, p: p, m: Object.keys(S.review).slice(0, 80), k: S.mocks };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
  function readCode(code) { return JSON.parse(decodeURIComponent(escape(atob(code.trim())))); }

  function viewTogether() {
    var ex = getExam(S.exam), f = S.friend;
    var cmp = ex.chapters.filter(function (ch) { return (ch.concepts || []).length; }).map(function (ch) {
      var mine = chapterPct(ex, ch);
      var theirs = f ? Math.round(100 * ch.concepts.filter(function (c) { return f.p[ex.id + "." + ch.id + "." + c.id]; }).length / ch.concepts.length) : null;
      return '<div class="item"><span class="grow">Ch. ' + ch.num + " " + esc(ch.title) + '</span><span class="pct" style="width:auto">' + esc(S.name) + " " + mine + "%</span>" + (f ? '<span class="pct" style="width:auto">' + esc(f.n) + " " + theirs + "%</span>" : "") + "</div>";
    }).join("");
    app.innerHTML = "<h1>Study together</h1><p class=\"muted small\">Send your code to your friend (text it or paste it in a chat) and paste theirs below. Codes only hold names, progress, and missed-question IDs.</p>" +
      '<div class="card"><h2 style="margin-top:0">Your code</h2><textarea id="mine" readonly>' + myCode() + '</textarea><div class="actions"><button id="cp">Copy my code</button></div></div>' +
      '<div class="card"><h2 style="margin-top:0">Your friend\'s code</h2><textarea id="theirs" placeholder="Paste their code here"></textarea><div id="err" class="err"></div><div class="actions"><button class="primary" id="ld">Compare</button></div></div>' +
      '<div class="card"><h2 style="margin-top:0">' + esc(ex.short) + " progress</h2><div class=\"list\">" + (cmp || '<div class="item muted small">No chapters yet.</div>') + "</div>" +
      (f ? '<div class="actions"><button class="primary" id="qe">Quiz each other (10 questions)</button></div><p class="tiny">Deals questions from both of your review queues, so each of you gets the other\'s weak spots too.</p>' : "") + "</div>";
    document.getElementById("cp").onclick = function () {
      var t = document.getElementById("mine"); t.select();
      try { navigator.clipboard.writeText(t.value); this.textContent = "Copied"; } catch (e) { document.execCommand("copy"); }
    };
    document.getElementById("theirs").oninput = function () { document.getElementById("err").textContent = ""; };
    document.getElementById("ld").onclick = function () {
      var v = document.getElementById("theirs").value;
      if (!v.trim()) { document.getElementById("err").textContent = "Paste your friend's code first."; return; }
      try { var d = readCode(v); if (!d || !d.n || !d.p) throw 0; S.friend = d; save(); viewTogether(); }
      catch (e) { document.getElementById("err").textContent = "That code didn't read correctly. Ask for a fresh copy."; }
    };
    var qe = document.getElementById("qe");
    if (qe) qe.onclick = function () {
      var pool = Object.keys(S.review).concat(f.m || []).filter(function (id, i, a) { return Q[id] && a.indexOf(id) === i; });
      if (pool.length < 10) pool = pool.concat(shuffle(Object.keys(Q).filter(function (id) { return Q[id].exam.id === ex.id && pool.indexOf(id) < 0; })));
      runQuiz(shuffle(pool.slice(0, Math.max(10, pool.length))).slice(0, 10).map(function (id) { return { id: id, q: Q[id].q }; }), {
        title: "Quiz each other", showSource: true, back: '<a href="#/together">Study together</a>',
        onDone: function (score, total, log) {
          log.forEach(function (l) { note(l.id, l.ok); }); save();
          app.innerHTML = '<div class="card"><div class="result">' + score + " / " + total + '</div><div class="actions"><a class="btn primary" href="#/together">Back</a></div></div>';
        }
      });
    };
  }

  // ---------- router ----------
  function route() {
    if (window.__mockTimer) { clearInterval(window.__mockTimer); window.__mockTimer = null; }
    header();
    if (!S.name) { viewSetup(); return; }
    var parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    window.scrollTo(0, 0);
    if (parts[0] === "together") return viewTogether();
    if (parts[0] === "review") return viewReview(parts[1]);
    var ex = getExam(parts[0] || S.exam);
    if (S.exam !== ex.id) { S.exam = ex.id; save(); header(); }
    if (!ex.chapters.length) { app.innerHTML = '<div class="card"><h1>' + esc(ex.title) + '</h1><p class="muted">' + esc(ex.comingNote || "Coming soon.") + "</p></div>"; return; }
    if (!parts[1]) return viewHome(ex);
    if (parts[1] === "emphasis") return viewEmphasis(ex);
    if (parts[1] === "practice") return viewPractice(ex);
    if (parts[1] === "adapt") return viewAdapt(ex);
    if (parts[1] === "mock" && parts[2] === "adaptive") return viewMock(ex, adaptiveMock(ex));
    if (parts[1] === "mock") { var m = (ex.mocks || []).filter(function (x) { return x.id === parts[2]; })[0]; return m ? viewMock(ex, m) : viewHome(ex); }
    var ch = findCh(ex, parts[1]);
    if (!ch.concepts || !ch.concepts.length) return viewHome(ex);
    if (!parts[2]) return viewChapter(ex, ch);
    var c = ch.concepts.filter(function (x) { return x.id === parts[2]; })[0];
    if (!c) return viewChapter(ex, ch);
    if (parts[3] === "check") return viewCheck(ex, ch, c);
    viewConcept(ex, ch, c);
  }
  // a link to the current page ("Another set" after a quiz) fires no hashchange, so redraw by hand
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href") === location.hash && a.target !== "_blank") { e.preventDefault(); route(); }
  });
  window.addEventListener("hashchange", route);
  route();
})();
