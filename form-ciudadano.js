/* ============================================================
   form-ciudadano.js — El trámite del CIUDADANO usa el MISMO formulario
   que la municipalidad definió en el Constructor (constructor.html →
   "Formulario ciudadano" + "Requisitos"), no un formulario genérico.

   Fuente del modelo: localStorage 'fvCitizenForm.edificacion.v1' si el
   municipio lo editó/publicó; si no, un SEED idéntico al del Constructor.
   Aplica el principio once-only (Ley 21.180): lo que el Estado ya tiene
   (ClaveÚnica, Registro Civil, SII) se muestra verificado / pre-llenado y
   NO se le vuelve a pedir al ciudadano.

   Solo actúa en nuevo.html cuando el actor es el Ciudadano. El ingreso por
   mesa de partes (funcionario) conserva su propio formulario intacto.
   ============================================================ */
(function(){
  "use strict";
  if((location.pathname.split('/').pop()||'')!=='nuevo.html') return;
  // el rol efectivo respeta ?as=<rol> del deck (embed) por encima del localStorage previo,
  // sin depender del orden en que carguen los scripts.
  var role; try{ role=(location.search.match(/[?&]as=([a-z]+)/)||[])[1] || localStorage.getItem('fvRole'); }catch(e){}
  if(role!=='ciudadano') return;   // solo el ciudadano

  var LSKEY='fvCitizenForm.edificacion.v1';
  // Seed 1:1 con constructor.html → seed()
  var SEED={
    requisitos:[
      {label:'Ser el propietario del predio o su representante legal', excluyente:true, origen:'SII'},
      {label:'El predio está ubicado en la comuna', excluyente:true, origen:'SII'},
      {label:'Sin deudas de aseo domiciliario pendientes', excluyente:false, origen:'Interno municipal'}
    ],
    pasos:[
      {nombre:'Identificación', tipo:'formulario', condicion:null, campos:[
        {tipo:'texto', label:'Nombre del propietario', requerido:true, origen:'ClaveÚnica'},
        {tipo:'texto', label:'RUT', requerido:true, descripcion:'Formato 12.345.678-9', origen:'ClaveÚnica'},
        {tipo:'select', label:'Estado civil', requerido:true, opciones:['Soltero/a','Casado/a','Otro'], origen:'Registro Civil'},
        {tipo:'texto', label:'Dirección del predio', requerido:true, origen:'Ciudadano'}
      ]},
      {nombre:'Datos de la obra', tipo:'formulario', condicion:null, campos:[
        {tipo:'numero', label:'Superficie a edificar (m²)', requerido:true, origen:'Ciudadano'},
        {tipo:'select', label:'Tipo de obra', requerido:true, opciones:['Obra nueva','Ampliación','Modificación'], origen:'Ciudadano'}
      ]},
      {nombre:'Certificado de matrimonio', tipo:'documentos', condicion:{campo:'Estado civil', valor:'Casado/a'}, documentos:[
        {nombre:'Certificado de matrimonio', formato:'PDF', descripcion:'Emitido por el Registro Civil', origen:'Registro Civil'}
      ]},
      {nombre:'Documentos de la obra', tipo:'documentos', condicion:null, documentos:[
        {nombre:'Planos de arquitectura', formato:'PDF/A', descripcion:'Firmados por el arquitecto responsable', origen:'Ciudadano', obligatorio:true},
        {nombre:'Certificado de dominio vigente', formato:'PDF', descripcion:'Emitido por el Conservador de Bienes Raíces', origen:'Ciudadano', obligatorio:true}
      ]},
      {nombre:'Pago de derechos', tipo:'pago', condicion:null, monto:'1% del presupuesto de la obra'},
      {nombre:'Firma de la solicitud', tipo:'firma', condicion:null, proveedor:'FirmaGob (ClaveÚnica)'}
    ]
  };
  function model(){
    try{ var m=JSON.parse(localStorage.getItem(LSKEY)); if(m&&Array.isArray(m.pasos)&&Array.isArray(m.requisitos)) return m; }catch(e){}
    return SEED;
  }
  // Datos que el Estado ya tiene (once-only) — pre-llenados y no editables
  var PRE={'Nombre del propietario':'María González','RUT':'12.345.678-9','Estado civil':'Soltero/a'};
  function esSistema(o){ return o && o!=='Ciudadano'; }
  var values={};   // respuestas del ciudadano

  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var M=model(), steps=[], idx=0, started=false;

  function visiblePasos(){
    return M.pasos.filter(function(p){
      if(!p.condicion) return true;
      var v=values[p.condicion.campo];
      // el estado civil viene de Registro Civil (PRE) si no se cambió
      if(v==null) v=PRE[p.condicion.campo];
      return v===p.condicion.valor;
    });
  }

  function toast(m){ if(window.toast) return window.toast(m); }

  function mount(){
    var main=document.querySelector('.main'); if(!main) return;
    // ocultar el wizard estático (mesa de partes) y su barra
    var hs=main.querySelector('.hsteps'); if(hs) hs.style.display='none';
    main.querySelectorAll('section[data-step]').forEach(function(s){ s.style.display='none'; });
    var wb=document.getElementById('wizBar'); if(wb) wb.style.display='none';
    // cabecera
    var ph=main.querySelector('.page-head .titles');
    if(ph){
      var eb=ph.querySelector('#ctxEyebrow'); if(eb) eb.textContent='Trámite en línea · Municipalidad de Ñuñoa';
      var tt=ph.querySelector('#ctxTitle'); if(tt) tt.textContent='Permiso de edificación';
      var ld=ph.querySelector('#ctxLede'); if(ld) ld.textContent='Formulario definido por la Dirección de Obras. Solo te pedimos lo que el Estado no tiene (principio once-only).';
    }
    // contenedor propio
    var wrap=document.createElement('div'); wrap.id='fvcw';
    wrap.innerHTML='<ol class="hsteps" id="fvcSteps"></ol><div id="fvcPanel"></div>'+
      '<div class="wiz-bar" id="fvcBar">'+
        '<button class="btn btn-ghost" id="fvcBack"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>Atrás</button>'+
        '<span class="info" id="fvcProg"></span><div style="flex:1"></div>'+
        '<button class="btn btn-primary" id="fvcNext">Continuar<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>'+
      '</div>';
    main.appendChild(wrap);
    document.getElementById('fvcBack').addEventListener('click', function(){ go(-1); });
    document.getElementById('fvcNext').addEventListener('click', function(){ go(1); });
    rebuild(); render();
  }

  function rebuild(){
    // pasos = [Requisitos] + pasos visibles del modelo + [Revisión]
    steps=[{key:'req', nombre:'Requisitos'}]
      .concat(visiblePasos().map(function(p){ return {key:'paso', paso:p, nombre:p.nombre}; }))
      .concat([{key:'rev', nombre:'Revisión'}]);
    if(idx>=steps.length) idx=steps.length-1;
  }

  function render(){
    // stepper
    var sc=document.getElementById('fvcSteps');
    sc.innerHTML=steps.map(function(s,i){
      return '<li class="hstep'+(i===idx?' on':(i<idx?' done':''))+'"><span class="n">'+(i+1)+'</span><span class="t">'+esc(s.nombre)+'</span></li>';
    }).join('');
    // panel
    var s=steps[idx], html='';
    if(s.key==='req') html=renderReq();
    else if(s.key==='rev') html=renderRev();
    else html=renderPaso(s.paso);
    document.getElementById('fvcPanel').innerHTML=html;
    wireInputs();
    // barra
    document.getElementById('fvcProg').textContent='Paso '+(idx+1)+' de '+steps.length;
    document.getElementById('fvcBack').disabled = idx===0;
    var next=document.getElementById('fvcNext');
    next.innerHTML = (idx===steps.length-1)
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Presentar solicitud'
      : (idx===0 ? 'Cumplo los requisitos · comenzar<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
                 : 'Continuar<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>');
    window.scrollTo(0,0);
  }

  function renderReq(){
    var h='<h2 style="font-size:var(--fs-20);margin-bottom:6px">Antes de empezar · requisitos</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5);max-width:70ch">Para este trámite debes cumplir lo siguiente. Los requisitos marcados los <b>verifica el Estado por ti</b> (no necesitas declararlos): consultamos a la fuente oficial.</p>'+
      '<div class="wiz-panel stack" style="gap:10px">';
    M.requisitos.forEach(function(r){
      var sys=esSistema(r.origen);
      var right = sys
        ? '<span class="badge resuelto"><span class="g"></span>Verificado · '+esc(r.origen)+'</span>'
        : (r.excluyente?'<span class="badge revision"><span class="g"></span>Excluyente</span>':'<span class="badge neutral"><span class="g"></span>Informativo</span>');
      h+='<div class="row between card" style="padding:12px 14px">'+
           '<div class="row" style="gap:10px"><svg viewBox="0 0 24 24" fill="none" stroke="'+(sys?'var(--success)':(r.excluyente?'var(--warning)':'var(--text-3)'))+'" stroke-width="2.2" style="width:18px;height:18px;flex-shrink:0">'+(sys?'<path d="M20 6L9 17l-5-5"/>':'<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>')+'</svg>'+
           '<div><div style="font-weight:600">'+esc(r.label)+'</div>'+(r.excluyente?'<div class="tiny dim">Si no se cumple, no puedes iniciar el trámite.</div>':'<div class="tiny dim">No impide continuar; es informativo.</div>')+'</div></div>'+
           right+
         '</div>';
    });
    h+='<div class="banner info mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg><div class="b-body"><b>Interoperabilidad del Estado</b><p>Verificamos tu calidad de propietario y la ubicación del predio directamente con el SII. No tienes que subir esos certificados.</p></div></div>';
    h+='</div>';
    return h;
  }

  function renderPaso(p){
    if(p.tipo==='formulario') return renderForm(p);
    if(p.tipo==='documentos') return renderDocs(p);
    if(p.tipo==='pago') return renderPago(p);
    if(p.tipo==='firma') return renderFirma(p);
    return '';
  }

  function renderForm(p){
    var h='<h2 style="font-size:var(--fs-20);margin-bottom:6px">'+esc(p.nombre)+'</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5)">Los datos con el ícono azul vienen de tu identidad y de registros del Estado: solo confírmalos.</p>'+
      '<div class="wiz-panel">';
    p.campos.forEach(function(c){
      var sys=esSistema(c.origen);
      var val = sys ? (PRE[c.label]!=null?PRE[c.label]:'') : (values[c.label]||'');
      var chip = sys ? '<span class="chip" style="height:20px;margin-left:8px"><svg viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" style="width:12px;height:12px"><path d="M20 6L9 17l-5-5"/></svg>traído de '+esc(c.origen)+'</span>' : (c.requerido?'':'<span class="opt"> — opcional</span>');
      var pii = c.label==='Nombre del propietario' || c.label==='RUT';
      h+='<div class="field"><label class="row" style="gap:6px">'+(pii?'<span class="dot" style="width:8px;height:8px;border-radius:50%;background:var(--danger)"></span>':'')+esc(c.label)+chip+'</label>';
      if(c.tipo==='select'){
        h+='<select class="input" data-f="'+esc(c.label)+'" style="appearance:none"'+(sys?' disabled':'')+'>'+
           (sys?'<option>'+esc(val)+'</option>':(['<option value="">Selecciona…</option>'].concat((c.opciones||[]).map(function(o){return '<option'+(values[c.label]===o?' selected':'')+'>'+esc(o)+'</option>';})).join('')))+
           '</select>';
      } else {
        h+='<input class="input" data-f="'+esc(c.label)+'" type="'+(c.tipo==='numero'?'number':'text')+'" value="'+esc(val)+'"'+(sys?' readonly style="opacity:.8"':'')+' placeholder="'+esc(c.descripcion||'')+'">';
      }
      if(c.descripcion && !sys) h+='<div class="help">'+esc(c.descripcion)+'</div>';
      if(sys) h+='<div class="help">Verificado con '+esc(c.origen)+' · no necesitas reingresarlo.</div>';
      h+='</div>';
    });
    h+='</div>';
    return h;
  }

  function renderDocs(p){
    var h='<h2 style="font-size:var(--fs-20);margin-bottom:6px">'+esc(p.nombre)+'</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5)">Adjunta solo los documentos que el Estado no puede obtener por ti.</p>'+
      '<div class="wiz-panel stack" style="gap:10px">';
    p.documentos.forEach(function(d){
      var sys=esSistema(d.origen);
      if(sys){
        h+='<div class="row between card" style="padding:12px 14px"><div class="row" style="gap:10px"><img class="doc-thumb" style="width:28px;height:35px" src="assets/docs/certificado.svg" alt=""><div><div style="font-weight:600">'+esc(d.nombre)+'</div><div class="tiny dim">'+esc(d.descripcion||'')+'</div></div></div><span class="badge resuelto"><span class="g"></span>Lo obtiene el Estado · '+esc(d.origen)+'</span></div>';
      } else {
        h+='<div class="drop" data-doc="'+esc(d.nombre)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="width:24px;height:24px;margin:0 auto 6px;color:var(--brand)"><path d="M12 15V3M7 8l5-5 5 5M5 21h14"/></svg><div style="color:var(--text-1);font-weight:600">'+esc(d.nombre)+'</div><div class="tiny">'+(d.obligatorio?'Obligatorio · ':'')+esc(d.formato||'PDF')+' · toca para adjuntar</div></div>';
      }
    });
    h+='</div>';
    return h;
  }

  function renderPago(p){
    var h='<h2 style="font-size:var(--fs-20);margin-bottom:6px">Pago de derechos</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5)">El pago se realiza en línea al final, o después desde «Mis trámites». Aún no se te cobra nada.</p>'+
      '<div class="wiz-panel"><div class="card">'+
        '<div class="meta-row"><span class="k">Concepto</span><span class="v">Derechos municipales de edificación</span></div>'+
        '<div class="meta-row"><span class="k">Cálculo</span><span class="v">'+esc(p.monto||'')+'</span></div>'+
        '<div class="meta-row" style="border:0"><span class="k">Estimado</span><span class="v tnum" style="font-weight:700">$148.230</span></div>'+
      '</div>'+
      '<div class="banner info mt-4"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg><div class="b-body"><p style="color:var(--text-2)">Pagos con Webpay (redirect). La plataforma nunca guarda el número de tu tarjeta (PCI SAQ-A).</p></div></div>'+
      '</div>';
    return h;
  }

  function renderFirma(p){
    return '<h2 style="font-size:var(--fs-20);margin-bottom:6px">Firma de la solicitud</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5)">Tu solicitud se firma con '+esc(p.proveedor||'FirmaGob')+', con validez legal (Ley 19.799).</p>'+
      '<div class="wiz-panel"><div class="card" style="text-align:center;padding:var(--s-6)">'+
        '<div style="display:flex;justify-content:center;margin-bottom:var(--s-4)"><span class="gplate dk"><img src="assets/gob/oficial-firmagob.png" alt="FirmaGob" style="height:30px"></span></div>'+
        '<p class="muted" style="max-width:46ch;margin:0 auto">Al presentar, firmarás con tu ClaveÚnica. Se generará el certificado de presentación sellado con hora SHOA.</p>'+
      '</div></div>';
  }

  function renderRev(){
    var dir=values['Dirección del predio']||'Av. Grecia 2260, Ñuñoa';
    var sup=values['Superficie a edificar (m²)']||'42';
    var obra=values['Tipo de obra']||'Ampliación';
    return '<h2 style="font-size:var(--fs-20);margin-bottom:6px">Revisión y presentación</h2>'+
      '<p class="muted" style="margin-bottom:var(--s-5)">Confirma los datos. Al presentar se asigna el IUIe, se ancla la versión legal y recibes tu comprobante.</p>'+
      '<div class="wiz-panel">'+
        '<div class="card" style="margin-bottom:var(--s-4)">'+
          '<div class="meta-row"><span class="k">Trámite</span><span class="v">Permiso de edificación</span></div>'+
          '<div class="meta-row"><span class="k">Solicitante</span><span class="v">'+esc(PRE['Nombre del propietario'])+' · '+esc(PRE['RUT'])+' <span class="chip" style="height:18px">ClaveÚnica</span></span></div>'+
          '<div class="meta-row"><span class="k">Predio</span><span class="v">'+esc(dir)+'</span></div>'+
          '<div class="meta-row"><span class="k">Obra</span><span class="v">'+esc(obra)+' · '+esc(sup)+' m²</span></div>'+
          '<div class="meta-row"><span class="k">Requisitos</span><span class="v"><span class="badge resuelto"><span class="g"></span>Verificados con el SII</span></span></div>'+
          '<div class="meta-row" style="border:0"><span class="k">Derechos</span><span class="v">$148.230 · se pagan en línea o en caja</span></div>'+
        '</div>'+
        '<div class="banner brand" style="margin-bottom:var(--s-4)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><path d="M9 12l2 2 4-4"/></svg><div class="b-body"><b>Certificado de presentación</b><p>Se firma con FirmaGob y se sella con hora SHOA. Verificable por folio + QR.</p></div></div>'+
        '<label class="row" style="gap:10px;cursor:pointer"><span class="switch on" onclick="this.classList.toggle(\'on\')"></span><span class="tiny muted">Declaro que los antecedentes son veraces (Ley 19.880).</span></label>'+
      '</div>';
  }

  function wireInputs(){
    document.querySelectorAll('#fvcPanel [data-f]').forEach(function(el){
      el.addEventListener('input', function(){ values[el.getAttribute('data-f')]=el.value; });
      el.addEventListener('change', function(){ values[el.getAttribute('data-f')]=el.value; if(el.tagName==='SELECT'){ rebuild(); } });
    });
    document.querySelectorAll('#fvcPanel .drop[data-doc]').forEach(function(d){
      d.addEventListener('click', function(){
        d.style.borderColor='var(--brand)'; d.style.background='var(--brand-soft)';
        d.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2" style="width:24px;height:24px;margin:0 auto 6px"><path d="M20 6L9 17l-5-5"/></svg><div style="color:var(--text-1);font-weight:600">'+d.getAttribute('data-doc')+'</div><div class="tiny dim">cargado · 1,8 MB</div>';
        d.setAttribute('data-ok','1'); toast('Documento adjuntado');
      });
    });
  }

  function validate(){
    var s=steps[idx];
    if(s.key!=='paso') return true;
    var p=s.paso;
    if(p.tipo==='formulario'){
      var miss=null;
      p.campos.forEach(function(c){
        if(esSistema(c.origen)) return;        // lo aporta el Estado
        if(c.requerido && !(values[c.label]&&String(values[c.label]).trim())) miss=miss||c.label;
      });
      if(miss){ toast('Completa: '+miss); return false; }
    }
    if(p.tipo==='documentos'){
      var falta=null;
      document.querySelectorAll('#fvcPanel .drop[data-doc]').forEach(function(d){ if(!d.getAttribute('data-ok')) falta=falta||d.getAttribute('data-doc'); });
      if(falta){ toast('Adjunta: '+falta); return false; }
    }
    return true;
  }

  function go(dir){
    if(dir>0){
      if(idx===steps.length-1){ return present(); }
      if(!validate()) return;
    }
    idx=Math.max(0, Math.min(steps.length-1, idx+dir));
    rebuild(); render();
  }

  function present(){
    var main=document.querySelector('.main');
    document.getElementById('fvcBar').style.display='none';
    document.getElementById('fvcSteps').style.display='none';
    document.getElementById('fvcPanel').innerHTML=
      '<div class="card pad-lg" style="text-align:center;border-color:var(--brand)">'+
        '<div style="width:56px;height:56px;border-radius:50%;background:var(--brand-soft);display:grid;place-items:center;margin:0 auto var(--s-4)"><svg viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.5" style="width:28px;height:28px"><path d="M20 6L9 17l-5-5"/></svg></div>'+
        '<h2 style="font-size:var(--fs-20)">Solicitud presentada</h2>'+
        '<p class="muted" style="margin:6px 0 var(--s-4)">Se asignó tu identificador único y se generó el certificado de presentación.</p>'+
        '<div class="code mono" style="font-size:var(--fs-16);padding:8px 14px;display:inline-block">IUIe 13120-2026-004826</div>'+
        '<p class="tiny dim" style="margin-top:var(--s-4)">Paga los derechos ahora para que tu trámite comience, o hazlo después desde «Mis trámites».</p>'+
        '<div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap;margin-top:var(--s-4)">'+
          '<a class="btn btn-secondary" href="comprobante.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>Descargar comprobante</a>'+
          '<a class="btn btn-primary" href="pago.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>Pagar derechos en línea</a>'+
        '</div>'+
        '<div style="text-align:center;margin-top:var(--s-3)"><a class="btn btn-ghost btn-sm" href="ciudadano.html">Ir a mis trámites</a></div>'+
      '</div>';
    window.scrollTo(0,0);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
