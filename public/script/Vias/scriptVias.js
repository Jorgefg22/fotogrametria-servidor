const { content ,contentGeneral } = require('./contensidebar');


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

fetch(grilla2024)
    .then(response => response.json())
    .then(data => {
        // Agregar los datos GeoJSON al mapa y agregar el evento click
        L.geoJSON(data, {
            style: function (feature) {
                // Define el color del polígono según la propiedad 'estado_levantamiento'
                let fillColor;
                // Primer if para determinar el color de relleno
                if (feature.properties.material == 0) {
                    fillColor = '#0d6efd';
                } else if (feature.properties.material == 1) {
                    fillColor = '#fdec03';
                } else if (feature.properties.material == 2) {
                    fillColor = '#ff540b';
                } else if (feature.properties.material == 3) {
                    fillColor = '#fd0101';
                } else if (feature.properties.material == 4) {
                    fillColor = '#fbfbfb';
                } else if (feature.properties.material == 5) {
                    fillColor = '#999682';
                } else if (feature.properties.material == 6) {
                    fillColor = '#6f30cf';
                } else if (feature.properties.material == 7) {
                    fillColor = '#090a0a';
                } else if (feature.properties.material == 8) {
                    fillColor = '#666767';
                }
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
                    var content = `<h2>Detalles del via</h2>
                               <p><strong>ID:</strong> ${feature.id}</p>
                                <ul class="list-group">
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Distrito Catastral</li>
                                <li class="list-group-item">${feature.properties.distrito_c}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Distrito Administrativo</li>
                                <li class="list-group-item">${feature.properties.distrito_a}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Codigo de via</li>
                                <li class="list-group-item">${feature.properties.cod_via}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tipo de Material de Via</li>
                                <li class="list-group-item">${getMaterialByNumber(feature.properties.material)}</li>
                                <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Fecha Definicion de Via</li>
                                <li class="list-group-item">${feature.properties.fecha_mate}</li>
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
                                                    <input type="text" class="form-control" id="calzadaVia"  placeholder="Ingrese la calzada de Via">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Clase de espacio</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="clasespacio"  placeholder="Ingrese la clase de espacio">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tipo de Via</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="tipoVia"  placeholder="Ingrese tipo de Via">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Acera</li>
                                                    </ul>
                                                    <input type="text" class="form-control" id="aceravia"  placeholder="Ingrese la Acera">
                                                </div>
                                                 <div class="form-group">
                                                    <ul class="list-group">
                                                    <li class="list-group-item list-group-item-action list-group-item-primary" aria-current="true">Tipo de espacio</li>
                                                    </ul>
                                                    <select id="tipoEspacio" name="tipo" class="form-control" required>
                                                    <option value="" disabled selected>Seleccionar clase </option>
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
                                                        <input class="form-check-input me-1" type="checkbox" id="agua" value="" aria-label="...">
                                                         Agua
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="energiaElectrica" value="" aria-label="...">
                                                        Energia Electrica
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="alcantarillado"value="" aria-label="...">
                                                        Alcantarillado
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="gasdomiciliario" value="" aria-label="...">
                                                        Gas Domiciliario
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="telefono" value="" aria-label="...">
                                                       Telefono
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="internetadsi" value="" aria-label="...">
                                                       Internet ADSI
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="internetfibopt"value="" aria-label="...">
                                                      Internet fibra Optica
                                                    </li>
                                                    <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="recojoBas" value="" aria-label="...">
                                                       Recojo de Basura
                                                    </li>
                                                     <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="alumbradopub" value="" aria-label="...">
                                                       Alumbrado Publico
                                                    </li>
                                                     <li class="list-group-item">
                                                        <input class="form-check-input me-1" type="checkbox" id="transpub" value="" aria-label="...">
                                                       Transporte publico
                                                    </li>
                                                    </ul>
                                                </div>
                                                <button type="submit" class="btn btn-primary" style="width: 100%;">Submit</button>
                                            </form>

                                     </div>
                              </div>`;

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
        const response = await fetch('http://localhost:5000/porcentaje-material');
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
    div.innerHTML += '<i style="background: #0d6efd"></i><span>Via Sin Registro</span><br>';
    div.innerHTML += '<i style="background: #fdec03"></i><span>Via de Tierra</span><br>';
    div.innerHTML += '<i style="background: #ff540b"></i><span>Via de Ripio</span><br>';
    div.innerHTML += '<i style="background: #fd0101"></i><span>Via de Pavic Enladrillado</span><br>';
    div.innerHTML += '<i style="background: #fbfbfb"></i><span>Via de Piedra</span><br>';
    div.innerHTML += '<i style="background: #999682"></i><span>Via de Loseta</span><br>';
    div.innerHTML += '<i style="background: #6f30cf"></i><span>Via de Adoquin</span><br>';
    div.innerHTML += '<i style="background: #090a0a"></i><span>Via de Asfalto</span><br>';
    div.innerHTML += '<i style="background: #666767"></i><span>Via de Pavimento Rigido</span><br>';
    return div;
};

legend.addTo(map);
function getMaterialByNumber(number) {
    return materialMap[number] || 'Material no encontrado';
}

document.getElementById('sidebar').classList.add("collapsed");