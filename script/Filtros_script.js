var loadingIndicator = document.getElementById('loadingIndicator');
function filterOrImageChanged() {

    var type = document.querySelector('input[name = "colorblindType"]:checked').value;
    var method = document.querySelector('#method option:checked').value;
    var filterName = method + type;
    console.log("filterOrImageChanged: " + filterName);

    document.getElementById('imageLink').style.display = type === "Normal" ? "none" : "inline";
    var isMachado = method == "macha";
    document.getElementById('severity').parentElement.style.display = isMachado ? 'inline' : 'none';
    ['Protanopia', 'Deuteranopia', 'Tritanopia', 'Achromatopsia'].forEach((item, i) => {
        document.querySelector('input[type="radio"][value="' + item + '"]').parentElement.style.display = isMachado ? 'none' : 'inline';
    });
    if (method == 'macha' && type != "Normal") {
        filterName += "_" + document.getElementById('severity').value
    }


    if (currentImage) {
        loadingIndicator.style.display = "inline";
        NProgress.set(0.2);
        setTimeout(function () {
            getFilteredImage(currentImage, filterName, function (filteredImage, url) {
                document.getElementById('imageLink').href = url;
                panZoomImage.displayImage(filteredImage);
                NProgress.done();
                loadingIndicator.style.display = "none";
            });
        }, 0);
    }
}

function lensChanged() {
    var v = document.querySelector('input[name = "lens"]:checked').value;
    if (v === "No") {
        panZoomImage.lens = 0;
    } else if (v === "Normal") {
        panZoomImage.lens = 1;
    } else if (v === "Inverse") {
        panZoomImage.lens = 2;
    } else {
        throw "Illegal Lens Type";
    }
    panZoomImage.redraw();
}
(function () {
    var radios = document.querySelectorAll('input[name = "colorblindType"]');
    var i;
    for (i = 0; i < radios.length; i++) {
        radios[i].onclick = filterOrImageChanged;
    }
    radios = document.querySelectorAll('input[name = "lens"]');
    for (i = 0; i < radios.length; i++) {
        radios[i].onclick = lensChanged;
    }
    document.getElementById("method").onchange = filterOrImageChanged;
    document.getElementById("severity").onchange = filterOrImageChanged;
})();

var fileInput = document.getElementById('fileInput');
var currentImage;
fileInput.onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;
    readFile(files);
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

                // Verifica se a imagem é menor que o limite e amplie se necessário
                if (width < maxWidth || height < maxHeight) {
                    if (width / maxWidth > height / maxHeight) {
                        if (width < maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height < maxHeight) {
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

                // Exiba a imagem no elemento "imageWrapper"
                var imageWrapper = document.getElementById('imageWrapper');
                imageWrapper.innerHTML = '';
                imageWrapper.appendChild(currentImage);
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(files[0]);
    }
    else {
        alert("Seu navegador não oferece suporte aos recursos necessários.");
    }
}
var canvasDiv = document.getElementById("canvasDiv");
var dropNotification = document.getElementById("dropNotification");

canvasDiv.addEventListener('drop', function (evt) {
    evt.stopPropagation();
    evt.preventDefault();

    dropNotification.style.display = "none";
    readFile(evt.dataTransfer.files);
}, false);

canvasDiv.addEventListener('dragover', function (evt) {
    document.getElementById("aboutBox").style.display = "none";
    evt.stopPropagation();
    evt.preventDefault();
    dropNotification.style.display = "block";
    evt.dataTransfer.dropEffect = 'copy';
}, false);

canvasDiv.addEventListener('dragleave', function (evt) {
    dropNotification.style.display = "none";
}, false);


document.onpaste = function (event) {

    var items = (event.clipboardData || event.originalEvent.clipboardData).items;

    var blob = null;
    for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = items[i].getAsFile();
        }
    }

    if (blob !== null) {
        readFile([blob]);
    }
};