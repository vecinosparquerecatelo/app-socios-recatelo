/* Agenda Cultural Lugo (pestaña «Agenda Cultural Lugo»). Regla de Marta (14-nov): sin enlaces a empresas;
   de cada acto solo nombre, sitio, hora y un teléfono público para reservar. La app enseña los actos de hoy en adelante.
   d: día (AAAA-MM-DD) · h: hora · t: nombre del acto · l: sitio · tel: teléfono para reservar · tel2: otro teléfono (opcional) */
window.AGENDA_ACT = "2026-11-26";
const TEL_CONCELLO = {tel:"010", tel2:"982 297 350"}; // Concello de Lugo: 010; desde fuera de Lugo 982 297 350
const TEL_DEPUTACION = {tel:"982 260 000"};
const TEL_CIRCULO = {tel:"982 225 456"}; // Círculo das Artes, oficina (11:00-13:00 y 16:30-20:30)
window.AGENDA = [
  // Marta, 24-nov: lo organiza una socia; mantener hasta que pase (no quitar en las puestas al día)
  {d:"2026-11-27", h:"19:00", t:"Entrega de premios del II Certamen Fotográfico Kósima Llamas, «Visiones de un instante». Lo organiza nuestra vecina y socia Pilar Llamas.", tgl:"Entrega de premios do II Certame Fotográfico Kósima Llamas, «Visiones de un instante». Organízao a nosa veciña e socia Pilar Llamas.", l:"Biblioteca Pública de Lugo"},
  {d:"2026-11-26", h:"18:00", t:"«A máquina do tempo» (a partir de 4 años; entradas agotadas)", tgl:"«A máquina do tempo» (a partir de 4 anos; entradas esgotadas)", l:"Museo MIHL", ...TEL_CONCELLO},
  {d:"2026-12-03", h:"20:30", t:"Teatro: «Black Box, unha saga épica»", tgl:"Teatro: «Black Box, unha saga épica»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-12-10", h:"18:00", t:"«Nadal cheo de contos» (cuentos de Navidad)", tgl:"«Nadal cheo de contos» (contos de Nadal)", l:"Biblioteca Municipal", ...TEL_CONCELLO},
  {d:"2026-11-27", h:"16:15, 17:45 y 19:15", t:"Chikichef: taller de cocina para niños (solo socios del Círculo, 6 €)", tgl:"Chikichef: obradoiro de cociña para nenos (só socios do Círculo, 6 €)", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-28", h:"10:00, 11:30 y 13:00", t:"Chikichef: taller de cocina para niños (solo socios del Círculo, 6 €)", tgl:"Chikichef: obradoiro de cociña para nenos (só socios do Círculo, 6 €)", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-12-01", h:"20:30", t:"Club do Viño: cata de vinos", tgl:"Club do Viño: cata de viños", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-12-29", h:"19:00", t:"Speak and Coffee: conversación en inglés", tgl:"Speak and Coffee: conversa en inglés", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO},
  {d:"2026-11-27", h:"Por confirmar", t:"Torneo de videojuegos (FC 27) para jóvenes de 12 a 26 años (solo socios del Círculo, gratis; inscripción hasta el 20 de noviembre)", tgl:"Torneo de videoxogos (FC 27) para mozos de 12 a 26 anos (só socios do Círculo, de balde; inscrición ata o 20 de novembro)", l:"Círculo das Artes (Praza Maior, 23), Espacio Joven", ...TEL_CIRCULO},
  {d:"2026-11-29", h:"19:00", t:"Concierto Candlelight a la luz de las velas: «Las cuatro estaciones» de Vivaldi (socios del Círculo 15 €, 40 plazas, sorteo si hay más peticiones)", tgl:"Concerto Candlelight á luz das velas: «As catro estacións» de Vivaldi (socios do Círculo 15 €, 40 prazas, sorteo se hai máis peticións)", l:"Círculo das Artes (Praza Maior, 23), Salón Regio", ...TEL_CIRCULO},
  {d:"2026-11-29", h:"21:00", t:"Concierto Candlelight a la luz de las velas: Coldplay e Imagine Dragons (socios del Círculo 15 €, 40 plazas, sorteo si hay más peticiones)", tgl:"Concerto Candlelight á luz das velas: Coldplay e Imagine Dragons (socios do Círculo 15 €, 40 prazas, sorteo se hai máis peticións)", l:"Círculo das Artes (Praza Maior, 23), Salón Regio", ...TEL_CIRCULO},
  {d:"2026-11-26", h:"17:00", t:"Taller «Laboratorio de historias»", tgl:"Obradoiro «Laboratorio de historias»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-26", h:"18:00", t:"Taller de escritura creativa", tgl:"Obradoiro de escrita creativa", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-28", h:"12:00", t:"Club de lectura «En-clave feminista»", tgl:"Club de lectura «En-clave feminista»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-28", h:"18:30", t:"Club de lectura: «A Sociedade Literaria e do Pastel de Pel de Pataca de Guernsey»", tgl:"Club de lectura: «A Sociedade Literaria e do Pastel de Pel de Pataca de Guernsey»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-28", h:"Por confirmar", t:"Concierto de Luis Fercán", tgl:"Concerto de Luis Fercán", l:"Círculo das Artes (Praza Maior, 23)", ...TEL_CIRCULO}
];
