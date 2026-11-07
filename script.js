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
    el.querySelectorAll('[data-count]').forEach(contar);
  }

  // Revelação ao rolar (também vale para os cards da rolagem infinita)
  var obs = temIO ? new IntersectionObserver(function(entradas){
    entradas.forEach(function(e){
      if(e.isIntersecting){ mostrar(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;
  function observar(el){ if(obs) obs.observe(el); else mostrar(el); }
  document.querySelectorAll('.rev').forEach(observar);

  // Lazy loading de imagens: use <img data-src="foto.jpg" alt="descrição" width="800" height="500">
  var imgs = document.querySelectorAll('img[data-src]');
  function carregar(img){ img.src = img.dataset.src; img.removeAttribute('data-src'); }
  if(temIO){
    var lz = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ carregar(e.target); lz.unobserve(e.target); } });
    }, { rootMargin: '300px 0px' });
    imgs.forEach(function(i){ lz.observe(i); });
  } else { imgs.forEach(carregar); }

  // Vídeo do YouTube: o player só é carregado quando a pessoa toca em "Assistir"
  var box = document.getElementById('videoBox'),
      btn = document.getElementById('playBtn');

  // Aceita o link completo do YouTube (watch, youtu.be, shorts, embed) ou só o código do vídeo
  function idYoutube(v){
    if(/^[\w-]{11}$/.test(v)) return v;
    var m = v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/);
    return m ? m[1] : '';
  }
  var yt = idYoutube((box.dataset.yt || '').trim());

  if(yt){
    var link = 'https://www.youtube.com/watch?v=' + yt;

    // Capa do vídeo, também com lazy loading
    var capa = document.createElement('img');
    capa.className = 'capa'; capa.alt = ''; capa.loading = 'lazy';
    capa.src = 'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg';
    capa.addEventListener('error', function(){ capa.remove(); });
    box.insertBefore(capa, btn);

    // Link de reserva sempre disponível embaixo do vídeo
    var reserva = document.createElement('p');
    reserva.className = 'nota';
    var ar = document.createElement('a');
    ar.href = link; ar.target = '_blank'; ar.rel = 'noopener';
    ar.textContent = 'O vídeo não abriu? Assistir no YouTube';
    reserva.appendChild(ar);
    box.parentNode.insertBefore(reserva, box.nextSibling);

    btn.addEventListener('click', function(){
      if(location.protocol === 'file:'){
        // O YouTube bloqueia o player quando a página é aberta direto do computador (file://)
        window.open(link, '_blank', 'noopener');
        return;
      }
      var el = document.createElement('iframe');
      el.src = 'https://www.youtube.com/embed/' + encodeURIComponent(yt) + '?autoplay=1&rel=0&playsinline=1';
      el.title = 'Reportagem sobre poluição marinha';
      el.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      el.referrerPolicy = 'strict-origin-when-cross-origin';
      el.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(el);
    });
  } else {
    btn.hidden = true;
    var aviso = document.createElement('p');
    aviso.textContent = 'O vídeo da reportagem será exibido aqui.';
    box.appendChild(aviso);
  }
})();