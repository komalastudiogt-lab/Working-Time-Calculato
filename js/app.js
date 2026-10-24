// ==========================================
// 1. LÓGICA DE NAVEGACIÓN
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');

/**
 * Función para cambiar de pantalla
 * @param {string} targetId - El ID de la pantalla a mostrar
 * @param {number} navIndex - El índice del botón en la barra
 */
function switchScreen(targetId, navIndex) {
    screens.forEach(screen => screen.classList.remove('active'));
    navItems.forEach(item => item.classList.remove('active'));

    document.getElementById(targetId).classList.add('active');
    navItems[navIndex].classList.add('active');

    // Si entramos a Informes, actualizamos los cálculos
    if(targetId === 'view-informes') {
        renderizarInforme();
    }
}

navItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const screenIds = ['view-inicio', 'view-jornadas', 'view-informes', 'view-perfil'];
        switchScreen(screenIds[index], index);
    });
});

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
        nombre: valNombre,
        moneda: valMoneda,
        tarifa: parseFloat(valTarifa) || 0,
        festivo: parseFloat(valFestivo) || 0
    };

    localStorage.setItem('wtc_perfil', JSON.stringify(perfil));
    alert('¡Perfil guardado correctamente!');
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
// 3. LÓGICA DE LA PANTALLA INICIO (HISTORIAL)
// ==========================================
function renderizarInicio() {
    const contenedor = document.getElementById('inicio-lista-jornadas');
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];

    if (historial.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--color-arena); margin-top: 10px;">No hay jornadas registradas.</p>';
        return;
    }

    const historialInvertido = [...historial].reverse();
    contenedor.innerHTML = ''; 

    historialInvertido.forEach(jornada => {
        const item = document.createElement('div');
        item.className = 'jornada-item';
        
        let festivoHTML = jornada.esFestivo ? `<span class="etiqueta-festivo">FESTIVO</span>` : '';
        let notasHTML = jornada.notas ? `<br><em>Nota: ${jornada.notas}</em>` : '';

        item.innerHTML = `
            <div class="jornada-header">
                <span>${jornada.fecha}</span>
                <span>${jornada.horasTrabajadas} hrs</span>
            </div>
            <div class="jornada-body">
                🕒 ${jornada.inicio} - ${jornada.fin} (Pausa: ${jornada.pausaMinutos}m) ${festivoHTML}
                ${notasHTML}
            </div>
            <div class="jornada-total">
                Total: ${jornada.moneda} ${jornada.totalEstimado}
            </div>
        `;
        contenedor.appendChild(item);
    });
}

// ==========================================
// 4. LÓGICA DE REGISTRO DE JORNADAS Y CÁLCULOS
// ==========================================
const formJornada = document.getElementById('form-jornada');

// @ts-ignore
document.getElementById('jornada-fecha').valueAsDate = new Date();

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
    const esFestivo = document.getElementById('jornada-festivo').checked;
    // @ts-ignore
    const notas = document.getElementById('jornada-notas').value;

    const perfilGuardado = JSON.parse(localStorage.getItem('wtc_perfil')) || { tarifa: 0, festivo: 0, moneda: '' };
    
    // Motor de cálculo
    let [horaInicio, minInicio] = inicio.split(':').map(Number);
    let [horaFin, minFin] = fin.split(':').map(Number);
    
    let minutosTotales = (horaFin * 60 + minFin) - (horaInicio * 60 + minInicio);
    
    // Si cruza la medianoche
    if (minutosTotales < 0) {
        minutosTotales += 24 * 60; 
    }

    let minutosTrabajados = minutosTotales - pausaMinutos;
    if (minutosTrabajados < 0) minutosTrabajados = 0; 

    const horasTrabajadas = minutosTrabajados / 60;

    const pagoBase = horasTrabajadas * perfilGuardado.tarifa;
    let recargoFestivo = 0;
    
    if (esFestivo) {
        recargoFestivo = pagoBase * (perfilGuardado.festivo / 100);
    }

    const totalEstimado = pagoBase + recargoFestivo;

    const nuevaJornada = {
        id: Date.now().toString(), 
        fecha,
        inicio,
        fin,
        pausaMinutos,
        esFestivo,
        notas,
        horasTrabajadas: horasTrabajadas.toFixed(2),
        pagoBase: pagoBase.toFixed(2),
        recargoFestivo: recargoFestivo.toFixed(2),
        totalEstimado: totalEstimado.toFixed(2),
        moneda: perfilGuardado.moneda
    };

    let historialJornadas = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    historialJornadas.push(nuevaJornada);
    localStorage.setItem('wtc_jornadas', JSON.stringify(historialJornadas));

    alert(`¡Jornada guardada!\nHoras netas: ${horasTrabajadas.toFixed(2)} hrs\nTotal estimado: ${perfilGuardado.moneda} ${totalEstimado.toFixed(2)}`);
    
    // Limpiar formulario
    // @ts-ignore
    document.getElementById('jornada-inicio').value = '';
    // @ts-ignore
    document.getElementById('jornada-fin').value = '';
    // @ts-ignore
    document.getElementById('jornada-pausa').value = '0';
    // @ts-ignore
    document.getElementById('jornada-festivo').checked = false;
    // @ts-ignore
    document.getElementById('jornada-notas').value = '';

    renderizarInicio();
    renderizarInforme();
    switchScreen('view-inicio', 0);
});

