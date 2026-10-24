// ==========================================
// 1. LÓGICA DE NAVEGACIÓN
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');

function switchScreen(targetId, navIndex) {
    screens.forEach(screen => screen.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    document.getElementById(targetId).classList.add('active');
    navItems[navIndex].classList.add('active');

    // ¡NUEVO SEGURO!: Forzar actualización visual siempre que cambiemos de pestaña
    if(targetId === 'view-inicio') renderizarInicio();
    if(targetId === 'view-informes') renderizarInforme();
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // @ts-ignore
        const targetId = item.getAttribute('data-target');
        // @ts-ignore
        const index = parseInt(item.getAttribute('data-index'));
        switchScreen(targetId, index);
    });
});

const fechaDash = document.getElementById('fecha-dashboard');
if (fechaDash) {
    const opciones = { weekday: 'short', day: 'numeric', month: 'short' };
    // @ts-ignore
    fechaDash.textContent = new Date().toLocaleDateString('es-ES', opciones);
}

// ==========================================
// 2. LÓGICA DEL PERFIL
// ==========================================
const formPerfil = document.getElementById('form-perfil');

formPerfil.addEventListener('submit', function(event) {
    event.preventDefault();
    // @ts-ignore
    const valNombre = document.getElementById('perfil-nombre').value;
    // @ts-ignore
    const valMoneda = document.getElementById('perfil-moneda').value;
    // @ts-ignore
    const valTarifa = document.getElementById('perfil-tarifa').value;
    // @ts-ignore
    const valFestivo = document.getElementById('perfil-festivo').value;

    const perfil = {
        nombre: valNombre, moneda: valMoneda,
        tarifa: parseFloat(valTarifa) || 0, festivo: parseFloat(valFestivo) || 0
    };

    localStorage.setItem('wtc_perfil', JSON.stringify(perfil));
    alert('¡Perfil guardado correctamente!');
    renderizarInicio(); 
    renderizarInforme();
});

function cargarPerfil() {
    const perfilGuardado = localStorage.getItem('wtc_perfil');
    if (perfilGuardado) {
        const perfil = JSON.parse(perfilGuardado);
        // @ts-ignore
        document.getElementById('perfil-nombre').value = perfil.nombre || '';
        // @ts-ignore
        document.getElementById('perfil-moneda').value = perfil.moneda || '';
        // @ts-ignore
        document.getElementById('perfil-tarifa').value = perfil.tarifa || '';
        // @ts-ignore
        document.getElementById('perfil-festivo').value = perfil.festivo || '';
    }
}

// ==========================================
// 3. LÓGICA DE LA PANTALLA INICIO Y EDICIÓN
// ==========================================
let idEditando = null;

window.eliminarJornada = function(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este turno permanentemente?")) {
        let historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
        historial = historial.filter(j => j.id !== id);
        localStorage.setItem('wtc_jornadas', JSON.stringify(historial));
        renderizarInicio(); renderizarInforme();
    }
};

window.prepararEdicion = function(id) {
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const jornada = historial.find(j => j.id === id);
    if(!jornada) return;

    idEditando = id;
    
    // @ts-ignore
    document.getElementById('jornada-fecha').value = jornada.fecha;
    // @ts-ignore
    document.getElementById('jornada-inicio').value = jornada.inicio;
    // @ts-ignore
    document.getElementById('jornada-fin').value = jornada.fin;
    // @ts-ignore
    document.getElementById('jornada-pausa').value = jornada.pausaMinutos;
    
    const tipoFestivo = jornada.tipoFestivo ? jornada.tipoFestivo : (jornada.esFestivo ? 'all' : 'none');
    // @ts-ignore
    document.getElementById('jornada-tipo-festivo').value = tipoFestivo;
    
    let notaReal = jornada.notas || '';
    if(notaReal.includes('|')) notaReal = notaReal.split('|')[1].trim(); 
    // @ts-ignore
    document.getElementById('jornada-notas').value = notaReal;

    const btnGuardar = document.getElementById('btn-guardar-jornada');
    if(btnGuardar) btnGuardar.innerHTML = 'Actualizar Jornada';
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if(btnCancelar) btnCancelar.style.display = 'flex';

    switchScreen('view-jornadas', 1);
};

