// Configuración inicial del mapa
var map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 13);

        
    

/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: 'Map data &copy; OpenStreetMap contributors'
}).addTo(map);*/
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20, // Nivel máximo de zoom
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] // Subdominios utilizados por Google para distribuir la carga
    // attribution: 'Map data ©2023 Google' // Atribución de los datos del mapa
}).addTo(map);


// Crear el sidebar y agregarlo al mapa
var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map).open('home');

// Cargar los datos GeoJSON
var grilla2024 = 'http://10.0.38.17:8080/geoserver/Vias_Catastro/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Vias_Catastro%3Avias_poligonos&maxFeatures=20000&outputFormat=application%2Fjson&srsName=EPSG:4326';
var  geojsonLayer  = "";
fetch('/grilla24')
    .then(response => response.json())
    .then(data => {
        // Agregar los datos GeoJSON al mapa y agregar el evento click
        geojsonLayer = L.geoJSON(data, {
            style: function (feature) {
                // Define el color del polígono según la propiedad 'estado_levantamiento'
                let fillColor;

                // Primer if para determinar el color de relleno
                if (feature.properties.estado_acumulativo == 0) {
                  fillColor = '#ababab';
                } else if (feature.properties.estado_acumulativo == 1) {
                  fillColor = '#ff540b';
                } else if (feature.properties.estado_acumulativo == 2) {
                  fillColor = '#fdec03';
                } else if (feature.properties.estado_acumulativo == 3) {
                  fillColor = '#1eca00';
                } else if (feature.properties.estado_acumulativo == 4) {
                  fillColor = '#0c45d6';
                }else if (feature.properties.estado_acumulativo == 10) {
                  fillColor = '#66a3d5';//348567
                }
        
                // Retornar el objeto de estilo  #348567
                return {
                  fillColor: fillColor, // Utiliza el color determinado por el if anterior
                  weight: 2, // Grosor del borde
                  color: '#0d6efd', // Color del borde
                  fillOpacity: 0.5 // Opacidad del relleno
                };
            },
            onEachFeature: function (feature, layer) {
                // Asignar un evento de clic a cada polígono
                layer.on('click', function (e) {
                    const soloFecha = new Date(feature.properties.fecha_levantamiento).toISOString().split('T')[0];
                    var filename = feature.properties.texto + ".ecw";
                    var buton2d = '';
                    var buton3d = '';
                    var btnsoliciud = '';
                    // Aquí actualizamos el contenido del sidebar con información del polígono
                    var content = `<h2>Detalles del via</h2>
                               <p><strong>ID:</strong> ${feature.properties.estado_acumulativo}</p>
                                <ul class="list-group">
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Distrito: </li>
                                <li class="list-group-item">${feature.properties.distrito_a}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Grilla numero: </li>
                                <li class="list-group-item">${feature.properties.texto}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Estado:</li>
                                <li class="list-group-item">${feature.properties.estado_acumulativo}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Fecha de Levantamiento: </li>
                                <li class="list-group-item">${soloFecha}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Fecha Definicion de Via</li>
                                <li class="list-group-item">${feature.properties.estado_acumulativo}</li>
                                </ul> <br>`;

                    var contentGeneral = `<a class="btn btn-primary" data-bs-toggle="collapse" href="#multiCollapseExample1" role="button" aria-expanded="false" aria-controls="multiCollapseExample1" style="color: white; width: 100%;">Informacion Tecnica - Servicios</a>
                                
                                <div class="row">
                                    <div class="col">
                                        <div class="collapse multi-collapse" id="multiCollapseExample1">
                                          <br>
                                        <form class="row g-3">
                                                <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Calzada de Via</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="nombre_via"  placeholder="Ingrese la calzada de Via">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Clase de espacio</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="clase_espacio"  placeholder="Ingrese la clase de espacio">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tipo de Via</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="tipo_via"  placeholder="Ingrese tipo de Via">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Acera</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="acera_via"  placeholder="Ingrese la Acera">
                                                </div>

                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Servicio de Agua</li>
                                                    </ul>
                                                    <select id="role" name="role" class="form-control" required>
                                                    <option value="" disabled selected>Seleccionar Rol </option>
                                                    <option value="publico">Publico</option>
                                                    <option value="privado">privado</option>
                                                    </select>

                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Servicios</li>
                                                    </ul>

                                                    <ul class="list-group">
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                         Agua
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                        Energia Electrica
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                        Alcantarillado
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                        Gas Domiciliario
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                       Telefono
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                       Internet ADSI
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                      Internet fibra Optica
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                       Recojo de Basura
                                                    </li>
                                                     <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                       Alumbrado Publico
                                                    </li>
                                                     <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" value="" aria-label="...">
                                                       Transporte publico
                                                    </li>
                                                    </ul>
                                                </div>
                                                <button type="submit" class="btn btn-primary" style="width: 100%;">Submit</button>
                                            </form>

                                     </div>
                              </div>`;


                              if (feature.properties.estado_acumulativo == 4) {
                                buton2d = '<a href="/users/descargar/' + filename + '"  class="btn btn-primary text-white btn-sm" role="button">Ortomosaico 2D</a>';
                                buton3d = '<button class="btn btn-warning btn-sm" id="btnAgregarScript" onclick="addscript(' + feature.properties.texto + ')">Nube de Puntos 3D</button>';
                              }
                              if (feature.properties.estado_acumulativo == 0) {
                                btnsoliciud = '<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#descargasModal2" onclick = "addGrillaSolev(' + feature.properties.texto + ')">Solicitar Levantamiento</button>'
                              }
                              if (feature.properties.estado_acumulativo == 10) {
                                 buton2d = '<a href="/users/descargarot/' + filename + '"  class="btn btn-primary text-white btn-sm" role="button">Descargar Ortomosaico O.T. 2D</a>';
                              }

                    // Cambiar el contenido del panel del sidebar
                    document.getElementById('info-content').innerHTML = content;
                    document.getElementById('info-general').innerHTML = buton2d +buton3d +btnsoliciud ;
                    // Abrir el sidebar
                    sidebar.open('home');
                });

                let center = layer.getBounds().getCenter();
                let label = L.marker(center, {
                  icon: L.divIcon({
                    className: 'label maplabel',
                    html: feature.properties.texto,
                    iconSize: [40, 20]
                  })
                });
        
                // Agregar el label al layer
                layer.label = label;

            }
        }).addTo(map);

        map.on('zoomend', function () {
          let zoom = map.getZoom();
          geojsonLayer.eachLayer(function (layer) {
            if (zoom >= 15) {
              if (!map.hasLayer(layer.label)) {
                map.addLayer(layer.label);
              }
            } else {
              if (map.hasLayer(layer.label)) {
                map.removeLayer(layer.label);
              }
            }
          });
        });
        // Ejecutar el evento una vez para establecer el estado inicial
        map.fire('zoomend');
    
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
    });
