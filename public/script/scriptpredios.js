let map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 13)

L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20, // Nivel máximo de zoom
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Subdominios utilizados por Google para distribuir la carga
  attribution: 'Map data ©2023 Google' // Atribución de los datos del mapa
}).addTo(map);


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

let poligonosDataGlobal = null
var highlightLayer = null;
var poligonosLayer = null;
Promise.all([
  fetch('/leaflet/area_urbana.geojson').then(res => res.json()),
  fetch('/leaflet/lineaCota.geojson').then(res => res.json()),
  fetch('/geo/distritosadm').then(res => res.json()),
  fetch('/geo/manzanos').then(res => res.json()), // 👈 añadimos manzanos
  fetch('/geo/poligonos').then(res => res.json()),
  fetch('/geo/distritoscat').then(res => res.json()),
  fetch('/geo/vias24').then(res => res.json()),
  fetch('/geo/grilla24').then(res => res.json())
])
.then(([areaUrbanaData, lineaCotaData, distritosData, manzanosData, poligonosData,distritoscatData,vias24Data,grilla24Data]) => {
  poligonosDataGlobal = poligonosData
  // Área Urbana
  const puntosDeInteresLayer = L.geoJSON(areaUrbanaData, {
    style: () => ({
      fillColor: '#9a9fa3bd',
      weight: 2,
      color: '#cd3685',
      fillOpacity: 0.5
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
      }
    }
  });

  // Línea de Cota
  const puntosDeInteresLayercota = L.geoJSON(lineaCotaData, {
    style: () => ({
      fillColor: '#9a9fa3bd',
      weight: 5,
      color: '#cd3685',
      fillOpacity: 0.5
    }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup("<h4>Límite COTA 2750 m.s.n.m. (P.N.T.)</h4>");
    }
  });

  // Distritos
  const puntosDeInteresLayer2 = L.geoJSON(distritosData, {
  style: () => ({
    fillColor: 'black',
    weight: 2,
    color: '#cd3685',
    fillOpacity: 0.5
  }),
  onEachFeature: (feature, layer) => {
    if (feature.properties && feature.properties.nombre_dis) {
      // Popup normal
      layer.bindPopup(`<strong>Nombre:</strong> ${feature.properties.nombre_dis || 'N/A'}<br>`);

      // Centroide aproximado
      const center = layer.getBounds().getCenter();

      // El "label" se agrega como parte del layer de distritos
      const label = L.marker(center, {
        icon: L.divIcon({
          className: 'label-distrito',
          html: `<div style="color:white; font-weight:bold; text-shadow: 1px 1px 2px black;">${feature.properties.nombre_dis}</div>`
        }),
        interactive: false // evita que interfiera con clics
      });

      // Vincular el marcador al polígono para que obedezca al control de capas
      layer.on('add', () => {
        map.addLayer(label);
      });
      layer.on('remove', () => {
        map.removeLayer(label);
      });
    }
  }
});

  // Manzanos
  const manzanosLayer = L.geoJSON(manzanosData, {
    style: () => ({
      fillColor: '#ffcc00', // Amarillo para distinguir
      weight: 1,
      color: '#333',
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties) {
        let popupContent = `<div><img src="/images/adt.png" width="300px" alt=""></div>
        <div><h6>Gobierno Autonomo Municipal de Sacaba</h6>
        <strong>Cod Manzana:</strong> ${feature.properties.codigo || 'N/A'}<br>`;
       
        layer.bindPopup(popupContent);
      }
    }
  });

  poligonosLayer = L.geoJSON(poligonosData, {
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
      layer.bindPopup(`
        <div><img src="/images/adt.png" width="300px" alt=""></div>
        <div><h6>Gobierno Autonomo Municipal de Sacaba</h6>
        <ul>
          <li>Codigo Catastral: ${feature.properties.codigo_cat}</li>
          <li>Numero de Inmueble: ${feature.properties.nro_inmueb}</li>
          <li>Distrito Catastral: ${feature.properties.distrito_c}</li>
          <li>Distrito Administrativo: ${feature.properties.distrito_a}</li>
          <li>Numero de zona: ${feature.properties.zona}</li>
        </ul>
      `);
    }
  }
}).addTo(map); // 👈 esto la activa por defecto



  const distirtosCatLayer = L.geoJSON(distritoscatData, {
    style: () => ({
      fillColor: '#44df31', // Amarillo para distinguir
      weight: 1,
      color: '#333',
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties) {
        
        let popupContent = `
        <div><img src="/images/adt.png" width="300px" alt=""></div>
        <div><h6>Gobierno Autonomo Municipal de Sacaba</h6>
        <strong>Codigo:</strong> ${feature.properties.codigo || 'N/A'}<br>`;
        popupContent += `<strong>Distrito cat:</strong> ${feature.properties.nombre || 'N/A'}`;
        layer.bindPopup(popupContent);
      }
    }
  });

  // grilla
  const grillaLayer = L.geoJSON(grilla24Data, {
    style: () => ({
      fillColor: 'black',
      weight: 2,
      color: '#333',
      fillOpacity: 0.2
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties && feature.properties.texto) {
         layer.bindPopup(`<strong>nombre:</strong> ${feature.properties.texto || 'N/A'}<br>`);
      }
    }
  });

  // vias
  const viasLayer = L.geoJSON(vias24Data, {
    style: () => ({
      fillColor: '#e034e9', // Amarillo para distinguir
      weight: 1,
      color: '#333',
      fillOpacity: 0.6
    }),
    onEachFeature: (feature, layer) => {
      if (feature.properties) {
        let popupContent = `<div><img src="/images/adt.png" width="300px" alt=""></div>
        <div><h6>Gobierno Autonomo Municipal de Sacaba</h6>
        <strong>Cod Manzana:</strong> ${feature.properties.codigo || 'N/A'}<br>`;
       
        layer.bindPopup(popupContent);
      }
    }
  });

  // Control de capas
  const overlayLayers = {
    'poligonos':poligonosLayer,
    'Área Urbana': puntosDeInteresLayer,
    'Distritos': puntosDeInteresLayer2,
    'Límite Cota': puntosDeInteresLayercota,
    'Manzanos': manzanosLayer,
    'Distritos Cat': distirtosCatLayer,
    'grillas ref.': grillaLayer,
    'vias ref': viasLayer
  };
 cargarCodigos();
  L.control.layers(null, overlayLayers).addTo(map);
})
.catch(error => console.error('Error cargando una de las capas GeoJSON:', error));



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



