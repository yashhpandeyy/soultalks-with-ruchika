/* =========================================================
   Soul Talks with Ruchika — interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const PHONE = "918758922203";
  const EMAIL = "soultalkswithruchika@gmail.com";

  const state = { mx: 0, my: 0, tx: 0, ty: 0, scroll: 0, vh: window.innerHeight };

  /* ---------------- starfield + fireflies ---------------- */
  const sky = (() => {
    const canvas = $("#sky");
    const ctx = canvas.getContext("2d");
    let w, h, dpr, stars = [], flies = [], shooter = null, nextShoot = 4000;

    // pre-rendered glow sprite for fireflies
    const glow = document.createElement("canvas");
    glow.width = glow.height = 64;
    const g = glow.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,240,200,1)");
    grad.addColorStop(0.25, "rgba(240,196,120,.55)");
    grad.addColorStop(1, "rgba(240,196,120,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(380, Math.round((w * h) / 4200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() < 0.08 ? Math.random() * 1.2 + 1 : Math.random() * 0.9 + 0.2,
        a: Math.random() * 0.6 + 0.3,
        s: Math.random() * 1.5 + 0.4,
        p: Math.random() * Math.PI * 2,
        d: Math.random() * 0.9 + 0.1,
        gold: Math.random() < 0.18,
      }));
      const flyCount = w < 640 ? 14 : 30;
      flies = Array.from({ length: flyCount }, newFly);
    }

    function newFly() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        r: Math.random() * 10 + 6,
        p: Math.random() * Math.PI * 2,
      };
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const px = state.tx * 18, py = state.ty * 12;
      const sc = state.scroll;

      for (const st of stars) {
        const tw = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * st.s + st.p);
        let x = st.x * w + px * st.d;
        let y = (st.y * h - sc * 0.06 * st.d) % h;
        if (y < 0) y += h;
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = st.gold ? "#f6d9a3" : "#e9e1ff";
        ctx.beginPath();
        ctx.arc(x, y + py * st.d, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const f of flies) {
        if (!reduceMotion) {
          f.x += f.vx + Math.sin(t * 0.0006 + f.p) * 0.2;
          f.y += f.vy;
          if (f.y < -20) { Object.assign(f, newFly(), { y: h + 20 }); }
          if (f.x < -20) f.x = w + 20;
          if (f.x > w + 20) f.x = -20;
        }
        const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.002 + f.p));
        ctx.globalAlpha = a;
        ctx.drawImage(glow, f.x - f.r + px * 0.6, f.y - f.r + py * 0.6, f.r * 2, f.r * 2);
      }

      if (!reduceMotion) {
        if (!shooter && t > nextShoot) {
          shooter = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.35, life: 0 };
          nextShoot = t + 6000 + Math.random() * 9000;
        }
        if (shooter) {
          shooter.life += 16;
          const k = shooter.life / 900;
          const len = 160;
          const x = shooter.x - k * 520, y = shooter.y + k * 260;
          const lg = ctx.createLinearGradient(x, y, x + len, y - len / 2);
          lg.addColorStop(0, "rgba(255,244,214,.95)");
          lg.addColorStop(1, "rgba(255,244,214,0)");
          ctx.globalAlpha = Math.sin(Math.min(k, 1) * Math.PI);
          ctx.strokeStyle = lg;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + len, y - len / 2);
          ctx.stroke();
          if (k >= 1) shooter = null;
        }
      }
      ctx.globalAlpha = 1;
    }

    window.addEventListener("resize", resize);
    resize();
    return { draw };
  })();

  /* ---------------- main animation loop ---------------- */
  const depthEls = $$("[data-depth]");
  const heroContent = $(".hero-content");
  const mBack = $(".m-back"), mFront = $(".m-front");
  const progressBar = $(".progress span");
  let running = true;

  function frame(t) {
    if (!running) return;
    state.tx += (state.mx - state.tx) * 0.06;
    state.ty += (state.my - state.ty) * 0.06;

    sky.draw(t);

    if (state.scroll < state.vh * 1.2) {
      for (const el of depthEls) {
        const d = parseFloat(el.dataset.depth);
        const extraY = el === heroContent ? state.scroll * 0.35 : state.scroll * d * 0.25;
        el.style.transform = `translate3d(${-state.tx * d * 24}px, ${-state.ty * d * 16 + extraY}px, 0)`;
      }
      heroContent.style.opacity = Math.max(0, 1 - state.scroll / (state.vh * 0.75));
      mBack.style.transform = `translate3d(${-state.tx * 10}px, ${state.scroll * 0.12}px, 0)`;
      mFront.style.transform = `translate3d(${-state.tx * 20}px, ${state.scroll * 0.05}px, 0)`;
    }
    requestAnimationFrame(frame);
  }

  function onScroll() {
    state.scroll = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? state.scroll / max : 0})`;
    nav.classList.toggle("scrolled", state.scroll > 40);
  }

  window.addEventListener("resize", () => { state.vh = window.innerHeight; });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  /* ---------------- pointer: parallax, cursor glow, card spotlight ---------------- */
  const glowEl = $(".cursor-glow");
  if (finePointer && !reduceMotion) {
    window.addEventListener("mousemove", (e) => {
      document.body.classList.add("has-mouse");
      state.mx = (e.clientX / window.innerWidth) * 2 - 1;
      state.my = (e.clientY / window.innerHeight) * 2 - 1;
      glowEl.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }, { passive: true });
    document.addEventListener("mouseleave", () => document.body.classList.remove("has-mouse"));
  }
  $$(".area").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------------- nav ---------------- */
  const nav = $("#nav");
  const burger = $("#burger");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => {
    if (nav.classList.contains("open")) burger.click();
  }));

  const navMap = new Map($$("#navLinks a:not(.btn)").map((a) => [a.getAttribute("href").slice(1), a]));
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const link = navMap.get(en.target.id);
      if (link && en.isIntersecting) {
        navMap.forEach((l) => l.classList.remove("current"));
        link.classList.add("current");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  /* ---------------- reveal on scroll ---------------- */
  const reveals = $$(".reveal");
  reveals.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const i = sibs.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 9) * 80}ms`;
  });
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      revealObs.unobserve(el);
      // hand transitions back to the element's own hover styles once revealed
      setTimeout(() => { el.classList.remove("reveal", "in"); el.style.transitionDelay = ""; }, 2000);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => revealObs.observe(el));

  const oneShot = (el, fn, threshold = 0.3) => {
    if (!el) return;
    const o = new IntersectionObserver(([en]) => { if (en.isIntersecting) { fn(); o.disconnect(); } }, { threshold });
    o.observe(el);
  };
  oneShot($("#journey"), () => $("#journey").style.setProperty("--jp", 1));
  oneShot($("#signs"), () => $("#signs").classList.add("in"), 0.25);

  /* ---------------- breathing reset ---------------- */
  (() => {
    const btn = $("#breatheBtn"), orb = $("#orb"), text = $("#orbText"), timer = $("#orbTimer"), count = $("#breatheCount");
    const phases = [
      { label: "Breathe in", secs: 4, scale: 1, glow: true },
      { label: "Hold", secs: 4, scale: 1, glow: true },
      { label: "Breathe out", secs: 6, scale: 0.55, glow: false },
    ];
    const ROUNDS = 3;
    let session = 0;

    const wait = (ms, id) => new Promise((res, rej) => setTimeout(() => (id === session ? res() : rej()), ms));

    async function run() {
      const id = ++session;
      btn.textContent = "Stop";
      orb.classList.add("running");
      try {
        for (let r = 1; r <= ROUNDS; r++) {
          count.textContent = `Round ${r} of ${ROUNDS}`;
          for (const ph of phases) {
            orb.style.transitionDuration = `${ph.secs}s`;
            orb.style.transform = `scale(${ph.scale})`;
            orb.classList.toggle("expand", ph.glow);
            text.textContent = ph.label;
            for (let s = ph.secs; s > 0; s--) {
              timer.textContent = s;
              await wait(1000, id);
            }
          }
        }
        finish("Welcome back.", "That calm? Imagine it for your whole team.");
      } catch { /* cancelled */ }
    }

    function finish(label, msg) {
      orb.classList.remove("running", "expand");
      orb.style.transitionDuration = "2s";
      orb.style.transform = "";
      text.textContent = label;
      timer.textContent = "";
      count.textContent = msg;
      btn.textContent = "Go again";
    }

    btn.addEventListener("click", () => {
      if (btn.textContent === "Stop") { session++; finish("Paused", "Come back whenever you need a minute."); }
      else run();
    });
  })();

  /* ---------------- program tabs ---------------- */
  (() => {
    const tabs = $$(".prog-tab");
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        panel.hidden = !on;
        panel.classList.toggle("active", on);
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const k = e.key;
        let n = null;
        if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === "Home") n = tabs[0];
        if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });

    // "Book this session" pre-selects the program in the enquiry form
    $$("[data-program]").forEach((a) => a.addEventListener("click", () => {
      const box = $$('#enquiry input[name="program"]').find((c) => c.value === a.dataset.program);
      if (box) box.checked = true;
    }));
  })();

  /* ---------------- pick a card ---------------- */
  (() => {
    const deck = $("#deck"), again = $("#reshuffle");
    const CARDS = [
      ["☾", "The Pause", "Stillness", "Your clearest answer is waiting in stillness, not speed. Take one unhurried breath before your next decision."],
      ["✦", "The Spark", "Curiosity", "Something new wants your attention this week. Follow the question that makes you lean in."],
      ["❀", "The Bloom", "Growth", "You are further along than you think. Notice one small win today and let it count."],
      ["◎", "The Anchor", "Boundaries", "A kind “no” protects your best “yes”. Choose one thing to let go of this week."],
      ["☼", "The Sun", "Radiance", "Your energy lifts the room more than you realise. Share it generously and let it come back to you."],
      ["≈", "The River", "Flow", "Stop pushing against the current. What would feel easier if you simply allowed it?"],
      ["◇", "The Mirror", "Self-awareness", "What irritates you today may be pointing to what you need. Look gently, not harshly."],
      ["∞", "The Circle", "Togetherness", "You don't have to carry it alone. Ask one colleague how they really are, and listen."],
      ["✧", "The Lantern", "Clarity", "Write down the one thing that matters most this week. The rest can wait its turn."],
      ["◈", "The Root", "Grounding", "Feel your feet on the floor. You are steady, and this is exactly where you begin."],
      ["☽", "The Horizon", "Vision", "Picture yourself six months from now, calm and proud. What would that version of you do today?"],
      ["♡", "The Bridge", "Connection", "A small kind word repairs more than you expect. Say the thank-you you've been holding."],
    ];
    let cards = [], chosen = false;
    const hint = document.createElement("p");
    hint.className = "deck-hint";

    function layout() {
      const narrow = deck.clientWidth < 600;
      const spread = narrow ? Math.min(46, deck.clientWidth / 9) : 120;
      const tilt = narrow ? 9 : 12;
      cards.forEach((c, i) => {
        if (c.classList.contains("chosen")) {
          c.style.transform = `translateY(-10px) scale(${narrow ? 1.12 : 1.18})`;
          c.style.zIndex = 10;
          return;
        }
        const o = i - (cards.length - 1) / 2;
        c.style.transform = `translateX(${o * spread}px) translateY(${Math.abs(o) * 12}px) rotate(${o * tilt}deg)`;
        c.style.zIndex = i;
      });
    }

    function deal() {
      chosen = false;
      deck.innerHTML = "";
      again.hidden = true;
      const picks = [...CARDS].sort(() => Math.random() - 0.5).slice(0, 5);
      cards = picks.map(([sym, name, energy, msg], i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "card";
        b.setAttribute("aria-label", `Card ${i + 1} of 5, face down`);
        b.innerHTML = `
          <span class="card-inner">
            <span class="card-face card-back"></span>
            <span class="card-face card-front">
              <span class="c-sym" aria-hidden="true">${sym}</span>
              <span class="c-name">${name}</span>
              <span class="c-energy">${energy}</span>
              <p>${msg}</p>
            </span>
          </span>`;
        b.style.transform = "translateY(60px) scale(.8)";
        b.style.opacity = "0";
        b.addEventListener("click", () => choose(b, name, energy, msg));
        deck.appendChild(b);
        return b;
      });
      hint.textContent = "Choose the card that calls to you";
      hint.style.opacity = 1;
      deck.appendChild(hint);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cards.forEach((c, i) => { c.style.transitionDelay = `${i * 70}ms`; c.style.opacity = ""; });
        layout();
        setTimeout(() => cards.forEach((c) => (c.style.transitionDelay = "")), 900);
      }));
    }

    function choose(card, name, energy, msg) {
      if (chosen) return;
      chosen = true;
      cards.forEach((c) => { if (c !== card) { c.classList.add("faded"); c.tabIndex = -1; } });
      card.classList.add("chosen");
      card.setAttribute("aria-label", `${name}. Energy: ${energy}. ${msg}`);
      hint.style.opacity = 0;
      layout();
      setTimeout(() => { again.hidden = false; }, 900);
    }

    again.addEventListener("click", deal);
    window.addEventListener("resize", layout);
    deal();
  })();

  /* ---------------- enquiry form ---------------- */
  (() => {
    const form = $("#enquiry"), err = $("#formError");
    const buildMessage = () => {
      const fd = new FormData(form);
      const programs = fd.getAll("program");
      const org = fd.get("org").trim(), size = fd.get("size"), note = fd.get("msg").trim();
      const lines = ["Hello Ruchika, I'd love to plan a Soul Talks experience.", "", `Name: ${fd.get("name").trim()}`];
      if (org) lines.push(`Organisation: ${org}`);
      lines.push(`Contact: ${fd.get("contact").trim()}`);
      if (size) lines.push(`Team size: ${size}`);
      if (programs.length) lines.push(`Interested in: ${programs.join(", ")}`);
      if (note) lines.push("", note);
      return lines.join("\n");
    };
    const validate = () => {
      let ok = true;
      ["name", "contact"].forEach((n) => {
        const input = form.elements[n];
        const bad = !input.value.trim();
        input.closest(".field").classList.toggle("invalid", bad);
        if (bad) ok = false;
      });
      err.textContent = ok ? "" : "Please add your name and an email or phone number so Ruchika can reach you.";
      if (!ok) form.querySelector(".invalid input").focus();
      return ok;
    };
    $("[data-send='wa']", form).addEventListener("click", () => {
      if (!validate()) return;
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener");
    });

    // Enquiries are captured by Netlify Forms (see the form's data-netlify attribute);
    // email alerts are configured in the Netlify dashboard.
    const sendBtn = $("#sendBtn"), sendLabel = $("#sendBtn span"), success = $("#formSuccess");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;
      const fd = new FormData(form);
      if (fd.get("bot-field")) return; // bot
      const org = fd.get("org").trim();
      const name = fd.get("name").trim();
      // Netlify keeps one value per field, so send the checked programs as one line.
      fd.set("programs", fd.getAll("program").join(", "));
      fd.delete("program");
      fd.set("subject", `New Soul Talks enquiry from ${name}${org ? " (" + org + ")" : ""}`);

      sendBtn.disabled = true;
      sendLabel.textContent = "Sending…";
      err.textContent = "";
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(fd).toString(),
        });
        if (!res.ok) throw new Error(res.status);
        $("#thanksName").textContent = `, ${name.split(" ")[0]}`;
        $$(":scope > :not(.form-success)", form).forEach((el) => (el.hidden = true));
        success.hidden = false;
        success.focus();
      } catch {
        err.innerHTML = `Sorry, the message couldn't be sent. Please try WhatsApp, or email <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
      } finally {
        sendBtn.disabled = false;
        sendLabel.textContent = "Send Enquiry";
      }
    });

    $("#newEnquiry").addEventListener("click", () => {
      form.reset();
      success.hidden = true;
      $$(":scope > :not(.form-success)", form).forEach((el) => (el.hidden = false));
      form.elements.name.focus();
    });
    form.addEventListener("input", (e) => {
      const f = e.target.closest(".field.invalid");
      if (f && e.target.value.trim()) { f.classList.remove("invalid"); if (!$(".field.invalid", form)) err.textContent = ""; }
    });
  })();

  /* ---------------- ambient sound (generated, no files) ---------------- */
  (() => {
    const btn = $("#soundToggle");
    let ctx, master, on = false;

    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1100;
      const delay = ctx.createDelay(2);
      delay.delayTime.value = 0.6;
      const fb = ctx.createGain();
      fb.gain.value = 0.35;
      delay.connect(fb).connect(delay);
      filter.connect(master);
      filter.connect(delay).connect(master);
      master.connect(ctx.destination);

      [110, 164.81, 220, 277.18, 329.63, 440].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 ? "triangle" : "sine";
        osc.frequency.value = f;
        osc.detune.value = (Math.random() - 0.5) * 8;
        const g = ctx.createGain();
        g.gain.value = 0.05 / (i + 1) + 0.012;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.04 + Math.random() * 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = g.gain.value * 0.8;
        lfo.connect(lfoGain).connect(g.gain);
        osc.connect(g).connect(filter);
        osc.start();
        lfo.start();
      });
    }

    btn.addEventListener("click", async () => {
      if (!ctx) build();
      on = !on;
      btn.setAttribute("aria-pressed", String(on));
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      if (on) {
        await ctx.resume();
        master.gain.linearRampToValueAtTime(0.5, now + 3);
      } else {
        master.gain.linearRampToValueAtTime(0, now + 1.5);
        setTimeout(() => { if (!on) ctx.suspend(); }, 1600);
      }
    });
  })();

  /* ---------------- misc ---------------- */
  $("#year").textContent = new Date().getFullYear();
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  requestAnimationFrame(frame);
})();