const colorMap = {
    'Sin registro': '#0d6efd',
    'Tierra': '#fdec03',
    'Ripio': '#ff540b',
    'Pavic-Enladrillado': '#fd0101',
    'Piedra': '#fbfbfb',
    'Loseta': '#999682',
    'Adoquin': '#6f30cf',
    'Asfalto': '#090a0a',
    'Pavimento Rigido': '#666767'
};
const materialMap = {
    0: 'Sin registro',
    1: 'Tierra',
    2: 'Ripio',
    3: 'Pavic-Enladrillado',
    4: 'Piedra',
    5: 'Loseta',
    6: 'Adoquin',
    7: 'Asfalto',
    8: 'Pavimento Rigido',
};

async function obtenerPorcentajeMaterial() {
    try {
        const response = await fetch('  /porcentaje-material');
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const data = await response.json();
        return data; // Devolver todo el conjunto de datos
    } catch (error) {
        console.error('Error al obtener el porcentaje de material:', error);
        return null; // O manejar el error según sea necesario
    }
}

// Crear el gráfico usando Chart.js
async function crearGrafico() {
    const datos = await obtenerPorcentajeMaterial();

    if (!datos) {
        console.error('No se pudieron obtener los datos de los materiales');
        return;
    }

    // Extraer etiquetas (materiales) y datos (porcentajes) del resultado de la API
    const etiquetas = datos.map(item => item.material);
    const porcentajes = datos.map(item => item.porcentaje);
    // Asignar colores basados en el tipo de material
    const colores = etiquetas.map(material => colorMap[material] || '#C9CBCF'); // Color por defecto si no está en el mapa

    // Crear el gráfico usando Chart.js
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie', // O 'bar', 'doughnut', etc.
        data: {
            labels: etiquetas, // Etiquetas de los materiales
            datasets: [{
                data: porcentajes, // Datos de los porcentajes
                backgroundColor: colores // Colores asignados según el material
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'left'
                }
            }
        }
    });
}
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h4>Leyenda</h4>';
    div.innerHTML += '<i style="background: #ff540b"></i><span>Grilla en Levantamiento</span><br>';
    div.innerHTML += '<i style="background: #fdec03"></i><span>Grilla en Procesamiento</span><br>';
    div.innerHTML += '<i style="background: #1eca00"></i><span>Grilla en Post Procesamiento</span><br>';
    div.innerHTML += '<i style="background: #0c45d6"></i><span>Grilla Completada Publicado</span><br>';
    div.innerHTML += '<i style="background: #66a3d5"></i><span>Grilla Ortomosaico O.T. </span><br>';
    return div;
  };

