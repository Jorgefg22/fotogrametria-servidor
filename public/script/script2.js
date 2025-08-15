function addscript(input,input2) {
    // Abrimos una nueva ventana con la segunda página HTML mediante una ruta de Express
    var ventana = window.open('http://localhost:5000/users/21', '21');
    // Esperamos que la nueva ventana cargue http://localhost:5000/users/geoport
    ventana.onload = function () {
        // Creamos un elemento script
        var script = ventana.document.createElement('script');
        script.type = 'text/javascript';
        // Asignamos el código JavaScript directamente
        script.textContent = `
        window.viewer = new Potree.Viewer(document.getElementById("potree_render_area"));

        viewer.setEDLEnabled(true);
        viewer.setFOV(60);
        viewer.setPointBudget(2_000_000);
        // INCLUDE SETTINGS HERE --
        viewer.loadSettingsFromURL();

        viewer.setDescription("");

        viewer.loadGUI(() => {
        viewer.setLanguage("es");
        $("#menu_appearance").next().show();
        $("#menu_tools").next().show();
        $("#menu_clipping").next().show();
        viewer.toggleSidebar();
        });

        Potree.loadPointCloud("/pointclouds/`+input+`/metadata.json", "`+input2+`", e => {
        let scene = viewer.scene;
        let pointcloud = e.pointcloud;

        let material = pointcloud.material;
        material.size = 1;
        material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        material.shape = Potree.PointShape.SQUARE;
        material.activeAttributeName = "rgba";

        scene.addPointCloud(pointcloud);

        viewer.fitToScreen();
        });
        console.log("s3e agrego")`;

        // Añadimos el script al head de la página en la nueva ventana
        ventana.document.head.appendChild(script);
    };
};