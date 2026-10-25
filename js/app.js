window.showToast = function(message, icon = 'check_circle') {
    const toast = document.getElementById('custom-toast');
    if(!toast) return;
    const msg = document.getElementById('toast-message'); if(msg) msg.innerText = message;
    const icn = document.getElementById('toast-icon'); if(icn) icn.innerText = icon;
    toast.className = 'toast-visible';
    setTimeout(() => { toast.className = 'toast-hidden'; }, 3500);
};

// Modales Custom (Hora y Fecha)
let currentInputTarget = null;
function initTimePicker() {
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    if(!colHours || !colMins) return;
    let htmlHours = '<div class="time-item empty"></div>'; for(let i=0; i<24; i++) { let val = i.toString().padStart(2, '0'); htmlHours += `<div class="time-item" data-val="${val}">${val}</div>`; } htmlHours += '<div class="time-item empty"></div>'; colHours.innerHTML = htmlHours;
    let htmlMins = '<div class="time-item empty"></div>'; for(let i=0; i<60; i++) { let val = i.toString().padStart(2, '0'); htmlMins += `<div class="time-item" data-val="${val}">${val}</div>`; } htmlMins += '<div class="time-item empty"></div>'; colMins.innerHTML = htmlMins;
}
window.openTimePicker = function(inputId) {
    currentInputTarget = document.getElementById(inputId);
    const mod = document.getElementById('time-picker-modal'); if(mod) mod.classList.add('visible');
    // @ts-ignore
    let val = currentInputTarget ? currentInputTarget.value : ''; let h = 0, m = 0; if(val) [h, m] = val.split(':').map(Number);
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    // @ts-ignore
    setTimeout(() => { if(colHours) colHours.scrollTop = h * 50; if(colMins) colMins.scrollTop = m * 50; }, 50);
};
window.closeTimePicker = function() { const mod = document.getElementById('time-picker-modal'); if(mod) mod.classList.remove('visible'); };
window.confirmTimePicker = function() {
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    // @ts-ignore
    let hIdx = colHours ? Math.round(colHours.scrollTop / 50) : 0; // @ts-ignore
    let mIdx = colMins ? Math.round(colMins.scrollTop / 50) : 0;
    if(hIdx > 23) hIdx = 23; if(mIdx > 59) mIdx = 59;
    // @ts-ignore
    if (currentInputTarget) { currentInputTarget.value = `${hIdx.toString().padStart(2, '0')}:${mIdx.toString().padStart(2, '0')}`; }
    window.closeTimePicker();
};

