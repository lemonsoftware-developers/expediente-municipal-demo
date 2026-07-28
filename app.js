/* ============================================================
   app.js — capa compartida de rol / onboarding / tours (demo)
   No framework. Se incluye al final de cada página.
   Reorganiza la nav por ROL, añade onboarding y recorridos guiados.
   ============================================================ */
(function(){
  "use strict";

  /* ---------- Tema claro/oscuro (persistente) ---------- */
  const THEME_KEY='fvTheme';
  function applyTheme(t){ document.documentElement.setAttribute('data-theme', t); try{localStorage.setItem(THEME_KEY,t);}catch(e){} }
  (function initTheme(){ let t; try{t=localStorage.getItem(THEME_KEY);}catch(e){} applyTheme(t==='light'?'light':'dark'); })();
  function currentTheme(){ return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark'; }
  const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3L4.9 4.9M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4"/></svg>';
  const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>';
  const CL_FLAG='<span class="fv-flag" title="Gobierno de Chile"><svg viewBox="0 0 30 20" width="21" height="14"><rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#D52B1E"/><rect width="10" height="10" fill="#0039A6"/><path fill="#fff" d="M5 2.2l.9 2.7h2.8l-2.3 1.7.9 2.7L5 7.6 2.7 9.3l.9-2.7L1.3 4.9h2.8z"/></svg></span>';

  /* ---------- Modelo de roles ---------- */
  const ROLES = [
    {id:'funcionario', label:'Funcionario (DOM)', color:'#7FB3A0', desc:'Revisa y resuelve trámites municipales',
      home:'funcionario.html', screens:['funcionario.html','bandeja.html','expedientes.html','nuevo.html','expediente.html','recursos.html','notificaciones.html'],
      flow:['Revisa tu bandeja y atiende lo urgente (plazos por vencer).','Abre el expediente y verifica documentos y trazabilidad.','Resuelve con doble firma (four-eyes): el ciudadano se notifica automáticamente y queda el acuse.']},
    {id:'supervisor', label:'Jefatura / Supervisión', color:'#C9A15E', desc:'Monitorea la gestión y los plazos legales',
      home:'supervisor.html', screens:['supervisor.html','bandeja.html','expedientes.html','expediente.html'],
      flow:['Mira los indicadores: % digital, tiempos, silencios por vencer.','Detecta cuellos de botella por funcionario y por tipo de trámite.','Entra a la bandeja o al expediente para intervenir.']},
    {id:'cajero', label:'Cajero (Tesorería)', color:'#8FBEC9', desc:'Recauda y concilia pagos municipales',
      home:'caja.html', screens:['caja.html'],
      flow:['Busca la obligación por RUT o rol y cobra.','Registra el pago; entra al libro contable inmodificable.','Concilia con el banco y cuadra la caja al cierre.']},
    {id:'inspector', label:'Inspector en terreno', color:'#B49AC9', desc:'Inspecciona en terreno con la app móvil',
      home:'movil.html', screens:['movil.html'],
      flow:['Abre la inspección asignada del día.','Levanta el acta con foto, ubicación y hora (sellada en origen).','Firma; se sincroniza y sella con SHOA al recuperar señal.']},
    {id:'dpo', label:'DPO (Datos personales)', color:'#C98F8F', desc:'Protege los datos personales (Ley 21.719)',
      home:'eipd.html', screens:['eipd.html'],
      flow:['Revisa el registro de tratamientos (RAT) por validar.','Evalúa el impacto (EIPD) de los datos sensibles.','Dictamina: sin dictamen favorable, el tratamiento no se activa.']},
    {id:'admin', label:'Administrador de plataforma', color:'#9AA6C9', desc:'Gestiona municipios, usuarios y roles',
      home:'admin.html', screens:['admin.html'],
      flow:['Administra las municipalidades y su aislamiento de datos.','Gestiona usuarios y permisos (deny-by-default).','No decide materia legal: eso es del equipo jurídico.']},
    {id:'config', label:'Configuración municipal', color:'#C9A15E', desc:'Crea y configura los TIPOS de trámite (no-code)',
      home:'tipos.html', screens:['tipos.html','constructor.html'],
      flow:['Abre el catálogo de tipos de trámite de tu municipio.','Crea o edita un tipo: define tus campos, el flujo y los documentos sobre el núcleo legal fijo de Lemon.','Publica; el sistema bloquea si un campo con dato personal no tiene su protección definida.']},
    {id:'concejal', label:'Concejal', color:'#7FB3A0', desc:'Vota los acuerdos del Concejo Municipal',
      home:'concejo.html', screens:['concejo.html'],
      flow:['Revisa la tabla de la sesión en curso.','Vota cada punto (a favor / en contra / abstención).','Tu voto queda consignado en el acta con el quórum.']},
    {id:'fiscalizador', label:'Fiscalizador (Contraloría)', color:'#9AA6C9', desc:'Fiscaliza sin poder modificar nada',
      home:'fiscalizacion.html', screens:['fiscalizacion.html'],
      flow:['Consulta expedientes de todos los municipios (federado).','Solo lectura: no puedes modificar; datos minimizados.','Cada consulta que haces queda registrada en el origen.']},
    {id:'ciudadano', label:'Ciudadano', color:'#8FBEC9', desc:'Inicia y sigue mis trámites municipales',
      home:'catalogo.html', screens:['catalogo.html','ciudadano.html','ficha.html','nuevo.html','mi-tramite.html','pago.html','comprobante.html'],
      flow:['Busca el trámite en el catálogo y revisa su ficha (requisitos, costo, plazo).','Inícialo en línea con tu ClaveÚnica y completa el formulario.','Sigue el avance y responde observaciones desde «Mis trámites».']}
  ];
  const SCREEN_LABEL = {
    'index.html':'Acceso','funcionario.html':'Escritorio','bandeja.html':'Bandeja','nuevo.html':'Crear trámite',
    'expedientes.html':'Expedientes','expediente.html':'Expediente','recursos.html':'Recursos','notificaciones.html':'Notificaciones','caja.html':'Caja',
    'fiscalizacion.html':'Fiscalización','concejo.html':'Concejo','supervisor.html':'Gestión','admin.html':'Administración',
    'eipd.html':'EIPD','ciudadano.html':'Mis trámites','movil.html':'App terreno',
    'tipos.html':'Tipos de trámite','constructor.html':'Constructor',
    'catalogo.html':'Trámites disponibles','ficha.html':'Ficha del trámite',
    'mi-tramite.html':'Mi trámite','pago.html':'Pago','comprobante.html':'Comprobante'
  };
  // iconos por pantalla (para el sidebar generado)
  const IC = {
    'funcionario.html':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'bandeja.html':'<path d="M3 7h18M3 12h18M3 17h18"/>',
    'expedientes.html':'<path d="M4 4h10l6 6v10H4z"/><path d="M14 4v6h6"/>',
    'nuevo.html':'<path d="M12 5v14M5 12h14"/>',
    'expediente.html':'<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/>',
    'recursos.html':'<path d="M9 14l-4-4 4-4M5 10h11a4 4 0 010 8h-1"/>',
    'notificaciones.html':'<path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>',
    'caja.html':'<rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/>',
    'supervisor.html':'<path d="M3 3v18h18"/><path d="M7 14l3-3 3 3 4-5"/>',
    'admin.html':'<path d="M3 21h18M6 21V9l6-4 6 4v12"/>',
    'eipd.html':'<path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/>',
    'concejo.html':'<path d="M3 21h18M5 21V10M19 21V10M3 10l9-6 9 6"/>',
    'fiscalizacion.html':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    'ciudadano.html':'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0114 0"/>',
    'tipos.html':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'constructor.html':'<path d="M12 20h9M3 20l2-2 9-9a2.8 2.8 0 014 4l-9 9-5 1z"/>',
    'movil.html':'<path d="M12 21s-7-4.5-7-11a7 7 0 0114 0c0 6.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    'catalogo.html':'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    'ficha.html':'<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5M9 13h6M9 17h4"/>'
  };
  const CNT = { 'bandeja.html':'23','expedientes.html':'218','notificaciones.html':'6' };
  // retrato ilustrado por rol (assets/people/*.svg) — reemplaza los avatares de iniciales
  const AV = {
    funcionario:'assets/people/carla.svg', supervisor:'assets/people/jorge.svg',
    cajero:'assets/people/mariapaz.svg', inspector:'assets/people/inspector.svg',
    dpo:'assets/people/rosa.svg', admin:'assets/people/ana.svg',
    config:'assets/people/rodrigo.svg', concejal:'assets/people/luis.svg',
    fiscalizador:'assets/people/contraloria.svg', ciudadano:'assets/people/maria.svg'
  };
  function avatar(id, cls){ return '<img class="pf '+(cls||'')+'" src="'+(AV[id]||AV.funcionario)+'" alt="">'; }
  const PERSON = {
    funcionario:{n:'Carla Mardones',s:'Revisora · DOM',i:'CM',c:'av-a'},
    supervisor:{n:'Jorge Tapia',s:'Jefe · DOM',i:'JT',c:'av-b'},
    cajero:{n:'María Paz Rivas',s:'Cajera · Tesorería',i:'MP',c:'av-d'},
    inspector:{n:'Jorge Tapia',s:'Inspector · DOM',i:'JT',c:'av-c'},
    dpo:{n:'Rosa Donoso',s:'DPO municipal',i:'RD',c:'av-f'},
    admin:{n:'Ana Díaz',s:'Admin plataforma',i:'AD',c:'av-e'},
    config:{n:'Rodrigo Fuentes',s:'Config · SECPLA',i:'RF',c:'av-b'},
    concejal:{n:'Luis Fuentes',s:'Concejal',i:'LF',c:'av-c'},
    fiscalizador:{n:'Contraloría',s:'Fiscalizador externo',i:'CG',c:'av-c'},
    ciudadano:{n:'María González',s:'Ciudadana',i:'MG',c:'av-e'}
  };

  /* ---------- Recorridos guiados por pantalla ---------- */
  const TOURS = {
    'funcionario.html':[
      {sel:'.page-head h1',t:'Tu escritorio',d:'Empieza el día por aquí: un resumen de lo que necesitas saber y hacer, priorizado.'},
      {sel:'.banner.danger',t:'Alertas de plazo legal',d:'Lo rojo es urgente: un silencio administrativo por vencer. Si no resuelves a tiempo, el trámite se aprueba solo.'},
      {sel:'.kpi.accent',t:'Tu carga de trabajo',d:'Indicadores de cuánto tienes asignado y qué está por vencer.'},
      {sel:'#taskList',t:'Tus tareas',d:'Filtra por estado y abre cada trámite para gestionarlo.'},
      {sel:'a[href="nuevo.html"]',t:'Ingresar un trámite',d:'Aquí creas un nuevo expediente con un asistente guiado.'}
    ],
    'bandeja.html':[
      {sel:'.search',t:'Busca rápido',d:'Por IUIe, dirección o solicitante. La lista se filtra al escribir.'},
      {sel:'.group-head',t:'Agrupado por estado',d:'Los trámites se agrupan por su etapa. Toca un grupo para colapsarlo.'},
      {sel:'.trow',t:'Cada fila es un trámite',d:'El ícono de la izquierda indica el estado. Ábrelo para verlo completo.'}
    ],
    'nuevo.html':[
      {sel:'.hsteps',t:'5 pasos guiados',d:'El ingreso está dividido en pasos claros. Nunca pierdes lo que escribes.'},
      {sel:'.opt-card',t:'Elige el tipo',d:'Según el trámite, el formulario y los documentos requeridos se adaptan solos.'},
      {sel:'#nextBtn',t:'Avanza con Continuar',d:'Al final se asigna el IUIe y se emite el certificado de presentación firmado.'}
    ],
    'expediente.html':[
      {sel:'.steps',t:'Ciclo de vida',d:'Ves en qué etapa está el trámite: ingresado, en revisión, resuelto, notificado.'},
      {sel:'.banner.warn',t:'Plazo legal',d:'El sistema calcula el plazo excluyendo feriados y suspensiones, y avisa el vencimiento.'},
      {sel:'.pill-tab',t:'Todo el expediente',d:'Documentos, trazabilidad (cadena de sellos) y actividad, en pestañas.'},
      {sel:'.btn-primary',t:'Resolver con doble firma',d:'Aprobar exige un segundo aprobador distinto del revisor (separación de funciones).'}
    ],
    'recursos.html':[
      {sel:'.banner.info',t:'Recurso vinculado',d:'Un recurso (art. 59) corre con su propio plazo sin borrar el expediente original.'},
      {sel:'.pill-tab',t:'Recurso, partes y cierre',d:'Aquí gestionas la reposición, los terceros que se oponen y el desistimiento o abandono.'}
    ],
    'notificaciones.html':[
      {sel:'.chan',t:'Elige los canales',d:'Email, SMS, push o carta certificada. Si nadie confirma, se dispara la carta automáticamente.'},
      {sel:'.btn-primary',t:'Envía con validez legal',d:'La notificación se folia, se sella con hora y registra el acuse de lectura.'}
    ],
    'caja.html':[
      {sel:'.banner.warn',t:'Lo que falta conciliar',d:'Antes de cerrar la caja, revisa los pagos sin confirmación bancaria.'},
      {sel:'.search',t:'Busca la obligación',d:'Por RUT o rol; el sistema trae el monto y si admite cuotas.'},
      {sel:'.btn-primary',t:'Registra el pago',d:'Entra a un libro contable inmodificable. La plataforma nunca guarda el número de tarjeta.'}
    ],
    'supervisor.html':[
      {sel:'.kpi.accent',t:'Métrica clave',d:'El % de trámites 100% digitales: la meta legal a diciembre de 2027.'},
      {sel:'#range',t:'Cambia el periodo',d:'Los indicadores se recalculan según el rango que elijas.'},
      {sel:'.banner.danger',t:'Silencios inminentes',d:'Lo que hay que resolver ya, antes de que se apruebe por silencio.'}
    ],
    'admin.html':[
      {sel:'.pill-tab',t:'Cuatro áreas',d:'Municipios, usuarios y roles, protección de datos y aplicación normativa.'},
      {sel:'.kpi.accent',t:'Cumplimiento',d:'Registros del RAT pendientes de validación del DPO.'}
    ],
    'eipd.html':[
      {sel:'.page-head h1',t:'Evaluación de impacto',d:'Obligatoria al tratar datos sensibles a gran escala con decisiones automatizadas.'},
      {sel:'.btn-primary',t:'Dictamen del DPO',d:'Sin un dictamen favorable, el tratamiento de datos no puede activarse.'}
    ],
    'concejo.html':[
      {sel:'.card.pad-lg',t:'Punto en votación',d:'El acuerdo que se está votando ahora, con el resultado en vivo.'},
      {sel:'#myVote',t:'Emite tu voto',d:'A favor, en contra o abstención. Tu voto actualiza el conteo y queda en el acta.'}
    ],
    'fiscalizacion.html':[
      {sel:'.banner.info',t:'Solo lectura',d:'No puedes modificar nada; los datos sensibles se muestran minimizados.'},
      {sel:'.card',t:'Vista federada',d:'Expedientes de todos los municipios en tiempo real. Cada consulta queda registrada en el origen.'}
    ],
    'ciudadano.html':[
      {sel:'.cz-hero',t:'Todos tus trámites',d:'De todas las comunas, en un solo lugar. Entras con ClaveÚnica.'},
      {sel:'.tram',t:'Abre un trámite',d:'Toca para ver su estado y qué debes hacer (por ejemplo, subsanar).'},
      {sel:'#comunaFilter',t:'Filtra por comuna',d:'Si tienes trámites en varias municipalidades, sepáralos aquí.'}
    ],
    'movil.html':[
      {sel:'.phone',t:'La app del inspector',d:'Pensada para el terreno y para funcionar sin señal (offline-first).'},
      {sel:'#netSwitch',t:'Prueba el modo offline',d:'Usa el interruptor: verás cómo las actas quedan en cola hasta recuperar conexión.'},
      {sel:'.ph-tabbar',t:'Navegación móvil',d:'Terreno, Acta, Sincronización y Perfil en la barra inferior.'}
    ],
    'tipos.html':[
      {sel:'.page-head h1',t:'Tipos de trámite de tu municipio',d:'El catálogo de lo que tu municipio tramita. Cada uno tiene su versión, su modo temporal y su estado (publicado/borrador).'},
      {sel:'.btn-primary',t:'Crear un tipo nuevo',d:'Desde aquí configuras un tipo de trámite completo, sin programar (no-code).'}
    ],
    'constructor.html':[
      {sel:'.cn-rail',t:'Todo lo configurable',d:'Datos, núcleo legal (fijo), tus campos, el flujo, documentos, notificaciones y la publicación.'},
      {sel:'.locked',t:'Núcleo legal fijo',d:'Lo que la ley obliga viene bloqueado y lo mantiene Lemon; tú no lo tocas.'},
      {sel:'.cn-sec[data-s="publicar"]',t:'Gate de publicación',d:'No puedes publicar si un campo con dato personal no tiene su protección definida.'}
    ],
    'catalogo.html':[
      {sel:'.bigsearch',t:'Busca tu trámite',d:'Escribe lo que necesitas (ej: «construir», «patente») — no necesitas el nombre exacto.'},
      {sel:'.cats',t:'O filtra por categoría',d:'Haz clic en una categoría (Obras, Vehículos…) para acotar la lista.'},
      {sel:'.tcard',t:'Abre la ficha',d:'Haz clic en un trámite para ver requisitos, costo y plazo antes de empezar.'}
    ],
    'ficha.html':[
      {sel:'.req',t:'Reúne los documentos',d:'Estos son los requisitos. Tenlos a mano para no interrumpir el trámite.'},
      {sel:'.aside .btn-primary',t:'Inicia el trámite',d:'Cuando estés listo, haz clic en «Iniciar trámite en línea»; te pediremos ClaveÚnica.'}
    ],
    'expedientes.html':[
      {sel:'.search',t:'Busca en el registro',d:'Por IUIe, dirección o solicitante.'},
      {sel:'#fTipo',t:'Filtra por tipo',d:'Elige el tipo de trámite (edificación, patente…) para acotar la tabla.'},
      {sel:'#tb tr',t:'Abre un expediente',d:'Haz clic en una fila para ver el detalle del trámite.'}
    ],
    'index.html':[
      {sel:'.fv-role-btn',t:'Cambia de rol aquí',d:'Este selector es la clave de la demo: elige un rol y verás exactamente lo que ve esa persona.'}
    ]
  };

  /* ---------- Procesos guiados (llevan al usuario PASO A PASO por una tarea) ---------- */
  const JOURNEYS = {
    permiso:{title:'Tramitar un permiso de edificación', role:'funcionario', steps:[
      {screen:'nuevo.html', label:'Paso 1 · Crear el trámite', instr:'Elige el tipo de trámite, identifica al solicitante y completa los 5 pasos. Al presentar se asigna el IUIe y se emite el certificado.', target:['#nextBtn','#fvcNext']},
      {screen:'bandeja.html', label:'Paso 2 · Ubicarlo en la bandeja', instr:'Tu trámite aparece agrupado por estado (en revisión, observado…). Ábrelo para gestionarlo.', target:'.trow'},
      {screen:'expediente.html', label:'Paso 3 · Revisar el expediente', instr:'Verifica documentos y trazabilidad, y mira las verificaciones automáticas. Aquí resuelves con doble firma (four-eyes).', target:'.btn-primary'},
      {screen:'notificaciones.html', label:'Paso 4 · La notificación es automática', instr:'Al resolver, el sistema notifica al ciudadano por los canales configurados y registra el acuse — el funcionario no envía nada a mano. Aquí ves las reglas automáticas y el seguimiento; el envío manual es solo la excepción.', target:'.pill-tab'}
    ]},
    ciudadano:{title:'Iniciar un trámite en línea', role:'ciudadano', steps:[
      {screen:'catalogo.html', label:'Paso 1 · Buscar el trámite', instr:'Busca lo que necesitas o explora por categoría (obras, patentes, vehículos…). No necesitas saber el nombre exacto.', target:'.tcard'},
      {screen:'ficha.html', label:'Paso 2 · Revisar la ficha', instr:'Antes de empezar, revisa requisitos, documentos, costo y plazo. Reúne lo necesario para no interrumpirte.', target:'.aside .btn-primary'},
      {screen:'nuevo.html', label:'Paso 3 · Iniciar con ClaveÚnica', instr:'Inicia sesión con ClaveÚnica y completa el formulario paso a paso. Al presentar recibes tu comprobante con el IUIe.', target:['#fvcNext','#nextBtn']},
      {screen:'ciudadano.html', label:'Paso 4 · Seguir el trámite', instr:'Vuelve a «Mis trámites» para ver el avance; te avisamos automáticamente cada cambio de estado.', target:'.tram'}
    ]},
    tipo:{title:'Crear un tipo de trámite (no-code)', role:'config', steps:[
      {screen:'tipos.html', label:'Paso 1 · Abrir el catálogo', instr:'Aquí están los tipos de trámite de tu municipio. Pulsa “Crear tipo de trámite” para empezar uno nuevo.', target:'.btn-primary[href="constructor.html"]'},
      {screen:'constructor.html', label:'Paso 2 · Datos y campos', instr:'En el rail configuras todo: datos, tus campos (los datos personales se detectan solos). El núcleo legal viene fijo (lo mantiene Lemon).', target:'.cn-sec[data-s="form"]'},
      {screen:'constructor.html', label:'Paso 3 · Flujo y documentos', instr:'Diseña las etapas y quién resuelve cada una (con four-eyes donde corresponda) y los documentos requeridos.', target:'.cn-sec[data-s="flujo"]'},
      {screen:'constructor.html', label:'Paso 4 · Publicar', instr:'Revisa el gate: cada campo con dato personal necesita su protección definida. Si falta, el sistema bloquea la publicación (válvula auditada por el DPO).', target:'.cn-sec[data-s="publicar"]'}
    ]},
    cobro:{title:'Cobrar una obligación', role:'cajero', steps:[
      {screen:'caja.html', label:'Paso 1 · Buscar la obligación', instr:'Busca por RUT, rol o N° de giro. La 1ª es el giro que emitió mesa de partes (Derechos de edificación). Selecciónalo.', target:'.obl'},
      {screen:'caja.html', label:'Paso 2 · Elegir medio de pago', instr:'Efectivo, tarjeta o cupón. La plataforma nunca guarda el número de tarjeta (redirect/tokenización).', target:'.opt-mini'},
      {screen:'caja.html', label:'Paso 3 · Registrar el pago', instr:'Pulsa “Registrar pago”. Entra al libro contable inmodificable (append-only) y el expediente avanza en la DOM.', target:'#cobrarBtn'},
      {screen:'caja.html', label:'Paso 4 · Cuadrar la caja', instr:'Antes del cierre, concilia con el banco y haz el arqueo (caja física vs. libro).', target:'.banner.warn'}
    ]},
    acta:{title:'Levantar un acta en terreno', role:'inspector', steps:[
      {screen:'movil.html', label:'Paso 1 · Abrir la inspección', instr:'Selecciona la inspección asignada del día desde la pestaña Terreno y pulsa «Iniciar inspección».', target:'.ph-tabbar [data-t="terreno"]'},
      {screen:'movil.html', label:'Paso 2 · Capturar evidencia', instr:'En la pestaña Acta toma foto, ubicación (geo) y escanea el QR de la obra. Todo queda sellado en origen con hora.', target:'.ph-tabbar [data-t="acta"]'},
      {screen:'movil.html', label:'Paso 3 · Firmar el acta', instr:'Firma el acta. Si no hay señal, queda en la cola de sincronización — no pierdes nada.', target:'.ph-tabbar [data-t="acta"]'},
      {screen:'movil.html', label:'Paso 4 · Sincronizar', instr:'En la pestaña Sync, al recuperar conexión se sella con hora SHOA y se envía al expediente (usa el interruptor de red para probarlo).', target:'.ph-tabbar [data-t="sync"]'}
    ]},
    gestion:{title:'Desatascar la gestión', role:'supervisor', steps:[
      {screen:'supervisor.html', label:'Paso 1 · Revisar indicadores', instr:'Mira el % digital, los tiempos y las alertas de silencio por vencer.', target:'.kpi.accent'},
      {screen:'supervisor.html', label:'Paso 2 · Ir a lo crítico', instr:'Los trámites con silencio inminente son lo urgente. Pulsa «Ver críticos» para intervenir.', target:'.banner.danger .btn'},
      {screen:'bandeja.html', label:'Paso 3 · Intervenir', instr:'Entra a la bandeja para priorizar o reasignar lo crítico.', target:'.trow'}
    ]},
    dictamen:{title:'Dictaminar una EIPD', role:'dpo', steps:[
      {screen:'eipd.html', label:'Paso 1 · Revisar el tratamiento', instr:'Verifica la finalidad, los datos y la base de licitud en las secciones 1 y 2.', target:'#eipdDesc'},
      {screen:'eipd.html', label:'Paso 2 · Evaluar riesgos y medidas', instr:'Revisa los riesgos identificados y que las medidas los mitiguen (secciones 3 y 4).', target:'#eipdRisk'},
      {screen:'eipd.html', label:'Paso 3 · Emitir el dictamen', instr:'Pulsa «Dictaminar». Sin dictamen favorable, el tratamiento de datos no se activa.', target:'.btn-primary'}
    ]},
    voto:{title:'Votar un acuerdo del Concejo', role:'concejal', steps:[
      {screen:'concejo.html', label:'Paso 1 · Abrir el punto', instr:'Revisa el punto de la tabla que está en votación.', target:'.card.pad-lg'},
      {screen:'concejo.html', label:'Paso 2 · Emitir tu voto', instr:'Vota a favor, en contra o abstención.', target:'#myVote'},
      {screen:'concejo.html', label:'Paso 3 · Ver el resultado', instr:'Tu voto queda consignado en el acta con el quórum de la sesión.', target:'#myVote'}
    ]},
    usuario:{title:'Dar de alta un usuario', role:'admin', steps:[
      {screen:'admin.html', label:'Paso 1 · Revisar municipalidades', instr:'Revisa las municipalidades activas y su aislamiento de datos.', target:'.kpi.accent'},
      {screen:'admin.html', label:'Paso 2 · Ir a Usuarios y roles', instr:'Abre la pestaña «Usuarios y roles».', target:'.pill-tab'},
      {screen:'admin.html', label:'Paso 3 · Invitar y asignar rol', instr:'Pulsa «Invitar usuario» y asigna su rol (permisos deny-by-default).', target:'.btn-primary'}
    ]},
    fiscalizar:{title:'Fiscalizar un expediente', role:'fiscalizador', steps:[
      {screen:'fiscalizacion.html', label:'Paso 1 · Filtrar por municipio', instr:'Usa la vista federada para acotar por municipio.', target:'select'},
      {screen:'fiscalizacion.html', label:'Paso 2 · Solicitar evidencia', instr:'Pulsa «Evidencia» en un expediente y funda el motivo — la consulta queda registrada en el origen.', target:'.trow button'},
      {screen:'fiscalizacion.html', label:'Paso 3 · Solo lectura', instr:'Recuerda: no puedes modificar nada; los datos sensibles se muestran minimizados.', target:'.banner.info'}
    ]}
  };
  function roleJourneyId(rid){ const k=Object.keys(JOURNEYS).find(function(id){return JOURNEYS[id].role===rid;}); return k||null; }

  /* ---------- Estilos inyectados ---------- */
  const css = `
  .fv-role{position:relative;flex-shrink:0}
  .fv-role-btn{display:flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 8px;border:1px solid var(--brand);border-radius:var(--r-2);background:var(--brand-soft);color:var(--brand-ink);font-family:var(--font-ui);font-size:var(--fs-12);font-weight:700;cursor:pointer;white-space:nowrap}
  .fv-role-btn .av{width:22px;height:22px;border-radius:var(--r-1);display:grid;place-items:center;font-size:10px;font-weight:800;color:#04130e}
  .fv-role-btn .who{display:flex;flex-direction:column;align-items:flex-start;line-height:1.15}
  .fv-role-btn .who small{font-size:9px;color:var(--text-3);font-weight:500;text-transform:uppercase;letter-spacing:.05em}
  .fv-role-btn svg{width:14px;height:14px}
  .fv-role-menu{position:absolute;top:42px;right:0;width:320px;max-width:calc(100vw - 24px);background:var(--overlay);border:1px solid var(--border-strong);border-radius:var(--r-3);box-shadow:var(--sh-lg);z-index:300;padding:6px;display:none;max-height:76vh;overflow-y:auto;overflow-x:hidden}
  .fv-role-menu.open{display:block}
  .fv-role-menu .hd{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);padding:8px;font-weight:700}
  .fv-ri{display:flex;gap:10px;align-items:flex-start;padding:9px 8px;border-radius:var(--r-2);cursor:pointer;width:100%;text-align:left;background:transparent;border:0;color:var(--text-1)}
  .fv-ri:hover{background:var(--surface-2)}
  .fv-ri.on{background:var(--brand-soft)}
  .fv-ri .av{width:28px;height:28px;border-radius:var(--r-2);display:grid;place-items:center;font-weight:800;font-size:11px;color:#04130e;flex-shrink:0}
  .fv-ri .tx{display:flex;flex-direction:column;min-width:0;flex:1}
  .fv-ri .nm{font-size:var(--fs-13);font-weight:600;white-space:normal;overflow-wrap:anywhere}
  .fv-ri .ds{font-size:var(--fs-11);color:var(--text-3);margin-top:1px;white-space:normal;overflow-wrap:anywhere;line-height:1.35}
  .fv-ri .ck{margin-left:auto;color:var(--brand);flex-shrink:0;opacity:0}
  .fv-ri.on .ck{opacity:1}
  .fv-foot{border-top:1px solid var(--border);margin-top:4px;padding:4px}
  .fv-foot button{width:100%;display:flex;align-items:center;gap:8px;padding:8px;border-radius:var(--r-2);border:0;background:transparent;color:var(--text-2);font-family:var(--font-ui);font-size:var(--fs-12);font-weight:600;cursor:pointer}
  .fv-foot button:hover{background:var(--surface-2);color:var(--text-1)}
  .fv-help{width:34px;height:34px;border-radius:var(--r-2);border:1px solid var(--border);background:var(--surface);color:var(--text-2);font-weight:800;font-size:15px;cursor:pointer;flex-shrink:0;display:grid;place-items:center}
  .fv-help:hover{color:var(--brand-ink);border-color:var(--brand)}
  .topnav-links a{position:relative}
  /* retratos ilustrados (foto de perfil) */
  .pf{border-radius:50%;object-fit:cover;background:var(--surface-2);display:block;flex-shrink:0}
  .fv-role-btn .av.pf{width:24px;height:24px;border-radius:50%;box-shadow:0 0 0 1.5px var(--border-strong)}
  .fv-ri .av.pf{width:34px;height:34px;border-radius:50%}
  .fv-onb-hero .av.pf{width:52px;height:52px;border-radius:50%;box-shadow:0 0 0 2px var(--surface),0 4px 12px rgba(0,0,0,.3)}
  .acct .avatar.pf{width:30px;height:30px}
  /* isotipo de marca + escudo comunal en el topnav */
  img.seal{width:24px;height:24px;border-radius:6px}
  .muni .crest{width:18px;height:20px;margin-right:2px}
  .muni{display:flex;align-items:center;gap:6px}

  /* onboarding + all-views modal */
  .fv-modal-bg{position:fixed;inset:0;background:rgba(4,6,5,.74);backdrop-filter:blur(4px);display:none;place-items:center;z-index:400;padding:var(--s-4)}
  .fv-modal-bg.open{display:grid}
  .fv-modal{width:100%;max-width:440px;background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r-4);box-shadow:var(--sh-lg);overflow:hidden;animation:fvpop .3s var(--ease)}
  .fv-modal.wide{max-width:620px}
  @keyframes fvpop{from{transform:translateY(10px) scale(.98);opacity:0}to{transform:none;opacity:1}}
  /* modo embebido (demo.html): shell acotado — sin selector de rol, ayuda ni bandera (no exploran todo el sistema) */
  .fv-embed .fv-role, .fv-embed .fv-help, .fv-embed .fv-flag{display:none!important}
  /* la navegación (sidebar y topnav) queda como CONTEXTO visual, no clickeable — el reproductor guía los pasos */
  .fv-embed .side .nav-item, .fv-embed .topnav-links a, .fv-embed .brand[href], .fv-embed .muni{pointer-events:none!important}
  .fv-onb-hero{padding:var(--s-5) var(--s-5) var(--s-4);background:linear-gradient(160deg,var(--brand-soft),transparent)}
  .fv-onb-hero .av{width:48px;height:48px;border-radius:var(--r-3);display:grid;place-items:center;font-weight:800;font-size:18px;color:#04130e;margin-bottom:var(--s-3)}
  .fv-onb-hero .ey{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.08em;color:var(--brand-ink);font-weight:700}
  .fv-onb-hero h3{font-size:var(--fs-25);margin-top:4px}
  .fv-onb-hero p{color:var(--text-2);margin-top:6px}
  .fv-onb-body{padding:var(--s-4) var(--s-5)}
  .fv-onb-body .lbl{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.06em;color:var(--text-3);font-weight:700;margin-bottom:var(--s-3)}
  .fv-flow{display:flex;flex-direction:column;gap:2px}
  .fv-flow .st{display:flex;gap:12px;padding:8px 0}
  .fv-flow .n{width:24px;height:24px;border-radius:50%;background:var(--brand-soft);color:var(--brand-ink);display:grid;place-items:center;font-size:var(--fs-12);font-weight:700;flex-shrink:0}
  .fv-flow .tx{font-size:var(--fs-13);color:var(--text-1);padding-top:2px}
  .fv-modal-foot{display:flex;flex-wrap:wrap;gap:8px;padding:var(--s-4) var(--s-5);border-top:1px solid var(--border);background:var(--surface-2)}
  .fv-modal-foot .btn{flex:1 1 auto;min-width:0}

  .fv-av-group{margin-bottom:var(--s-3)}
  .fv-av-group .g{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.05em;color:var(--text-3);font-weight:700;margin-bottom:6px}
  .fv-av-links{display:flex;flex-wrap:wrap;gap:6px}
  .fv-av-links a{padding:6px 10px;border:1px solid var(--border);border-radius:var(--r-2);font-size:var(--fs-12);font-weight:600;color:var(--text-1);background:var(--surface)}
  .fv-av-links a:hover{border-color:var(--brand);color:var(--brand-ink)}

  /* tour */
  .fv-spot{position:fixed;border-radius:10px;box-shadow:0 0 0 9999px rgba(4,6,5,.74);border:2px solid var(--brand);z-index:410;pointer-events:none;transition:all .32s var(--ease)}
  .fv-tip{position:fixed;z-index:411;width:310px;max-width:calc(100vw - 24px);background:var(--overlay);border:1px solid var(--border-strong);border-radius:var(--r-3);box-shadow:var(--sh-lg);padding:16px;animation:fvpop .25s var(--ease)}
  .fv-tip .ey{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.06em;color:var(--brand-ink);font-weight:700}
  .fv-tip h4{font-size:var(--fs-16);margin:4px 0 6px}
  .fv-tip p{font-size:var(--fs-13);color:var(--text-2);line-height:1.5}
  .fv-tip .bar{display:flex;align-items:center;gap:10px;margin-top:14px}
  .fv-dots{display:flex;gap:5px;flex:1}
  .fv-dots i{width:6px;height:6px;border-radius:50%;background:var(--border-strong)}
  .fv-dots i.on{background:var(--brand)}
  @media(max-width:640px){.fv-role-btn .who small{display:none}}
  `;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ---------- Utilidades ---------- */
  function file(){ const p=(location.pathname.split('/').pop()||'').trim(); return p||'index.html'; }
  function byId(id){ return ROLES.find(r=>r.id===id); }
  function ownerOf(f){ return ROLES.find(r=>r.screens.indexOf(f)>=0); }
  function esc(s){ return s; }

  const cf = file();
  // modo embebido (?embed=1): la pantalla se muestra dentro del reproductor de demo.html →
  // sin onboarding automático ni barra de proceso guiado (se vería el modal tapando la pantalla).
  const IS_EMBED = /[?&]embed=1/.test(location.search);
  if(IS_EMBED){
    // el reproductor puede fijar el rol del flujo con ?as=<rol> (p.ej. nuevo.html?embed=1&as=ciudadano)
    var _asRole=(location.search.match(/[?&]as=([a-z]+)/)||[])[1];
    if(_asRole && byId(_asRole)){ try{ localStorage.setItem('fvRole', _asRole); }catch(e){} }
    try{ document.body.classList.add('fv-embed'); }catch(e){}
    // ACOTAR: dentro de la demo NO se navega a otras pantallas/roles — el reproductor controla los pasos.
    // Se permite interactuar con el CONTENIDO del paso (formularios, pestañas, scroll); solo se
    // bloquea cualquier navegación de documento (enlaces a otra .html y botones onclick=location...).
    // 'auxclick' incluido: el clic con rueda abre el enlace en otra pestaña sin
    // disparar 'click' → sin él se puede escapar del recorrido acotado.
    var bloquearNav = function(e){
      var nav = e.target.closest && e.target.closest('a[href], [onclick]');
      if(!nav) return;
      var href = nav.getAttribute('href') || '';
      var oc = nav.getAttribute('onclick') || '';
      var navegaHref = href && href.charAt(0)!=='#' && !/^(javascript|mailto|tel):/i.test(href);
      var navegaJs = /location\s*\.\s*(href|assign|replace)|(^|[^.\w])location\s*=/.test(oc);
      if(navegaHref || navegaJs){ e.preventDefault(); e.stopPropagation(); return false; }
    };
    document.addEventListener('click', bloquearNav, true);
    document.addEventListener('auxclick', bloquearNav, true);
    // y sin menú contextual sobre enlaces no hay "abrir en pestaña nueva"
    document.addEventListener('contextmenu', function(e){
      if(e.target.closest && e.target.closest('a[href]')) e.preventDefault();
    }, true);
    // evita también el envío de formularios que redirigen de página
    document.addEventListener('submit', function(e){ e.preventDefault(); }, true);
  }
  // rol PEGAJOSO: si el rol actual posee esta pantalla, se mantiene (evita saltos en pantallas compartidas
  // como expediente/bandeja). Solo cambia al dueño si la pantalla no pertenece a tu rol.
  const stored = localStorage.getItem('fvRole') || 'funcionario';
  const storedRole = byId(stored);
  let roleId;
  if(storedRole && storedRole.screens.indexOf(cf)>=0){ roleId = stored; }
  else { const owner = ownerOf(cf); roleId = owner ? owner.id : stored; }
  localStorage.setItem('fvRole', roleId);
  const role = byId(roleId) || ROLES[0];

  /* ---------- Reconstruir la nav por rol ---------- */
  function roleShort(r){ return r.label.split(/\s*[(/]/)[0].trim().split(' ')[0]; }
  const links = document.querySelector('.topnav-links');
  if(links){
    if(cf==='index.html'){
      // landing: explorador por rol (entrada a cada mundo)
      links.innerHTML = ROLES.map(function(r){ return '<a href="'+r.home+'">'+roleShort(r)+'</a>'; }).join('');
    } else {
      // header limpio: la navegación vive en el sidebar del rol (no se duplica arriba)
      links.innerHTML = '';
    }
  }
  // SIDEBAR UNIFORME: se genera desde las pantallas del rol → idéntico en todas las vistas del rol,
  // sin cruces de rol y sin variación página a página (reemplaza los sidebars escritos a mano).
  var side = document.querySelector('.shell .side');
  if(side){
    if(role.screens.length > 1){
      // rol MULTI-pantalla → sidebar generado desde el rol, idéntico en todas sus vistas (aquí estaba la inconsistencia)
      var p = PERSON[roleId] || {n:'Usuario',s:role.label,i:'U',c:'av-a'};
      // Pantallas CONTEXTUALES (detalle/vista de un ítem): pertenecen al rol pero NO son destinos de nav.
      // Se llegan DESDE un listado o la bandeja, no desde el sidebar. Al estar en una, se resalta su listado padre.
      var CONTEXTUAL = { 'expediente.html':'expedientes.html' };
      var nav = role.screens.filter(function(h){ return IC[h] && !CONTEXTUAL[h]; }).map(function(h){
        var on = (h===cf || CONTEXTUAL[cf]===h) ? ' active' : '';
        var cnt = CNT[h] ? '<span class="count">'+CNT[h]+'</span>' : '';
        return '<a class="nav-item'+on+'" href="'+h+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">'+IC[h]+'</svg>'+(SCREEN_LABEL[h]||h)+cnt+'</a>';
      }).join('');
      side.innerHTML =
        '<div class="grp">'+nav+'</div>'+
        '<div class="spacer"></div>'+
        '<div class="acct">'+avatar(roleId,'avatar')+'<div style="flex:1;min-width:0"><div style="font-size:var(--fs-12);font-weight:600">'+p.n+'</div><div class="tiny dim">'+p.s+'</div></div></div>';
    } else {
      // rol de UNA pantalla → conservar sus secciones internas, pero quitar cualquier ítem que cruce a otro rol
      side.querySelectorAll('a.nav-item').forEach(function(a){
        var href=a.getAttribute('href');
        if(href && href.indexOf('.html')>=0 && role.screens.indexOf(href)<0){ a.remove(); }
      });
      side.querySelectorAll('.grp').forEach(function(g){ if(!g.querySelector('.nav-item')) g.remove(); });
    }
    // retrato en el acct del sidebar también para roles de una sola pantalla (acct escrito a mano)
    side.querySelectorAll('.acct .avatar').forEach(function(a){
      if(a.tagName.toLowerCase()==='img') return;
      var im=document.createElement('img'); im.className='pf avatar'; im.src=AV[roleId]||AV.funcionario; im.alt='';
      a.replaceWith(im);
    });
  }

  // Pre-llenado con ClaveÚnica: si un CIUDADANO ingresa un trámite, no le volvemos a pedir su identidad
  if(cf==='nuevo.html' && roleId==='ciudadano'){
    var _rut=document.getElementById('rut');
    if(_rut){ _rut.value='12.345.678-9'; _rut.setAttribute('readonly',''); _rut.style.opacity='.8'; }
    var _s2=document.querySelector('[data-step="2"]');
    if(_s2){
      var _nom=_s2.querySelector('.g-2 .field input');
      if(_nom){ _nom.value='María González'; _nom.setAttribute('readonly',''); _nom.style.opacity='.8'; }
      var _mail=_s2.querySelectorAll('.g-2 .field input')[1];
      if(_mail){ _mail.value='maria.gonzalez@correo.cl'; }
      var _panel=_s2.querySelector('.wiz-panel');
      if(_panel){
        var _note=document.createElement('div');
        _note.className='banner brand'; _note.style.marginBottom='var(--s-4)';
        _note.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><div class="b-body"><b>Identificado con ClaveÚnica</b><p>Tus datos vienen de tu ClaveÚnica; no necesitas volver a ingresarlos.</p></div>';
        _panel.insertBefore(_note, _panel.firstChild);
      }
    }
  }

  /* ---------- Controles en topnav-right ---------- */
  const right = document.querySelector('.topnav-right');
  if(right){
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;align-items:center;gap:8px';
    // role selector
    const rl=document.createElement('div'); rl.className='fv-role';
    rl.innerHTML =
      '<button class="fv-role-btn" id="fvRoleBtn" aria-haspopup="true">'+
        avatar(roleId,'av')+
        '<span class="who"><small>Viendo como</small><b>'+role.label+'</b></span>'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>'+
      '</button>'+
      '<div class="fv-role-menu" id="fvRoleMenu">'+
        '<div class="hd">Explorar como…</div>'+
        ROLES.map(function(r){
          return '<button class="fv-ri'+(r.id===roleId?' on':'')+'" data-r="'+r.id+'">'+
            avatar(r.id,'av')+
            '<span class="tx"><span class="nm">'+r.label+'</span><span class="ds">'+r.desc+'</span></span>'+
            '<svg class="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" style="width:16px;height:16px"><path d="M20 6L9 17l-5-5"/></svg>'+
          '</button>';
        }).join('')+
        '<div class="fv-foot"><button id="fvAllBtn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Ver todas las pantallas</button></div>'+
      '</div>';
    // theme toggle
    const th=document.createElement('button'); th.className='fv-theme'; th.id='fvTheme'; th.title='Cambiar modo claro/oscuro';
    th.innerHTML = currentTheme()==='light'?MOON:SUN;
    th.addEventListener('click',function(){ const next=currentTheme()==='light'?'dark':'light'; applyTheme(next); th.innerHTML=next==='light'?MOON:SUN; });
    // help
    const help=document.createElement('button'); help.className='fv-help'; help.id='fvHelp'; help.title='¿Cómo funciona?'; help.textContent='?';
    wrap.appendChild(rl); wrap.appendChild(th); wrap.appendChild(help);
    right.insertBefore(wrap, right.firstChild);
  }
  /* bandera de Chile junto a la marca (ambiente gobierno) */
  const brandEl=document.querySelector('.topnav .brand');
  if(brandEl && !document.querySelector('.fv-flag')){ brandEl.insertAdjacentHTML('afterend', CL_FLAG); }
  /* isotipo de producto en la marca (reemplaza el sello dibujado a mano) */
  var sealEl=document.querySelector('.brand .seal');
  if(sealEl && sealEl.tagName.toLowerCase()!=='img'){ var im=document.createElement('img'); im.className='seal'; im.src='assets/brand/isotipo.svg'; im.alt=''; sealEl.replaceWith(im); }
  /* escudo de la comuna en el chip de municipio (multi-tenant, real) */
  var COMUNA_CREST={'Ñuñoa':'nunoa','Providencia':'providencia','Maipú':'maipu','Santiago':'santiago'};
  document.querySelectorAll('.muni .dot').forEach(function(dot){
    var name=(dot.parentElement.textContent||'').replace(/\s+/g,' ').trim();
    var key=Object.keys(COMUNA_CREST).find(function(c){return name.indexOf(c)>=0;});
    var crest=document.createElement('img'); crest.className='crest'; crest.alt='';
    crest.src='assets/comunas/'+(key?COMUNA_CREST[key]:'generico')+'.svg'; dot.replaceWith(crest);
  });
  /* cabecera de identidad en el sidebar — TODOS los roles la muestran (pedido explícito).
     Roles ligados a una comuna → escudo comunal + "Municipalidad de X".
     Roles cross-tenant (admin plataforma, fiscalizador federado, ciudadano) → escudo comunal
     de la comuna en contexto + rótulo del ámbito (no se les inventa una sola comuna en el nombre). */
  (function(){
    var sb=document.querySelector('.shell .side'); if(!sb) return;
    if(sb.querySelector('.side-muni')) return;
    var CN={nunoa:'Ñuñoa',providencia:'Providencia',maipu:'Maipú',santiago:'Santiago'};
    var mt=(document.querySelector('.topnav .muni')||{}).textContent||'';
    var key=Object.keys(CN).find(function(k){return mt.indexOf(CN[k])>=0;})||'nunoa';
    var CROSS={
      admin:['assets/comunas/'+key+'.svg','Plataforma Lemon','Todas las municipalidades'],
      fiscalizador:['assets/comunas/'+key+'.svg','Fiscalización','Vista federada · Contraloría'],
      ciudadano:['assets/comunas/'+key+'.svg','Portal ciudadano','Mis trámites municipales']
    };
    var h=document.createElement('div'); h.className='side-muni';
    if(CROSS[roleId]){
      h.innerHTML='<img src="'+CROSS[roleId][0]+'" alt=""><div class="tx"><div class="nm">'+CROSS[roleId][1]+'</div><div class="rg">'+CROSS[roleId][2]+'</div></div>';
    } else {
      h.innerHTML='<img src="assets/comunas/'+key+'.svg" alt=""><div class="tx"><div class="nm">Municipalidad de '+CN[key]+'</div><div class="rg">Región Metropolitana</div></div>';
    }
    sb.insertBefore(h, sb.firstChild);
  })();

  /* Conmutador de vistas internas para roles de UNA sola pantalla:
     un nav-item[data-view] muestra la sección [data-view-panel] correspondiente y oculta las demás.
     Evita el patrón roto de ítems de sidebar que apuntaban a su propia página sin mostrar nada. */
  (function(){
    var items=document.querySelectorAll('.shell .side .nav-item[data-view]');
    if(!items.length) return;
    var panels=document.querySelectorAll('[data-view-panel]');
    function show(v){
      items.forEach(function(x){ x.classList.toggle('active', x.getAttribute('data-view')===v); });
      panels.forEach(function(p){ p.classList.toggle('hide', p.getAttribute('data-view-panel')!==v); });
      try{ history.replaceState(null,'','#'+v); }catch(e){}
      window.scrollTo(0,0);
    }
    items.forEach(function(it){ it.addEventListener('click', function(e){ e.preventDefault(); show(it.getAttribute('data-view')); }); });
    var initial=(location.hash||'').replace('#','');
    var has=Array.prototype.some.call(items, function(x){ return x.getAttribute('data-view')===initial; });
    show(has? initial : items[0].getAttribute('data-view'));
  })();
  function initials(label){ const m=label.replace(/\(.*/,'').trim().split(/\s+/).filter(function(w){return w && /[0-9a-zA-ZÁÉÍÓÚÑáéíóúñ]/.test(w[0]);}); return ((m[0]?m[0][0]:'')+(m[1]?m[1][0]:'')).toUpperCase(); }

  /* ---------- Menú de rol ---------- */
  const roleBtn=document.getElementById('fvRoleBtn'), roleMenu=document.getElementById('fvRoleMenu');
  if(roleBtn){
    roleBtn.addEventListener('click',function(e){ e.stopPropagation(); roleMenu.classList.toggle('open'); });
    document.addEventListener('click',function(){ roleMenu.classList.remove('open'); });
    roleMenu.addEventListener('click',function(e){ e.stopPropagation(); });
    roleMenu.querySelectorAll('.fv-ri').forEach(function(b){
      b.addEventListener('click',function(){
        const r=byId(b.dataset.r); localStorage.setItem('fvRole',r.id); location.href=r.home;
      });
    });
    document.getElementById('fvAllBtn').addEventListener('click',openAll);
  }

  /* ---------- Modal "todas las pantallas" ---------- */
  const allBg=document.createElement('div'); allBg.className='fv-modal-bg'; allBg.id='fvAllBg';
  allBg.innerHTML='<div class="fv-modal wide"><div class="fv-onb-hero" style="background:var(--surface-2);padding:var(--s-4) var(--s-5)"><div class="row" style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-size:var(--fs-20)">Todas las pantallas</h3><button class="fv-help" id="fvAllX" style="border:0;background:transparent">✕</button></div><p style="margin-top:2px">Prototipo de demostración · 15 pantallas por rol</p></div><div class="fv-onb-body" id="fvAllBody"></div></div>';
  document.body.appendChild(allBg);
  document.getElementById('fvAllBody').innerHTML = ROLES.map(function(r){
    return '<div class="fv-av-group"><div class="g">'+r.label+'</div><div class="fv-av-links">'+
      r.screens.map(function(h){ return '<a href="'+h+'">'+(SCREEN_LABEL[h]||h)+'</a>'; }).join('')+
      '</div></div>';
  }).join('');
  function openAll(){ roleMenu&&roleMenu.classList.remove('open'); allBg.classList.add('open'); }
  allBg.addEventListener('click',function(e){ if(e.target===allBg) allBg.classList.remove('open'); });
  document.getElementById('fvAllX').addEventListener('click',function(){ allBg.classList.remove('open'); });

  /* ---------- Onboarding ---------- */
  const onbBg=document.createElement('div'); onbBg.className='fv-modal-bg'; onbBg.id='fvOnbBg';
  onbBg.innerHTML =
    '<div class="fv-modal">'+
      '<div class="fv-onb-hero">'+avatar(roleId,'av')+
        '<div class="ey">Bienvenido/a · rol de demostración</div><h3>'+role.label+'</h3><p>'+role.desc+'.</p></div>'+
      '<div class="fv-onb-body"><div class="lbl">Tu flujo de trabajo</div><div class="fv-flow">'+
        role.flow.map(function(s,i){ return '<div class="st"><span class="n">'+(i+1)+'</span><span class="tx">'+s+'</span></div>'; }).join('')+
      '</div></div>'+
      '<div class="fv-modal-foot"><button class="btn btn-ghost" id="fvOnbSkip">Explorar solo</button><button class="btn btn-secondary" id="fvOnbTour">Conocer la pantalla</button>'+(roleJourneyId(roleId)?'<button class="btn btn-primary" id="fvOnbJourney"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>Empezar paso a paso</button>':'')+'</div>'+
    '</div>';
  document.body.appendChild(onbBg);
  document.getElementById('fvOnbSkip').addEventListener('click',function(){ onbBg.classList.remove('open'); });
  document.getElementById('fvOnbTour').addEventListener('click',function(){ onbBg.classList.remove('open'); startTour(); });
  var _ojb=document.getElementById('fvOnbJourney'); if(_ojb) _ojb.addEventListener('click',function(){ onbBg.classList.remove('open'); startJourney(roleJourneyId(roleId)); });
  onbBg.addEventListener('click',function(e){ if(e.target===onbBg) onbBg.classList.remove('open'); });

  if(!IS_EMBED && cf!=='index.html' && !localStorage.getItem('fvOnb_'+roleId)){
    localStorage.setItem('fvOnb_'+roleId,'1');
    setTimeout(function(){ onbBg.classList.add('open'); }, 450);
  }

  /* ---------- Motor de tour ---------- */
  const help2=document.getElementById('fvHelp');
  if(help2) help2.addEventListener('click',function(){ onbBg.classList.add('open'); });

  let steps=[], idx=0, spot, tip;
  function startTour(){
    steps=(TOURS[cf]||[]).filter(function(s){ return document.querySelector(s.sel); });
    if(!steps.length){ onbBg.classList.add('open'); return; }
    idx=0; buildTourEls(); showStep();
  }
  function buildTourEls(){
    if(spot) return;
    spot=document.createElement('div'); spot.className='fv-spot'; spot.style.display='none';
    tip=document.createElement('div'); tip.className='fv-tip'; tip.style.display='none';
    document.body.appendChild(spot); document.body.appendChild(tip);
  }
  function endTour(){ if(spot)spot.style.display='none'; if(tip)tip.style.display='none'; }
  function showStep(){
    const s=steps[idx]; const el=document.querySelector(s.sel);
    if(!el){ next(); return; }
    el.scrollIntoView({block:'center',behavior:'smooth'});
    setTimeout(function(){
      const r=el.getBoundingClientRect(); const pad=6;
      spot.style.display='block';
      spot.style.top=(r.top-pad)+'px'; spot.style.left=(r.left-pad)+'px';
      spot.style.width=(r.width+pad*2)+'px'; spot.style.height=(r.height+pad*2)+'px';
      tip.style.display='block';
      tip.innerHTML='<div class="ey">Paso '+(idx+1)+' de '+steps.length+'</div><h4>'+s.t+'</h4><p>'+s.d+'</p>'+
        '<div class="bar"><div class="fv-dots">'+steps.map(function(_,i){return '<i class="'+(i===idx?'on':'')+'"></i>';}).join('')+'</div>'+
        (idx>0?'<button class="btn btn-ghost btn-sm" id="fvPrev">Atrás</button>':'')+
        '<button class="btn btn-secondary btn-sm" id="fvSkip">Saltar</button>'+
        '<button class="btn btn-primary btn-sm" id="fvNext">'+(idx===steps.length-1?'Terminar':'Siguiente')+'</button></div>';
      // position tip: below target if room, else above
      const th=tip.offsetHeight, tw=tip.offsetWidth, vh=window.innerHeight, vw=window.innerWidth;
      let top=r.bottom+12; if(top+th>vh-8) top=Math.max(8, r.top-th-12);
      let left=r.left; if(left+tw>vw-8) left=vw-tw-8; if(left<8) left=8;
      tip.style.top=top+'px'; tip.style.left=left+'px';
      const nx=document.getElementById('fvNext'); nx&&nx.addEventListener('click',next);
      const pv=document.getElementById('fvPrev'); pv&&pv.addEventListener('click',prev);
      const sk=document.getElementById('fvSkip'); sk&&sk.addEventListener('click',endTour);
    },320);
  }
  function next(){ if(idx>=steps.length-1){ endTour(); return; } idx++; showStep(); }
  function prev(){ if(idx>0){ idx--; showStep(); } }
  window.addEventListener('keydown',function(e){ if(tip&&tip.style.display==='block'){ if(e.key==='Escape')endTour(); if(e.key==='ArrowRight')next(); if(e.key==='ArrowLeft')prev(); } });
  window.addEventListener('resize',function(){ if(tip&&tip.style.display==='block')showStep(); });

  // expose for debugging / external triggers
  window.fvStartTour=startTour;

  /* ============================================================
     Procesos guiados — barra persistente que guía la TAREA a través de pantallas
     ============================================================ */
  var jcss = document.createElement('style');
  jcss.textContent = ''+
  '.fv-jbar{position:fixed;left:0;right:0;bottom:0;z-index:390;background:var(--overlay);border-top:2px solid var(--brand);box-shadow:0 -10px 30px rgba(0,0,0,.5);display:flex;align-items:center;gap:16px;padding:12px 20px;animation:fvup .32s var(--ease)}'+
  '@keyframes fvup{from{transform:translateY(110%)}to{transform:none}}'+
  '.fv-jbar .lead{display:flex;flex-direction:column;line-height:1.2;white-space:nowrap;padding-right:16px;border-right:1px solid var(--border)}'+
  '.fv-jbar .lead .t{font-size:var(--fs-11);text-transform:uppercase;letter-spacing:.06em;color:var(--brand-ink);font-weight:700}'+
  '.fv-jbar .lead .s{font-size:var(--fs-12);color:var(--text-2);font-weight:600}'+
  '.fv-jbar .dots{display:flex;gap:6px;flex-shrink:0}'+
  '.fv-jbar .dots i{width:8px;height:8px;border-radius:50%;background:var(--border-strong)}'+
  '.fv-jbar .dots i.on{background:var(--brand);box-shadow:0 0 0 3px var(--brand-soft)}'+
  '.fv-jbar .dots i.done{background:var(--brand);opacity:.55}'+
  '.fv-jbar .step{flex:1;min-width:0}'+
  '.fv-jbar .step b{font-size:var(--fs-13);color:var(--text-1)}'+
  '.fv-jbar .step p{font-size:var(--fs-12);color:var(--text-2);margin-top:1px}'+
  '.fv-jbar .acts{display:flex;gap:8px;flex-shrink:0}'+
  '.fv-jbar .step .hint{display:inline-flex;align-items:center;gap:5px;margin-top:4px;font-size:var(--fs-11);font-weight:700;color:var(--brand-ink)}'+
  '.fv-jbar .step .hint svg{width:13px;height:13px}'+
  /* anillo pulsante que señala DÓNDE hacer clic en el paso actual */
  '.fv-jhl{position:fixed;z-index:388;pointer-events:none;border:2.5px solid var(--brand);border-radius:10px;transition:top .25s var(--ease),left .25s var(--ease),width .25s var(--ease),height .25s var(--ease);animation:fvjpulse 1.5s ease-in-out infinite}'+
  /* mientras persigue al objetivo (scroll en curso) el anillo va SIN transición: con
     ella se arrastra 250ms por detrás y se lee como si estuviera pegado en otro sitio.
     Al detenerse recupera la transición para los reajustes finos posteriores. */
  '.fv-jhl.tracking{transition:none}'+
  '@media(prefers-reduced-motion:reduce){.fv-jhl{transition:none;animation:none}}'+
  '@keyframes fvjpulse{0%,100%{box-shadow:0 0 0 3px var(--brand-glow),0 0 12px 2px var(--brand-glow)}50%{box-shadow:0 0 0 7px transparent,0 0 22px 7px var(--brand-glow)}}'+
  '.fv-jhl .tag{position:absolute;top:-12px;left:12px;background:var(--brand);color:var(--text-on-brand);font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 9px;border-radius:999px;white-space:nowrap;box-shadow:var(--sh-sm)}'+
  '@media(max-width:760px){.fv-jbar{flex-wrap:wrap;gap:8px}.fv-jbar .step{flex-basis:100%;order:3}}';
  document.head.appendChild(jcss);

  /* ---- resaltado del objetivo del paso guiado (anillo "haz clic aquí") ---- */
  var _jhl=null,_jhlEl=null,_jhlBound=false,_jhlRaf=0,_jhlRO=null;
  function _posJhl(){ if(!_jhl||!_jhlEl)return; var r=_jhlEl.getBoundingClientRect(); if(r.width===0&&r.height===0){ _jhl.style.display='none'; return; } _jhl.style.display='block'; var p=6; _jhl.style.top=(r.top-p)+'px'; _jhl.style.left=(r.left-p)+'px'; _jhl.style.width=(r.width+p*2)+'px'; _jhl.style.height=(r.height+p*2)+'px'; }
  /* PERSEGUIR el objetivo hasta que se detiene, en vez de apostar a un timeout fijo.
     `scrollIntoView({behavior:'smooth'})` es ASÍNCRONO y su duración depende de la
     distancia, del equipo y del contenido que aún esté reflowando (la pantalla del
     iframe carga después). Con un setTimeout fijo el anillo se quedaba clavado a mitad
     de camino y solo se recolocaba cuando el usuario scrolleaba a mano — el bug real.
     Aquí se reposiciona en cada frame hasta que el rect no cambia durante 3 frames
     seguidos (o se agota el tope de seguridad), así acompaña al scroll de principio a fin. */
  function _trackJhl(){
    cancelAnimationFrame(_jhlRaf);
    var quietos=0, last=null, t0=(window.performance&&performance.now)?performance.now():Date.now();
    if(_jhl) _jhl.classList.add('tracking');   // sin transición mientras persigue: si no, va por detrás
    (function step(){
      if(!_jhl||!_jhlEl) return;
      _posJhl();
      var r=_jhlEl.getBoundingClientRect();
      var key=Math.round(r.top)+':'+Math.round(r.left)+':'+Math.round(r.width)+':'+Math.round(r.height);
      quietos = (key===last) ? quietos+1 : 0;
      last=key;
      var ahora=(window.performance&&performance.now)?performance.now():Date.now();
      // 3 frames sin moverse = el scroll terminó · 2s = tope duro por si algo anima sin fin
      if(quietos>=3 || (ahora-t0)>2000){ if(_jhl) _jhl.classList.remove('tracking'); return; }
      _jhlRaf=requestAnimationFrame(step);
    })();
  }
  function clearHighlight(){
    cancelAnimationFrame(_jhlRaf); _jhlRaf=0;
    if(_jhlRO){ try{ _jhlRO.disconnect(); }catch(e){} _jhlRO=null; }
    if(_jhl){ _jhl.remove(); _jhl=null; } _jhlEl=null;
    if(_jhlBound){ window.removeEventListener('scroll',_posJhl,true); window.removeEventListener('resize',_posJhl); _jhlBound=false; }
  }
  function highlightTarget(sel, tag){
    clearHighlight(); if(!sel) return false;
    // sel puede ser una LISTA de selectores: se usa el primero que exista y sea
    // visible (una misma pantalla cambia de controles según el rol o el paso).
    if(Object.prototype.toString.call(sel)==='[object Array]'){
      for(var i=0;i<sel.length;i++){ if(highlightTarget(sel[i], tag)) return true; }
      return false;
    }
    var el; try{ el=document.querySelector(sel); }catch(e){ return false; }
    if(!el) return false;
    // un objetivo sin caja (oculto en este paso) no se puede señalar: que el
    // llamador lo sepa y pruebe otro selector en vez de dibujar un anillo invisible.
    if(!el.getClientRects().length) return false;
    _jhlEl=el; _jhl=document.createElement('div'); _jhl.className='fv-jhl';
    _jhl.innerHTML='<span class="tag"></span>'; _jhl.firstChild.textContent = tag || 'Haz clic aquí';
    document.body.appendChild(_jhl);
    try{ el.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
    _posJhl(); _trackJhl();
    window.addEventListener('scroll',_posJhl,true); window.addEventListener('resize',_posJhl); _jhlBound=true;
    // Segunda línea de defensa: el layout también cambia SIN scroll (una imagen que
    // carga, un acordeón que se abre, la fuente que reemplaza al fallback). Sin esto,
    // el anillo quedaría desalineado hasta que el usuario scrollee.
    if(window.ResizeObserver){
      try{
        _jhlRO=new ResizeObserver(function(){ _posJhl(); });
        _jhlRO.observe(el); _jhlRO.observe(document.documentElement);
      }catch(e){ _jhlRO=null; }
    }
    return true;
  }

  function getJourney(){ try{ return JSON.parse(localStorage.getItem('fvJourney')||'null'); }catch(e){ return null; } }
  function setJourney(j){ if(j){ localStorage.setItem('fvJourney', JSON.stringify(j)); } else { localStorage.removeItem('fvJourney'); } }
  function startJourney(id){ if(!JOURNEYS[id])return; setJourney({id:id, step:0}); var s0=JOURNEYS[id].steps[0].screen; if(s0===cf){ renderJbar(); } else { location.href=s0; } }
  function exitJourney(){ setJourney(null); clearHighlight(); var b=document.getElementById('fvJbar'); if(b) b.remove(); document.body.style.paddingBottom=''; }
  function advanceJourney(){ var j=getJourney(); if(!j)return; var J=JOURNEYS[j.id]; if(j.step>=J.steps.length-1){ completeJourney(); return; } j.step++; setJourney(j); var st=J.steps[j.step]; if(st.screen!==cf){ location.href=st.screen; } else { renderJbar(); } }
  function completeJourney(){ setJourney(null); clearHighlight(); var bar=ensureBar(); bar.innerHTML =
    '<div class="lead"><span class="t">Proceso completado</span><span class="s">Recorriste el flujo de punta a punta</span></div>'+
    '<div class="step"><b>¡Listo! Completaste el proceso guiado.</b><p>Ya conoces el camino: puedes repetirlo o probar otro rol.</p></div>'+
    '<div class="acts"><button class="btn btn-primary btn-sm" id="fvJdone">Cerrar</button></div>';
    document.getElementById('fvJdone').onclick=exitJourney;
  }
  function ensureBar(){ var bar=document.getElementById('fvJbar'); if(!bar){ bar=document.createElement('div'); bar.id='fvJbar'; bar.className='fv-jbar'; document.body.appendChild(bar); } document.body.style.paddingBottom='84px'; return bar; }
  function renderJbar(){
    var j=getJourney(); if(!j||!JOURNEYS[j.id]) return; var J=JOURNEYS[j.id]; var st=J.steps[j.step];
    var onScreen = st.screen===cf; var bar=ensureBar();
    // resaltar el contenedor a clickear en este paso (solo si estamos en la pantalla del paso)
    var highlighted = onScreen ? highlightTarget(st.target) : (clearHighlight(),false);
    var hint = highlighted ? '<span class="hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11V6a2 2 0 114 0v5m0 0V4a2 2 0 114 0v7m0 0V7a2 2 0 114 0v9a6 6 0 01-6 6h-2a6 6 0 01-5.5-3.6L5 15a2 2 0 013.3-2.3L10 14"/></svg>Sigue el área resaltada «Haz clic aquí»</span>' : '';
    bar.innerHTML =
      '<div class="lead"><span class="t">Proceso guiado</span><span class="s">'+J.title+'</span></div>'+
      '<div class="dots">'+J.steps.map(function(_,i){ return '<i class="'+(i<j.step?'done':i===j.step?'on':'')+'"></i>'; }).join('')+'</div>'+
      '<div class="step"><b>'+st.label+'</b><p>'+st.instr+'</p>'+hint+'</div>'+
      '<div class="acts">'+
        (onScreen
          ? '<button class="btn btn-primary btn-sm" id="fvJnext">'+(j.step===J.steps.length-1?'Finalizar proceso':'Hecho · siguiente paso')+'</button>'
          : '<button class="btn btn-primary btn-sm" id="fvJgo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>Ir a este paso</button>')+
        '<button class="btn btn-ghost btn-sm" id="fvJexit">Salir</button>'+
      '</div>';
    var go=document.getElementById('fvJgo'); if(go) go.onclick=function(){ location.href=st.screen; };
    var nx=document.getElementById('fvJnext'); if(nx) nx.onclick=advanceJourney;
    document.getElementById('fvJexit').onclick=exitJourney;
  }
  window.fvStartJourney=startJourney;
  // El reproductor de la demo (demo.html) dirige el resaltado DENTRO del iframe:
  // mismo origen → llama a estas dos funciones sobre contentWindow en cada paso.
  window.fvHighlight=highlightTarget;
  window.fvClearHighlight=clearHighlight;

  // añadir lanzador de procesos guiados al pie del menú de rol
  (function(){
    var foot=roleMenu&&roleMenu.querySelector('.fv-foot'); var rj=roleJourneyId(roleId);
    if(foot&&rj){ var b=document.createElement('button'); b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:16px;height:16px"><path d="M9 6l6 6-6 6"/></svg>Empezar proceso guiado';
      b.addEventListener('click',function(){ roleMenu.classList.remove('open'); startJourney(rj); }); foot.appendChild(b); }
  })();

  // si hay un proceso en curso, mostrar la barra
  if(!IS_EMBED && getJourney()) renderJbar();
})();
