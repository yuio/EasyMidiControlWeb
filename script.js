// Main controls
let devicesSelect   =null;
let refreshButton   =null;
let programInput    =null;
let sendButton      =null;
let fullscreenButton=null;
let settingsCheckBox=null;

// Settings controls
let setupSelect     =null;
let alwaysOnCheckBox=null;
let incDecCheckBox  =null;
let colsNumInput    =null;
let rowsNumInput    =null;
let colNameSelect   =null;
let rowNameSelect   =null;

// IncDec controls
let decrementButton =null;
let incrementButton =null;

// Sections
let settingsSection       =null;
let incDecSettingsSection =null;
let buttonsGridSection    =null;

//----------------------------------------------------------------------------------------------------------

let midiAccess    = null;
let selectDevice = null;

//----------------------------------------------------------------------------------------------------------
// STATE
//----------------------------------------------------------------------------------------------------------

let currentState =
{ "midiDevice" : ""
, "program"    : 0
, "settings"   : true
, "setup"      : "none"
, "alwaysOn"   : true
, "incDecCtrl" : true
, "colsNum"    : 3
, "rowsNum"    : 5
, "colName"    : "col_name_character"
, "rowName"    : "row_name_number"
, "bankSize"   : "128"
};

let incommingState = { ...currentState };

function execute_incommingState ( forced, record_state_cookie ) 
{
  if (incommingState["program"]<0   ) incommingState["program"]=0   ;
  if (incommingState["program"]>4096) incommingState["program"]=4096;

  if ( forced || (incommingState["settings"] != currentState["settings"] ) ) 
  {
    if (incommingState["settings"])
        settingsSection.style.display = "block";
    else
        settingsSection.style.display = "none";

    if ( settingsCheckBox.checked!=incommingState["settings" ] ) 
    settingsCheckBox.checked=incommingState["settings" ];
  }

  if ( forced || ( incommingState["setup"] != currentState["setup"] ) ) 
  {
    switch (incommingState["setup"]) 
    {
      case "setup_for_gt1000"  : incommingState["bankSize"]=  125; incommingState["colsNum"]= 4; incommingState["rowsNum"]=64 ; incommingState["colName"]="col_name_number"   ; incommingState["rowName"]="row_name_number"; break;
      case "setup_for_sy1000"  : incommingState["bankSize"]=  125; incommingState["colsNum"]= 4; incommingState["rowsNum"]=64 ; incommingState["colName"]="col_name_number"   ; incommingState["rowName"]="row_name_number"; break;
      case "setup_for_tonex"   : incommingState["bankSize"]=  128; incommingState["colsNum"]= 3; incommingState["rowsNum"]=100; incommingState["colName"]="col_name_character"; incommingState["rowName"]="row_name_number"; break;
      case "setup_for_helix"   : incommingState["bankSize"]=  128; incommingState["colsNum"]= 4; incommingState["rowsNum"]= 32; incommingState["colName"]="col_name_character"; incommingState["rowName"]="row_name_number"; break;
    }    

    setupSelect.value="none";
  }

  if ( forced || (incommingState["alwaysOn"] != currentState["alwaysOn"] ) )
  {
    if (incommingState["alwaysOn"])
      activateScreenLock();
    else
      desactivateScreenLock();

    if ( alwaysOnCheckBox.checked!=incommingState["alwaysOn"  ] ) 
      alwaysOnCheckBox.checked=incommingState["alwaysOn"  ];
  }

  if ( forced || (incommingState["incDecCtrl"] != currentState["incDecCtrl"] ) )
  {    
    if (incommingState["incDecCtrl"])
      incDecSettingsSection.style.display = "block";
    else
      incDecSettingsSection.style.display = "none";

      if ( incDecCheckBox.checked!=incommingState["incDecCtrl"] ) 
        incDecCheckBox.checked=incommingState["incDecCtrl"];
    }

  let update_grid=forced;
    
  if ( forced || (incommingState["colsNum"] != currentState["colsNum"] ) ) { if (colsNumInput .value!=incommingState["colsNum"]) colsNumInput .value=incommingState["colsNum"] ; update_grid=true; }
  if ( forced || (incommingState["rowsNum"] != currentState["rowsNum"] ) ) { if (rowsNumInput .value!=incommingState["rowsNum"]) rowsNumInput .value=incommingState["rowsNum"] ; update_grid=true; }
  if ( forced || (incommingState["colName"] != currentState["colName"] ) ) { if (colNameSelect.value!=incommingState["colName"]) colNameSelect.value=incommingState["colName"] ; update_grid=true; }
  if ( forced || (incommingState["rowName"] != currentState["rowName"] ) ) { if (rowNameSelect.value!=incommingState["rowName"]) rowNameSelect.value=incommingState["rowName"] ; update_grid=true; }
  if ( update_grid )
  {
    let col_number = (incommingState["colName"]=="col_name_number");
    let row_number = (incommingState["rowName"]=="row_name_number");
    let eachButtonWidth= ""+Math.floor(90/incommingState["colsNum"])+"%";
    function clickevent(n) { return function(event) { incommingState["program"]=n; execute_incommingState(false, true); } }

    buttonsGridSection.innerHTML = '';    
    let num=0;
    for (let y=0; y!=incommingState["rowsNum"]; y++) 
    {
      d=document.createElement("div");
      d.classList.add("buttons_grid_row_container");      
      for (let x=0; x!=incommingState["colsNum"]; x++) 
      {
        b=document.createElement("button");

        b.id="programbutton_"+num;

        b.style.width=eachButtonWidth;
        b.addEventListener('click' , clickevent(num) );
        
        buttonName =(row_number?y.toString():String.fromCharCode(65 + y));
        buttonName+="-"
        buttonName+=(col_number?x.toString():String.fromCharCode(65 + x));
        
        b.innerHTML="<span class='button_big_name'>"+buttonName+"</span><br><span>("+num+")</span>";
        
        d.appendChild(b);
        num++;
      }
      buttonsGridSection.appendChild(d);
    }
  }

  if ( forced || update_grid || (incommingState["program"] != currentState["program"] ) || (incommingState["bankSize"] != currentState["bankSize"]) )
  {
    var previously_selected = document.querySelectorAll(".buttons_grid_row_container .button_grid_selected");
    previously_selected.forEach(function(e) { e.classList.remove("button_grid_selected"); });

    b = document.getElementById("programbutton_"+incommingState["program"]);
    if (b!=null)
      b.classList.add("button_grid_selected");
          
    selectMidiProgram(incommingState["program"], incommingState["bankSize"]);
    
    if (bankSizeInput.value!=incommingState["bankSize"]) 
    bankSizeInput.value=incommingState["bankSize"];

    if (programInput.value!=incommingState["program"]) 
      programInput.value=incommingState["program"];
  }

  let deviceSelectionChanged=false;
  if ( forced || (incommingState["midiDevice"] != currentState["midiDevice"] ) )
  {
    console.log("selectedDevice:"+incommingState["midiDevice"]);
    deviceSelectionChanged=true;

    if (devicesSelect.value!=incommingState["midiDevice"]) 
    devicesSelect.value=incommingState["midiDevice"];
  }

  currentState = { ...incommingState };

  if (deviceSelectionChanged)
    refreshMidiDevicesList();

  if ( record_state_cookie )
    setCookie("appState",  JSON.stringify(currentState));
}

