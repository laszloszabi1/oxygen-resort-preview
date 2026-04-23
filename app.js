(function(){
  // ==== Lenis smooth scroll ====
  const lenis = new Lenis({
    duration: 1.3,
    easing: (t)=> Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 1,
    smoothWheel: true,
    touchMultiplier: 1.6
  });
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  window.lenis = lenis;

  // anchor interceptor
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if (id.length>1){
        const t = document.querySelector(id);
        if (t){ e.preventDefault(); lenis.scrollTo(t, { offset:-20, duration:1.6 }); }
      }
    });
  });

  // ==== Dinamikus stagger delay — elemszámra skálázódik ====
  document.querySelectorAll('[data-stagger]').forEach(wrap => {
    const items = wrap.children;
    const n = items.length;
    // kisebb lépések nagyobb gyerekszámhoz, hogy a teljes sor ne legyen túl hosszú
    const step = n <= 6 ? 0.09 : n <= 10 ? 0.065 : n <= 16 ? 0.045 : 0.035;
    Array.from(items).forEach((it, i) => {
      it.style.transitionDelay = (0.04 + i * step).toFixed(3) + 's';
    });
  });

  // ==== Nav scrolled state + scroll progress + altitude ====
  const nav = document.getElementById('nav');
  const rail = document.getElementById('rail');
  const altV = document.getElementById('altV');
  const H = () => document.documentElement.scrollHeight - window.innerHeight;
  function onScroll(){
    const y = window.scrollY;
    if (nav){ if (y > 60) nav.classList.add('scrolled'); else nav.classList.remove('scrolled'); }
    const p = Math.max(0, Math.min(1, y / H()));
    if (rail) rail.style.setProperty('--p', (p*100).toFixed(2)+'%');
    if (altV){
      const a = Math.round(820 + p * (1240-820));
      altV.textContent = a;
    }
  }
  lenis.on('scroll', onScroll);
  onScroll();

  // ==== IntersectionObserver reveal ====
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting){
        e.target.classList.add('in');
        if (!e.target.dataset.replay) io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal, .reveal-clip, [data-stagger], .gal-cell, .gp-item').forEach(el=> io.observe(el));

  // subtle stagger for masonry .gp-item inside same .gal-pro
  document.querySelectorAll('.gal-pro').forEach(g=>{
    const items = g.querySelectorAll('.gp-item');
    items.forEach((it, i)=>{ it.style.transitionDelay = (0.04 + (i % 6) * 0.07).toFixed(3) + 's'; });
  });

  // ==== Hero words reveal ====
  const heroH1 = document.getElementById('heroH1');
  const cover = document.querySelector('.cover');
  if (cover) requestAnimationFrame(()=>{
    cover.classList.add('ready');
    setTimeout(()=>{
      if (heroH1) heroH1.classList.add('in');
      const ct = document.querySelector('.cover-top'); if (ct) ct.classList.add('in');
    }, 180);
    setTimeout(()=>{
      document.querySelectorAll('.cover .reveal').forEach(el=>el.classList.add('in'));
    }, 260);
  });

  // ==== Magnetic CTA ====
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * 0.14;
      const y = (e.clientY - r.top - r.height/2) * 0.14;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
  });

  // ==== Parallax on gallery cells (subtle) ====
  const mb = document.querySelectorAll('.gal-cell img');
  let ticking = false;
  function parallax(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      mb.forEach(el=>{
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        const mid = window.innerHeight/2;
        const d = (r.top + r.height/2 - mid) / window.innerHeight;
        el.style.transform = `scale(1.02) translateY(${(-d*10).toFixed(2)}px)`;
      });
      ticking = false;
    });
  }
  lenis.on('scroll', parallax);

  // ==== Mobile menu ====
  const burger = document.querySelector('.nav-burger');
  const mm = document.querySelector('.mobile-menu');
  if (burger && mm){
    burger.addEventListener('click', ()=>{
      burger.classList.toggle('open');
      mm.classList.toggle('open');
      document.body.style.overflow = mm.classList.contains('open') ? 'hidden' : '';
    });
    mm.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{
      burger.classList.remove('open');
      mm.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  // ==== Form handler (local preview) ====
  document.querySelectorAll('form[data-local]').forEach(f=>{
    f.addEventListener('submit', (e)=>{
      e.preventDefault();
      const btn = f.querySelector('[type="submit"]');
      const orig = btn ? btn.innerHTML : '';
      if (btn){ btn.innerHTML = '<span>Trimis ✓</span>'; btn.style.background='var(--moss)'; btn.style.color='var(--bg-deep)'; }
      setTimeout(()=>{ f.reset(); if (btn){ btn.innerHTML = orig; btn.style.background=''; btn.style.color=''; } }, 2400);
    });
  });
})();
