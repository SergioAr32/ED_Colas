// cola_simple.js
// Implementación: Cola Lineal de tamaño fijo, sin corrimiento.
// Problema: Genera "desbordamiento falso" al avanzar el puntero 'frente'.

const MAX_SIZE = 4; 

// Punteros: 'frente' indica el primer elemento, 'final' el último.
let frente = -1;
let final = -1;
let queue = new Array(MAX_SIZE); // Array de tamaño fijo
let tipoDatoSeleccionado = '';
let queueBloqueada = false; 

// --- Elementos del DOM (Asegurar que coincidan con cola.html) ---
const colaVisual = document.getElementById('cola-visual');
const estadoMensaje = document.getElementById('estado-mensaje');
const infoEstado = document.getElementById('info-estado');
const valorInput = document.getElementById('valor-input');
const tipoActualDiv = document.getElementById('tipo-actual'); 
const tipoSelect = document.getElementById('tipo-dato-select');


// --- Funciones de Utilidad y Lógica de Bloqueo ---

function seleccionarTipoDato() {
    tipoDatoSeleccionado = tipoSelect.value;
    tipoActualDiv.textContent = `Tipo seleccionado: ${tipoDatoSeleccionado.toUpperCase() || 'NINGUNO'}`;

    if (tipoDatoSeleccionado && !queueBloqueada) {
        valorInput.disabled = false;
        estadoMensaje.textContent = `¡Listo! Ahora solo se aceptan valores de tipo "${tipoDatoSeleccionado.toUpperCase()}"`;
    } else {
        valorInput.disabled = true; 
        estadoMensaje.textContent = 'Selecciona un tipo de dato válido para comenzar.';
    }
    estadoMensaje.className = 'estado';
}

function actualizarCola() {
    colaVisual.innerHTML = '';
    
    // Solo mostramos las posiciones del arreglo que son relevantes
    for (let i = 0; i < MAX_SIZE; i++) {
        const valor = queue[i] !== undefined ? queue[i] : 'Vacio';
        const bloque = document.createElement('div');
        bloque.className = 'bloque-cola';
        bloque.textContent = valor;
        
        if (i >= frente && i <= final) {
             bloque.style.backgroundColor = '#17a2b8'; // Color normal para elementos válidos
        } else {
             bloque.style.backgroundColor = '#ccc'; // Gris para posiciones vacías o inutilizadas
        }

        // El primer elemento válido (índice frente) es el FRENTE
        if (i === frente && frente !== -1 && frente <= final) {
            bloque.innerHTML = `${queue[i]}<span class="label-front">FRENTE</span>`;
        }
        // El último elemento (índice final) es el FINAL
        if (i === final && final !== -1 && frente <= final) {
             bloque.innerHTML = `${queue[i]}<span class="label-rear">FINAL</span>`;
        }
        
        colaVisual.appendChild(bloque);
    }
    
    infoEstado.textContent = `Frente: ${frente}, Final: ${final}. ${frente === -1 ? 'Cola Vacía.' : `Elementos en uso: ${final - frente + 1}`}`;
}

// --- Funciones Principales (FIFO) ---

function enqueueElement() {
    const valorRaw = valorInput.value.trim();
    estadoMensaje.className = 'estado'; 
    valorInput.value = ''; 

    // 1. Validaciones y Lógica de Tipo (Completa)
    if (!tipoDatoSeleccionado || valorRaw === '') { /* ... (manejo de error) ... */ return; }
    let esTipoValido = false;
    let valorAInsertar = valorRaw;
    
    switch (tipoDatoSeleccionado) {
        case 'int': esTipoValido = !isNaN(parseInt(valorRaw)) && String(parseInt(valorRaw)) === valorRaw && !valorRaw.includes('.'); if (esTipoValido) valorAInsertar = parseInt(valorRaw); break;
        case 'double': esTipoValido = !isNaN(parseFloat(valorRaw)); if (esTipoValido) valorAInsertar = parseFloat(valorRaw); break;
        case 'char': esTipoValido = valorRaw.length === 1; break;
        case 'string': esTipoValido = valorRaw.length > 0; break;
    }
    
    if (!esTipoValido) { /* ... (manejo de error de tipo) ... */ return; }

    // 2. Control de Desbordamiento (Overflow - SIMPLE)
    if (final === MAX_SIZE - 1) {
        estadoMensaje.textContent = '⛔ ERROR: ¡DESBORDAMIENTO! (Overflow). Cola llena. El espacio libre al inicio no puede ser usado.';
        estadoMensaje.classList.add('error');
        return;
    }

    // 3. ENQUEUE: Añade al final
    if (frente === -1) { frente = 0; }
    final++; // Mueve el puntero del final
    queue[final] = valorAInsertar; 
    
    actualizarCola();

    // 4. Lógica de Bloqueo
    if (frente === 0 && final === 0 && !queueBloqueada) { // Solo si es el primer elemento
        tipoSelect.disabled = true;
        queueBloqueada = true;
        tipoActualDiv.textContent = `Tipo seleccionado: ${tipoDatoSeleccionado.toUpperCase()} (BLOQUEADO)`;
    }
    
    estadoMensaje.textContent = `✅ ENQUEUE exitoso: Se encoló el valor "${valorAInsertar}"`;
}

function dequeueElement() {
    estadoMensaje.className = 'estado';
    
    // Control de Subdesbordamiento (Underflow)
    if (frente === -1 || frente > final) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (Underflow). Cola vacía.';
        estadoMensaje.classList.add('error');
        return;
    }
    
    // 1. DEQUEUE: Elimina del frente
    const valorEliminado = queue[frente];
    queue[frente] = undefined; // Deja el espacio inutilizable (demostrando el problema)
    frente++; // Mueve el puntero del frente

    actualizarCola();
    estadoMensaje.textContent = `✅ DEQUEUE exitoso: Se desencoló el valor "${valorEliminado}"`;

    // 2. Lógica de Desbloqueo (Cola queda vacía)
    if (frente > final) {
        frente = -1;
        final = -1; // Resetea punteros

        tipoSelect.disabled = true;
        valorInput.disabled = false;
        queueBloqueada = true;
        // tipoDatoSeleccionado = '';
        // tipoSelect.value = '';
        
        estadoMensaje.textContent += '. Cola ahora vacía. Listo para nuevos ENQUEUE.';
        tipoActualDiv.textContent = `Tipo seleccionado: ${tipoDatoSeleccionado.toUpperCase()} (BLOQUEADO)`;
    }
}

function peekElement() {
    estadoMensaje.className = 'estado'; 
    if (frente === -1 || frente > final) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (UNDERFLOW)';
        estadoMensaje.classList.add('error');
        return;
    }
    
    const valorFrente = queue[frente];
    estadoMensaje.textContent = `👁️ FRENTE (PEEK): El elemento es "${valorFrente}" (Posición ${frente})`;
    // No hay resaltado visual directo para mantener la lógica simple
}

function resetQueue() {
    frente = -1;
    final = -1;
    queue = new Array(MAX_SIZE); // Recrea el array
    tipoDatoSeleccionado = '';
    queueBloqueada = false;
    
    tipoSelect.disabled = false;
    valorInput.disabled = true;
    tipoSelect.value = '';
    valorInput.value = '';
    
    actualizarCola();
    tipoActualDiv.textContent = 'Tipo seleccionado: Ninguno';
    estadoMensaje.textContent = 'Cola Reiniciada.';
    estadoMensaje.className = 'estado';
}

// Inicialización Segura
document.addEventListener('DOMContentLoaded', (event) => {
    resetQueue();
});