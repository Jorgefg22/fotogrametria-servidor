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


module.exports = { content,contentGeneral };