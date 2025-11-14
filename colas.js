// Colas Interactivas (Queues) - FIFO

// La Cola (el arreglo central)
let queue = []; 
const MAX_CAPACITY = 7; // Más capacidad ya que la visualización es horizontal

// Variables de Estado (Igual que en Pilas)
let tipoDatoSeleccionado = '';
let queueBloqueada = false;

// Elementos del DOM
const colaVisual = document.getElementById('cola-visual');
const estadoMensaje = document.getElementById('estado-mensaje');
const infoEstado = document.getElementById('info-estado');
const valorInput = document.getElementById('valor-input');
const tipoActualDiv = document.getElementById('tipo-actual'); 
const tipoSelect = document.getElementById('tipo-dato-select');

// --- Funciones de Utilidad ---

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
    
    queue.forEach((valor, indice) => {
        const bloque = document.createElement('div');
        bloque.className = 'bloque-cola';
        bloque.textContent = valor;
        
        // El primer elemento (índice 0) es el FRENTE
        if (indice === 0 && queue.length > 0) {
            bloque.innerHTML += '<span class="label-front">FRENTE</span>';
        }

        // El último elemento (índice length - 1) es el FINAL
        if (indice === queue.length - 1 && queue.length > 0) {
             bloque.innerHTML += '<span class="label-rear">FINAL</span>';
        }
        
        colaVisual.appendChild(bloque);
    });

    infoEstado.textContent = queue.length > 0 
        ? `Elementos: ${queue.join(', ')} | Frente: ${queue[0]} | Final: ${queue[queue.length - 1]}`
        : 'La cola está vacía.';
}

// --- Funciones Principales (FIFO) ---

function enqueueElement() {
    const valorRaw = valorInput.value.trim();
    estadoMensaje.className = 'estado'; 
    valorInput.value = ''; 


    // 1. Validaciones iniciales
    if (!tipoDatoSeleccionado) {
        estadoMensaje.textContent = '❌ ERROR: Por favor, selecciona primero un Tipo de Dato.';
        estadoMensaje.classList.add('error');
        return;
    }
    if (valorRaw === '') {
        estadoMensaje.textContent = '❌ ERROR: El valor no puede estar vacío.';
        estadoMensaje.classList.add('error');
        return;
    }

    // --- LÓGICA DE VALIDACIÓN DE TIPO ---
    let esTipoValido = false;
    let valorAInsertar = valorRaw;

    switch (tipoDatoSeleccionado) {
        case 'int':
            // Válido si: es un número (no NaN), es entero (no tiene punto), y la conversión a string coincide con el raw.
            esTipoValido = !isNaN(parseInt(valorRaw)) && 
                           String(parseInt(valorRaw)) === valorRaw && 
                           !valorRaw.includes('.');
            if (esTipoValido) valorAInsertar = parseInt(valorRaw);
            break;

        case 'double':
            // Válido si: es un número (acepta decimales)
            esTipoValido = !isNaN(parseFloat(valorRaw));
            if (esTipoValido) valorAInsertar = parseFloat(valorRaw);
            break;

        case 'char':
            // Válido si: la longitud de la cadena es exactamente 1.
            esTipoValido = valorRaw.length === 1;
            break;

        case 'string':
            // Válido si: la longitud es mayor que 0.
            esTipoValido = valorRaw.length > 0;
            break;
    }

    // 2. Control de Error de Tipo
    if (!esTipoValido) {
        estadoMensaje.textContent = `❌ ERROR DE TIPO: "${valorRaw}" no es válido para el tipo "${tipoDatoSeleccionado.toUpperCase()}".`;
        estadoMensaje.classList.add('error');
        return;
    }
    // --- FIN LÓGICA DE VALIDACIÓN DE TIPO ---


    // 3. Manejo de Desbordamiento (Overflow)
    if (queue.length >= MAX_CAPACITY) {
        estadoMensaje.textContent = '⛔ ERROR: ¡DESBORDAMIENTO! (OVERFLOW)';
        estadoMensaje.classList.add('error');
        return;
    }
    // 2. ENQUEUE (FIFO): Añade al final (push)
    queue.push(valorAInsertar); 
    actualizarCola();

    // 3. Bloqueo del Selector
    if (queue.length === 1 && !queueBloqueada) {
        tipoSelect.disabled = true;
        queueBloqueada = true;
        tipoActualDiv.textContent = `Tipo seleccionado: ${tipoDatoSeleccionado.toUpperCase()} (BLOQUEADO)`;
    }
    
    estadoMensaje.textContent = `✅ ENQUEUE exitoso: Se encoló el valor "${valorAInsertar}"`;
}

function dequeueElement() {
    estadoMensaje.className = 'estado';
    
    // 1. Manejo de Subdesbordamiento (Underflow)
    if (queue.length === 0) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (UNDERFLOW)';
        estadoMensaje.classList.add('error');
        return;
    }
    
    // 2. DEQUEUE (FIFO): Saca del frente (shift)
    const valorEliminado = queue.shift(); // ⬅️ Diferencia clave con la pila
    actualizarCola();
    estadoMensaje.textContent = `✅ DEQUEUE exitoso: Se desencoló el valor "${valorEliminado}"`;

    // 3. Lógica de Desbloqueo
    if (queue.length === 0 && queueBloqueada) {
        tipoSelect.disabled = false;
        valorInput.disabled = true;
        queueBloqueada = false;
        tipoDatoSeleccionado = '';
        tipoSelect.value = '';
        
        tipoActualDiv.textContent = 'Tipo: Desbloqueado. Selecciona un nuevo tipo.';
        estadoMensaje.textContent = '✅ Cola vacía. Selecciona un nuevo tipo.';
    }
}

function peekElement() {
    estadoMensaje.className = 'estado'; 

    // Si la cola está vacía, es Underflow
    if (queue.length === 0) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (UNDERFLOW)';
        estadoMensaje.classList.add('error');
        return;
    }
    
    // PEEK: Devuelve el elemento en el índice 0 (el FRENTE)
    const frente = queue[0];
    estadoMensaje.textContent = `👁️ FRENTE (PEEK): El elemento superior es "${frente}"`;

    // Resaltar visualmente el frente
    const bloques = colaVisual.getElementsByClassName('bloque-cola');
    if (bloques.length > 0) {
        const bloqueFrente = bloques[0]; // ⬅️ Seleccionamos el índice 0
        bloqueFrente.classList.add('resaltado-peek-cola'); 
        setTimeout(() => {
            bloqueFrente.classList.remove('resaltado-peek-cola');
        }, 900);
    }
}

function resetQueue() {
    queue = [];
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