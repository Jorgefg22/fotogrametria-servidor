let map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 13)

L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20, // Nivel máximo de zoom
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Subdominios utilizados por Google para distribuir la carga
  attribution: 'Map data ©2023 Google' // Atribución de los datos del mapa
}).addTo(map);



fetch('/geo/poligonos')
  .then(response => response.json())
  .then(data => {
    let geojsonLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          fillColor: '#ff540b',
          weight: 2,
          color: '#0d6efd',
          fillOpacity: 0.5
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.id) {
          layer.bindPopup('<div><img src="/images/adt.png" width="300px" alt=""></div>' +
            '<div><h6>Gobierno Autonomo Municipal de Sacaba</h6>' +
            '<ul><li>Codigo Catastral: ' + feature.properties.codigo_cat + '</li>' +
            '<li>Numero de Inmueble: ' + feature.properties.nro_inmueb + '</li>' +
            '<li>Distrito Catastral: ' + feature.properties.distrito_c + '</li>' +
            '<li>Distrito Administrativo: ' + feature.properties.distrito_a + '</li>' +
            '<li>Numero de zona: ' + feature.properties.zona + '</li></ul>');
           // '<h6>Subir una imagen para un Predio</h6><form action="/upload" method="post" enctype="multipart/form-data"><label>Código Catastro del Predio: </label><span id="codigo_cat_display">'+ feature.properties.codigo_cat +'</span><label for="image">Selecciona una imagen:</label><input type="file" id="image" name="image" required><br><input type="hidden" id="codigo_cat" name="codigo_cat" value="'+ feature.properties.codigo_cat +'"><button type="submit">Subir Imagen</button></form>'+
          //'<button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">imagenes cargadas</button></p><div class="collapse" id="collapseExample"><div class="card card-body"><div><ul><% images.forEach(image => { %><li><a href="/image/<%= image.id %>"><%= image.nombre %></a></li><% }) %></ul><br> </div></div></div>');

        }

        
      }
    }).addTo(map);

   
  })
  .catch(error => console.error('Error al cargar el GeoJSON:', error));


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

  console.log(primerCaracter);

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

var puntosDeInteresLayer = "";
var puntosDeInteresLayercota = "";

fetch('/leaflet/area_urbana.geojson')
  .then(response => response.json())
  .then(data => {
    // Crear una capa GeoJSON con el archivo cargado
    puntosDeInteresLayer = L.geoJSON(data, {


      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        return {
          fillColor: '#9a9fa3bd', // Cambia el color dependiendo de la propiedad 'estado_levantamiento'
          weight: 2, // Grosor del borde
          color: '#cd3685', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }

    });

  })
  .catch(error => console.error('Error cargando el archivo GeoJSON:', error));

//otro
fetch('/leaflet/lineaCota.geojson')
  .then(response => response.json())
  .then(data => {
    // Crear una capa GeoJSON con el archivo cargado
    puntosDeInteresLayercota = L.geoJSON(data, {


      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        return {
          fillColor: '#9a9fa3bd', // Cambia el color dependiendo de la propiedad 'estado_levantamiento'
          weight: 5, // Grosor del borde
          color: '#cd3685', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.area) {
          layer.bindPopup("<h4>Limite COTA 2750 m.s.n.m. (P.N.T.)</h4>");
        }
      }

    });

  })
  .catch(error => console.error('Error cargando el archivo GeoJSON:', error));


fetch('/leaflet/distritos_admin.geojson')
  .then(response => response.json())
  .then(data => {
    // Crear una capa GeoJSON con el archivo cargado
    var puntosDeInteresLayer2 = L.geoJSON(data, {


      style: function (feature) {
        // Define el color del polígono según la propiedad 'estado_levantamiento'
        return {
          fillColor: 'black', // Cambia el color dependiendo de la propiedad 'estado_levantamiento'
          weight: 2, // Grosor del borde
          color: '#cd3685', // Color del borde
          fillOpacity: 0.5 // Opacidad del relleno
        };
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      }
    });

    // Crear un objeto para las capas de superposición
    var overlayLayers = {
      'Area Urbana': puntosDeInteresLayer,
      'Distrios': puntosDeInteresLayer2,
      'Limite Cota': puntosDeInteresLayercota

    };
    L.control.layers(null, overlayLayers).addTo(map);
  })
  .catch(error => console.error('Error cargando el archivo GeoJSON:', error));


var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<h4>Leyenda</h4>';
  div.innerHTML += '<i style="background: #ff540b"></i><span>Grilla en Levantamiento</span><br>';
  div.innerHTML += '<i style="background: #fdec03"></i><span>Grilla en Procesamiento</span><br>';
  div.innerHTML += '<i style="background: #1eca00"></i><span>Grilla en Post Procesamiento</span><br>';
  div.innerHTML += '<i style="background: #0c45d6"></i><span>Grilla Completada Publicado</span><br>';
  return div;
};

legend.addTo(map);

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