legend.addTo(map);
function getMaterialByNumber(number) {
    return materialMap[number] || 'Material no encontrado';
}

document.getElementById('sidebar').classList.add("collapsed");

var marker = L.marker([28.3949, 84.1240]).addTo(map);

// search button click 
function search() {


    var latlng = document.getElementById('search').value;
    var latlngArr = latlng.split(',');
  
    var utmZone19S = '+proj=utm +zone=19 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
  
    // Sistema de referencia de coordenadas: WGS84
    var wgs84 = 'EPSG:4326';
  
    var eas = parseFloat(latlngArr[0]);
    var nort = parseFloat(latlngArr[1]);
    // Coordenadas UTM
    var easting = eas;
    var northing = nort;
  
    // Convertir de UTM zona 19 Sur a WGS84
    var latLng = proj4(utmZone19S, wgs84, [easting, northing]);
  
    /* Mostrar las coordenadas geográficas en la página web
    document.getElementById('result').innerHTML = "Latitud: " + latLng[1].toFixed(14) +
        "<br>Longitud: " + latLng[0].toFixed(14);*/
  
    map.setView([latLng[1].toFixed(14), latLng[0].toFixed(14)], 19);
    marker.setLatLng([latLng[1].toFixed(14), latLng[0].toFixed(14)]);
  
  };
  
  
  function addNametocircle() {
  
    var usuario = document.getElementById('usuario').innerText;
    var textuser = document.getElementById('imagecircle');
    let primerCaracter = usuario.charAt(0);
    textuser.innerHTML = primerCaracter;

    var role = document.getElementById('role').innerText;
    const div = document.getElementById('dropdown');
  
    if (role === 'admin' || role === 'root') {
      div.style.display = 'block';
    } else {
      div.style.display = 'none';
    }
  
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('descargasModal');
  
    modal.addEventListener('show.bs.modal', async () => {
      try {
        const response = await fetch('/users/descargados');
        const descargas = await response.json();
        const tableBody = document.getElementById('descargasTableBody');
        tableBody.innerHTML = ''; // Limpiar el contenido actual
  
        descargas.forEach((descarga) => {
          const row = document.createElement('tr');
          //    <td>${descarga.id}</td>
          //    <td>${descarga.tamano_archivo}</td>
          //console.log(descarga.fecha_hora)
          row.innerHTML = `
          
              <td>${descarga.nombre_archivo}</td>
            
              <td>${descarga.fecha_hora}</td>
              <td>${descarga.resultado}</td>
            `;
          tableBody.appendChild(row);
        });
      } catch (err) {
        console.error('Error al cargar las descargas:', err);
      }
    });
  });



  function addGrillaSolev(numeroGrilla) {

    var select = document.getElementById("grilla");
  
    // Cambia el valor de la opción seleccionada
    var nuevoValor = numeroGrilla;
    var nuevoTexto = "Grilla " + numeroGrilla;
    select.options[select.selectedIndex].value = nuevoValor;
    select.options[select.selectedIndex].text = nuevoTexto;
  
    // Asegura que la nueva opción esté seleccionada
    select.value = nuevoValor;
    console.log("el numero de grilla es " + numeroGrilla);
  
  }

  fetch('/messages')
  .then(response => response.json())
  .then(messages => {
    const messageTableBody = document.getElementById('messages');
    messages.forEach(message => {
      const tableRow = document.createElement('tr');

      // Columna "De"
      const senderCell = document.createElement('td');
      senderCell.textContent = message.sender_name;
      tableRow.appendChild(senderCell);

      // Columna "Mensaje"
      const contentCell = document.createElement('td');
      contentCell.textContent = message.content;
      tableRow.appendChild(contentCell);

      // Columna "Fecha"
      const timestampCell = document.createElement('td');
      timestampCell.textContent = message.timestamp;
      tableRow.appendChild(timestampCell);

      // Columna "Grid"
      const grillaCell = document.createElement('td');
      grillaCell.textContent = message.grilla; // Asegúrate de que `grid` esté disponible en los datos de `message`
      tableRow.appendChild(grillaCell);

      // Añadir la fila a la tabla
      messageTableBody.appendChild(tableRow);
    });
  })
  .catch(error => console.error('Error al obtener los mensajes:', error));

