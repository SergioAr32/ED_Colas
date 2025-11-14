// cola_circular.js
// Implementación: Cola Circular con reutilización de espacio usando el operador módulo (%).

const MAX_SIZE = 2; 

// Punteros y contador
let frente = 0;
let final = 0;
let count = 0; // Contador para rastrear el número real de elementos
let queue = new Array(MAX_SIZE); 
let tipoDatoSeleccionado = '';
let queueBloqueada = false; 

// --- Elementos del DOM (Definidos igual que en cola_simple.js) ---
const colaVisual = document.getElementById('cola-visual');
const estadoMensaje = document.getElementById('estado-mensaje');
const infoEstado = document.getElementById('info-estado');
const valorInput = document.getElementById('valor-input');
const tipoActualDiv = document.getElementById('tipo-actual'); 
const tipoSelect = document.getElementById('tipo-dato-select');


// --- Funciones de Utilidad y Lógica de Bloqueo (Mismas que en cola_simple.js) ---
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
    
    // Mostramos todas las posiciones del arreglo para ver el ciclo
    for (let i = 0; i < MAX_SIZE; i++) {
        const valor = queue[i] !== undefined ? queue[i] : 'Vacio';
        const bloque = document.createElement('div');
        bloque.className = 'bloque-cola';
        bloque.textContent = valor;
        
        const ultimoElementoIndex = (count > 0) ? (final - 1 + MAX_SIZE) % MAX_SIZE : -1;

        // Estilos para mostrar si la posición está ocupada
        if (queue[i] !== undefined) {
             bloque.style.backgroundColor = '#17a2b8';
        } else {
             bloque.style.backgroundColor = '#ccc';
        }

        // FRENTE (donde va a salir el próximo elemento)
        if (i === frente && count > 0) {
            bloque.innerHTML = `${queue[i]}<span class="label-front">FRENTE</span>`;
        }

        // 3. Identificación del FINAL (El último elemento insertado)
        if (i === ultimoElementoIndex && count > 0) {
            // Si el FINAL y el FRENTE están en el mismo lugar, solo mostramos FRENTE para evitar solapamiento
            if (i !== frente || count === 1) { 
                bloque.innerHTML += `<span class="label-rear">FINAL</span>`;
            }
}
        // FINAL (donde se insertará el próximo elemento)
        if (i === final && count < MAX_SIZE) {
             bloque.innerHTML += `<span class="label-rear">FINAL (Pos ${final})</span>`;
             // Si i === final pero la cola no está vacía, no es el FINAL del elemento, sino el slot de inserción
             if (count > 0) bloque.textContent = queue[i];
             else bloque.textContent = 'Vacio';
        }
        
        colaVisual.appendChild(bloque);
    }
    
    infoEstado.textContent = `Frente: ${frente}, Final (siguiente): ${final}. Elementos: ${count}. MAX: ${MAX_SIZE}`;
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

    // 2. Control de Desbordamiento (Overflow - CIRCULAR)
    if (count === MAX_SIZE) {
        estadoMensaje.textContent = '⛔ ERROR: ¡DESBORDAMIENTO! (Overflow). Cola circular llena. Final alcanza al Frente.';
        estadoMensaje.classList.add('error');
        return;
    }

    // 3. ENQUEUE: Añade al final (Circular)
    queue[final] = valorAInsertar; 
    final = (final + 1) % MAX_SIZE; // ⬅️ Mueve el puntero circularmente
    count++; // Incrementa el contador
    
    actualizarCola();

    // 4. Lógica de Bloqueo
    if (count === 1 && !queueBloqueada) { // Solo si es el primer elemento
        tipoSelect.disabled = true;
        queueBloqueada = true;
        tipoActualDiv.textContent = `Tipo seleccionado: ${tipoDatoSeleccionado.toUpperCase()} (BLOQUEADO)`;
    }
    
    estadoMensaje.textContent = `✅ ENQUEUE exitoso: Se encoló el valor "${valorAInsertar}"`;
}

function dequeueElement() {
    estadoMensaje.className = 'estado';
    
    // Control de Subdesbordamiento (Underflow - CIRCULAR)
    if (count === 0) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (Underflow). Cola vacía.';
        estadoMensaje.classList.add('error');
        return;
    }
    
    // 1. DEQUEUE: Elimina del frente (Circular)
    const valorEliminado = queue[frente];
    queue[frente] = undefined; // Marca el espacio como vacío para reutilizar
    
    frente = (frente + 1) % MAX_SIZE; // ⬅️ Mueve el puntero circularmente
    count--; // Decrementa el contador

    actualizarCola();
    estadoMensaje.textContent = `✅ DEQUEUE exitoso: Se desencoló el valor "${valorEliminado}"`;


}

function peekElement() {
    estadoMensaje.className = 'estado'; 
    if (count === 0) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! (UNDERFLOW)';
        estadoMensaje.classList.add('error');
        return;
    }
    
    const valorFrente = queue[frente];
    estadoMensaje.textContent = `👁️ FRENTE (PEEK): El elemento es "${valorFrente}" (Posición ${frente})`;
    // No hay resaltado visual directo para mantener la lógica simple
}

function peekRear() {
    estadoMensaje.className = 'estado'; 

    // Si la cola está vacía, es Underflow
    if (count === 0) {
        estadoMensaje.textContent = '⛔ ERROR: ¡SUBDESBORDAMIENTO! No hay elementos para ver el Final.';
        estadoMensaje.classList.add('error');
        return;
    }
    
    // Calcular el índice del último elemento insertado (el elemento justo ANTES del puntero 'final')
    // Fórmula de retroceso circular: (final - 1 + MAX_SIZE) % MAX_SIZE
    const ultimoElementoIndex = (final - 1 + MAX_SIZE) % MAX_SIZE;
    
    const valorFinal = queue[ultimoElementoIndex];
    estadoMensaje.textContent = `👁️ FINAL (PEEK): El último elemento es "${valorFinal}" (Posición ${ultimoElementoIndex})`;

    // Resaltar visualmente el último elemento insertado
    const bloques = colaVisual.getElementsByClassName('bloque-cola');
    if (bloques.length > 0) {
        const bloqueFinal = bloques[ultimoElementoIndex]; 
        bloqueFinal.classList.add('resaltado-peek-cola'); 
        setTimeout(() => {
            bloqueFinal.classList.remove('resaltado-peek-cola');
        }, 900);
    }
}

function resetQueue() {
    frente = 0;
    final = 0;
    count = 0;
    queue = new Array(MAX_SIZE); // Recrea el array
    tipoDatoSeleccionado = '';
    queueBloqueada = false;
    
    tipoDatoSeleccionado = ''; // Reinicia el tipo
    queueBloqueada = false; // Desbloquea la cola

    tipoSelect.disabled = false; // HABILITA el selector
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