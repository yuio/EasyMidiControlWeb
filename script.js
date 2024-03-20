// Acciones al hacer clic en una celda de cualquier tabla
document.addEventListener('DOMContentLoaded', function() {
  const tables = document.querySelectorAll('table');

  tables.forEach(function(table) {
    table.addEventListener('click', function(event) {
      const target = event.target;
      const tagName = target.tagName;

      if (tagName === 'TD') {
        const input = target.querySelector('input, select');
        if (input) {
          if (input.tagName === 'SELECT') {
            input.focus();
          } else if (input.tagName === 'INPUT') {
            if (input.type === 'checkbox') {
              input.checked = !input.checked;
            } else if (input.type === 'button' || input.type === 'submit') {
              input.click();
            } else {
              input.focus();
            }
          }
        }
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", function() {
  const settingsButton = document.getElementById("settings");
  const settingsSection = document.getElementById("settings_section");

  settingsButton.addEventListener("click", function() {
      if (settingsSection.style.display === "none" || settingsSection.style.display === "") {
          settingsSection.style.display = "block";
      } else {
          settingsSection.style.display = "none";
      }
  });
});

let wakeLock = null;

// Función para activar el bloqueo de pantalla
async function activarBloqueoPantalla() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Bloqueo de pantalla activado.');
    } catch (err) {
        console.error('Error al activar el bloqueo de pantalla:', err);
    }
}

// Función para desactivar el bloqueo de pantalla
function desactivarBloqueoPantalla() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Bloqueo de pantalla desactivado.');
    }
}

// Función para entrar o salir de pantalla completa
function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        console.log('Saliendo de pantalla completa.');
    } else {
        document.documentElement.requestFullscreen();
        console.log('Entrando en pantalla completa.');
    }
}

document.addEventListener("DOMContentLoaded", function() {
  const devicesSelect = document.getElementById("devices");
  const decrementButton = document.getElementById("decrement");
  const incrementButton = document.getElementById("increment");
  const programInput = document.getElementById("program");
  const sendButton = document.getElementById("send");

  //const activarBoton = document.getElementById('activar');
  //const desactivarBoton = document.getElementById('desactivar');
  const fullscreenBoton = document.getElementById('fullscreen');
  //activarBoton.addEventListener('click', activarBloqueoPantalla);
  //desactivarBoton.addEventListener('click', desactivarBloqueoPantalla);
  fullscreenBoton.addEventListener('click', toggleFullscreen);

  let midiAccess;
  let selected_output;

  // Obtener la selección guardada en las cookies al cargar la página
  const savedProgram = getCookie("midiProgram");
  const savedDevice = getCookie("midiDevice");
  if (savedProgram && savedDevice) {
    programInput.value = savedProgram;
    devicesSelect.value = savedDevice;
  }

  // Obtener los dispositivos MIDI disponibles y enviar el programa seleccionado
  navigator.requestMIDIAccess().then(function(access) {
    midiAccess = access;
    let any_output_name;
    const outputs = midiAccess.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
      const option = document.createElement("option");
      option.text = output.value.name;
      devicesSelect.add(option);      
      any_output_name = output.value.name;
    }
    
    // Seleccionar el dispositivo guardado
    if (savedDevice) {
      devicesSelect.value = savedDevice;
      devicesSelect.dispatchEvent(new Event("change")); // Disparar evento de cambio para seleccionar el dispositivo
    }
    
    if (!selected_output) {
        devicesSelect.value = any_output_name;
        devicesSelect.dispatchEvent(new Event("change")); // Disparar evento de cambio para seleccionar el dispositivo
    }   
    
    // Enviar el programa seleccionado al cargar la página
    sendProgramChange();
  });

  // Cambiar el dispositivo seleccionado y guardar en la cookie
  devicesSelect.addEventListener("change", function() {
    const selectedDeviceName = devicesSelect.value;
    const outputs = midiAccess.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
      if (output.value.name === selectedDeviceName) {
        selected_output = output.value;
        sendProgramChange(); // Llamar aquí para asegurarnos de que selected_output está definido
        break;
      }
    }
    setCookie("midiDevice", selectedDeviceName, 7);
  });

  // Escuchar cambios en el programa y guardar en la cookie
  programInput.addEventListener("change", function() {
    setCookie("midiProgram", programInput.value, 7);
    sendProgramChange();    
  });

  // Enviar el programa seleccionado al hacer clic en el botón "Enviar"
  sendButton.addEventListener("click", function() {
    sendProgramChange();
  });

  // Incrementar el programa
  incrementButton.addEventListener("click", function() {
    programInput.stepUp();
    programInput.dispatchEvent(new Event("change"));
  });

  // Decrementar el programa
  decrementButton.addEventListener("click", function() {
    programInput.stepDown();
    programInput.dispatchEvent(new Event("change"));
  });

  // Funciones para manejar cookies
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  function getCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return null;
  }

  // Enviar el programa seleccionado al cargar la página
  function sendProgramChange() {
    if (selected_output && selected_output.state === 'connected') {

      const user_program = parseInt(programInput.value);
      const bank=(user_program>>7);
      const prog=(user_program&0x7f);

      const data0 = [0xB0, 0x00, bank];
      selected_output.send(data0);
      console.log(data0);
      
      const data1 = [0xB0, 0x20, 0x00];
      selected_output.send(data1);
      console.log(data1);

      const data2 = [0xC0, prog];
      selected_output.send(data2);
      console.log(data2);
    }
  }
});

