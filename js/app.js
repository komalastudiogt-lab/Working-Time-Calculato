window.showToast = function(message, icon = 'check_circle') {
    const toast = document.getElementById('custom-toast');
    // @ts-ignore
    document.getElementById('toast-message').innerText = message;
    // @ts-ignore
    document.getElementById('toast-icon').innerText = icon;
    // @ts-ignore
    toast.className = 'toast-visible';
    setTimeout(() => { // @ts-ignore
        toast.className = 'toast-hidden';
    }, 3500);
};

let currentInputTarget = null;
function initTimePicker() {
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    let htmlHours = '<div class="time-item empty"></div>'; for(let i=0; i<24; i++) { let val = i.toString().padStart(2, '0'); htmlHours += `<div class="time-item" data-val="${val}">${val}</div>`; } htmlHours += '<div class="time-item empty"></div>'; // @ts-ignore
    if(colHours) colHours.innerHTML = htmlHours;
    let htmlMins = '<div class="time-item empty"></div>'; for(let i=0; i<60; i++) { let val = i.toString().padStart(2, '0'); htmlMins += `<div class="time-item" data-val="${val}">${val}</div>`; } htmlMins += '<div class="time-item empty"></div>'; // @ts-ignore
    if(colMins) colMins.innerHTML = htmlMins;
}
window.openTimePicker = function(inputId) {
    currentInputTarget = document.getElementById(inputId); // @ts-ignore
    document.getElementById('time-picker-modal').classList.add('visible');
    // @ts-ignore
    let val = currentInputTarget.value; let h = 0, m = 0; if(val) [h, m] = val.split(':').map(Number);
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    // @ts-ignore
    setTimeout(() => { colHours.scrollTop = h * 50; colMins.scrollTop = m * 50; }, 50);
};
window.closeTimePicker = function() { // @ts-ignore
    document.getElementById('time-picker-modal').classList.remove('visible'); };
window.confirmTimePicker = function() {
    const colHours = document.getElementById('tp-hours'); const colMins = document.getElementById('tp-minutes');
    // @ts-ignore
    let hIdx = Math.round(colHours.scrollTop / 50); // @ts-ignore
    let mIdx = Math.round(colMins.scrollTop / 50);
    if(hIdx > 23) hIdx = 23; if(mIdx > 59) mIdx = 59;
    // @ts-ignore
    if (currentInputTarget) { currentInputTarget.value = `${hIdx.toString().padStart(2, '0')}:${mIdx.toString().padStart(2, '0')}`; }
    // @ts-ignore
    window.closeTimePicker();
};

let currentDate = new Date(); let selectedDate = new Date();
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function renderCalendar() {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    // @ts-ignore
    document.getElementById('dp-month-year').innerText = `${monthNames[month]} ${year}`;
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('dp-days-grid'); // @ts-ignore
    grid.innerHTML = '';
    // @ts-ignore
    for (let i = 0; i < firstDay; i++) { grid.innerHTML += `<div class="dp-day empty"></div>`; }
    for (let i = 1; i <= daysInMonth; i++) {
        const isSelected = (i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear());
        const selClass = isSelected ? 'selected' : ''; // @ts-ignore
        grid.innerHTML += `<div class="dp-day ${selClass}" onclick="selectDate(${year}, ${month}, ${i})">${i}</div>`;
    }
}
window.openDatePicker = function() {
    // @ts-ignore
    const inputVal = document.getElementById('jornada-fecha').value;
    if(inputVal) { const [y, m, d] = inputVal.split('-'); selectedDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d)); currentDate = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
    } else { selectedDate = new Date(); currentDate = new Date(); }
    renderCalendar(); // @ts-ignore
    document.getElementById('date-picker-modal').classList.add('visible');
};
window.closeDatePicker = function() { // @ts-ignore
    document.getElementById('date-picker-modal').classList.remove('visible'); };
