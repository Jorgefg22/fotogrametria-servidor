const { exec } = require('child_process');
const path = require('path');

const generarMapa = (req, res) => {
  const scriptPath = path.join(__dirname, '../python/generar_mapa.py');
  const pdfPath = path.join(__dirname, '../public/mapa_python.pdf');

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error al ejecutar el script Python:', error);
      return res.status(500).send('Error al generar el mapa.');
    }

    // Esperar un poco por si el archivo tarda en guardarse (opcional)
    setTimeout(() => {
      res.download(pdfPath, 'mapa_generado.pdf', (err) => {
        if (err) {
          console.error('Error al enviar el archivo:', err);
          res.status(500).send('Error al descargar el mapa.');
        }
      });
    }, 500); // medio segundo de espera por precaución
  });
};

module.exports = { generarMapa };
