// Configuración inicial del mapa
var map = L.map('map').setView([-17.403868804926827, -66.03924367573562], 11);

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

fetch('/presas')
    .then(response => response.json())
    .then(data => {
        // Agregar los datos GeoJSON al mapa y agregar el evento click
        L.geoJSON(data, {
            style: function (feature) {
                // Define el color del polígono según la propiedad 'estado_levantamiento'
                let fillColor = '#0d6efd';

                // Retornar el objeto de estilo
                return {
                    fillColor: fillColor, // Utiliza el color determinado por el if anterior
                    weight: 0.5, // Grosor del borde
                    color: '#0d6efd', // Color del borde
                    fillOpacity: 0.7 // Opacidad del relleno
                };
            },
            onEachFeature: function (feature, layer) {
                // Asignar un evento de clic a cada polígono
                layer.on('click', function (e) {
                    // Aquí actualizamos el contenido del sidebar con información del polígono
                    var content = `<h2>Detalles de la presa</h2>
                                 <p><strong>Cod:</strong> ${feature.properties.cod}</p>
                                  <ul class="list-group">
                                  <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Nombre</li>
                                  <li class="list-group-item">${feature.properties.nombre}</li>
                                  <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Cuenca Influencia</li>
                                  <li class="list-group-item">${feature.properties.cuenca_influencia}</li>
                                  <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">SubCuenca</li>
                                  <li class="list-group-item">${feature.properties.subcuenca}</li>
                                  <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Rio</li>
                                  <li class="list-group-item">${feature.properties.rio}</li>
                                  <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tipo de Presa</li>
                                  <li class="list-group-item">${feature.properties.tipo_presa}</li>
              <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tamaño</li>
                                  <li class="list-group-item">${feature.properties.tamanio}</li>
              <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Año de Construccion</li>
                                  <li class="list-group-item">${feature.properties.anio_construccion}</li>
                                  </ul> <br>`;

                    var contentGeneral = `
                                    <p>
                                    <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" style="width: 100%;">
                                      Agregar Fotos de Inspeccion
                                    </button>
                                    </p>
                                    <div class="collapse" id="collapseExample">
                                    <div class="card card-body">
                                        <form action="/upimagespresa/${feature.properties.cod}" method="POST" enctype="multipart/form-data">
                                       
                                       <div class="mb-3">
                                        <label for="descripcion" class="form-label">Descripcion</label>
                                        <textarea class="form-control" name="descripcion" id="descripcion" rows="3"></textarea>
                                       </div>

                                       <div class="form-group">
                                        <label for="porjentaje">Porcentaje:</label><div id="tooltip">50%</div>
                                        <br>
                                        <input type="range" id="porjentaje" name="porcentaje" style="width: 100%;" min="0" max="100" value="50" oninput="tooltip.textContent = this.value + '%'">
                                       </div>
                                       <br>    
                                        <div class="mb-3">
                                            <label for="file1" class="form-label">Foto 1</label>
                                            <input type="file" class="form-control" name="foto_1" id="foto_1" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="file2" class="form-label">Foto 2</label>
                                            <input type="file" class="form-control" name="foto_2" id="foto_2" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="file3" class="form-label">Foto 3</label>
                                            <input type="file" class="form-control" name="foto_3" id="foto_3" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="file4" class="form-label">Foto 4</label>
                                            <input type="file" class="form-control" name="foto_4" id="foto_4" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="file5" class="form-label">Foto 5</label>
                                            <input type="file" class="form-control" name="foto_5" id="foto_5" required>
                                        </div>
                                        <button type="submit" class="btn btn-secondary" style="width: 100%;" >Subir archivos</button>
                                        </form>
                                    </div>
                                    </div>
                                    `;

                    // Cambiar el contenido del panel del sidebar
                    document.getElementById('info-content').innerHTML = content;
                    document.getElementById('info-general').innerHTML = contentGeneral;
                    obtenerImganesporCodpres(feature.properties.cod)
                    // Abrir el sidebar
                    sidebar.open('home');
                });
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON:', error);
    });



    let buttons = '<button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal"  onclick="cargarImagenes(';
    let funcionbutonimg = ')" >Ver fotos</button>'

    async function obtenerImganesporCodpres(id) {

        try {
            const response = await fetch('/inspecciones_presa/' + id);
            const inspecciones = await response.json();
            const tableBody = document.getElementById('inspecTableBody');
            tableBody.innerHTML = ''; // Limpiar el contenido actual

            inspecciones.forEach((inspeccion) => {
                const row = document.createElement('tr');
                let porcent ="%" 
                row.innerHTML = `
                
                    <td>${inspeccion.fecha}</td>
                    <td>${inspeccion.descripcion}</td>
                     <td>${inspeccion.porcentaje}`+ porcent+`</td>
                    <td>`+ buttons+inspeccion.id+funcionbutonimg+`</td>
                    `;
                tableBody.appendChild(row);
            });
        } catch (err) {
            console.error('Error al cargar las inspecciones:', err);
        }
    }

    async function cargarImagenes(idInspeccion) {
        try {
          const response = await fetch(`/imagenes_inspeccion/${idInspeccion}`);
          if (!response.ok) throw new Error('Error al obtener imágenes');
      
          const imagenes = await response.json(); // { foto_1, foto_2, ... }
      
          for (let i = 1; i <= 5; i++) {
            const img = document.getElementById(`foto_${i}`);
            const base64 = imagenes[`foto_${i}`];
      
            if (base64) {
              img.src = `data:image/jpeg;base64,${base64}`;
            } else {
              img.src = ''; // o una imagen por defecto si querés: "no-image.jpg"
              img.alt = 'Imagen no disponible';
            }
          }
        } catch (error) {
          console.error('Error al cargar imágenes:', error);
        }
      }
      

let capaSecundaria = "";

fetch('/embalse') // o una ruta absoluta: '/data/capa_secundaria.geojson'
    .then(response => response.json())
    .then(data => {
        capaSecundaria = L.geoJSON(data, {
            style: {
                color: '##033057', // borde verde
                fillColor: '#0d6efd',
                fillOpacity: 0.5,
                weight: 1
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`<strong>${feature.properties.nombre || 'Sin nombre'}</strong>`);
            }
        }).addTo(map);
        intentarAgregarControlCapas();
    })
    .catch(error => {
        console.error('Error al cargar el archivo GeoJSON de la capa secundaria:', error);
    }); 

    
function intentarAgregarControlCapas() {
    if (capaSecundaria) {
        let overlayMaps = {

            "Embalse": capaSecundaria
        };
        L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
    }
}



document.getElementById('sidebar').classList.add("collapsed");
