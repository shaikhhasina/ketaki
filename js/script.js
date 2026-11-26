(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  // mobile menu
  const nav=$('#nav'), burger=$('#burger');
  burger.addEventListener('click',()=>nav.classList.toggle('open'));
  $$('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  // year
  $('#yr').textContent=new Date().getFullYear();

  // scroll reveal + count-up
  const countUp=el=>{
    const end=parseFloat(el.dataset.count), dec=+el.dataset.dec||0, suf=el.dataset.suffix||'';
    const t0=performance.now(), dur=1400;
    (function step(t){
      const p=Math.min((t-t0)/dur,1), v=end*(1-Math.pow(1-p,3));
      el.innerHTML=v.toFixed(dec)+(p===1?suf:'');
      if(p<1) requestAnimationFrame(step);
    })(t0);
  };
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      $$('[data-count]',e.target).forEach(countUp);
      io.unobserve(e.target);
    }
  }),{threshold:.15});
  $$('.reveal').forEach(el=>io.observe(el));

  // hero slides
  const slides=$$('.slide'), dots=$$('.hero-dots button'), media=$$('.hero-bg,.env-photo img');
  let cur=0, timer;
  const show=i=>{cur=i;slides.forEach((s,k)=>s.classList.toggle('active',k===i));dots.forEach((d,k)=>d.classList.toggle('active',k===i));media.forEach(m=>m.classList.toggle('active',+m.dataset.slide===i));};
  const auto=()=>{clearInterval(timer);timer=setInterval(()=>show((cur+1)%slides.length),6000);};
  dots.forEach((d,k)=>d.addEventListener('click',()=>{show(k);auto();}));
  auto();

  // tabs
  $$('.tab').forEach(t=>t.addEventListener('click',()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    $$('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    $('#tab-'+t.dataset.tab).classList.add('active');
  }));

  // FAQ accordion
  $$('.acc-item').forEach(item=>{
    $('.acc-q',item).addEventListener('click',()=>{
      const open=item.classList.contains('open');
      $$('.acc-item').forEach(i=>{i.classList.remove('open');$('.acc-a',i).style.maxHeight=null;});
      if(!open){item.classList.add('open');const a=$('.acc-a',item);a.style.maxHeight=a.scrollHeight+'px';}
    });
  });

  // gallery lightbox
  const lb=document.createElement('div');lb.className='lightbox';lb.innerHTML='<img alt="">';document.body.appendChild(lb);
  $$('.gal-grid img').forEach(img=>img.addEventListener('click',()=>{$('img',lb).src=img.src;lb.classList.add('open');}));
  lb.addEventListener('click',()=>lb.classList.remove('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open');});

  // back to top
  const top=$('.to-top');
  addEventListener('scroll',()=>top.classList.toggle('show',scrollY>600),{passive:true});

  // popup open / close
  const modal=$('#enquiryModal');
  const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');setTimeout(()=>$('input[name=name]',modal).focus(),300);};
  const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');};
  $$('[data-enquire]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();nav.classList.remove('open');openModal();}));
  $('#modalClose').addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  // enquiry forms (popup + page form)
  $$('.enq-ajax').forEach(form=>{
    const msg=$('.form-msg',form);
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      msg.className='form-msg';
      const name=form.name.value.trim(), phone=form.phone.value.trim();
      if(!name||!/^[0-9]{10}$/.test(phone)){
        msg.classList.add('err');msg.textContent='Please enter your name and a valid 10-digit phone number.';return;
      }
      const btn=$('button[type=submit]',form);btn.disabled=true;btn.textContent='Sending...';
      try{
        const r=await fetch(form.action,{method:'POST',body:new FormData(form)});
        const j=await r.json();
        if(!j.ok) throw new Error(j.error||'failed');
        msg.classList.add('ok');msg.textContent='Thank you! Our team will contact you shortly.';form.reset();
        if(modal.contains(form)) setTimeout(()=>{closeModal();msg.textContent='';},2200);
      }catch(err){
        const city=form.city?form.city.value:'-';
        const t=encodeURIComponent(`Hi, I am ${name} (${phone}). City: ${city||'-'}. I am interested in Ketaki Arcade Wing A2.`);
        msg.classList.add('ok');msg.textContent='Opening WhatsApp to complete your enquiry...';
        window.open('https://wa.me/919021388540?text='+t,'_blank');
      }
      btn.disabled=false;btn.textContent='Submit';
    });
  });

  // amenities slider
  (function(){
    const st=document.querySelector('.as-stage'); if(!st) return;
    const sl=[...st.querySelectorAll('.as-slide')], pn=[...document.querySelectorAll('.as-panel')], dt=[...document.querySelectorAll('.as-dot')];
    const n=sl.length; let cur=0, x0=null;
    function go(i){
      cur=(i+n)%n;
      sl.forEach((s,k)=>{const d=(k-cur+n)%n;
        s.classList.toggle('is-active',d===0);
        s.classList.toggle('is-next',d===1);
        s.classList.toggle('is-prev',d===n-1&&n>2);});
      pn.forEach((p,k)=>p.classList.toggle('active',k===cur));
      dt.forEach((p,k)=>p.classList.toggle('active',k===cur));
    }
    document.querySelectorAll('.as-arrow').forEach(b=>b.addEventListener('click',()=>go(cur+ +b.dataset.dir)));
    dt.forEach((d,k)=>d.addEventListener('click',()=>go(k)));
    sl.forEach((s,k)=>s.addEventListener('click',()=>{if(k!==cur) go(k)}));
    st.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
    st.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
    st.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1));x0=null});
    go(0);
  })();
  // ===== Liquid effects (feat/liquid-effects) — remove this block to remove the feature =====
  const LIQUID = {
    logo: true,                 // gold liquid-metal lotus in the enquiry section
    glass: true,                // Liquid Glass layer behind the hero "Explore Project" button
    glassTint: 0.12,            // 0 = clear glass, higher = milkier
    glassMinWidth: 961,         // glass only on wider screens with a mouse
    gradient: true,             // Shader Gradient behind the enquiry section
    gradientPreset: 'calm',     // 'calm' | 'vivid' | 'mono' (see js/shader-gradient.js)
    gradientMinWidth: 768       // smaller screens keep the static CSS gradient
  };
  const mq=q=>matchMedia(q).matches;
  const calm=mq('(prefers-reduced-motion: reduce)');
  const saveData=!!(navigator.connection&&navigator.connection.saveData);

  // Liquid Logo: lazy-load the video when the enquiry section is near, pause offscreen / hidden tab
  (function(){
    const box=$('[data-liquid-logo]'); if(!LIQUID.logo||!box||calm||saveData) return;
    const v=$('video',box); let loaded=false, visible=false;
    const play=()=>{ if(visible&&!document.hidden){ const p=v.play(); if(p) p.catch(()=>{}); } };
    v.addEventListener('playing',()=>box.classList.add('is-playing'));
    v.addEventListener('error',()=>box.classList.remove('is-playing'),true);
    new IntersectionObserver(es=>es.forEach(e=>{
      visible=e.isIntersecting;
      if(visible&&!loaded){ $$('source',v).forEach(s=>s.src=s.dataset.src); v.load(); loaded=true; }
      visible?play():v.pause();
    }),{rootMargin:'200px 0px'}).observe(box);
    document.addEventListener('visibilitychange',()=>document.hidden?v.pause():play());
  })();

  // Shader Gradient: load React + the gradient only when the enquiry section is near
  (function(){
    const mount=$('#sgMount'), wrap=mount&&mount.parentElement;
    if(!LIQUID.gradient||!mount||calm||saveData) return;
    if(!mq(`(min-width:${LIQUID.gradientMinWidth}px)`)) return;
    if(!(HTMLScriptElement.supports&&HTMLScriptElement.supports('importmap'))) return;
    let gl=null; try{ gl=document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl'); }catch(e){}
    if(!gl) return;
    const lose=gl.getExtension('WEBGL_lose_context'); if(lose) lose.loseContext();
    const io=new IntersectionObserver(es=>{
      if(!es.some(e=>e.isIntersecting)) return;
      io.disconnect();
      import(new URL('js/shader-gradient.js',document.baseURI).href)
        .then(m=>m.mount(mount,{preset:LIQUID.gradientPreset,pixelDensity:1,onReady:()=>wrap.classList.add('sg-ready')}))
        .catch(()=>{});                              // offline / CDN blocked: the CSS gradient stays
    },{rootMargin:'400px 0px'});
    io.observe(wrap);
  })();

  // Liquid Glass: desktop only, after the page has loaded and the browser is idle
  (function(){
    const btn=$('[data-glass]'), hero=$('.hero');
    if(!LIQUID.glass||!btn||!hero) return;
    if(!mq(`(min-width:${LIQUID.glassMinWidth}px) and (hover:hover) and (pointer:fine)`)) return;
    if(calm||saveData||mq('(prefers-reduced-transparency: reduce)')||mq('(prefers-contrast: more)')) return;
    let gl=null; try{ gl=document.createElement('canvas').getContext('webgl'); }catch(e){}
    if(!gl) return;
    const lose=gl.getExtension('WEBGL_lose_context'); if(lose) lose.loseContext();
    const load=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});
    const start=()=>load('assets/vendor/html2canvas/html2canvas.min.js')
      .then(()=>load('assets/vendor/liquid-glass/container.js'))
      .then(()=>{
        /* global Container */
        Container.snapshotTarget=hero;               // vendored patch: snapshot only the hero
        const g=new Container({type:'rounded',borderRadius:2,tintOpacity:LIQUID.glassTint});
        g.element.classList.add('glass-layer'); g.element.setAttribute('aria-hidden','true');
        btn.classList.add('has-glass'); btn.prepend(g.element);
        const t0=performance.now();
        (function ready(){ if(g.webglInitialized) btn.classList.add('glass-ready'); else if(performance.now()-t0<8000) requestAnimationFrame(ready); })();
        const w0=innerWidth;                         // the snapshot is fixed to this width
        addEventListener('resize',()=>btn.classList.toggle('glass-off',innerWidth!==w0),{passive:true});
      })
      .catch(()=>{});                                // any failure: the normal button stays
    const idle=()=>('requestIdleCallback' in window)?requestIdleCallback(start,{timeout:3000}):setTimeout(start,1500);
    document.readyState==='complete'?idle():addEventListener('load',idle,{once:true});
  })();
})();