window.cancelarEdicion = function() {
    idEditando = null;
    try {
        // @ts-ignore
        document.getElementById('form-jornada').reset();
    } catch(e) {}
    
    // Método a prueba de fallos para poner la fecha actual
    let hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    // @ts-ignore
    document.getElementById('jornada-fecha').value = hoy.toISOString().split('T')[0];
    
    const btnGuardar = document.getElementById('btn-guardar-jornada');
    if(btnGuardar) btnGuardar.innerHTML = 'Guardar Jornada';
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if(btnCancelar) btnCancelar.style.display = 'none';
    
    switchScreen('view-inicio', 0);
};

function renderizarInicio() {
    const contenedor = document.getElementById('inicio-lista-jornadas');
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const perfilGuardado = JSON.parse(localStorage.getItem('wtc_perfil')) || { moneda: 'Q' };

    const txtTotalDinero = document.getElementById('inicio-total-dinero');
    const txtTotalHoras = document.getElementById('inicio-total-horas');

    let sumaTotalDinero = 0; let sumaTotalHoras = 0;

    if (historial.length === 0) {
        contenedor.innerHTML = '<p style="color: #64748b; text-align: center; margin-top: 20px;">No hay transacciones.</p>';
        if(txtTotalDinero) txtTotalDinero.textContent = `${perfilGuardado.moneda} 0.00`;
        if(txtTotalHoras) txtTotalHoras.textContent = `0.00 hrs acumuladas`;
        return;
    }

    for (const j of historial) {
        sumaTotalDinero += parseFloat(j.totalEstimado || 0);
        sumaTotalHoras += parseFloat(j.horasTrabajadas || 0);
    }

    if(txtTotalDinero) txtTotalDinero.textContent = `${perfilGuardado.moneda} ${sumaTotalDinero.toFixed(2)}`;
    if(txtTotalHoras) txtTotalHoras.textContent = `${sumaTotalHoras.toFixed(2)} hrs acumuladas`;

    const historialInvertido = [...historial].reverse();
    contenedor.innerHTML = ''; 

    for (const jornada of historialInvertido) {
        const item = document.createElement('div');
        item.className = 'jornada-item';
        
        let fechaVisual = jornada.fechaMostrar || jornada.fecha;
        let iconoClase = (jornada.tipoFestivo && jornada.tipoFestivo !== 'none') ? "celebration" : "work_history";

        item.innerHTML = `
            <div class="jornada-icon">
                <span class="material-symbols-rounded">${iconoClase}</span>
            </div>
            <div class="jornada-info">
                <h4>${fechaVisual}</h4>
                <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                    ${jornada.inicio} - ${jornada.fin} | ${jornada.notas || 'Turno Regular'}
                </p>
            </div>
            <div class="jornada-amount">
                <h4>${jornada.moneda} ${jornada.totalEstimado}</h4>
                <p>+${jornada.horasTrabajadas}h</p>
            </div>
            <div class="jornada-actions">
                <button onclick="prepararEdicion('${jornada.id}')" class="btn-action-sm edit">
                    <span class="material-symbols-rounded" style="font-size: 18px;">edit</span>
                </button>
                <button onclick="eliminarJornada('${jornada.id}')" class="btn-action-sm delete">
                    <span class="material-symbols-rounded" style="font-size: 18px;">delete</span>
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    }
}

// ==========================================
// 4. MOTOR DE CÁLCULO DE JORNADAS
// ==========================================
const formJornada = document.getElementById('form-jornada');

// Iniciar con la fecha actual de forma segura
let hoy = new Date();
hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
// @ts-ignore
document.getElementById('jornada-fecha').value = hoy.toISOString().split('T')[0];

formJornada.addEventListener('submit', function(event) {
    event.preventDefault();

    // @ts-ignore
    const fecha = document.getElementById('jornada-fecha').value;
    // @ts-ignore
    const inicio = document.getElementById('jornada-inicio').value;
    // @ts-ignore
    const fin = document.getElementById('jornada-fin').value;
    // @ts-ignore
    const pausaMinutos = parseInt(document.getElementById('jornada-pausa').value) || 0;
    // @ts-ignore
    const tipoFestivo = document.getElementById('jornada-tipo-festivo').value;
    // @ts-ignore
    const notasUsuario = document.getElementById('jornada-notas').value;

    const perfil = JSON.parse(localStorage.getItem('wtc_perfil')) || { tarifa: 0, festivo: 0, moneda: '' };
    
    let [hIni, mIni] = inicio.split(':').map(Number);
    let [hFin, mFin] = fin.split(':').map(Number);
    
    let minTotalesDia1 = 0;
    let minTotalesDia2 = 0;
    let cruzaMedianoche = false;

    if ((hFin * 60 + mFin) <= (hIni * 60 + mIni) && inicio !== fin) {
        cruzaMedianoche = true;
        minTotalesDia1 = (24 * 60) - (hIni * 60 + mIni);
        minTotalesDia2 = (hFin * 60 + mFin);
    } else {
        minTotalesDia1 = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    }

    let minutosTotales = minTotalesDia1 + minTotalesDia2;
    if (minutosTotales === 0 && inicio === fin) {
        minutosTotales = 24 * 60; 
        minTotalesDia1 = 24 * 60;
    }

    let ratio1 = minutosTotales > 0 ? minTotalesDia1 / minutosTotales : 0;
    let ratio2 = minutosTotales > 0 ? minTotalesDia2 / minutosTotales : 0;
    
    let hrsDia1 = Math.max(0, minTotalesDia1 - (pausaMinutos * ratio1)) / 60;
    let hrsDia2 = Math.max(0, minTotalesDia2 - (pausaMinutos * ratio2)) / 60;

    let tarifaNormal = perfil.tarifa;
    let multiplicadorFestivo = perfil.festivo / 100;

    let recargo1 = 0;
    let recargo2 = 0;

    if (tipoFestivo === 'all') {
        recargo1 = hrsDia1 * (tarifaNormal * multiplicadorFestivo);
        recargo2 = hrsDia2 * (tarifaNormal * multiplicadorFestivo);
    } else if (tipoFestivo === 'start') {
        recargo1 = hrsDia1 * (tarifaNormal * multiplicadorFestivo);
    } else if (tipoFestivo === 'end' && cruzaMedianoche) {
        recargo2 = hrsDia2 * (tarifaNormal * multiplicadorFestivo);
    } else if (tipoFestivo === 'end' && !cruzaMedianoche) {
        recargo1 = hrsDia1 * (tarifaNormal * multiplicadorFestivo); 
    }

    let pagoBase = (hrsDia1 + hrsDia2) * tarifaNormal;
    let totalEstimado = pagoBase + recargo1 + recargo2;
    let horasTrabajadas = hrsDia1 + hrsDia2;

    let fObj1 = new Date(fecha + 'T12:00:00'); 
    let dia1Str = fObj1.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    let fechaMostrar = dia1Str;
    
    if (cruzaMedianoche) {
        let fObj2 = new Date(fObj1);
        fObj2.setDate(fObj2.getDate() + 1);
        let dia2Str = fObj2.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        fechaMostrar = `${dia1Str} al ${dia2Str}`;
    }

    let subTextoNota = 'Normal';
    if(tipoFestivo === 'all') subTextoNota = 'Festivo Completo';
    else if(tipoFestivo === 'start') subTextoNota = 'Festivo (Entrada)';
    else if(tipoFestivo === 'end') subTextoNota = 'Festivo (Salida)';
    
    let notasFinales = notasUsuario ? `${subTextoNota} | ${notasUsuario}` : subTextoNota;

    const nuevaJornada = {
        id: idEditando ? idEditando : Date.now().toString(),
        fecha: fecha,
        fechaMostrar: fechaMostrar, 
        inicio, fin,
        pausaMinutos,
        tipoFestivo: tipoFestivo,
        notas: notasFinales,
        horasTrabajadas: horasTrabajadas.toFixed(2),
        totalEstimado: totalEstimado.toFixed(2),
        moneda: perfil.moneda
    };

    let historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    let msjAlerta = "";
    
    if (idEditando) {
        const index = historial.findIndex(j => j.id === idEditando);
        if(index !== -1) historial[index] = nuevaJornada;
        msjAlerta = `¡Turno actualizado!\nTotal recalculado: ${perfil.moneda} ${totalEstimado.toFixed(2)}`;
    } else {
        historial.push(nuevaJornada);
        msjAlerta = `¡Turno guardado correctamente!\nTotal: ${perfil.moneda} ${totalEstimado.toFixed(2)}`;
    }

    // 1. GUARDAR EN MEMORIA (Aseguramos que guarde ANTES de que cualquier alerta congele el sistema)
    localStorage.setItem('wtc_jornadas', JSON.stringify(historial));
    
    // 2. LIMPIAR INTERFAZ Y REGRESAR AL INICIO INMEDIATAMENTE
    // @ts-ignore
    window.cancelarEdicion();

    // 3. MOSTRAR ALERTA (Con un pequeñísimo retraso para que Android termine sus procesos)
    setTimeout(() => {
        alert(msjAlerta);
    }, 150);
});

// ==========================================
// 5. LÓGICA DE INFORMES Y PDF
// ==========================================
function renderizarInforme() {
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const perfil = JSON.parse(localStorage.getItem('wtc_perfil')) || { nombre: 'Usuario', moneda: '' };
    const contTotales = document.getElementById('resumen-totales');
    const contTabla = document.getElementById('tabla-informe');
    
    document.getElementById('reporte-perfil').textContent = `Trabajador: ${perfil.nombre || 'No especificado'}`;

    if (historial.length === 0) {
        contTotales.innerHTML = '';
        contTabla.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No hay datos para el informe.</p>';
        return;
    }

    let totalHoras = 0; let totalDinero = 0; let htmlTabla = '';

    for (const j of historial) {
        totalHoras += parseFloat(j.horasTrabajadas);
        totalDinero += parseFloat(j.totalEstimado);
        
        let festivoMarca = (j.tipoFestivo && j.tipoFestivo !== 'none') ? '*' : '';
        let fechaVis = j.fechaMostrar || j.fecha;

        htmlTabla += `
            <div class="reporte-item">
                <div>
                    <strong>${fechaVis}</strong> ${festivoMarca}<br>
                    <span style="color: gray; font-size: 0.8rem;">${j.inicio} - ${j.fin}</span>
                </div>
                <div style="text-align: right;">
                    ${j.horasTrabajadas} hrs<br>
                    <strong>${perfil.moneda} ${j.totalEstimado}</strong>
                </div>
            </div>
        `;
    }

    contTotales.innerHTML = `
        <div><span class="material-symbols-rounded">schedule</span><br>Total Horas<span>${totalHoras.toFixed(2)}</span></div>
        <div><span class="material-symbols-rounded">payments</span><br>Total Ingresos<span>${perfil.moneda} ${totalDinero.toFixed(2)}</span></div>
    `;
    contTabla.innerHTML = htmlTabla;
}

window.descargarPDF = function() {
    const elemento = document.getElementById('reporte-contenido');
    const btn = document.querySelector('button[onclick="descargarPDF()"]');
    // @ts-ignore
    const originalText = btn.innerHTML;
    // @ts-ignore
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> Generando...';

    const opt = { margin: 15, filename: 'Reporte_WorkingTime.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }};

    // @ts-ignore
    html2pdf().set(opt).from(elemento).toPdf().output('datauristring').then(function (pdfDataUri) {
        try {
            // @ts-ignore
            if (window.NativeShare) {
                const base64Data = pdfDataUri.split(',')[1];
                const nombre = "Reporte_WorkingTime_" + Date.now() + ".pdf";
                // @ts-ignore
                window.NativeShare(base64Data, nombre).then(() => { // @ts-ignore
                    btn.innerHTML = originalText; }).catch(err => { console.log(err); // @ts-ignore
                    btn.innerHTML = originalText; });
            } else {
                // @ts-ignore
                html2pdf().set(opt).from(elemento).save().then(() => { // @ts-ignore
                    btn.innerHTML = originalText; });
            }
        } catch (error) { alert('Error: ' + error); // @ts-ignore
        btn.innerHTML = originalText; }
    }).catch(function(err) { alert('Error PDF: ' + err); // @ts-ignore
    btn.innerHTML = originalText; });
};

cargarPerfil();
renderizarInicio();
renderizarInforme();
