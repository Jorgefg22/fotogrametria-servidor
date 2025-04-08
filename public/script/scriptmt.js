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
                                  <li class="list-group-item">${getMaterialByNumber(feature.properties.rio)}</li>
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
                    // Abrir el sidebar
                    sidebar.open('home');
                });
            }
        }).addTo(map);
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


function getMaterialByNumber(number) {
    return materialMap[number] || 'Material no encontrado';
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