window.selectDate = function(y, m, d) { selectedDate = new Date(y, m, d); renderCalendar(); };
window.prevMonth = function() { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
window.nextMonth = function() { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
window.confirmDatePicker = function() {
    const y = selectedDate.getFullYear(); const m = String(selectedDate.getMonth() + 1).padStart(2, '0'); const d = String(selectedDate.getDate()).padStart(2, '0');
    // @ts-ignore
    document.getElementById('jornada-fecha').value = `${y}-${m}-${d}`; // @ts-ignore
    window.closeDatePicker();
};

const navItems = document.querySelectorAll('.nav-item'); const screens = document.querySelectorAll('.screen');
function switchScreen(targetId, navIndex) {
    screens.forEach(screen => screen.classList.remove('active')); navItems.forEach(item => item.classList.remove('active'));
    document.getElementById(targetId).classList.add('active'); navItems[navIndex].classList.add('active');
    if(targetId === 'view-inicio') renderizarInicio(); if(targetId === 'view-informes') renderizarInforme();
}
navItems.forEach(item => { item.addEventListener('click', () => { // @ts-ignore
        switchScreen(item.getAttribute('data-target'), parseInt(item.getAttribute('data-index'))); }); });
const fechaDash = document.getElementById('fecha-dashboard'); // @ts-ignore
if (fechaDash) { fechaDash.textContent = new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }); }

const formPerfil = document.getElementById('form-perfil');
formPerfil.addEventListener('submit', function(event) {
    event.preventDefault(); // @ts-ignore
    const perfil = { nombre: document.getElementById('perfil-nombre').value, moneda: document.getElementById('perfil-moneda').value, tarifa: parseFloat(document.getElementById('perfil-tarifa').value) || 0, festivo: parseFloat(document.getElementById('perfil-festivo').value) || 0 };
    localStorage.setItem('wtc_perfil', JSON.stringify(perfil)); // @ts-ignore
    window.showToast('¡Perfil guardado correctamente!', 'verified_user'); renderizarInicio(); renderizarInforme();
});
function cargarPerfil() {
    const guardado = localStorage.getItem('wtc_perfil');
    if (guardado) { const p = JSON.parse(guardado); // @ts-ignore
        document.getElementById('perfil-nombre').value = p.nombre || ''; document.getElementById('perfil-moneda').value = p.moneda || ''; document.getElementById('perfil-tarifa').value = p.tarifa || ''; document.getElementById('perfil-festivo').value = p.festivo || ''; }
}

let idEditando = null;
window.eliminarJornada = function(id) {
    if(confirm("¿Eliminar este turno permanentemente?")) {
        let h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; h = h.filter(j => j.id !== id);
        localStorage.setItem('wtc_jornadas', JSON.stringify(h)); renderizarInicio(); renderizarInforme(); // @ts-ignore
        window.showToast('Jornada eliminada', 'delete');
    }
};
window.prepararEdicion = function(id) {
    const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; const j = h.find(x => x.id === id); if(!j) return;
    idEditando = id; // @ts-ignore
    document.getElementById('jornada-fecha').value = j.fecha; document.getElementById('jornada-inicio').value = j.inicio; document.getElementById('jornada-fin').value = j.fin; document.getElementById('jornada-pausa').value = j.pausaMinutos;
    const tipoF = j.tipoFestivo ? j.tipoFestivo : (j.esFestivo ? 'all' : 'none'); // @ts-ignore
    document.getElementById('jornada-tipo-festivo').value = tipoF;
    let nota = j.notas || ''; if(nota.includes('|')) nota = nota.split('|')[1].trim();  // @ts-ignore
    document.getElementById('jornada-notas').value = nota;
    const btnG = document.getElementById('btn-guardar-jornada'); if(btnG) btnG.innerHTML = 'Actualizar Jornada';
    const btnC = document.getElementById('btn-cancelar-edicion'); if(btnC) btnC.style.display = 'flex';
    switchScreen('view-jornadas', 1);
};
window.cancelarEdicion = function() {
    idEditando = null; try { // @ts-ignore
    document.getElementById('form-jornada').reset(); } catch(e) {}
    let hoy = new Date(); hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset()); // @ts-ignore
    document.getElementById('jornada-fecha').value = hoy.toISOString().split('T')[0]; // @ts-ignore
    document.getElementById('jornada-inicio').value = ''; document.getElementById('jornada-fin').value = '';
    const btnG = document.getElementById('btn-guardar-jornada'); if(btnG) btnG.innerHTML = 'Guardar Jornada';
    const btnC = document.getElementById('btn-cancelar-edicion'); if(btnC) btnC.style.display = 'none';
    renderizarInicio(); renderizarInforme(); switchScreen('view-inicio', 0);
};

