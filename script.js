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
let metronomeSection      =null;
let incDecSettingsSection =null;
let buttonsGridSection    =null;

//----------------------------------------------------------------------------------------------------------

let midiAccess      = null;
let selectDeviceOUT = null;
let selectDeviceIN  = null;
let selectDevice_identity=null;
let selectDevice_preset_names=null;

//----------------------------------------------------------------------------------------------------------
// STATE
//----------------------------------------------------------------------------------------------------------

let currentState =
{ "midiDevice" : ""
, "program"    : 0
, "settings"   : true
, "metronome"  : false
, "setup"      : "none"
, "alwaysOn"   : true
, "invLayout"  : false
, "incDecCtrl" : true
, "bankSize"   : "128"
, "colsNum"    : 3
, "rowsNum"    : 5
, "colName"    : "col_name_character"
, "rowName"    : "row_name_number"
, "metroOn"    : false
, "metroBpm"   : 120
, "metroVol"   : 100
, "metroBal"   : 0
, "metroRyt"   : "Qqqq"
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

  if ( forced || (incommingState["metronome"] != currentState["metronome"] ) ) 
  {
    if (incommingState["metronome"])
        metronomeSection.style.display = "block";
    else
      metronomeSection.style.display = "none";

    if ( metronomeCheckBox.checked!=incommingState["metronome" ] ) 
    metronomeCheckBox.checked=incommingState["metronome" ];
  }

  if ( forced || (incommingState["metroOn"] != currentState["metroOn"] ) )
  {
    if (incommingState["metroOn"]) {
      metronome_start();
    } else {
      metronome_stop();
    }

    if (metroOnCheckBox.checked!=incommingState["metroOn"]) 
    metroOnCheckBox.checked=incommingState["metroOn"];
  }

  if ( forced || (incommingState["metroBpm"] != currentState["metroBpm"] ) )
  {
    metronome_tempo=incommingState["metroBpm"];
    updateMetronome();

    if (bpmInput.value!=incommingState["metroBpm"]) 
      bpmInput.value=incommingState["metroBpm"];
  }

  if ( forced || (incommingState["metroVol"] != currentState["metroVol"] ) )
  {
    metronome_volume=incommingState["metroVol"]/100;

    if (volInput.value!=incommingState["metroVol"]) 
      volInput.value=incommingState["metroVol"];
  }

  if ( forced || (incommingState["metroBal"] != currentState["metroBal"] ) )
  {
    if (balanceInput.value!=incommingState["metroBal"]) 
      balanceInput.value=incommingState["metroBal"];
  }

  if ( forced || (incommingState["metroRyt"] != currentState["metroRyt"] ) )
  {
    switch(incommingState["metroRyt"]) 
    {
      case "metronome_ryt_Q"        : metronome_accent=1; updateMetronome(); break;
      case "metronome_ryt_Qq"       : metronome_accent=2; updateMetronome(); break;
      case "metronome_ryt_Qqq"      : metronome_accent=3; updateMetronome(); break;
      case "metronome_ryt_Qqqq"     : metronome_accent=4; updateMetronome(); break;
      case "metronome_ryt_Qqqqq"    : metronome_accent=5; updateMetronome(); break;
      case "metronome_ryt_Qqqqqq"   : metronome_accent=6; updateMetronome(); break;
      case "metronome_ryt_Qqqqqqq"  : metronome_accent=7; updateMetronome(); break;
      case "metronome_ryt_Qqqqqqqq" : metronome_accent=8; updateMetronome(); break;
    }
    
    if (rythmSelect.value!=incommingState["metroRyt"]) 
      rythmSelect.value=incommingState["metroRyt"];
  }

  if ( forced || ( incommingState["setup"] != currentState["setup"] ) ) 
  {
    switch (incommingState["setup"]) 
    {
      case "setup_for_gt1000c" : incommingState["bankSize"]=  125; incommingState["colsNum"]= 4; incommingState["rowsNum"]= 64; incommingState["colName"]="col_name_number_plus1"; incommingState["rowName"]="row_name_number_plus1"; break;
      case "setup_for_gt1000"  : incommingState["bankSize"]=  125; incommingState["colsNum"]= 5; incommingState["rowsNum"]= 50; incommingState["colName"]="col_name_number_plus1"; incommingState["rowName"]="row_name_number_plus1"; break;
      case "setup_for_sy1000"  : incommingState["bankSize"]=  125; incommingState["colsNum"]= 4; incommingState["rowsNum"]= 64; incommingState["colName"]="col_name_number_plus1"; incommingState["rowName"]="row_name_number_plus1"; break;
      case "setup_for_tonex"   : incommingState["bankSize"]=  128; incommingState["colsNum"]= 3; incommingState["rowsNum"]= 50; incommingState["colName"]="col_name_character"   ; incommingState["rowName"]="row_name_number"      ; break;
      case "setup_for_helix"   : incommingState["bankSize"]=  128; incommingState["colsNum"]= 4; incommingState["rowsNum"]= 32; incommingState["colName"]="col_name_character"   ; incommingState["rowName"]="row_name_number_plus1"; break;
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

  if ( forced || (incommingState["invLayout"] != currentState["invLayout"] ) )
  {    
    if (incommingState["invLayout"])
      document.body.style.flexDirection = "column-reverse";
    else
      document.body.style.flexDirection = "column";

    if ( invLayoutCheckBox.checked!=incommingState["invLayout"] ) 
      invLayoutCheckBox.checked=incommingState["invLayout"];
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
    let col_number = (incommingState["colName"]!="col_name_character");
    let row_number = (incommingState["rowName"]!="row_name_character");

    let col_number_base = (incommingState["colName"]=="col_name_number_plus1"?1:0);
    let row_number_base = (incommingState["rowName"]=="row_name_number_plus1"?1:0);

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
        
        buttonName =(row_number?(y+row_number_base).toString():String.fromCharCode(65 + y));
        buttonName+="-"
        buttonName+=(col_number?(x+col_number_base).toString():String.fromCharCode(65 + x));
        
        b.innerHTML="<span class='button_big_name'>"+buttonName+"</span><br><span>("+num+")</span><span id='buttonname"+num+"'></span>";
        
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
// METRONOME
//----------------------------------------------------------------------------------------------------------

let metronome_timerId = null;
let metronome_tempo = 120;
let metronome_volume = 0.1;
let metronome_count = 0;
let metronome_accent = 4;

let metronome_clickSound = null;
let metronome_clackSound = null;

function metronome_setup() {
  metronome_clickSound = document.getElementById('clickSound');
  metronome_clackSound = document.getElementById('clackSound');
}

function metronome_playClick() {
  if ( (metronome_count%metronome_accent)==0 ) {
    metronome_clackSound.volume = metronome_volume;
    metronome_clackSound.play();
  } else {
    metronome_clickSound.volume = metronome_volume;
    metronome_clickSound.play();
  }
  metronome_count++;
}

function metronome_start() {
  if (metronome_timerId==null) {
    metronome_count=0;
    metronome_playClick();
    metronome_timerId = setInterval(metronome_playClick, 60000 / metronome_tempo);
  }
}

function metronome_stop() {
  if (metronome_timerId!=null) {
    clearInterval(metronome_timerId);
    metronome_timerId=null;
  }
}

function updateMetronome() {
  if (metronome_timerId!=null) {
    metronome_stop();
    metronome_start();
  }
}

//----------------------------------------------------------------------------------------------------------
// MIDI 
//----------------------------------------------------------------------------------------------------------

let preset_names_watcher_waiting_preset=null;
function preset_names_watcher() {
  if (preset_names_watcher_waiting_preset==null) {
    for( preset_number=0; preset_number!=selectDevice_preset_names.length; preset_number++)
    {
      if (selectDevice_preset_names[preset_number]==null) {
        address=[0x20,0x00,0x00,0x00];
        const next_address_first_preset=128;
        if (preset_number<next_address_first_preset)
          address[1]+=preset_number;
        else
        {
          address[0]+=1;
          address[1]+=preset_number-next_address_first_preset;
        }
        send_gt1000_sysex_Request_Data_1_RQ1 (selectDevice_identity["channel"], address, [0x00,0x00,0x00,0x10] );
        preset_names_watcher_waiting_preset=preset_number;
        console.log("name request:"+preset_number);
        break;
      }
    }
  }
}

function send_gt1000_sysex_Request_Data_1_RQ1 ( channel, address, size ) 
{
  var checksum = 0;
  checksum += address[0]+address[1]+address[2]+address[3];
  checksum += size[0]+size[1]+size[2]+size[3];
  checksum = 128 - Math.floor(checksum%128);
  if (checksum==128) checksum=0;
  
  const data = [0xF0, 0x41, channel, 0x00, 0x00, 0x00, 0x4F, 0x11, address[0], address[1], address[2], address[3], size[0], size[1], size[2], size[3], checksum, 0xF7 ];
  console.log(bytes_array_to_hexstring(data));
  selectDeviceOUT.send(data);
}

function send_gt1000_sysex_Data_Set_1_DT1 ( channel, address, data_to_set ) 
{
}

function bytes_array_to_hexstring( bytesarray ) 
{
  str = "";
  for (i in bytesarray)
  {
    let databyte=bytesarray[i];
    str+=databyte.toString(16).toUpperCase().padStart(2, '0')+" ";
  }

  return str;
}

function bytesarray_to_string ( bytesarray ) 
{
  str = "";
  for (i in bytesarray)
  {
    let databyte=bytesarray[i];
    str+= (databyte>=0x20 && databyte<0x7F)?String.fromCharCode(databyte):".";
  }

  return str;
}

function bytesarray_to_num ( bytesarray ) 
{
  let num=0;

  for (i in bytesarray)
    num = (num<<8) + bytesarray[i];

  return num;
}

function processSysEx ( message ) {
  //console.log (message);

  // Check and store identity sysex
  if (message[1]==0x7E && message[3]==0x06 && message[4]==0x02 ) {

    selectDevice_identity = {}

    // channel
    selectDevice_identity["channel"    ]= message[2];
    selectDevice_identity["channel_str"]= message[2].toString(16).toUpperCase().padStart(2, '0');
    
    // manufacturer id (single or double byte)
    let offset_bytes=0;
    let manufacturer_id     = message[5];
    let manufacturer_id_str = message[5].toString(16).toUpperCase().padStart(2, '0');
    if (manufacturer_id==0) {
        manufacturer_id  = message[6]<<8;
        manufacturer_id += message[7];
        manufacturer_id_str  = message[6].toString(16).toUpperCase().padStart(2, '0')+" ";
        manufacturer_id_str += message[7].toString(16).toUpperCase().padStart(2, '0');
        offset_bytes=2;
    }     
    selectDevice_identity["manufacturer_id"    ]=manufacturer_id;
    selectDevice_identity["manufacturer_id_str"]=manufacturer_id_str;

    // family
    let family_code  = message[6+offset_bytes]<<8;
        family_code += message[7+offset_bytes];
    selectDevice_identity["family_code"]= family_code;
    let family_code_str  = message[6+offset_bytes].toString(16).toUpperCase().padStart(2, '0')+" ";
        family_code_str += message[7+offset_bytes].toString(16).toUpperCase().padStart(2, '0');
    selectDevice_identity["family_code_str"]= family_code_str;

    // model
    let model_number  = message[8+offset_bytes]<<8;
        model_number += message[9+offset_bytes]   ;
    selectDevice_identity["model_number"]= model_number;
    let model_number_str  = message[8+offset_bytes].toString(16).toUpperCase().padStart(2, '0')+" ";
        model_number_str += message[9+offset_bytes].toString(16).toUpperCase().padStart(2, '0');
    selectDevice_identity["model_number_str"]= model_number_str;

    // version
    let version_number  = message[10+offset_bytes]<<24;
        version_number += message[11+offset_bytes]<<16;
        version_number += message[12+offset_bytes]<<8 ;
        version_number += message[13+offset_bytes]<<0 ;
    selectDevice_identity["version_number"]= version_number;
    let version_number_str  = message[10+offset_bytes].toString(16).toUpperCase().padStart(2, '0')+" ";
        version_number_str += message[11+offset_bytes].toString(16).toUpperCase().padStart(2, '0')+" ";
        version_number_str += message[12+offset_bytes].toString(16).toUpperCase().padStart(2, '0')+" ";
        version_number_str += message[13+offset_bytes].toString(16).toUpperCase().padStart(2, '0');
    selectDevice_identity["version_number_str"]= version_number_str;

    // Check GT-1000 and requests patch names
    console.log (selectDevice_identity);
    if (message[6+offset_bytes]==0x4f) {
      console.log ("GT-1000 detected");      
      preset_names_watcher_waiting_preset=null;
      selectDevice_preset_names= new Array(250).fill(null);
      preset_names_watcher_timerId = setInterval(preset_names_watcher, 50);      
    }
  }

  // Check GT-1000 reception
  let channel=selectDevice_identity["channel"];
  if (channel)
  {
    if (  message[1]==0x41 
      && message[2]==selectDevice_identity["channel"]
      && message[3]==0x00 && message[4]==0x00 && message[5]==0x00 && message[6]==0x4f
      && message[7]==0x12
      ) 
    {
      //console.log ("gt1000_sysex_Data_Set_1_DT1!!"+address.toString(16));
      let address=message.slice(8,12);
      let address_num=bytesarray_to_num(address);
      if (address_num>=0x20000000 && address_num<=0x21790000)
      {
        let preset_number=(address[0]==0x20)?(address[1]):(address[1]+128)

        let preset_name= bytesarray_to_string(message.slice(12,-2));        
        console.log (`preset (${address_num.toString(16)}) ${preset_number}:${preset_name}`);

        // check if its an old request or really is what we are waiting
        if (preset_number==preset_names_watcher_waiting_preset) 
        {
          selectDevice_preset_names[preset_number]=preset_name;
          preset_names_watcher_waiting_preset=null;
          console.log("name accepted "+preset_number);
        }
        else
          console.log("ignoring old name request ");

        buttonname=document.getElementById("buttonname"+preset_number);
        if (buttonname!=undefined)
          buttonname.innerHTML=preset_name;
      }
    }
  }
}

let sysex_message_acumulator=null
function processMidiInput ( message )
{
  for ( i in message )  
  {
    let byte=message[i]
    if (sysex_message_acumulator==null) {
      if (byte==0xF0) {
        sysex_message_acumulator = [byte];
      }
    } else {      
      sysex_message_acumulator.push(byte);
      if (byte==0xF7) {
        processSysEx ( sysex_message_acumulator)
        sysex_message_acumulator=null;
      }
    }
  }
}

function refreshMidiDevicesList()
{  
  console.log("refreshMidiDevicesList");
  let requestMIDIAccessSetup = { sysex: true } 
  navigator.requestMIDIAccess(requestMIDIAccessSetup).then
  (
    function(access) 
    {
      devicesSelect.innerHTML = '';
      selectDeviceOUT=null;

      let firstDevicePending=true;
      midiAccess = access;

      // Open input
      const inputs = midiAccess.inputs.values();
      for (let input = inputs.next(); input && !input.done; input = inputs.next())
      {
        if (input.value.name==currentState["midiDevice"]) {
          console.log("adquiring input...:"+currentState["midiDevice"]);
          selectDeviceIN=input.value;
          selectDevice_identity=null;
          selectDevice_preset_names=[];
          preset_names_watcher_timerId=null;

          selectDeviceIN.onmidimessage = function(event) {
            var message = event.data;
            processMidiInput(message);
          };
        }
      }
      
      // Open output
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
          console.log("adquiring output...:"+currentState["midiDevice"]);
          selectDeviceOUT=output.value;
          selectMidiProgram(currentState["program"], currentState["bankSize"]);
          selectMidiAskIdenty();
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
  if (selectDeviceOUT && selectDeviceOUT.state === 'connected') 
  {
    const user_program = parseInt(programNumber);
    const bank = Math.floor(user_program/bankSize);
    const prog = Math.floor(user_program%bankSize);

    const data0 = [0xB0, 0x00, bank];
    selectDeviceOUT.send(data0);
    console.log(data0);
    
    const data1 = [0xB0, 0x20, 0x00];
    selectDeviceOUT.send(data1);
    console.log(data1);

    const data2 = [0xC0, prog];
    selectDeviceOUT.send(data2);
    console.log(data2);
  }
}

function selectMidiAskIdenty()
{
  if (selectDeviceOUT && selectDeviceOUT.state === 'connected') 
  {
    console.log ("asking midi identity");
    const data = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7];
    selectDeviceOUT.send(data);
    //console.log(data);
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

  metronome_setup();

  // Sections
  settingsSection       = document.getElementById("settings_section"       );
  metronomeSection      = document.getElementById("metronome_section"      );
  incDecSettingsSection = document.getElementById("buttons_inc_dec_section");
  buttonsGridSection    = document.getElementById("buttons_grid_section"   );

  //Main controls
  devicesSelect    = document.getElementById("devices"   );
  refreshButton    = document.getElementById("refresh"   );
  programInput     = document.getElementById("program"   );
  sendButton       = document.getElementById("send"      );
  fullscreenButton = document.getElementById('fullscreen');
  settingsCheckBox = document.getElementById("settings"  );
  metronomeCheckBox= document.getElementById("metronome" );

  devicesSelect    .addEventListener('change', function () { incommingState["midiDevice"] = devicesSelect   .value  ; execute_incommingState(false, true); } );
  refreshButton    .addEventListener('click' , refreshMidiDevicesList);  
  fullscreenButton .addEventListener('click' , toggleFullscreen      );  
  programInput     .addEventListener('change', function () { incommingState["program"   ] = programInput     .value  ; execute_incommingState(false, true); } );
  settingsCheckBox .addEventListener('change', function () { incommingState["settings"  ] = settingsCheckBox .checked; execute_incommingState(false, true); } );
  metronomeCheckBox.addEventListener('change', function () { incommingState["metronome" ] = metronomeCheckBox.checked; execute_incommingState(false, true); } );

  // Settings controls
  setupSelect      = document.getElementById("setup_for" );
  alwaysOnCheckBox = document.getElementById("scr_on"    );
  invLayoutCheckBox= document.getElementById("inv_layout");  
  incDecCheckBox   = document.getElementById("inc_buts"  );
  bankSizeInput    = document.getElementById("bank_size" );
  colsNumInput     = document.getElementById("cols_num"  );
  rowsNumInput     = document.getElementById("rows_num"  );
  colNameSelect    = document.getElementById("col_name"  );
  rowNameSelect    = document.getElementById("row_name"  );

  setupSelect      .addEventListener('change', function () { incommingState["setup"     ] = setupSelect      .value  ; execute_incommingState(false, true); } );
  alwaysOnCheckBox .addEventListener('change', function () { incommingState["alwaysOn"  ] = alwaysOnCheckBox .checked; execute_incommingState(false, true); } );
  invLayoutCheckBox.addEventListener('change', function () { incommingState["invLayout" ] = invLayoutCheckBox.checked; execute_incommingState(false, true); } );
  incDecCheckBox   .addEventListener('change', function () { incommingState["incDecCtrl"] = incDecCheckBox   .checked; execute_incommingState(false, true); } );
  bankSizeInput    .addEventListener('change', function () { incommingState["bankSize"  ] = bankSizeInput    .value  ; execute_incommingState(false, true); } );
  colsNumInput     .addEventListener('change', function () { incommingState["colsNum"   ] = colsNumInput     .value  ; execute_incommingState(false, true); } );
  rowsNumInput     .addEventListener('change', function () { incommingState["rowsNum"   ] = rowsNumInput     .value  ; execute_incommingState(false, true); } );
  colNameSelect    .addEventListener('change', function () { incommingState["colName"   ] = colNameSelect    .value  ; execute_incommingState(false, true); } );
  rowNameSelect    .addEventListener('change', function () { incommingState["rowName"   ] = rowNameSelect    .value  ; execute_incommingState(false, true); } );

  // Metronome controls
  metroOnCheckBox  = document.getElementById("metronome_on"     );
  bpmInput         = document.getElementById("metronome_bpm"    );
  bpmIncButton     = document.getElementById("metronome_bpm_inc");
  bpmDecButton     = document.getElementById("metronome_bpm_dec");
  volInput         = document.getElementById("metronome_vol"    );
  volIncButton     = document.getElementById("metronome_vol_inc");
  volDecButton     = document.getElementById("metronome_vol_dec");
  balanceInput     = document.getElementById("metronome_bal"    );
  rythmSelect      = document.getElementById("metronome_ryt"    );
  
  metroOnCheckBox  .addEventListener('change', function () { incommingState["metroOn"  ] = metroOnCheckBox.checked; execute_incommingState(false, true); } );
  bpmInput         .addEventListener('change', function () { incommingState["metroBpm" ] = parseInt(bpmInput.value); execute_incommingState(false, true); } );
  bpmIncButton     .addEventListener('click' , function () { let p=bpmInput.value; bpmInput.value=parseInt(bpmInput.value)+5; if (bpmInput.checkValidity()) bpmInput.dispatchEvent(new Event('change')); else bpmInput.value=p;} );
  bpmDecButton     .addEventListener('click' , function () { let p=bpmInput.value; bpmInput.value=parseInt(bpmInput.value)-5; if (bpmInput.checkValidity()) bpmInput.dispatchEvent(new Event('change')); else bpmInput.value=p;} );
  volInput         .addEventListener('change', function () { incommingState["metroVol" ] = parseInt(volInput.value); execute_incommingState(false, true); } );
  volIncButton     .addEventListener('click' , function () { let p=volInput.value; volInput.value=parseInt(volInput.value)+5; if (volInput.checkValidity()) volInput.dispatchEvent(new Event('change')); else volInput.value=p;} );
  volDecButton     .addEventListener('click' , function () { let p=volInput.value; volInput.value=parseInt(volInput.value)-5; if (volInput.checkValidity()) volInput.dispatchEvent(new Event('change')); else volInput.value=p;} );
  balanceInput     .addEventListener('change', function () { incommingState["metroBal" ] = balanceInput   .value  ; execute_incommingState(false, true); } );
  rythmSelect      .addEventListener('change', function () { incommingState["metroRyt" ] = rythmSelect    .value  ; execute_incommingState(false, true); } );

  // IncDec controls
  decrementButton = document.getElementById("decrement");
  incrementButton = document.getElementById("increment");

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
    incommingState["metroOn"]=false;
    execute_incommingState(false, false);
  }
}

document.addEventListener("DOMContentLoaded", on_load );
