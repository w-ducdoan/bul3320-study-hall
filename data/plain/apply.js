// Merges the plain-English layer into the exam data. Loaded after style3.js and before app.js.
// MOCKMAP lists, for each mock question in order, the fact that explains it: chapter.concept.fact.
(function () {
  var MOCKMAP = {
    A: "ch29.c1.atwill ch29.c1.term ch29.c3.unpaid ch29.c3.tenure ch29.c4.exclusive ch29.c5.weekly ch29.c7.norris ch29.c7.lmrda ch29.c8.majority ch29.c11.closed ch29.c10.notice ch29.c4.agency " +
       "ch30.c2.size ch30.c1.first ch30.c3.impact ch30.c3.treatment ch30.c5.actor ch30.c6.hardship ch30.c6.adea ch30.c5.defenses ch30.c4.strict ch30.c2.bases " +
       "ch7.c1.sg ch7.c3.grand ch7.c4.ladder ch7.c4.frisk ch7.c5.list ch7.c8.bec ch7.c3.petit ch7.c5.fruit ch7.c5.warrant ch7.c7.rico " +
       "ch27.c2.gaap ch27.c1.pcaob ch27.c1.line ch27.c4.ultra ch27.c4.scale ch27.c2.opinions ch27.c5.s11 ch27.c6.privilege " +
       "ch36.c1.seven ch36.c1.thirteen ch36.c2.stay ch36.c5.list ch36.c5.brunner ch36.c3.order ch36.c6.dip ch36.c2.invol " +
       "ch40.c2.caa ch40.c3.cwa ch40.c3.opa ch40.c4.rcra ch40.c1.penalties ch40.c2.cap ch40.c5.nepa",
    B: "ch29.c2.report ch29.c5.calc ch29.c5.exempt ch29.c3.size ch29.c4.third ch29.c8.inaccess ch29.c9.threat ch29.c9.resign ch29.c10.partial ch29.c11.rtw ch29.c6.warn ch29.c11.federal " +
       "ch30.c3.burden ch30.c4.coworker ch30.c4.defense ch30.c2.sexplus ch30.c6.s1981 ch30.c2.relig ch30.c6.pitfall ch30.c6.epa ch30.c6.userra ch30.c1.powers " +
       "ch7.c5.auto ch7.c4.ladder ch7.c4.civilcrim ch7.c6.miranda ch7.c6.noprivilege ch7.c7.conspiracy ch7.c7.grease ch7.c3.info ch7.c2.corp ch7.c6.immunity " +
       "ch27.c4.restate ch27.c4.landlord ch27.c1.revolving ch27.c1.rotate ch27.c5.scienter ch27.c5.whistle ch27.c2.adverse ch27.c6.js " +
       "ch36.c4.window ch36.c4.window ch36.c4.constructive ch36.c4.actual ch36.c6.vote ch36.c6.revive ch36.c6.cramdown ch36.c3.exempt " +
       "ch40.c4.owner ch40.c4.joint ch40.c2.citizens ch40.c2.stricter ch40.c5.tsca ch40.c5.match ch40.c3.opa",
    C: "ch29.c3.unpaid ch29.c3.size ch29.c4.intent ch29.c5.exempt ch29.c8.cards ch29.c11.closed ch29.c11.rtw ch29.c6.warn ch29.c9.discipline ch29.c7.norris ch29.c10.wildcat ch29.c6.erisa " +
       "ch30.c2.size ch30.c6.adea ch30.c1.first ch30.c5.customer ch30.c3.treatment ch30.c2.bases ch30.c6.adaask ch30.c2.preg ch30.c4.defense ch30.c2.reverse " +
       "ch7.c3.grand ch7.c3.petit ch7.c4.frisk ch7.c4.ladder ch7.c5.list ch7.c5.fruit ch7.c8.bec ch7.c1.sg ch7.c7.conspiracy ch7.c3.nolo " +
       "ch27.c2.gaap ch27.c1.pcaob ch27.c1.consult ch27.c4.landlord ch27.c4.gross ch27.c2.disclaimer ch27.c5.scienter ch27.c6.privilege " +
       "ch36.c3.admin ch36.c1.seven ch36.c2.stay ch36.c4.window ch36.c5.list ch36.c6.plan15 ch36.c5.wait ch36.c3.exempt " +
       "ch40.c2.caa ch40.c3.opa ch40.c3.cwa ch40.c1.penalties ch40.c4.joint ch40.c4.rcra ch40.c5.nepa"
  };
  var ex = window.EXAMS.filter(function (e) { return e.id === "exam3"; })[0];
  var P = window.PLAIN, problems = [];

  function teach(q, text, where) {
    if (!text) { problems.push("no fact: " + where); return; }
    q.textbook = /Textbook, not on the slides/.test(q.explain || "") || /comes from the textbook|from the textbook|\(textbook\)/i.test(text);
    q.explain = text;
  }

  ex.chapters.forEach(function (ch) {
    (ch.concepts || []).forEach(function (c) {
      var p = P[ch.id] && P[ch.id][c.id];
      if (!p) { problems.push("no card: " + ch.id + "." + c.id); return; }
      c.takeaway = p.takeaway;
      c.plain = p.plain;
      var keys = p.q.split(" ");
      if (keys.length !== c.checks.length) problems.push(ch.id + "." + c.id + " has " + c.checks.length + " questions, " + keys.length + " facts");
      c.checks.forEach(function (q, i) { teach(q, p.facts[keys[i]], ch.id + "." + c.id + "." + keys[i]); });
    });
  });

  ex.mocks.forEach(function (m) {
    var keys = MOCKMAP[m.id].split(" ");
    if (keys.length !== m.questions.length) problems.push("mock " + m.id + " has " + m.questions.length + " questions, " + keys.length + " facts");
    m.questions.forEach(function (q, i) {
      var k = keys[i].split("."), c = P[k[0]] && P[k[0]][k[1]];
      if (k[0] !== q.ch) problems.push("mock " + m.id + i + " chapter " + q.ch + " vs " + k[0]);
      q.concept = k[0] + "." + k[1];
      teach(q, c && c.facts[k[2]], "mock " + m.id + i + " " + keys[i]);
    });
  });

  window.PLAIN_PROBLEMS = problems;
  if (problems.length && window.console) console.error("plain layer:", problems);
})();
