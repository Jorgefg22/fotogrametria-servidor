import geopandas as gpd
from shapely.geometry import Polygon
import matplotlib.pyplot as plt
from reportlab.pdfgen import canvas
import contextily as ctx
import os

# Crear polígono
coords = [
              [-66.084803212, -17.375194844],
              [-66.084795543, -17.375195682],
              [-66.084787834, -17.375195303],
              [-66.084780294, -17.375193718],
              [-66.084773126, -17.37519097],
              [-66.084766523, -17.375187132],
              [-66.084765701, -17.375186455],
              [-66.08472844, -17.37524647],
              [-66.084741699, -17.375321582],
              [-66.085057179, -17.37526162],
              [-66.085064943, -17.37526078],
              [-66.085072744, -17.375261186],
              [-66.085080368, -17.375262827],
              [-66.085087603, -17.375265658],
              [-66.08509425, -17.3752696],
              [-66.085095121, -17.375270334],
              [-66.085150913, -17.375198884],
              [-66.08507735, -17.375128892],
              [-66.085074118, -17.375133272],
              [-66.085068519, -17.375138652],
              [-66.08506206, -17.375143053],
              [-66.085054922, -17.37514635],
              [-66.08504731, -17.37514845],
              [-66.084803212, -17.375194844]
            ]
poly = Polygon(coords)
gdf = gpd.GeoDataFrame(index=[0], crs="EPSG:4326", geometry=[poly])

# Convertir a Web Mercator (necesario para contextily)
gdf_web_mercator = gdf.to_crs(epsg=3857)

# Expandir vista con buffer (en metros, porque EPSG:3857 usa metros)
buffered = gdf_web_mercator.buffer(200)  # 500 metros alrededor
bounds = buffered.total_bounds  # [minx, miny, maxx, maxy]

# Crear figura y graficar polígono
fig, ax = plt.subplots(figsize=(12, 9), dpi=300)  # alta resolución
gdf_web_mercator.plot(ax=ax, color='blue', edgecolor='red', alpha=0.4)

# Ajustar límites del gráfico
ax.set_xlim(bounds[0], bounds[2])
ax.set_ylim(bounds[1], bounds[3])

# Añadir mapa base
ctx.add_basemap(ax, source=ctx.providers.OpenStreetMap.Mapnik)

# Quitar ejes
plt.axis('off')

# Guardar imagen temporal
img_path = "public/temp_mapa.png"
plt.savefig(img_path, format='png', bbox_inches='tight', dpi=300)
plt.close()

# Crear PDF
pdf_path = "public/mapa_python.pdf"
pdf = canvas.Canvas(pdf_path)
pdf.drawImage(img_path, 30, 350, width=550, height=400)
pdf.drawString(50, 480, "Coordenadas: WGS 84 Zona 19S + Mapa Base OSM")
pdf.save()

# Eliminar imagen temporal
if os.path.exists(img_path):
    os.remove(img_path)
