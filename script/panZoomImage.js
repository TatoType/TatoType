panZoomImage = {canvas: document.getElementById('Canvas'),
    lastX: 0, lastY: 0, translateX: 0, translateY: 0, scale: 1.0, dragged: false, lens: 0};
panZoomImage.displayImage = function displayImage(img) {
    this.ctx = this.canvas.getContext('2d');
    this.currentImage = img;
    this.canvas.width = 800; 
    this.canvas.height = 451;
    this.redraw();
};

panZoomImage.setHiddenLensImage = function setHiddenLensImage(img) {
    this.hiddenLensImage = img;
    this.redraw();
};
function readFile(files) {
    document.getElementById("aboutBox").style.display = "none";

    if (FileReader && files && files.length) {
        if (files.length !== 1) {
            alert("Só pode mostrar um arquivo por vez");
            return;
        }
        if (!files[0].type.match('image.*')) {
            alert("Não era um arquivo de imagem. :(");
            return;
        }
        NProgress.set(0.0);
        var fr = new FileReader();
        fr.onload = function () {
            var img = new Image();
            img.onload = function () {
                var maxWidth = 800;
                var maxHeight = 600;

                var width = img.width;
                var height = img.height;

                // Verifique se a imagem é maior que o limite e redimensione se necessário
                if (width > maxWidth || height > maxHeight) {
                    if (width / maxWidth > height / maxHeight) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                }

                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                currentImage = new Image();
                currentImage.onload = function () {
                    panZoomImage.setHiddenLensImage(currentImage);
                    clearImageCache();
                    filterOrImageChanged();
                };
                currentImage.src = canvas.toDataURL('image/jpeg'); // Converta para formato de dados da imagem
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(files[0]);
    }
    else {
        alert("Seu navegador não oferece suporte aos recursos necessários.");
    }
}

panZoomImage.onresize = function () {
    /*this.canvas.style.width  = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;*/
    this.redraw();
};
window.addEventListener('resize', function () {
    panZoomImage.onresize();
}, false);
window.addEventListener('load', function () {
    panZoomImage.onresize();
}, false);

panZoomImage.getFullImage = function getFullImage() {
    return this.lens === 0 || this.lens === 1 ? this.currentImage : this.hiddenLensImage;
};
panZoomImage.getLensImage = function getFullImage() {
    return this.lens === 2 ? this.currentImage : this.hiddenLensImage;
};
panZoomImage.clearImage = function clearImage() {
    if (this.currentImage) {
        this.ctx.clearRect(
            this.translateX, this.translateY,
            this.scale * this.currentImage.width, this.scale * this.currentImage.height);
    }
};
panZoomImage.drawImageAndLens = function drawImageAndLens() {
    if (!this.currentImage) {
        return;
    }

    // Limpe o canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var lensImage = this.getLensImage();
    var fullImage = this.getFullImage();
    this.ctx.drawImage(fullImage,
        0, 0, this.currentImage.width, this.currentImage.height,
        this.translateX, this.translateY,
        this.currentImage.width * this.scale, this.currentImage.height * this.scale);

    if (this.lens === 1 || this.lens === 2) {
        this.drawLens();
    }
};
panZoomImage.clearLens = function clearLens() {
    if (!this.currentImage) {
        return;
    }

    this.ctx.drawImage(this.getFullImage(),
            (this.lastX - this.translateX - 50) / this.scale, (this.lastY - this.translateY - 50) / this.scale,
            100 / this.scale, 100  / this.scale,
            this.lastX - 50, this.lastY - 50,
            100, 100);
};
panZoomImage.drawLens = function drawLens() {
    if (!this.currentImage || this.lens === 0) {
        return;
    }
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.lastX, this.lastY, 50, 0, 2 * Math.PI);
    this.ctx.clip();
    this.ctx.drawImage(this.getLensImage(),
            (this.lastX - this.translateX - 50) / this.scale, (this.lastY - this.translateY - 50) / this.scale,
            100 / this.scale, 100  / this.scale,
            this.lastX - 50, this.lastY - 50,
            100, 100);
    this.ctx.restore();
};
panZoomImage.redraw = function redraw() {
    if (this.currentImage) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawImageAndLens();
    }
};
panZoomImage.canvas.addEventListener('mousedown', function (evt) {
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
    panZoomImage.lastX = evt.offsetX || (evt.pageX - panZoomImage.canvas.offsetLeft);
    panZoomImage.lastY = evt.offsetY || (evt.pageY - panZoomImage.canvas.offsetTop);
    panZoomImage.dragStart = {x: panZoomImage.lastX, y: panZoomImage.lastY};
    panZoomImage.dragged = false;
}, false);
panZoomImage.canvas.addEventListener('mousemove', function (evt) {
    var thisX = evt.offsetX || (evt.pageX - panZoomImage.canvas.offsetLeft);
    var thisY = evt.offsetY || (evt.pageY - panZoomImage.canvas.offsetTop);
    panZoomImage.dragged = true;
    if (panZoomImage.dragStart) {
        panZoomImage.clearImage();
        panZoomImage.translateX += thisX - panZoomImage.lastX;
        panZoomImage.translateY += thisY - panZoomImage.lastY;
        panZoomImage.drawImageAndLens();
    } else {
        panZoomImage.clearLens();
    }
    panZoomImage.lastX = thisX;
    panZoomImage.lastY = thisY;
    if (!panZoomImage.dragStart) {
        panZoomImage.drawLens();
    }

}, false);
panZoomImage.zoom = function (clicks) {
    if (!this.currentImage) {
        return;
    }
    this.clearImage();

    var oldscale = this.scale;
    this.scale *= Math.pow(1.1, clicks);

    this.translateX += (this.translateX - this.lastX) * (this.scale / oldscale - 1);
    this.translateY += (this.translateY - this.lastY) * (this.scale / oldscale - 1);
    this.drawImageAndLens();
};
panZoomImage.canvas.addEventListener('mouseup', function (evt) {
    panZoomImage.dragStart = null;
    if (!panZoomImage.dragged) {
        panZoomImage.zoom(evt.shiftKey ? -1 : 1);
    }
}, false);

var handleScroll = function (evt) {
    var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) {
        panZoomImage.zoom(delta);
    }
    return evt.preventDefault() && false;
};
panZoomImage.canvas.addEventListener('DOMMouseScroll', handleScroll, false);
panZoomImage.canvas.addEventListener('mousewheel', handleScroll, false);