// ==========================================
// 5. LÓGICA DE INFORMES Y PDF
// ==========================================
function renderizarInforme() {
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const perfilGuardado = JSON.parse(localStorage.getItem('wtc_perfil')) || { nombre: 'Usuario', moneda: '' };
    const contenedorTotales = document.getElementById('resumen-totales');
    const contenedorTabla = document.getElementById('tabla-informe');
    
    document.getElementById('reporte-perfil').textContent = `Trabajador: ${perfilGuardado.nombre || 'No especificado'}`;

    if (historial.length === 0) {
        contenedorTotales.innerHTML = '';
        contenedorTabla.innerHTML = '<p style="text-align:center; color: var(--color-arena);">No hay datos para el informe.</p>';
        return;
    }

    let totalHoras = 0;
    let totalDinero = 0;
    let htmlTabla = '';

    for (const j of historial) {
        totalHoras += parseFloat(j.horasTrabajadas);
        totalDinero += parseFloat(j.totalEstimado);
        
        let festivoMarca = j.esFestivo ? '*' : '';

        htmlTabla += `
            <div class="reporte-item">
                <div>
                    <strong>${j.fecha}</strong> ${festivoMarca}<br>
                    <span style="color: gray;">${j.inicio} - ${j.fin}</span>
                </div>
                <div style="text-align: right;">
                    ${j.horasTrabajadas} hrs<br>
                    <strong>${perfilGuardado.moneda} ${j.totalEstimado}</strong>
                </div>
            </div>
        `;
    }

    contenedorTotales.innerHTML = `
        <div>Total Horas: <br><span style="font-size:1.2rem;">${totalHoras.toFixed(2)}</span></div>
        <div style="text-align:right;">Total Ingresos: <br><span style="font-size:1.2rem;">${perfilGuardado.moneda} ${totalDinero.toFixed(2)}</span></div>
    `;
    contenedorTabla.innerHTML = htmlTabla;
}

/** Exportar a PDF usando el menú de compartir de Android */
window.descargarPDF = function() {
    const elemento = document.getElementById('reporte-contenido');
    
    const opt = {
        margin:       15,
        filename:     'Reporte_WorkingTime.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 1. Generamos el PDF temporalmente en la memoria (como Blob)
    // @ts-ignore
    html2pdf().set(opt).from(elemento).output('blob').then(function (pdfBlob) {
        try {
            // 2. Preparamos el archivo
            const file = new File([pdfBlob], "Reporte_WorkingTime.pdf", { type: 'application/pdf' });
            
            // 3. Si Android soporta el menú de compartir nativo, lo abrimos
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: 'Mi Reporte de Horas',
                    text: 'Adjunto el reporte de mis jornadas laborales.'
                }).catch(err => console.log('El usuario canceló compartir.', err));
            } else {
                // 4. Fallback: si falla o estamos en web, forzamos la descarga clásica
                // @ts-ignore
                html2pdf().set(opt).from(elemento).save();
            }
        } catch (error) {
            // @ts-ignore
            html2pdf().set(opt).from(elemento).save();
        }
    });
};

// ==========================================
// INICIALIZACIÓN DE LA APP AL ABRIR
// ==========================================
cargarPerfil();
renderizarInicio();
renderizarInforme();
