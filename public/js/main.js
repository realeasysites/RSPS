(function () {
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  var form = document.getElementById('quoteForm');
  var msg = document.getElementById('formMsg');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form-msg';
    var data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone) {
      msg.textContent = 'Please add your name and phone number.';
      msg.classList.add('err');
      return;
    }
    var submit = form.querySelector('button[type=submit]');
    submit.disabled = true;
    msg.textContent = 'Sending...';
    fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.j.error || 'Something went wrong.');
        form.reset();
        msg.textContent = "Thanks! We got your request and will be in touch soon. Need us sooner? Call or text (207) 347-9115.";
        msg.classList.add('ok');
      })
      .catch(function (err) {
        msg.textContent = (err.message || 'Something went wrong.') + ' Please call or text (207) 347-9115.';
        msg.classList.add('err');
      })
      .finally(function () { submit.disabled = false; });
  });
})();
