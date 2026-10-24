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
// 3. LÓGICA DE LA PANTALLA INICIO (HISTORIAL Y CALCULADORA)
// ==========================================
function renderizarInicio() {
    const contenedor = document.getElementById('inicio-lista-jornadas');
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const perfilGuardado = JSON.parse(localStorage.getItem('wtc_perfil')) || { moneda: 'Q' };

    // Referencias a la nueva calculadora
    const txtTotalDinero = document.getElementById('inicio-total-dinero');
    const txtTotalHoras = document.getElementById('inicio-total-horas');

    let sumaTotalDinero = 0;
    let sumaTotalHoras = 0;

    // Si no hay historial, poner en ceros
    if (historial.length === 0) {
        contenedor.innerHTML = '<p style="color: var(--color-arena); margin-top: 10px;">No hay jornadas registradas.</p>';
        if(txtTotalDinero) txtTotalDinero.textContent = `${perfilGuardado.moneda} 0.00`;
        if(txtTotalHoras) txtTotalHoras.textContent = `0.00 hrs en total`;
        return;
    }

    // Calcular totales leyendo cada jornada
    for (const j of historial) {
        sumaTotalDinero += parseFloat(j.totalEstimado || 0);
        sumaTotalHoras += parseFloat(j.horasTrabajadas || 0);
    }

    // Actualizar la interfaz de la calculadora superior
    if(txtTotalDinero) txtTotalDinero.textContent = `${perfilGuardado.moneda} ${sumaTotalDinero.toFixed(2)}`;
    if(txtTotalHoras) txtTotalHoras.textContent = `${sumaTotalHoras.toFixed(2)} hrs en total`;

    // Renderizar la lista
    const historialInvertido = [...historial].reverse();
    contenedor.innerHTML = ''; 

    for (const jornada of historialInvertido) {
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
    }
}

// ==========================================
// 4. LÓGICA DE REGISTRO DE JORNADAS
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
    
    let [horaInicio, minInicio] = inicio.split(':').map(Number);
    let [horaFin, minFin] = fin.split(':').map(Number);
    
    let minutosTotales = (horaFin * 60 + minFin) - (horaInicio * 60 + minInicio);
    
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
// 5. LÓGICA DE INFORMES Y PDF (PUENTE NATIVO)
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

window.descargarPDF = function() {
    const elemento = document.getElementById('reporte-contenido');
    const btn = document.querySelector('button[onclick="descargarPDF()"]');
    // @ts-ignore
    const originalText = btn.innerText;
    // @ts-ignore
    btn.innerText = "Generando PDF...";

    const opt = {
        margin:       15,
        filename:     'Reporte_WorkingTime.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(elemento).toPdf().output('datauristring').then(function (pdfDataUri) {
        try {
            // @ts-ignore
            if (window.NativeShare) {
                const base64Data = pdfDataUri.split(',')[1];
                const nombreArchivo = "Reporte_WorkingTime_" + Date.now() + ".pdf";
                
                // @ts-ignore
                window.NativeShare(base64Data, nombreArchivo).then(() => {
                    // @ts-ignore
                    btn.innerText = originalText;
                }).catch(err => {
                    console.log(err);
                    // @ts-ignore
                    btn.innerText = originalText;
                });
            } else {
                // @ts-ignore
                html2pdf().set(opt).from(elemento).save().then(() => {
                    // @ts-ignore
                    btn.innerText = originalText;
                });
            }
        } catch (error) {
            alert('Error al procesar: ' + error);
            // @ts-ignore
            btn.innerText = originalText;
        }
    }).catch(function(err) {
        alert('Error fatal de PDF: ' + err);
        // @ts-ignore
        btn.innerText = originalText;
    });
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
cargarPerfil();
renderizarInicio();
renderizarInforme();
                        
