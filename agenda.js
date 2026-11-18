/* Agenda Cultural Lugo (pestaña «Agenda Cultural Lugo»). Regla de Marta (14-nov): sin enlaces a empresas;
   de cada acto solo nombre, sitio, hora y un teléfono público para reservar. La app enseña los actos de hoy en adelante.
   d: día (AAAA-MM-DD) · h: hora · t: nombre del acto · l: sitio · tel: teléfono para reservar · tel2: otro teléfono (opcional) */
window.AGENDA_ACT = "2026-11-16";
const TEL_CONCELLO = {tel:"010", tel2:"982 297 350"}; // Concello de Lugo: 010; desde fuera de Lugo 982 297 350
const TEL_DEPUTACION = {tel:"982 260 000"};
const TEL_CIRCULO = {tel:"982 225 456"}; // Círculo das Artes, oficina (11:00-13:00 y 16:30-20:30)
window.AGENDA = [
  {d:"2026-11-16", h:"19:30", t:"Club Cultural Valle Inclán: ciclo «Cine alemán»", tgl:"Club Cultural Valle Inclán: ciclo «Cine alemán»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-17", h:"19:30", t:"Película «Gattaca»", tgl:"Proxección do filme «Gattaca»", l:"Casa do Saber (Diputación)", lgl:"Casa do Saber (Deputación)", ...TEL_DEPUTACION},
  {d:"2026-11-19", h:"18:00", t:"«Nube de algodón» (para niños)", tgl:"«Nube de algodón» (para nenos)", l:"Museo MIHL", ...TEL_CONCELLO},
  {d:"2026-11-19", h:"20:30", t:"Teatro: «Crónica do rei pasmado»", tgl:"Teatro: «Crónica do rei pasmado»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-11-22", h:"18:30", t:"Danza: «Únicos» (a partir de 3 años)", tgl:"Danza: «Únicos» (a partir de 3 anos)", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-11-26", h:"18:00", t:"«A máquina do tempo» (a partir de 4 años)", tgl:"«A máquina do tempo» (a partir de 4 anos)", l:"Biblioteca Municipal", ...TEL_CONCELLO},
  {d:"2026-12-03", h:"20:30", t:"Teatro: «Black Box, unha saga épica»", tgl:"Teatro: «Black Box, unha saga épica»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-12-10", h:"18:00", t:"«Nadal cheo de contos» (cuentos de Navidad)", tgl:"«Nadal cheo de contos» (contos de Nadal)", l:"Biblioteca Municipal", ...TEL_CONCELLO},
  {d:"2026-11-21", h:"Por confirmar", t:"Fiesta de los 80, abierta a todos (socios del Círculo gratis, resto 15 €)", tgl:"Festa dos 80, aberta a todos (socios do Círculo de balde, resto 15 €)", l:"Círculo das Artes (Praza Maior, 23), Salón Regio", ...TEL_CIRCULO},
  {d:"2026-11-22", h:"Por confirmar", t:"Salón do Viño, con bodegueros de la zona", tgl:"Salón do Viño, con adegueiros da zona", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-24", h:"19:00", t:"Speak and Coffee: conversación en inglés", tgl:"Speak and Coffee: conversa en inglés", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-25", h:"20:00", t:"Charla y cata de miel gallega «Do trobo á mesa» (solo socios del Círculo, 20 €)", tgl:"Charla e cata de mel galego «Do trobo á mesa» (só socios do Círculo, 20 €)", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-27", h:"16:15, 17:45 y 19:15", t:"Chikichef: taller de cocina para niños (solo socios del Círculo, 6 €)", tgl:"Chikichef: obradoiro de cociña para nenos (só socios do Círculo, 6 €)", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-28", h:"10:00, 11:30 y 13:00", t:"Chikichef: taller de cocina para niños (solo socios del Círculo, 6 €)", tgl:"Chikichef: obradoiro de cociña para nenos (só socios do Círculo, 6 €)", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-12-01", h:"20:30", t:"Club do Viño: cata de vinos", tgl:"Club do Viño: cata de viños", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-12-29", h:"19:00", t:"Speak and Coffee: conversación en inglés", tgl:"Speak and Coffee: conversa en inglés", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-18", h:"18:00", t:"Charla de arqueología: «As orixes da Ribeira Sacra» (II Xornadas de Arqueoloxía Lucense)", tgl:"Charla de arqueoloxía: «As orixes da Ribeira Sacra» (II Xornadas de Arqueoloxía Lucense)", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-18", h:"20:15", t:"Presentación del libro «Fran Pérez, NARF. Canto sentido»", tgl:"Presentación do libro «Fran Pérez, NARF. Canto sentido»", l:"Casa do Saber (Diputación)", lgl:"Casa do Saber (Deputación)", ...TEL_DEPUTACION},
  {d:"2026-11-20", h:"20:00", t:"Concierto de piano: Judith Jáuregui", tgl:"Concerto de piano: Judith Jáuregui", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-21", h:"11:00 a 14:00", t:"Curso de prevención del ictus y atención temprana, de nuestra asociación, con Cruz Roja. Inscripción en la pestaña Cursos de la app, hasta el jueves 19 de noviembre", tgl:"Curso de prevención do ictus e atención temperá, da nosa asociación, con Cruz Vermella. Inscrición na pestana Cursos da app, ata o xoves 19 de novembro", l:"O Vello Cárcere"},
  {d:"2026-11-21", h:"19:00 a 22:00", t:"Showroom de Arela Deco (2.ª edición). Lo organiza Patricia, vecina y socia. Actividades infantiles: taller de globoflexia y papiroflexia, impartido por Charo Jiménez Rico y Sergio Lorenzana Cubas, y merienda para los peques. Inscripción previa, gratuita y con aforo limitado, en el teléfono 667 582 636", tgl:"Showroom de Arela Deco (2.ª edición). Organízao Patricia, veciña e socia. Actividades infantís: obradoiro de globoflexia e papiroflexia, impartido por Charo Jiménez Rico e Sergio Lorenzana Cubas, e merenda para os cativos. Inscrición previa, de balde e con aforo limitado, no teléfono 667 582 636", l:"Cafetería Ateneo", tel:"667 582 636"},
  {d:"2026-11-27", h:"Por confirmar", t:"Torneo de videojuegos (FC 27) para jóvenes de 12 a 26 años (solo socios del Círculo, gratis; inscripción hasta el 20 de noviembre)", tgl:"Torneo de videoxogos (FC 27) para mozos de 12 a 26 anos (só socios do Círculo, de balde; inscrición ata o 20 de novembro)", l:"Círculo das Artes (Praza Maior, 23), Espacio Joven", ...TEL_CIRCULO}
];
