/* Agenda Cultural Lugo (pestaña «Agenda Cultural Lugo»). Regla de Marta (14-nov): sin enlaces a empresas;
   de cada acto solo nombre, sitio, hora y un teléfono público para reservar. La app enseña los actos de hoy en adelante.
   d: día (AAAA-MM-DD) · h: hora · t: nombre del acto · l: sitio · tel: teléfono para reservar · tel2: otro teléfono (opcional) */
window.AGENDA_ACT = "2026-11-14";
const TEL_CONCELLO = {tel:"010", tel2:"982 297 350"}; // Concello de Lugo: 010; desde fuera de Lugo 982 297 350
const TEL_DEPUTACION = {tel:"982 260 000"};
window.AGENDA = [
  {d:"2026-11-14", h:"11:00 y 12:30", t:"Cuentacuentos para los más pequeños: «A mancha ou a raias?»", tgl:"Contacontos para os máis pequenos: «A mancha ou a raias?»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-14", h:"11:30", t:"Charla «A aldea necesita + feeling: Psicogeografía de A Piringalla»", tgl:"Charla «A aldea necesita + feeling: Psicoxeografía da Piringalla»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-11-14", h:"17:00", t:"Entre Iguais: talleres por la igualdad y contra la violencia de género (hasta el 21 de noviembre)", tgl:"Entre Iguais: obradoiros pola igualdade e contra a violencia de xénero (ata o 21 de novembro)", l:"Casa das Asociacións «María Mariño»", ...TEL_CONCELLO},
  {d:"2026-11-15", h:"11:00", t:"Cousiñas xeitosas: Día Internacional do Músico (para niños)", tgl:"Cousiñas xeitosas: Día Internacional do Músico (para nenos)", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-16", h:"19:30", t:"Club Cultural Valle Inclán: ciclo «Cine alemán»", tgl:"Club Cultural Valle Inclán: ciclo «Cine alemán»", l:"O Vello Cárcere", ...TEL_CONCELLO},
  {d:"2026-11-17", h:"19:30", t:"Película «Gattaca»", tgl:"Proxección do filme «Gattaca»", l:"Casa do Saber (Diputación)", lgl:"Casa do Saber (Deputación)", ...TEL_DEPUTACION},
  {d:"2026-11-19", h:"18:00", t:"«Nube de algodón» (para niños)", tgl:"«Nube de algodón» (para nenos)", l:"Biblioteca Municipal", ...TEL_CONCELLO},
  {d:"2026-11-19", h:"20:30", t:"Teatro: «Crónica do rei pasmado»", tgl:"Teatro: «Crónica do rei pasmado»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-11-22", h:"18:30", t:"Danza: «Únicos» (a partir de 3 años)", tgl:"Danza: «Únicos» (a partir de 3 anos)", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-11-26", h:"18:00", t:"«A máquina do tempo» (a partir de 4 años)", tgl:"«A máquina do tempo» (a partir de 4 anos)", l:"Biblioteca Municipal", ...TEL_CONCELLO},
  {d:"2026-12-03", h:"20:30", t:"Teatro: «Black Box, unha saga épica»", tgl:"Teatro: «Black Box, unha saga épica»", l:"Auditorio Gustavo Freire", ...TEL_CONCELLO},
  {d:"2026-12-10", h:"18:00", t:"«Nadal cheo de contos» (cuentos de Navidad)", tgl:"«Nadal cheo de contos» (contos de Nadal)", l:"Biblioteca Municipal", ...TEL_CONCELLO}
];
