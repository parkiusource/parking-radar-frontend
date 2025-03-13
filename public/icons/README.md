# Generación de Íconos PWA

Este directorio contiene los íconos necesarios para la Progressive Web App (PWA).

## Íconos Requeridos

1. `temp-icon.png` - Ícono temporal que se está usando actualmente
2. `pwa-192x192.png` - Ícono de 192x192 píxeles (pendiente de generar)
3. `pwa-512x512.png` - Ícono de 512x512 píxeles (pendiente de generar)
4. `apple-touch-icon.png` - Ícono para dispositivos iOS

## Instrucciones para Generar los Íconos

### Usando una Herramienta Online

1. Ve a https://www.iloveimg.com/resize-image
2. Sube el archivo `temp-icon.png`
3. Genera dos versiones:
   - Una de 192x192 píxeles (guarda como `pwa-192x192.png`)
   - Una de 512x512 píxeles (guarda como `pwa-512x512.png`)
4. Coloca los archivos generados en este directorio

### Usando ImageMagick (si está instalado)

```bash
# Para generar el ícono de 192x192
convert temp-icon.png -resize 192x192 pwa-192x192.png

# Para generar el ícono de 512x512
convert temp-icon.png -resize 512x512 pwa-512x512.png
```

## Verificación

Una vez generados los íconos:
1. Asegúrate de que los archivos estén en este directorio
2. Verifica que los nombres coincidan exactamente con los especificados
3. Comprueba que las dimensiones sean correctas
4. Reinicia el servidor de desarrollo para ver los cambios