let currentDate = new Date(); let selectedDate = new Date();
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function renderCalendar() {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const lbl = document.getElementById('dp-month-year'); if(lbl) lbl.innerText = `${monthNames[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('dp-days-grid'); if(!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) { grid.innerHTML += `<div class="dp-day empty"></div>`; }
    for (let i = 1; i <= daysInMonth; i++) {
        const isSelected = (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear());
        grid.innerHTML += `<div class="dp-day ${isSelected ? 'selected' : ''}" onclick="selectDate(${year}, ${month}, ${i})">${i}</div>`;
    }
}
window.openDatePicker = function() {
    const inputF = document.getElementById('jornada-fecha');
    // @ts-ignore
    if(inputF && inputF.value) { const [y, m, d] = inputF.value.split('-'); selectedDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d)); currentDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
    } else { selectedDate = new Date(); currentDate = new Date(); }
    renderCalendar(); const m = document.getElementById('date-picker-modal'); if(m) m.classList.add('visible');
};
window.closeDatePicker = function() { const m = document.getElementById('date-picker-modal'); if(m) m.classList.remove('visible'); };
window.selectDate = function(y, m, d) { selectedDate = new Date(y, m, d); renderCalendar(); };
window.prevMonth = function() { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
window.nextMonth = function() { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
window.confirmDatePicker = function() {
    const y = selectedDate.getFullYear(); const m = String(selectedDate.getMonth() + 1).padStart(2, '0'); const d = String(selectedDate.getDate()).padStart(2, '0');
    const inputF = document.getElementById('jornada-fecha'); // @ts-ignore
    if(inputF) inputF.value = `${y}-${m}-${d}`; window.closeDatePicker();
};

// Navegación (4 Pestañas)
const navItems = document.querySelectorAll('.nav-item'); const screens = document.querySelectorAll('.screen');
function switchScreen(targetId, navIndex) {
    screens.forEach(screen => screen.classList.remove('active')); navItems.forEach(item => item.classList.remove('active'));
    const t = document.getElementById(targetId); if(t) t.classList.add('active'); 
    if(navItems[navIndex]) navItems[navIndex].classList.add('active');
    if(targetId === 'view-inicio') window.renderizarInicio(); 
    if(targetId === 'view-informes') window.renderizarInforme();
}
navItems.forEach(item => { item.addEventListener('click', () => { // @ts-ignore
        switchScreen(item.getAttribute('data-target'), parseInt(item.getAttribute('data-index'))); }); });

const fechaDash = document.getElementById('fecha-dashboard');
if (fechaDash) { fechaDash.textContent = new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }); }

// Perfil Original
const formPerfil = document.getElementById('form-perfil');
if (formPerfil) {
    formPerfil.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const pNom = document.getElementById('perfil-nombre'); const pMon = document.getElementById('perfil-moneda'); const pTar = document.getElementById('perfil-tarifa'); const pFes = document.getElementById('perfil-festivo');
        // @ts-ignore
        const perfil = { nombre: pNom?pNom.value:'', moneda: pMon?pMon.value:'', tarifa: pTar?parseFloat(pTar.value)||0:0, festivo: pFes?parseFloat(pFes.value)||0:0 };
        localStorage.setItem('wtc_perfil', JSON.stringify(perfil)); window.showToast('¡Perfil guardado correctamente!', 'verified_user'); 
        window.renderizarInicio(); window.renderizarInforme();
    });
}
function cargarPerfil() {
    const guardado = localStorage.getItem('wtc_perfil');
    if (guardado) { const p = JSON.parse(guardado);
        const pNom = document.getElementById('perfil-nombre'); if(pNom) pNom.value = p.nombre || ''; // @ts-ignore
        const pMon = document.getElementById('perfil-moneda'); if(pMon) pMon.value = p.moneda || ''; // @ts-ignore
        const pTar = document.getElementById('perfil-tarifa'); if(pTar) pTar.value = p.tarifa || ''; // @ts-ignore
        const pFes = document.getElementById('perfil-festivo'); if(pFes) pFes.value = p.festivo || ''; // @ts-ignore
    }
}

// Lógica de Edición y Borrado
let idEditando = null;
window.eliminarJornada = function(id) {
    if(confirm("¿Eliminar este turno permanentemente?")) {
        let h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; h = h.filter(j => j.id !== id);
        localStorage.setItem('wtc_jornadas', JSON.stringify(h)); window.renderizarInicio(); window.renderizarInforme(); window.showToast('Jornada eliminada', 'delete');
    }
};
window.prepararEdicion = function(id) {
    const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; const j = h.find(x => x.id === id); if(!j) return;
    idEditando = id;
    const fFec = document.getElementById('jornada-fecha'); if(fFec) fFec.value = j.fecha; // @ts-ignore
    const fIni = document.getElementById('jornada-inicio'); if(fIni) fIni.value = j.inicio; // @ts-ignore
    const fFin = document.getElementById('jornada-fin'); if(fFin) fFin.value = j.fin; // @ts-ignore
    const fPau = document.getElementById('jornada-pausa'); if(fPau) fPau.value = j.pausaMinutos; // @ts-ignore
    const tipoF = j.tipoFestivo ? j.tipoFestivo : (j.esFestivo ? 'all' : 'none');
    const fTip = document.getElementById('jornada-tipo-festivo'); if(fTip) fTip.value = tipoF; // @ts-ignore
    let nota = j.notas || ''; if(nota.includes('|')) nota = nota.split('|')[1].trim(); 
    const fNot = document.getElementById('jornada-notas'); if(fNot) fNot.value = nota; // @ts-ignore
    const btnG = document.getElementById('btn-guardar-jornada'); if(btnG) btnG.innerHTML = 'Actualizar Jornada';
    const btnC = document.getElementById('btn-cancelar-edicion'); if(btnC) btnC.style.display = 'flex';
    switchScreen('view-jornadas', 1);
};
window.cancelarEdicion = function() {
    idEditando = null; const formJ = document.getElementById('form-jornada'); if(formJ) { try { // @ts-ignore
        formJ.reset(); } catch(e) {} }
    let hoy = new Date(); hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const fFec = document.getElementById('jornada-fecha'); if(fFec) fFec.value = hoy.toISOString().split('T')[0]; // @ts-ignore
    const fIni = document.getElementById('jornada-inicio'); if(fIni) fIni.value = ''; // @ts-ignore
    const fFin = document.getElementById('jornada-fin'); if(fFin) fFin.value = ''; // @ts-ignore
    const btnG = document.getElementById('btn-guardar-jornada'); if(btnG) btnG.innerHTML = 'Guardar Jornada';
    const btnC = document.getElementById('btn-cancelar-edicion'); if(btnC) btnC.style.display = 'none';
    window.renderizarInicio(); window.renderizarInforme(); switchScreen('view-inicio', 0);
};

window.renderizarInicio = function() {
    const cont = document.getElementById('inicio-lista-jornadas'); const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; const p = JSON.parse(localStorage.getItem('wtc_perfil')) || { moneda: 'Q' };
    const txtD = document.getElementById('inicio-total-dinero'); const txtH = document.getElementById('inicio-total-horas');
    if(!cont) return;

    let sumD = 0; let sumH = 0;
    if (h.length === 0) {
        cont.innerHTML = '<p style="color: #94a3b8; text-align: center; margin-top: 20px;">No hay jornadas registradas.</p>';
        if(txtD) txtD.textContent = `${p.moneda} 0.00`; if(txtH) txtH.textContent = `0.00 hrs acumuladas`; return;
    }

    for (const j of h) { sumD += parseFloat(j.totalEstimado || 0); sumH += parseFloat(j.horasTrabajadas || 0); }
    if(txtD) txtD.textContent = `${p.moneda} ${sumD.toFixed(2)}`; if(txtH) txtH.textContent = `${sumH.toFixed(2)} hrs acumuladas`;

    const hInv = [...h].reverse(); cont.innerHTML = ''; 
    for (const j of hInv) {
        const item = document.createElement('div'); item.className = 'swipe-container'; 
        let fVis = j.fechaMostrar || j.fecha; let icClass = (j.tipoFestivo && j.tipoFestivo !== 'none') ? "celebration" : "work_history";
        item.innerHTML = `
            <div class="swipe-content">
                <div class="jornada-icon"><span class="material-symbols-rounded">${icClass}</span></div>
                <div class="jornada-info"><h4>${fVis}</h4><p>${j.inicio} - ${j.fin} | ${j.notas || 'Turno Regular'}</p></div>
                <div class="jornada-amount"><h4>${j.moneda} ${j.totalEstimado}</h4><p>+${j.horasTrabajadas}h</p></div>
            </div>
            <div class="swipe-actions">
                <button onclick="prepararEdicion('${j.id}')" class="swipe-btn edit"><span class="material-symbols-rounded">edit</span></button>
                <button onclick="eliminarJornada('${j.id}')" class="swipe-btn delete"><span class="material-symbols-rounded">delete</span></button>
            </div>
        `;
        cont.appendChild(item);
    }
};

const formJornada = document.getElementById('form-jornada');
if (formJornada) {
    let hoyJ = new Date(); hoyJ.setMinutes(hoyJ.getMinutes() - hoyJ.getTimezoneOffset());
    const inputFecha = document.getElementById('jornada-fecha'); if(inputFecha) inputFecha.value = hoyJ.toISOString().split('T')[0]; // @ts-ignore

    formJornada.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const eFec = document.getElementById('jornada-fecha'); const eIni = document.getElementById('jornada-inicio'); const eFin = document.getElementById('jornada-fin'); const ePau = document.getElementById('jornada-pausa'); const eTip = document.getElementById('jornada-tipo-festivo'); const eNot = document.getElementById('jornada-notas');
        // @ts-ignore
        const fecha = eFec?eFec.value:''; const inicio = eIni?eIni.value:'00:00'; const fin = eFin?eFin.value:'00:00'; const pausaMinutos = ePau?parseInt(ePau.value)||0:0; const tipoFestivo = eTip?eTip.value:'none'; const notasUsuario = eNot?eNot.value:''; // @ts-ignore
        const perfil = JSON.parse(localStorage.getItem('wtc_perfil')) || { tarifa: 0, festivo: 0, moneda: '' };
        
        let [hIni, mIni] = inicio.split(':').map(Number); let [hFin, mFin] = fin.split(':').map(Number);
        let minT1 = 0; let minT2 = 0; let cruza = false;

        if ((hFin * 60 + mFin) <= (hIni * 60 + mIni) && inicio !== fin) { cruza = true; minT1 = (24 * 60) - (hIni * 60 + mIni); minT2 = (hFin * 60 + mFin); } else { minT1 = (hFin * 60 + mFin) - (hIni * 60 + mIni); }
        let minTot = minT1 + minT2; if (minTot === 0 && inicio === fin) { minTot = 24 * 60; minT1 = 24 * 60; }
        let r1 = minTot > 0 ? minT1 / minTot : 0; let r2 = minTot > 0 ? minT2 / minTot : 0;
        let hrs1 = Math.max(0, minT1 - (pausaMinutos * r1)) / 60; let hrs2 = Math.max(0, minT2 - (pausaMinutos * r2)) / 60;
        let tN = perfil.tarifa; let mF = perfil.festivo / 100; let rec1 = 0; let rec2 = 0;

        if (tipoFestivo === 'all') { rec1 = hrs1 * (tN * mF); rec2 = hrs2 * (tN * mF); } else if (tipoFestivo === 'start') { rec1 = hrs1 * (tN * mF); } else if (tipoFestivo === 'end' && cruza) { rec2 = hrs2 * (tN * mF); } else if (tipoFestivo === 'end' && !cruza) { rec1 = hrs1 * (tN * mF); }
        let pBase = (hrs1 + hrs2) * tN; let totEst = pBase + rec1 + rec2; let hrsTrab = hrs1 + hrs2;

        let fObj1 = new Date(fecha + 'T12:00:00'); let d1Str = fObj1.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); let fMos = d1Str;
        if (cruza) { let fObj2 = new Date(fObj1); fObj2.setDate(fObj2.getDate() + 1); let d2Str = fObj2.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); fMos = `${d1Str} al ${d2Str}`; }
        let subNot = 'Normal'; if(tipoFestivo === 'all') subNot = 'Festivo Completo'; else if(tipoFestivo === 'start') subNot = 'Festivo (Entrada)'; else if(tipoFestivo === 'end') subNot = 'Festivo (Salida)';
        let nFin = notasUsuario ? `${subNot} | ${notasUsuario}` : subNot;

        const nJor = { id: idEditando ? idEditando : Date.now().toString(), fecha: fecha, fechaMostrar: fMos, inicio, fin, pausaMinutos, tipoFestivo: tipoFestivo, notas: nFin, horasTrabajadas: hrsTrab.toFixed(2), totalEstimado: totEst.toFixed(2), moneda: perfil.moneda };
        let h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; let msjA = "";
        
        if (idEditando) { const idx = h.findIndex(j => j.id === idEditando); if(idx !== -1) h[idx] = nJor; msjA = `¡Turno actualizado!\nTotal: ${perfil.moneda} ${totEst.toFixed(2)}`; } 
        else { h.push(nJor); msjA = `¡Turno guardado!\nTotal: ${perfil.moneda} ${totEst.toFixed(2)}`; }

        localStorage.setItem('wtc_jornadas', JSON.stringify(h)); window.cancelarEdicion(); setTimeout(() => { window.showToast(msjA, 'task_alt'); }, 150);
    });
}

let workChartInstancia = null;
window.renderizarInforme = function() {
    const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; const p = JSON.parse(localStorage.getItem('wtc_perfil')) || { nombre: 'Usuario', moneda: '' };
    const cTot = document.getElementById('resumen-totales'); const cTab = document.getElementById('tabla-informe');
    const pNom = document.getElementById('reporte-perfil'); if(pNom) pNom.textContent = `Trabajador: ${p.nombre || 'No especificado'}`;
    const eFiltro = document.getElementById('filtro-grafica'); // @ts-ignore
    const filtroDias = eFiltro ? eFiltro.value : '15';

    if (h.length === 0) {
        if(cTot) cTot.innerHTML = ''; if(cTab) cTab.innerHTML = '<p style="text-align:center; color: #94a3b8;">No hay datos para el informe.</p>'; 
        if(workChartInstancia) workChartInstancia.destroy(); return; 
    }

    let jornadasOrdenadas = [...h].sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    if(filtroDias !== 'all') { const fechaLimite = new Date(); fechaLimite.setDate(fechaLimite.getDate() - parseInt(filtroDias)); jornadasOrdenadas = jornadasOrdenadas.filter(j => new Date(j.fecha) >= fechaLimite); }

    let tH = 0; let tD = 0; let hTab = ''; const jInverso = [...jornadasOrdenadas].reverse();
    for (const j of jInverso) { tH += parseFloat(j.horasTrabajadas); tD += parseFloat(j.totalEstimado); let fM = (j.tipoFestivo && j.tipoFestivo !== 'none') ? '*' : ''; let fVis = j.fechaMostrar || j.fecha;
        hTab += `<div class="reporte-item"><div><strong>${fVis}</strong> ${fM}<br><span style="color: gray; font-size: 0.8rem;">${j.inicio} - ${j.fin}</span></div><div style="text-align: right;">${j.horasTrabajadas} hrs<br><strong>${p.moneda} ${j.totalEstimado}</strong></div></div>`;
    }
    if(cTot) cTot.innerHTML = `<div><span class="material-symbols-rounded">schedule</span><br>Total Horas<span>${tH.toFixed(2)}</span></div><div><span class="material-symbols-rounded">payments</span><br>Total Ingresos<span>${p.moneda} ${tD.toFixed(2)}</span></div>`;
    if(cTab) cTab.innerHTML = hTab;

    const chartLabels = []; const chartData = []; const agrupado = {};
    jornadasOrdenadas.forEach(j => { let diaVisual = j.fecha.substring(5); if(!agrupado[diaVisual]) agrupado[diaVisual] = 0; agrupado[diaVisual] += parseFloat(j.horasTrabajadas); });
    for(let date in agrupado) { chartLabels.push(date); chartData.push(agrupado[date]); }

    const ctx = document.getElementById('workChart'); if(workChartInstancia) workChartInstancia.destroy();
    const textColor = '#64748b'; const gridColor = '#e2e8f0';
    // @ts-ignore
    if(ctx && window.Chart) { // @ts-ignore
        workChartInstancia = new window.Chart(ctx, { type: 'bar', data: { labels: chartLabels, datasets: [{ label: 'Horas Trabajadas', data: chartData, backgroundColor: '#3b82f6', borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } }, x: { grid: { display: false }, ticks: { color: textColor } } } } });
    }
};

window.descargarPDF = function() {
    const e = document.getElementById('reporte-contenido'); const btn = document.querySelector('button[onclick="descargarPDF()"]');
    if(!e || !btn) return; // @ts-ignore
    const oTxt = btn.innerHTML; // @ts-ignore
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> Generando...';
    const opt = { margin: 15, filename: 'Reporte_WorkingTime.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }};
    // @ts-ignore
    html2pdf().set(opt).from(e).toPdf().output('datauristring').then(function (pdf) {
        try { // @ts-ignore
            if (window.NativeShare) { const b64 = pdf.split(',')[1]; const n = "Reporte_WorkingTime_" + Date.now() + ".pdf"; // @ts-ignore
                window.NativeShare(b64, n).then(() => { btn.innerHTML = oTxt; }).catch(err => { console.log(err); btn.innerHTML = oTxt; });
            } else { // @ts-ignore
                html2pdf().set(opt).from(e).save().t
