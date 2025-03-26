let BTN_REGISRTER_USER='<button type="button" id= "btn_register" class="btn btn-primary" style="width: 100%;" >Registrar Nuevo Usuario</button>';
let BTN_DISTRITOS='	<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" style="width: 100%;">Distritos</button><ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1"style="width: 100%; text-align: center;"><li><a class="dropdown-item" href="/users/geoport">Vista General</a></li><li><a class="dropdown-item" href="/users/geoportD2">Distrito - 2</a></li><li><a class="dropdown-item" href="/users/geoportD3">Distrito - 3</a></li><li><a class="dropdown-item" href="/users/geoportD4">Distrito - 4</a></li><li><a class="dropdown-item" href="/users/geoportD6">Distrito - 6</a></li><li><a class="dropdown-item" href="/users/geoportD7">Distrito - 7</a></li><li><a class="dropdown-item" href="/users/geoportDLL">Distrito - LL</a></li></ul>';
let BTN_BANDEJA_ENTRADA='<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#descargasModal3" style="width: 100%; margin-top: 10px;">Bandeja de entrada	</button>';
let BTN_PREDIOS='<button type="button"id= "btn_predios" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Portal de Predios</button>';
let BTN_VIAS='<button type="button" id ="btn_vias" class="btn btn-primary" style="width: 100%; margin-top: 10px;" >Portal de Vias</button>';

function addNametocircle() {

  var usuario = document.getElementById('usuario').innerText;
  var textuser = document.getElementById('imagecircle');
  let primerCaracter = usuario.charAt(0);
  textuser.innerHTML = primerCaracter;

  console.log(primerCaracter);

  var role = document.getElementById('role').innerText;
  addRegisterUser(role);
  addDistritos(role);
  addBandejaEntrada(role);
  addPredios(role);
  addVias(role);
}

function addRegisterUser(role) {
  let divRegisterUser = document.getElementById("register-user")
  if (role === 'root') {
    divRegisterUser.innerHTML = BTN_REGISRTER_USER;
    let btn = document.getElementById("btn_register");
    btn.addEventListener("click", function () {
      window.location.href = "/users/register";
    });
  }
}

  function addDistritos(role) {
    let divDistritos = document.getElementById("distritos")
    if(role ==='root' || role === 'admin'){
      divDistritos.innerHTML= BTN_DISTRITOS;
    }
  }


  function addBandejaEntrada(role) {
    let divBandeja = document.getElementById("bandeja_entrada")
    if(role ==='root'|| role === 'admin'){
      divBandeja.innerHTML= BTN_BANDEJA_ENTRADA;
      } 
  }

  function addPredios(role) {
    let divPredios = document.getElementById("portal_predios");
    if(role ==='root'|| role === 'admin'){
        divPredios.innerHTML=BTN_PREDIOS;
        let btn = document.getElementById("btn_predios");
    btn.addEventListener("click", function () {
      window.location.href = "/users/geoportPredios";
    });
      } 
  }


  function addVias(role) {
    let divVias =document.getElementById("portal_vias");
    if(role ==='root'|| role === 'admin'){
        divVias.innerHTML=BTN_VIAS;
        let btn = document.getElementById("btn_vias");
    btn.addEventListener("click", function () {
      window.location.href = "/users/geoportVias";
    });
      }
  }
  function addrootRegister(){
    
  }

