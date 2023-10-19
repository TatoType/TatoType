const canvas = new fabric.Canvas('canvas');
const colorValue = document.getElementById('colorValue');
const colorDisplay = document.getElementById('colorDisplay');
const rgbValues = document.getElementById('rgbValues');
const imageUpload = document.getElementById('imageUpload');
const maxCanvasWidth = 800; // Largura máxima do canvas
const maxCanvasHeight = 600; // Altura máxima do canvas
const iniCanvasWidth = 800; // Largura inicial do canvas
const iniCanvasHeight = 300; // Altura inicial do canvas
let originalImage = null; // Variável para armazenar a imagem original

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const imgWidth = img.width;
                const imgHeight = img.height;

                // Verifique se as dimensões da imagem excedem o tamanho máximo
                if (imgWidth > maxCanvasWidth || imgHeight > maxCanvasHeight) {
                    const scaleWidth = maxCanvasWidth / imgWidth;
                    const scaleHeight = maxCanvasHeight / imgHeight;
                    const scale = Math.min(scaleWidth, scaleHeight);

                    const newWidth = imgWidth * scale;
                    const newHeight = imgHeight * scale;

                    const canvasWidth = newWidth; // Define a largura do canvas com base no novo tamanho da imagem
                    const canvasHeight = newHeight; // Define a altura do canvas com base no novo tamanho da imagem

                    canvas.setDimensions({ width: canvasWidth, height: canvasHeight }); // Redimensiona o canvas

                    const fabricImg = new fabric.Image(img, {
                        scaleX: scale,
                        scaleY: scale,
                        selectable: false // Impede a seleção da imagem
                    });

                    canvas.clear();
                    canvas.add(fabricImg);

                    originalImage = fabricImg; // Define a imagem redimensionada como a imagem original
                } else {
                    const canvasWidth = imgWidth; // Define a largura do canvas com base na largura da imagem
                    const canvasHeight = imgHeight; // Define a altura do canvas com base na altura da imagem

                    canvas.setDimensions({ width: canvasWidth, height: canvasHeight }); // Redimensiona o canvas

                    const fabricImg = new fabric.Image(img, {
                        selectable: false // Impede a seleção da imagem
                    });

                    canvas.clear();
                    canvas.add(fabricImg);

                    originalImage = fabricImg; // Define a imagem original
                }
            };
        };
        reader.readAsDataURL(file);
    }
});

canvas.on('mouse:up', (e) => {
    if (e.target) {
        const pixel = canvas.getContext().getImageData(e.e.layerX, e.e.layerY, 1, 1).data;
        const hexColor = `#${(pixel[0] < 16 ? '0' : '') + pixel[0].toString(16)}${(pixel[1] < 16 ? '0' : '') + pixel[1].toString(16)}${(pixel[2] < 16 ? '0' : '') + pixel[2].toString(16)}`;
        colorValue.textContent = hexColor;
        colorDisplay.style.backgroundColor = hexColor;
        rgbValues.textContent = `R: ${pixel[0]}, G: ${pixel[1]}, B: ${pixel[2]}`; // Exibe os valores RGB
    }
});

document.getElementById('resetPositionButton').addEventListener('click', () => {
    if (originalImage) {
        // Redefina a posição do zoom para o valor inicial (1.0)
        zoomLevel = 1.0;
        canvas.setZoom(zoomLevel);

        // Centraliza a imagem no canvas
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;
        originalImage.set({
            left: canvasCenterX - (originalImage.width * originalImage.scaleX / 2),
            top: canvasCenterY - (originalImage.height * originalImage.scaleY / 2)
        });
        canvas.renderAll();
    }
});


const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
let zoomLevel = 1.0; // Zoom inicial
const minZoom = 0.1; // Zoom mínimo
const maxZoom = 4.0; // Zoom máximo
zoomInButton.addEventListener('click', () => {
    if (zoomLevel < maxZoom) {
        zoomLevel += 0.1;
        canvas.setZoom(zoomLevel);
        canvas.renderAll();
    }
});
zoomOutButton.addEventListener('click', () => {
    if (zoomLevel > minZoom) {
        zoomLevel -= 0.1;
        canvas.setZoom(zoomLevel);
        canvas.renderAll();
    }
});

const clearButton = document.getElementById('clearButton');
clearButton.addEventListener('click', () => {
    resetCanvas()
});

function resetCanvas() {
    canvas.clear();
    canvas.setDimensions({ width: iniCanvasWidth, height: iniCanvasHeight });
    originalImage = null;
    colorValue.textContent = '#FFFFFF'; // Branco
    colorDisplay.style.backgroundColor = '#FFFFFF';
    rgbValues.textContent = 'R: 255, G: 255, B: 255';

    // Redefina a posição do zoom para o valor inicial (1.0)
    zoomLevel = 1.0;
    canvas.setZoom(zoomLevel);

    // Centralize a imagem no canvas
    if (originalImage) {
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;
        originalImage.set({
            left: canvasCenterX - (originalImage.width * originalImage.scaleX / 2),
            top: canvasCenterY - (originalImage.height * originalImage.scaleY / 2)
        });
        canvas.renderAll();
    }
}


const moveUpButton = document.getElementById('moveUpButton');
const moveDownButton = document.getElementById('moveDownButton');
const moveLeftButton = document.getElementById('moveLeftButton');
const moveRightButton = document.getElementById('moveRightButton');
moveUpButton.addEventListener('click', () => {
  moveImage(0, -10); // Mover para cima (decrementar a posição Y)
});
moveDownButton.addEventListener('click', () => {
  moveImage(0, 10); // Mover para baixo (incrementar a posição Y)
});
moveLeftButton.addEventListener('click', () => {
  moveImage(-10, 0); // Mover para a esquerda (decrementar a posição X)
});
moveRightButton.addEventListener('click', () => {
  moveImage(10, 0); // Mover para a direita (incrementar a posição X)
});
function moveImage(deltaX, deltaY) {
  if (originalImage) {
    originalImage.set({
      left: originalImage.left + deltaX,
      top: originalImage.top + deltaY,
    });
    canvas.renderAll();
  }
}