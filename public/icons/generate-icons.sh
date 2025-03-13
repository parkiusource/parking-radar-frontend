#!/bin/bash

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick no está instalado. Por favor instálalo primero."
    echo "En macOS: brew install imagemagick"
    echo "En Ubuntu/Debian: sudo apt-get install imagemagick"
    exit 1
fi

# Convertir SVG a PNG base (512x512)
convert temp-icon.svg -resize 512x512 temp-icon.png

# Generar los diferentes tamaños
convert temp-icon.png -resize 192x192 pwa-192x192.png
cp temp-icon.png pwa-512x512.png
cp temp-icon.png apple-touch-icon.png

echo "¡Íconos generados exitosamente!"
echo "Verifica que se hayan creado los siguientes archivos:"
echo "- pwa-192x192.png"
echo "- pwa-512x512.png"
echo "- apple-touch-icon.png"
