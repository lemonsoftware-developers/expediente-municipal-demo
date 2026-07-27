/* ============================================================
   flujo.js — HILO de un permiso de edificación de punta a punta.
   Un solo expediente (IUIe 004826, ciudadana María González) que viaja
   coherente por 4 pantallas, con estado persistido en localStorage:

     Ciudadano lo presenta (comprobante)  →  aparece en «Mis trámites» (ciudadano)
       →  llega a la bandeja del funcionario DOM  →  se abre y gestiona (expediente)
       →  Observar / Resolver cambia el estado  →  el ciudadano lo ve reflejado.

   Se incluye SOLO en: comprobante, ciudadano, bandeja, expediente.
   No usa framework. Corre al final del body (DOM ya parseado).
   ============================================================ */
(function(){
  "use strict";
  var KEY='fvEdif004826';
  var BASE={
    iuie:'13120-2026-004826', corto:'004826',
    tipo:'Permiso de edificación',
    titulo:'Ampliación de vivienda — segundo piso',
    solicitante:'María González', rut:'12.345.678-9',
    direccion:'Av. Grecia 2260, Ñuñoa', superficie:'42 m²', derechos:'$148.230',
    estado:'Ingresado'
  };

  function now(){ return Date.now(); }
  function fmt(ts){ try{ var d=new Date(ts);
    return d.toLocaleDateString('es-CL',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false});
  }catch(e){ return ''; } }
  function fmtDay(ts){ try{ return new Date(ts).toLocaleDateString('es-CL',{day:'2-digit',month:'short'}); }catch(e){ return ''; } }
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
  function save(x){ try{ localStorage.setItem(KEY, JSON.stringify(x)); }catch(e){} }
  function seed(){
    var x=JSON.parse(JSON.stringify(BASE)); x.ingreso=now();
    x.eventos=[{t:'Ingreso del expediente en línea · IUIe asignado · versión legal v9 anclada', at:x.ingreso, who:'María González · ClaveÚnica', brand:true}];
    return x;
  }
  function get(){ var x=load(); if(!x||!x.eventos){ x=seed(); save(x); } return x; }
  function reset(){ var x=seed(); save(x); return x; }
  function setEstado(estado, evento, who){ var x=get(); x.estado=estado; x.eventos.unshift({t:evento, at:now(), who:who||'Carla Mardones · DOM', brand:estado==='Aprobado'}); save(x); return x; }
  window.FVEdif={ get:get, reset:reset, setEstado:setEstado, fmt:fmt };

  // estado → presentación UI
  var ST={
    'Ingresado':      {cls:'ingresado', label:'Ingresado',              active:0, cz:'Ingresado'},
    'En revisión':    {cls:'revision',  label:'En revisión',            active:2, cz:'En revisión'},
    'Observado':      {cls:'observado', label:'Observado · subsanación', active:2, cz:'Requiere tu respuesta'},
    'Aprobado':       {cls:'resuelto',  label:'Aprobado',               active:4, cz:'Finalizado'}
  };
  function st(x){ return ST[x.estado]||ST['Ingresado']; }

  function page(){ return (location.pathname.split('/').pop()||'').trim()||'index.html'; }
  var P=page();
  try{
    if(P==='comprobante.html'){ reset(); }          // llegar al comprobante = recién presentado
    else if(P==='ciudadano.html'){ injectCiudadano(get()); }
    else if(P==='bandeja.html'){ injectBandeja(get()); }
    else if(P==='expediente.html'){ injectExpediente(get()); }
  }catch(e){ console.warn('[flujo]', e); }

  /* ---------------- Mis trámites (ciudadano) ---------------- */
  function injectCiudadano(x){
    var list=document.getElementById('tramList'); if(!list) return;
    var s=st(x); var open = x.estado==='Observado';
    var stepsHtml =
      '<div class="steps mt-4">'+
        stepNode(s.active>=0)+ bar()+
        stepNode(s.active>=1)+ bar()+
        stepNodeC(s.active,2)+ bar()+
        stepNodeC(s.active,4,true)+
      '</div>'+
      '<div class="step-labels"><span class="'+(s.active>=0?'on':'')+'">Ingresado</span><span class="'+(s.active>=1?'on':'')+'">Admisible</span><span class="'+(s.active>=2?'on':'')+'">En revisión</span><span class="'+(s.active>=4?'on':'')+'">Resuelto</span></div>';

    var body;
    if(x.estado==='Observado'){
      body='<div class="banner warn mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg><div class="b-body"><b>Observación de la Dirección de Obras</b><p>Falta el timbre del CBR en el certificado de dominio vigente. Tienes 8 días hábiles para subsanar (art. 31).</p></div></div>'+
           '<div class="row mt-4" style="gap:8px"><button class="btn btn-primary" onclick="FVEdifResponder()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>Responder observación</button></div>';
    } else if(x.estado==='Aprobado'){
      body='<div class="banner brand mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><div class="b-body"><b>¡Permiso aprobado!</b><p>La Dirección de Obras aprobó tu permiso de edificación con doble firma. Ya puedes descargar el certificado.</p></div></div>'+
           '<div class="row mt-4" style="gap:8px"><button class="btn btn-primary" onclick="toast(\'Descargando permiso de edificación (PDF/A firmado)\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Descargar permiso</button></div>';
    } else {
      body=stepsHtml+'<p class="muted mt-4">Tu solicitud está siendo revisada por la Dirección de Obras de Ñuñoa. Te avisaremos por correo, SMS y esta app en cada avance.</p>';
    }

    var el=document.createElement('div');
    el.className='tram'+(open?' open':''); el.setAttribute('data-c','nunoa'); el.id='fv-tram-edif';
    el.style.borderColor='var(--brand)';
    el.innerHTML=
      '<div class="tram-head" onclick="this.parentElement.classList.toggle(\'open\')">'+
        '<img class="muni-dot" src="assets/comunas/nunoa.svg" alt="Ñuñoa">'+
        '<div style="flex:1;min-width:0"><div style="font-weight:600">Permiso de edificación — ampliación 2º piso <span class="badge brand" style="height:18px;margin-left:6px">Tu trámite reciente</span></div>'+
          '<div class="tiny dim">Ñuñoa · IUIe '+x.iuie+' · ingresado '+fmtDay(x.ingreso)+'</div></div>'+
        '<span class="badge '+s.cls+'"><span class="g"></span>'+s.cz+'</span>'+
        '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M6 9l6 6 6-6"/></svg>'+
      '</div>'+
      '<div class="tram-body">'+body+'</div>';
    list.insertBefore(el, list.firstChild);

    // responder observación → vuelve a revisión (el funcionario reanuda)
    window.FVEdifResponder=function(){
      setEstado('En revisión','El ciudadano subsanó y adjuntó el documento faltante','María González · ClaveÚnica');
      if(window.toast) toast('Documento enviado · la Dirección de Obras reanuda la revisión');
      var n=document.getElementById('fv-tram-edif'); if(n) n.remove();
      injectCiudadano(get());
    };
  }

  /* ---------------- Bandeja (funcionario) ---------------- */
  function injectBandeja(x){
    var firstBody=document.querySelector('#results [data-group] .g-body'); if(!firstBody) return;
    var s=st(x);
    var a=document.createElement('a');
    a.className='trow'; a.id='fv-row-edif';
    a.href='expediente.html?id='+x.corto;
    a.setAttribute('data-s', 'permiso edificación ampliación '+x.solicitante+' '+x.iuie+' '+x.direccion);
    a.setAttribute('data-p','2');
    a.style.background='var(--brand-soft)';
    a.innerHTML=
      '<span class="id">'+x.corto+'</span>'+
      '<span class="ttl">Permiso de edificación — ampliación 2º piso · '+x.direccion+'</span>'+
      '<span class="meta">'+
        '<span class="badge brand" style="height:20px"><span class="g"></span>En línea</span>'+
        '<span class="chip" style="height:20px"><span class="dot" style="background:var(--info)"></span>Edificación</span>'+
        '<span class="badge '+s.cls+'"><span class="g"></span>'+s.label+'</span>'+
        '<img class="pf" style="width:18px;height:18px;border-radius:50%" src="assets/people/maria.svg" alt="">'+
        '<span class="date">hoy</span>'+
      '</span>';
    firstBody.insertBefore(a, firstBody.firstChild);
    // +1 en el contador del grupo
    var cnt=firstBody.parentElement.querySelector('.group-head .cnt');
    if(cnt){ var m=cnt.textContent.match(/\d+/); if(m) cnt.textContent='· '+(parseInt(m[0])+1); }
  }

  /* ---------------- Expediente (funcionario gestiona) ---------------- */
  function injectExpediente(x){
    var id=new URLSearchParams(location.search).get('id');
    if(id!==x.corto) return;   // solo cuando se abre el expediente del flujo
    applyExpediente(x);

    // Cablear las acciones de gestión para que persistan el estado y refresquen la UI.
    var obsBtn=document.querySelector('#observe .modal-foot .btn-primary');
    if(obsBtn) obsBtn.addEventListener('click', function(){
      var y=setEstado('Observado','Observación de subsanación enviada al ciudadano (art. 31)','Carla Mardones · DOM');
      applyExpediente(y);
    });
    var resBtn=document.querySelector('#resolve .modal-foot .btn-primary');
    if(resBtn) resBtn.addEventListener('click', function(){
      var y=setEstado('Aprobado','Permiso de edificación aprobado con doble firma (four-eyes) · FirmaGob','Carla Mardones + Jorge Tapia · DOM');
      applyExpediente(y);
    });
  }

  function applyExpediente(x){
    var s=st(x);
    document.title='Expediente '+x.corto+' · '+x.tipo;
    // título + subtítulo
    var h1=document.querySelector('.page-head h1'); if(h1) h1.textContent=x.titulo;
    var sub=document.querySelector('.page-head .titles .row.wrap');
    if(sub) sub.innerHTML='<span class="mono">IUIe '+x.iuie+'</span><span>·</span><span>Ingreso '+fmt(x.ingreso)+'</span><span>·</span><span>'+x.solicitante+' · '+x.rut+'</span><span>·</span><span>'+x.direccion+'</span>';
    // badge de estado (page-head, primero)
    var topBadge=document.querySelector('.page-head .titles .row .badge');
    if(topBadge){ topBadge.className='badge '+s.cls; topBadge.innerHTML='<span class="g"></span>'+s.label; }
    // banner: origen ciudadano (reemplaza el de plazo) + resultado según estado
    var banner=document.querySelector('.main > .banner') || document.querySelector('.banner.warn, .banner.brand, .banner.info');
    if(banner){
      if(x.estado==='Aprobado'){
        banner.className='banner brand'; banner.style.marginBottom='var(--s-5)';
        banner.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><div class="b-body"><b>Resuelto · permiso aprobado con doble firma</b><p>Notificación automática enviada al ciudadano (email + SMS + push). Certificado firmado con FirmaGob y sellado (SHOA).</p></div>';
      } else if(x.estado==='Observado'){
        banner.className='banner warn'; banner.style.marginBottom='var(--s-5)';
        banner.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg><div class="b-body"><b>Observado · esperando al ciudadano</b><p>Subsanación enviada (art. 31). El plazo se suspende hasta que el ciudadano responda; la notificación salió automáticamente.</p></div>';
      } else {
        banner.className='banner brand'; banner.style.marginBottom='var(--s-5)';
        banner.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><path d="M9 12l2 2 4-4"/></svg><div class="b-body"><b>Ingresado por el ciudadano en línea</b><p>Presentado con ClaveÚnica por '+x.solicitante+' el '+fmt(x.ingreso)+'. Identidad verificada; documentos firmados con FirmaGob.</p></div>';
      }
    }
    // state machine (5 pasos)
    var steps=document.querySelector('.card .steps');
    if(steps){
      var n=[0,1,2,3,4].map(function(i){
        var done = x.estado==='Aprobado' ? true : i<s.active;
        var cur  = x.estado!=='Aprobado' && i===s.active;
        var cls = done?'step done':(cur?'step current':'step');
        var inner = done ? '<span class="node"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px"><path d="M20 6L9 17l-5-5"/></svg></span>' : '<span class="node">'+(i+1)+'</span>';
        return '<div class="'+cls+'">'+inner+(i<4?'<span class="bar"></span>':'')+'</div>';
      }).join('');
      steps.innerHTML=n;
    }
    // sidebar propiedades: Estado + IUIe
    document.querySelectorAll('.col-4 .meta-row').forEach(function(r){
      var k=r.querySelector('.k'); if(!k) return; var t=k.textContent.trim();
      if(t==='Estado'){ r.querySelector('.v').innerHTML='<span class="badge '+s.cls+'"><span class="g"></span>'+s.label+'</span>'; }
      if(t==='IUIe'){ r.querySelector('.v').textContent=x.iuie; }
    });
    // descripción: superficie y derechos
    var g3=document.querySelectorAll('[data-panel="resumen"] .g-3 > div');
    if(g3[0]) g3[0].children[1].textContent=x.superficie;
    if(g3[1]) g3[1].children[1].textContent=x.derechos;
    // acciones: al aprobar, deshabilitar botones de gestión
    if(x.estado==='Aprobado'){
      document.querySelectorAll('.page-head .actions .btn').forEach(function(b){
        if(/Observar|Resolver|Derivar/.test(b.textContent)){ b.setAttribute('disabled',''); b.style.opacity=.5; b.style.pointerEvents='none'; }
      });
    }
  }

  /* helpers de steps para la tarjeta del ciudadano (4 pasos) */
  function bar(){ return '<span class="bar" style="flex:1;height:2px;background:var(--border-strong)"></span>'; }
  function stepNode(done){ return '<div class="step '+(done?'done':'')+'"><span class="node">'+(done?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px"><path d="M20 6L9 17l-5-5"/></svg>':'•')+'</span></div>'; }
  function stepNodeC(active,idx,last){ var done=active>idx, cur=active===idx; return '<div class="step '+(done?'done':(cur?'current':''))+'"><span class="node">'+(done?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:12px;height:12px"><path d="M20 6L9 17l-5-5"/></svg>':(idx===2?'3':'4'))+'</span></div>'; }
})();