function renderizarInicio() {
    const cont = document.getElementById('inicio-lista-jornadas'); const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || []; const p = JSON.parse(localStorage.getItem('wtc_perfil')) || { moneda: 'Q' };
    const txtD = document.getElementById('inicio-total-dinero'); const txtH = document.getElementById('inicio-total-horas');

    let sumD = 0; let sumH = 0;
    if (h.length === 0) { // @ts-ignore
        cont.innerHTML = '<p style="color: #64748b; text-align: center; margin-top: 20px;">No hay transacciones.</p>';
        if(txtD) txtD.textContent = `${p.moneda} 0.00`; if(txtH) txtH.textContent = `0.00 hrs acumuladas`; return;
    }

    for (const j of h) { sumD += parseFloat(j.totalEstimado || 0); sumH += parseFloat(j.horasTrabajadas || 0); }
    if(txtD) txtD.textContent = `${p.moneda} ${sumD.toFixed(2)}`; if(txtH) txtH.textContent = `${sumH.toFixed(2)} hrs acumuladas`;

    const hInv = [...h].reverse(); // @ts-ignore
    cont.innerHTML = ''; 
    for (const j of hInv) {
        const item = document.createElement('div'); 
        item.className = 'swipe-container'; // NUEVO: Swipe framework
        let fVis = j.fechaMostrar || j.fecha;
        let icClass = (j.tipoFestivo && j.tipoFestivo !== 'none') ? "celebration" : "work_history";
        
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
        // @ts-ignore
        cont.appendChild(item);
    }
}

const formJornada = document.getElementById('form-jornada');
let hoyJ = new Date(); hoyJ.setMinutes(hoyJ.getMinutes() - hoyJ.getTimezoneOffset());
// @ts-ignore
document.getElementById('jornada-fecha').value = hoyJ.toISOString().split('T')[0];

formJornada.addEventListener('submit', function(event) {
    event.preventDefault(); // @ts-ignore
    const fecha = document.getElementById('jornada-fecha').value; const inicio = document.getElementById('jornada-inicio').value; const fin = document.getElementById('jornada-fin').value; const pausaMinutos = parseInt(document.getElementById('jornada-pausa').value) || 0; const tipoFestivo = document.getElementById('jornada-tipo-festivo').value; const notasUsuario = document.getElementById('jornada-notas').value;
    const perfil = JSON.parse(localStorage.getItem('wtc_perfil')) || { tarifa: 0, festivo: 0, moneda: '' };
    
    let [hIni, mIni] = inicio.split(':').map(Number); let [hFin, mFin] = fin.split(':').map(Number);
    let minT1 = 0; let minT2 = 0; let cruza = false;

    if ((hFin * 60 + mFin) <= (hIni * 60 + mIni) && inicio !== fin) { cruza = true; minT1 = (24 * 60) - (hIni * 60 + mIni); minT2 = (hFin * 60 + mFin); } 
    else { minT1 = (hFin * 60 + mFin) - (hIni * 60 + mIni); }
    let minTot = minT1 + minT2; if (minTot === 0 && inicio === fin) { minTot = 24 * 60; minT1 = 24 * 60; }
    let r1 = minTot > 0 ? minT1 / minTot : 0; let r2 = minTot > 0 ? minT2 / minTot : 0;
    let hrs1 = Math.max(0, minT1 - (pausaMinutos * r1)) / 60; let hrs2 = Math.max(0, minT2 - (pausaMinutos * r2)) / 60;
    let tN = perfil.tarifa; let mF = perfil.festivo / 100;
    let rec1 = 0; let rec2 = 0;

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

    localStorage.setItem('wtc_jornadas', JSON.stringify(h)); // @ts-ignore
    window.cancelarEdicion(); setTimeout(() => { // @ts-ignore
    window.showToast(msjA, 'task_alt'); }, 150);
});

// ==========================================
// 7. LÓGICA DE INFORMES, CHART Y PDF
// ==========================================
let workChartInstancia = null;

