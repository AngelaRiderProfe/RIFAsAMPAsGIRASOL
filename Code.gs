/**
 * Rifa AMPA El Girasol — "servidor" en Google Sheets (Apps Script)
 * ---------------------------------------------------------------
 * 1. Cambia el PIN de abajo por uno vuestro (el que usaréis las del AMPA).
 * 2. Implementar > Nueva implementación > Aplicación web
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario
 * 3. Copia la URL que termina en /exec y pégala en index.html (API_URL).
 */

const PIN = 'girasol2026';      // <-- CÁMBIALO. Déjalo en '' para no pedir PIN.
const HOJA = 'Ventas';
const PRECIO = 2;

function hoja_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(HOJA);
  if (!sh) {
    sh = ss.insertSheet(HOJA);
    sh.appendRow(['Rifa', 'Número', 'Nombre', 'Nota', 'Pagado', 'Apuntado por', 'Actualizado']);
    sh.setFrozenRows(1);
    sh.getRange('A1:G1').setFontWeight('bold').setBackground('#A3161C').setFontColor('#ffffff');
    sh.setColumnWidth(3, 220);
    sh.setColumnWidth(4, 180);
  }
  return sh;
}

function leer_() {
  const sh = hoja_();
  const v = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < v.length; i++) {
    if (v[i][0] === '' || v[i][1] === '') continue;
    out.push({
      rifa: String(v[i][0]),
      n: Number(v[i][1]),
      name: String(v[i][2]),
      note: String(v[i][3] || ''),
      paid: v[i][4] === true || String(v[i][4]).toUpperCase() === 'TRUE' || String(v[i][4]).toUpperCase() === 'SÍ',
      by: String(v[i][5] || ''),
      row: i + 1
    });
  }
  return out;
}

function limpio_(list) {
  return list.map(t => ({ rifa: t.rifa, n: t.n, name: t.name, note: t.note, paid: t.paid, by: t.by }));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const pin = (e && e.parameter && e.parameter.pin) || '';
  if (PIN !== '' && pin !== PIN) return json_({ ok: false, error: 'pin', pin: true });
  return json_({ ok: true, tickets: limpio_(leer_()), price: PRECIO, pin: PIN !== '' });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_request' }); }

  if (PIN !== '' && String(body.pin || '') !== PIN) return json_({ ok: false, error: 'pin' });
  if (body.action === 'check') return json_({ ok: true });

  const rifa = String(body.rifa || '');
  const n = Number(body.n);
  if (!rifa || !(n >= 1 && n <= 100)) return json_({ ok: false, error: 'bad_request' });

  const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    const sh = hoja_();
    const list = leer_();
    const cur = list.find(t => t.rifa === rifa && t.n === n);
    const prev = String(body.prevName || '');

    // Si alguien lo cambió mientras tanto, no pisamos su dato
    if ((cur ? cur.name : '') !== prev) {
      return json_({ ok: false, error: 'taken', tickets: limpio_(list) });
    }

    if (body.action === 'set') {
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) return json_({ ok: false, error: 'bad_request' });
      const fila = [rifa, n, name, String(body.note || '').trim().slice(0, 120), body.paid !== false,
                    String(body.by || '').trim().slice(0, 40), new Date()];
      if (cur) sh.getRange(cur.row, 1, 1, 7).setValues([fila]);
      else sh.appendRow(fila);
    } else if (body.action === 'free') {
      if (cur) sh.deleteRow(cur.row);
    } else {
      return json_({ ok: false, error: 'bad_request' });
    }
    SpreadsheetApp.flush();
    return json_({ ok: true, tickets: limpio_(leer_()) });
  } finally {
    lock.releaseLock();
  }
}
