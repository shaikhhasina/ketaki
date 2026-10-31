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
})();