//----------------------------------------------------------------------------------------------------------
// COOKIES
//----------------------------------------------------------------------------------------------------------

function setCookie(name, value) 
{
  const expires = new Date('9999-12-31T23:59:59'); // Establecer la fecha de expiración en el futuro
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) 
{
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) 
  {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') 
      cookie = cookie.substring(1);

    if (cookie.indexOf(cookieName) === 0) 
      return cookie.substring(cookieName.length, cookie.length);
  }

  return null;
}

//----------------------------------------------------------------------------------------------------------
// MIDI 
//----------------------------------------------------------------------------------------------------------

function refreshMidiDevicesList() 
{
  console.log("refreshMidiDevicesList");
  navigator.requestMIDIAccess().then
  (
    function(access) 
    {
      devicesSelect.innerHTML = '';
      selectDevice=null;

      let firstDevicePending=true;
      midiAccess = access;
      const outputs = midiAccess.outputs.values();
      for (let output = outputs.next(); output && !output.done; output = outputs.next())
      {
        if (firstDevicePending) 
        {
          const no_option = document.createElement("option");
          no_option.text="(Choose Midi Device)";
          devicesSelect.add(no_option);
          firstDevicePending=false;
        }

        const option = document.createElement("option");
        option.text  = output.value.name;
        option.value = output.value.name;
        
        devicesSelect.add(option);

        if (output.value.name==currentState["midiDevice"]) {
          console.log("adquiring...:"+currentState["midiDevice"]);
          selectDevice=output.value;
          selectMidiProgram(currentState["program"], currentState["bankSize"]);
          devicesSelect.value=output.value.name;
        }
      }

      if (firstDevicePending) 
      {
        const no_option = document.createElement("option");
        no_option.text="(No Midi Devices)";
        devicesSelect.add(no_option);
      }
    }
  )
}

function selectMidiProgram(programNumber, bankSize)
{
  if (selectDevice && selectDevice.state === 'connected') 
  {
    const user_program = parseInt(programNumber);
    const bank = Math.floor(user_program/bankSize);
    const prog = Math.floor(user_program%bankSize);

    const data0 = [0xB0, 0x00, bank];
    selectDevice.send(data0);
    console.log(data0);
    
    const data1 = [0xB0, 0x20, 0x00];
    selectDevice.send(data1);
    console.log(data1);

    const data2 = [0xC0, prog];
    selectDevice.send(data2);
    console.log(data2);


  }
}