function search() {
  const codigo = document.getElementById("search").value.trim();
  if (!codigo || !poligonosDataGlobal) return;

  const feature = poligonosDataGlobal.features.find(
    f => f.properties.codigo_cat == codigo
  );

  if (!feature) {
    alert("No se encontró el código: " + codigo);
    return;
  }

  // Quitar highlight anterior
  if (highlightLayer) {
    map.removeLayer(highlightLayer);
  }

  // Crear highlight con popup
  highlightLayer = L.geoJSON(feature, {
    style: {
      color: 'yellow',
      weight: 4,
      fillColor: 'red',
      fillOpacity: 0.7
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`
        <div><img src="/images/adt.png" width="300px" alt=""></div>
        <div><h6>Gobierno Autonomo Municipal de Sacaba</h6>
        <ul>
          <li>Codigo Catastral: ${feature.properties.codigo_cat}</li>
          <li>Numero de Inmueble: ${feature.properties.nro_inmueb}</li>
          <li>Distrito Catastral: ${feature.properties.distrito_c}</li>
          <li>Distrito Administrativo: ${feature.properties.distrito_a}</li>
          <li>Numero de zona: ${feature.properties.zona}</li>
        </ul>
      `);
    }
  }).addTo(map);

  map.fitBounds(highlightLayer.getBounds());

  // Abrir popup de highlight directamente
  highlightLayer.eachLayer(l => l.openPopup());
}


function cargarCodigos() {
  if (!poligonosDataGlobal) return;

  const datalist = document.getElementById("codigosList");
  datalist.innerHTML = ""; // limpiar

  poligonosDataGlobal.features.forEach(f => {
    if (f.properties && f.properties.codigo_cat) {
      const option = document.createElement("option");
      option.value = f.properties.codigo_cat;
      datalist.appendChild(option);
    }
  });
}