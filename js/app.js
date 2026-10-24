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
// 3. LÓGICA DE LA PANTALLA INICIO (Y EDICIÓN)
// ==========================================
let idEditando = null; // Variable para saber si estamos editando

// Función Global para Borrar
window.eliminarJornada = function(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este turno permanentemente?")) {
        let historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
        historial = historial.filter(j => j.id !== id);
        localStorage.setItem('wtc_jornadas', JSON.stringify(historial));
        renderizarInicio();
        renderizarInforme();
    }
};

// Función Global para Preparar la Edición
window.prepararEdicion = function(id) {
    const historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    const jornada = historial.find(j => j.id === id);
    if(!jornada) return;

    idEditando = id;
    
    // Llenar el formulario con los datos
    // @ts-ignore
    document.getElementById('jornada-fecha').value = jornada.fecha;
    // @ts-ignore
    document.getElementById('jornada-inicio').value = jornada.inicio;
    // @ts-ignore
    document.getElementById('jornada-fin').value = jornada.fin;
    // @ts-ignore
    document.getElementById('jornada-pausa').value = jornada.pausaMinutos;
    // @ts-ignore
    document.getElementById('jornada-festivo').checked = jornada.esFestivo;
    // @ts-ignore
    document.getElementById('jornada-notas').value = jornada.notas || '';

    // Cambiar texto de los botones
    const btnGuardar = document.getElementById('btn-guardar-jornada');
    if(btnGuardar) btnGuardar.innerHTML = 'Actualizar Jornada';
    
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if(btnCancelar) btnCancelar.style.display = 'flex';

    // Mover a la pestaña de Registro
    switchScreen('view-jornadas', 1);
};

// Función Global para Cancelar Edición
window.cancelarEdicion = function() {
    idEditando = null;
    
    // @ts-ignore
    document.getElementById('form-jornada').reset();
    // @ts-ignore
    document.getElementById('jornada-fecha').valueAsDate = new Date();
    
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

    let sumaTotalDinero = 0;
    let sumaTotalHoras = 0;

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
        
        let subTexto = jornada.esFestivo ? "Día Festivo" : (jornada.notas ? jornada.notas : "Jornada Regular");

        item.innerHTML = `
            <div class="jornada-icon">
                <span class="material-symbols-rounded">work_history</span>
            </div>
            <div class="jornada-info">
                <h4>${jornada.fecha}</h4>
                <p>${jornada.inicio} - ${jornada.fin} | ${subTexto}</p>
            </div>
            <div class="jornada-amount">
                <h4>${jornada.moneda} ${jornada.totalEstimado}</h4>
                <p>+${jornada.horasTrabajadas}h</p>
            </div>
            <div class="jornada-actions">
                <button onclick="prepararEdicion('${jornada.id}')" class="btn-action-sm edit">
                    <span class="material-symbols-rounded" style="font-size: 18px;">edit</span> Editar
                </button>
                <button onclick="eliminarJornada('${jornada.id}')" class="btn-action-sm delete">
                    <span class="material-symbols-rounded" style="font-size: 18px;">delete</span> Borrar
                </button>
            </div>
        `;
        contenedor.appendChild(item);
    }
}

// ==========================================
// 4. LÓGICA DE REGISTRO
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
        id: idEditando ? idEditando : Date.now().toString(), // Mantiene el ID si edita
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

    let historial = JSON.parse(localStorage.getItem('wtc_jornadas')) || [];
    
    if (idEditando) {
        // Actualizar registro existente
        const index = historial.findIndex(j => j.id === idEditando);
        if(index !== -1) historial[index] = nuevaJornada;
        alert(`¡Turno actualizado!\nTotal recalculado: ${perfilGuardado.moneda} ${totalEstimado.toFixed(2)}`);
    } else {
        // Agregar nuevo
        historial.push(nuevaJornada);
        alert(`¡Turno registrado!\nTotal sumado: ${perfilGuardado.moneda} ${totalEstimado.toFixed(2)}`);
    }

    localStorage.setItem('wtc_jornadas', JSON.stringify(historial));

    // Limpiar y resetear vista
    // @ts-ignore
    window.cancelarEdicion();
    renderizarInicio();
    renderizarInforme();
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
        contenedorTabla.innerHTML = '<p style="text-align:center; color: var(--text-muted);">No hay datos para el informe.</p>';
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
                    <span style="color: gray; font-size: 0.8rem;">${j.inicio} - ${j.fin}</span>
                </div>
                <div style="text-align: right;">
                    ${j.horasTrabajadas} hrs<br>
                    <strong>${perfilGuardado.moneda} ${j.totalEstimado}</strong>
                </div>
            </div>
        `;
    }

    contenedorTotales.innerHTML = `
        <div><span class="material-symbols-rounded">schedule</span><br>Total Horas<span>${totalHoras.toFixed(2)}</span></div>
        <div><span class="material-symbols-rounded">payments</span><br>Total Ingresos<span>${perfilGuardado.moneda} ${totalDinero.toFixed(2)}</span></div>
    `;
    contenedorTabla.innerHTML = htmlTabla;
}

window.descargarPDF = function() {
    const elemento = document.getElementById('reporte-contenido');
    const btn = document.querySelector('button[onclick="descargarPDF()"]');
    // @ts-ignore
    const originalText = btn.innerHTML;
    // @ts-ignore
    btn.innerHTML = '<span class="material-symbols-rounded">hourglass_top</span> Generando...';

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
                    btn.innerHTML = originalText;
                }).catch(err => {
                    console.log(err);
                    // @ts-ignore
                    btn.innerHTML = originalText;
                });
            } else {
                // @ts-ignore
                html2pdf().set(opt).from(elemento).save().then(() => {
                    // @ts-ignore
                    btn.innerHTML = originalText;
                });
            }
        } catch (error) {
            alert('Error al procesar: ' + error);
            // @ts-ignore
            btn.innerHTML = originalText;
        }
    }).catch(function(err) {
        alert('Error fatal de PDF: ' + err);
        // @ts-ignore
        btn.innerHTML = originalText;
    });
};

cargarPerfil();
renderizarInicio();
renderizarInforme();
