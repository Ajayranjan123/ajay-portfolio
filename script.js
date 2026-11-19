/* Portfolio script: vanilla JS, no dependencies */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. PROJECTS: add an object to this array to add a new card.
        Keep github/demo as "" until you have real links (buttons stay disabled). */
  const PROJECTS = [
    { title: "Application Development", icon: "fa-solid fa-mobile-screen-button",
      desc: "An application development project focused on building a useful application with an intuitive user experience. More details and features will be added as development progresses.",
      tags: ["Application Development"], // add confirmed technologies here, e.g. "Java"
      github: "", demo: "" },
    { title: "Bluetooth Chat Application", icon: "fa-brands fa-bluetooth-b",
      desc: "A communication-focused project that explores Bluetooth-based connectivity and messaging between devices. Designed to understand wireless communication and application development.",
      tags: ["Bluetooth", "Application Development"],
      github: "", demo: "" }
  ];
  const link = (url, label, icon, cls) => url
    ? `<a class="btn ${cls}" href="${url}" target="_blank" rel="noopener noreferrer"><i class="${icon}"></i>${label}</a>`
    : `<span class="btn" aria-disabled="true" title="Link will be added soon"><i class="${icon}"></i>${label}</span>`;
  $("#project-list").innerHTML = PROJECTS.map(p => `
    <article class="card proj reveal">
      <div class="thumb" aria-hidden="true"><i class="${p.icon}"></i></div>
      <div class="proj-body"><h3>${p.title}</h3><p>${p.desc}</p>
        <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
        <div class="acts">${link(p.github, "GitHub", "fa-brands fa-github", "")}${link(p.demo, "Live Demo", "fa-solid fa-arrow-up-right-from-square", "primary")}</div>
      </div>
    </article>`).join("");

  /* 2. Footer year, nav state, back-to-top, mobile menu */
  $("#year").textContent = new Date().getFullYear();
  const nav = $("#nav"), toTop = $("#toTop"), burger = $("#burger"), menu = $("#menu");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 20);
    toTop.classList.toggle("show", scrollY > 600);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const setMenu = open => {
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  menu.addEventListener("click", e => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", e => e.key === "Escape" && setMenu(false));

  /* 3. Scroll reveal (staggered inside grids) + active nav link */
  $$(".grid,.links").forEach(g => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
  const ro = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
  }), { threshold: .15 });
  $$(".reveal").forEach(el => ro.observe(el));

  const links = $$(".menu a");
  const so = new IntersectionObserver(es => es.forEach(e => {
    const id = "#" + e.target.id;
    if (!e.isIntersecting || !links.some(a => a.hash === id)) return;
    links.forEach(a => {
      const on = a.hash === id;
      a.classList.toggle("active", on);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => so.observe(s));

  /* 4. Typing animation (static first title if reduced motion is on) */
  if (!calm) {
    const roles = ["AI/ML Student", "Aspiring Software Developer", "Java Programmer", "Problem Solver"];
    const out = $("#typed");
    let r = 0, i = roles[0].length, del = true;
    const tick = () => {
      const word = roles[r];
      i += del ? -1 : 1;
      out.textContent = word.slice(0, i);
      let wait = del ? 40 : 85;
      if (!del && i === word.length) { del = true; wait = 1500; }
      else if (del && i === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 1800);
  }

  /* 5. Background particles (skipped if reduced motion is on) */
  const cv = $("#bg");
  if (!calm && cv.getContext) {
    const cx = cv.getContext("2d");
    let W, H;
    const fit = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
    fit(); addEventListener("resize", fit);
    const dots = Array.from({ length: Math.min(60, Math.round(W / 24)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + .5,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      c: Math.random() > .5 ? "139,92,246" : "6,182,212"
    }));
    (function draw() {
      cx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.x = (d.x + d.vx + W) % W; d.y = (d.y + d.vy + H) % H;
        cx.fillStyle = `rgba(${d.c},.6)`;
        cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 6.283); cx.fill();
      }
      requestAnimationFrame(draw);
    })();
  }

  /* 6. Cursor glow (desktop with a mouse only) */
  if (!calm && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const g = $("#glow");
    addEventListener("pointermove", e => {
      g.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      g.style.opacity = 1;
    }, { passive: true });
  }

  /* 7. Contact form: validate, then open the visitor's email app (mailto) */
  const form = $("#form"), msg = $("#msg");
  const rules = {
    name: v => v.trim().length > 1 || "Please enter your name.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address.",
    subject: v => v.trim().length > 2 || "Please add a subject.",
    message: v => v.trim().length > 9 || "Your message should be at least 10 characters."
  };
  const check = f => {
    const r = rules[f.name](f.value);
    f.nextElementSibling.textContent = r === true ? "" : r;
    f.setAttribute("aria-invalid", r !== true);
    return r === true;
  };
  form.addEventListener("input", e => e.target.hasAttribute("aria-invalid") && check(e.target));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const fields = $$("input,textarea", form);
    const ok = fields.map(f => check(f)).every(Boolean);
    msg.className = "msg " + (ok ? "ok" : "error");
    if (!ok) { msg.textContent = "Please fix the highlighted fields and try again."; return; }
    const v = Object.fromEntries(fields.map(f => [f.name, f.value.trim()]));
    const body = `Name: ${v.name}\nEmail: ${v.email}\n\n${v.message}`;
    location.href = `mailto:ajayr526857@gmail.com?subject=${encodeURIComponent(v.subject)}&body=${encodeURIComponent(body)}`;
    msg.textContent = "Your email app should open with this message ready. Nothing is sent until you press Send there. If nothing opens, write to ajayr526857@gmail.com directly.";
  });
})();