//----------------------------------------------------------------------------------------------------------
// DISPLAY CONTROL
//----------------------------------------------------------------------------------------------------------
function toggleFullscreen() 
{
  if (document.fullscreenElement) 
  {
      document.exitFullscreen();
      console.log('Saliendo de pantalla completa.');
  } 
  else 
  {
      document.documentElement.requestFullscreen();
      console.log('Entrando en pantalla completa.');
  }
}

let wakeLock = null;
 function activateScreenLock() {
    try 
    {
        wakeLock = navigator.wakeLock.request('screen');
        console.log('Screen lock activated.');
    } 
    catch (err) 
    {
        console.error('Unable to activate screen lock.', err);
    }
}

function desactivateScreenLock() 
{
    if (wakeLock !== null) 
    {
        wakeLock = null;
        console.log('Screen lock deactivated.');
    }
}

//----------------------------------------------------------------------------------------------------------
// START - ON LOAD
//----------------------------------------------------------------------------------------------------------

function on_load()
{
  console.log("on_load");

  //Main controls
  devicesSelect    = document.getElementById("devices");
  refreshButton    = document.getElementById("refresh");
  programInput     = document.getElementById("program");
  sendButton       = document.getElementById("send");
  fullscreenButton = document.getElementById('fullscreen');
  settingsCheckBox = document.getElementById("settings");

  // Settings controls
  setupSelect      = document.getElementById("setup_for");
  alwaysOnCheckBox = document.getElementById("scr_on");
  incDecCheckBox   = document.getElementById("inc_buts");
  bankSizeInput    = document.getElementById("bank_size");
  colsNumInput     = document.getElementById("cols_num");
  rowsNumInput     = document.getElementById("rows_num");
  colNameSelect    = document.getElementById("col_name");
  rowNameSelect    = document.getElementById("row_name");

  // IncDec controls
  decrementButton = document.getElementById("decrement");
  incrementButton = document.getElementById("increment");

  // Sections
  settingsSection       = document.getElementById("settings_section"       );
  incDecSettingsSection = document.getElementById("buttons_inc_dec_section");
  buttonsGridSection    = document.getElementById("buttons_grid_section"   );

  // Load settings
  devicesSelect   .addEventListener('change', function () { incommingState["midiDevice"] = devicesSelect   .value  ; execute_incommingState(false, true); } );
  refreshButton   .addEventListener('click' , refreshMidiDevicesList);  
  fullscreenButton.addEventListener('click' , toggleFullscreen      );  
  programInput    .addEventListener('change', function () { incommingState["program"   ] = programInput    .value  ; execute_incommingState(false, true); } );
  settingsCheckBox.addEventListener('change', function () { incommingState["settings"  ] = settingsCheckBox.checked; execute_incommingState(false, true); } );
  setupSelect     .addEventListener('change', function () { incommingState["setup"     ] = setupSelect     .value  ; execute_incommingState(false, true); } );
  alwaysOnCheckBox.addEventListener('change', function () { incommingState["alwaysOn"  ] = alwaysOnCheckBox.checked; execute_incommingState(false, true); } );
  incDecCheckBox  .addEventListener('change', function () { incommingState["incDecCtrl"] = incDecCheckBox  .checked; execute_incommingState(false, true); } );
  bankSizeInput   .addEventListener('change', function () { incommingState["bankSize"  ] = bankSizeInput   .value  ; execute_incommingState(false, true); } );
  colsNumInput    .addEventListener('change', function () { incommingState["colsNum"   ] = colsNumInput    .value  ; execute_incommingState(false, true); } );
  rowsNumInput    .addEventListener('change', function () { incommingState["rowsNum"   ] = rowsNumInput    .value  ; execute_incommingState(false, true); } );
  colNameSelect   .addEventListener('change', function () { incommingState["colName"   ] = colNameSelect   .value  ; execute_incommingState(false, true); } );
  rowNameSelect   .addEventListener('change', function () { incommingState["rowName"   ] = rowNameSelect   .value  ; execute_incommingState(false, true); } );

  // Decrement
  decrementButton .addEventListener('click' , function () { incommingState["program"]--; execute_incommingState(false, true); } );
  incrementButton .addEventListener('click' , function () { incommingState["program"]++; execute_incommingState(false, true); } );

  // Get initial devices list;
  refreshMidiDevicesList();

  // Force initial state
  execute_incommingState(true, false);

  // Load cookie if exists
  stateCookie = getCookie("appState");
  if (stateCookie!=null) 
  {
    incommingState=JSON.parse(stateCookie);
    execute_incommingState(false, false);
  }
}

document.addEventListener("DOMContentLoaded", on_load );
