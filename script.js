'Use strict'

(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  function contar(el){
    var alvo = +el.dataset.count, suf = el.dataset.suf || '';
    if(reduz){ el.textContent = alvo + suf; return; }
    var ini = null, dur = 1600;
    function passo(t){
      if(!ini) ini = t;
      var p = Math.min((t - ini) / dur, 1);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + suf;
      if(p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  function mostrar(el){
    el.classList.add('on');
    el.querySelectorAll('.fill').forEach(function(f){ f.style.width = f.dataset.w + '%'; });
    el.querySelectorAll('[data-count]').forEach(contar);
  }

  // Infinite scroll
  var obs = temIO ? new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(e.isIntersecting){ mostrar(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;
  function observar(el){ if(obs) obs.observe(el); else mostrar(el); }
  document.querySelectorAll('.rev').forEach(observar);

  // Lazy loading de imagens
  var imgs = document.querySelectorAll('img[data-src]');
  function carregar(img){ img.src = img.dataset.src; img.removeAttribute('data-src'); }
  if(temIO){
    var lz = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ carregar(e.target); lz.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    imgs.forEach(function(i){ lz.observe(i); });
  } else { imgs.forEach(carregar); }

  // Lazy loading do vídeo
  var box = document.getElementById('videoBox'),
      btn = document.getElementById('playBtn'),
      msg = document.getElementById('videoMsg');
  var yt = (box.dataset.yt || '').trim(), mp4 = (box.dataset.mp4 || '').trim();
  if(yt || mp4){
    msg.hidden = true;
    btn.addEventListener('click', function(){
      var el;
      if(yt){
        el = document.createElement('iframe');
        el.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&rel=0';
        el.title = 'Reportagem sobre poluição marinha';
        el.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        el.allowFullscreen = true;
      } else {
        el = document.createElement('video');
        el.src = mp4; el.controls = true; el.autoplay = true; el.playsInline = true; el.preload = 'metadata';
      }
      box.innerHTML = '';
      box.appendChild(el);
    });
  } else { btn.hidden = true; }
})();