window.renderizarInforme = function() {
    const h = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const p = JSON.parse(localStorage.getItem('wtc_perfil')) || { nombre: 'Usuario', moneda: '' };
    const cTot = document.getElementById('resumen-totales'); const cTab = document.getElementById('tabla-informe');
    // @ts-ignore
    document.getElementById('reporte-perfil').textContent = `Trabajador: ${p.nombre || 'No especificado'}`;
    // @ts-ignore
    const filtroDias = document.getElementById('filtro-grafica').value;

    if (h.length === 0) { // @ts-ignore
        cTot.innerHTML = ''; // @ts-ignore
        cTab.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No hay datos para el informe.</p>'; 
        if(workChartInstancia) workChartInstancia.destroy();
        return; 
    }

    // Ordenar fechas cronológicamente para la gráfica y filtrado
    let jornadasOrdenadas = [...h].sort((a,b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    // Filtrar por días
    if(filtroDias !== 'all') {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - parseInt(filtroDias));
        jornadasOrdenadas = jornadasOrdenadas.filter(j => new Date(j.fecha) >= fechaLimite);
    }

    // Datos para la tabla
    let tH = 0; let tD = 0; let hTab = '';
    const jInverso = [...jornadasOrdenadas].reverse(); // Tabla muestra recientes primero
    
    for (const j of jInverso) {
        tH += parseFloat(j.horasTrabajadas); tD += parseFloat(j.totalEstimado);
        let fM = (j.tipoFestivo && j.tipoFestivo !== 'none') ? '*' : ''; let fVis = j.fechaMostrar || j.fecha;
        hTab += `<div class="reporte-item"><div><strong>${fVis}</strong> ${fM}<br><span style="color: gray; font-size: 0.8rem;">${j.inicio} - ${j.fin}</span></div><div style="text-align: right;">${j.horasTrabajadas} hrs<br><strong>${p.moneda} ${j.totalEstimado}</strong></div></div>`;
    }
    // @ts-ignore
    cTot.innerHTML = `<div><span class="material-symbols-rounded">schedule</span><br>Total Horas<span>${tH.toFixed(2)}</span></div><div><span class="material-symbols-rounded">payments</span><br>Total Ingresos<span>${p.moneda} ${tD.toFixed(2)}</span></div>`; // @ts-ignore
    cTab.innerHTML = hTab;

    // --- GRÁFICA CHART.JS ---
    const chartLabels = [];
    const chartData = [];
    
    // Agrupar por fecha para la gráfica
    const agrupado = {};
    jornadasOrdenadas.forEach(j => {
        let diaVisual = j.fecha.substring(5); // Solo MM-DD
        if(!agrupado[diaVisual]) agrupado[diaVisual] = 0;
        agrupado[diaVisual] += parseFloat(j.horasTrabajadas);
    });
    
    for(let date in agrupado) {
        chartLabels.push(date);
        chartData.push(agrupado[date]);
    }

    const ctx = document.getElementById('workChart');
    if(workChartInstancia) workChartInstancia.destroy();
    
    // @ts-ignore
    if(ctx && window.Chart) {
        // @ts-ignore
        workChartInstancia = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Horas Trabajadas',
                    data: chartData,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
};

window.descargarPDF = function() {
    const e = document.getElementById('reporte-contenido'); const btn = document.querySelector('button[onclick="descargarPDF()"]'); // @ts-ignore
    const oTxt = btn.innerHTML; // @ts-ignore
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> Generando...';
    const opt = { margin: 15, filename: 'Reporte_WorkingTime.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }};
    // @ts-ignore
    html2pdf().set(opt).from(e).toPdf().output('datauristring').then(function (pdf) {
        try { // @ts-ignore
            if (window.NativeShare) { const b64 = pdf.split(',')[1]; const n = "Reporte_WorkingTime_" + Date.now() + ".pdf"; // @ts-ignore
                window.NativeShare(b64, n).then(() => { btn.innerHTML = oTxt; }).catch(err => { console.log(err); btn.innerHTML = oTxt; });
            } else { // @ts-ignore
                html2pdf().set(opt).from(e).save().then(() => { btn.innerHTML = oTxt; }); }
        } catch (error) { // @ts-ignore
        window.showToast('Error: ' + error, 'error'); btn.innerHTML = oTxt; }
    }).catch(function(err) { // @ts-ignore
    window.showToast('Error PDF: ' + err, 'error'); btn.innerHTML = oTxt; });
};

initTimePicker(); cargarPerfil(); renderizarInicio(); renderizarInforme();
