document.addEventListener('DOMContentLoaded', function () {
    // Mevcut ol-viewport öğelerini temizle
    const mapContainer = document.getElementById('map');
    while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
    }
    const turkeyCenter = ol.proj.fromLonLat([32.9113, 40.0221]);

    const view = new ol.View({
        center: turkeyCenter,
        zoom: 6,
    });
    // OpenLayers harita oluşturma
    var map = new ol.Map({ //harita oluşturuyoruz
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM() //haritanın türü, OSM haritası
            })
        ],
        view: view,
    });

    // Define a vector source to hold the points
    const vectorSource = new ol.source.Vector();
    const vectorSourcePolygon = new ol.source.Vector();

    // Define a vector layer to display the points
    const vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    const vectorLayerPolygon = new ol.layer.Vector({
        source: vectorSourcePolygon
    });

    // Add the vector layer to the map
    map.addLayer(vectorLayer);
    map.addLayer(vectorLayerPolygon);
    // Sayfa yüklendiğinde getAll methodunu çağır
    //harita üzerinde nokta, polygon ve görseller eklenmesi için bi vektör oluşturulur. bu vektör az önce yukarıda oluşturduğumuz map nesnesinin içine eklenir. (map.addLayer(vector)). bu sayede harita üzerine yeni bi katman eklemiş oluruz. bu vektör katmanına eklenen veriler bu sayede harita üzerinde görülecektir.

    window.onload = function () {
        getAllPoints(); //sayfa ilk açıldığında window.onload ile ilk burası çalışır. bu sayede getAllPoints fonksiyonu çağırılır ve apiden tüm veriler getirilir ve haritaya nokta eklenir.
        getAllPolygon();
    };


    var addPointBtn = document.getElementById('addPointBtn'); //addPointBtn bu isim index.html'de bulunan butonun id'sidir. bu sayede bu butona tıklanıp tıklanmadığı bilgisi elde edilir.
    var getAllPointsBtn = document.getElementById('getAllPoints'); //addAllPointBtn bu isim index.html butonunun id'sidir. bu sayede butona tıklanıp tıklanmadığı bilgisi elde edilir.
    var queryPointsBtn = document.getElementById('queryPointsBtn');
    var addPolygonBtn = document.getElementById('addPolygonBtn');
    var queryPolygonBtn = document.getElementById('queryPolygonBtn');
    var drawInteraction; //çizim işlemi için bi nesne üretilir ve daha sonra hangi çizim işlemi yapılcaksa bu nesneye o değer atanır. Point çizim aktif edilcekse type'ı Point yapılır. Polygon çizim yapılcaksa type'ı Polygon çizim yapılır vs. gibi.
    var modifyInteraction;

    addPointBtn.addEventListener('click', function () { //burada aslında addPointBtn izleniyor gibi düşünebiliriz. AddPoint butonuna tıklandığında bu method çalışmaya başlayacak 'click' dediği şey aslında diyor ki sen addPoint butonuna basarsan ben bunu yakalarım ve çalışırım.
        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
        }
        drawInteraction = new ol.interaction.Draw({
            type: 'Point'
        });
        map.addInteraction(drawInteraction);
        //addPointe tıkladığında diyor ki tamam sen point çizmek istiyosun o zaman ben bu çizim elemanının type'ını point yapayım sen haritaya her tıkladığında ben bi nokta koyayım diyor.

        drawInteraction.on('drawend', function (event) { //burasıda çizim bitişini kontrol ediyor. bi yere gelip mause ile tıklayıp bıraktığında burası çalışmaya başlar.
            var coordinates = event.feature.getGeometry().getCoordinates();
            var lonLat = ol.proj.toLonLat(coordinates);
            //bi yere tıklandığında koordinat bilgilerini openlayersin nimetlerinden faydanalanarak bulur.

            jsPanel.create({
                id: 'addPointJsPanel',
                container: 'body',
                theme: 'dark',
                headerTitle: 'Coordinate Form',
                position: {
                    my: 'right-top',
                    at: 'right-top'
                },
                contentSize: {
                    width: '30%',
                    height: 'auto'
                },
                content: `
        <form id="pointForm">
            <label for="xCoord">X Coordinate:</label>
            <input type="text" id="xCoord" name="xCoord" value="${lonLat[0]}" readonly><br>
            <label for="yCoord">Y Coordinate:</label>
            <input type="text" id="yCoord" name="yCoord" value="${lonLat[1]}" readonly><br>
            <label for="pointName">Name:</label>
            <input type="text" id="pointName" name="pointName"><br>
            <input type="submit" value="Save"> 
        </form>
        `, //jspanel içindeki alanları ekler. x, y ve name alanlarını ekler. x ve y için yukarda bulunduğu koordinat bilgilerini yerlerine yazar.
                callback: function (panel) {
                    panel.content.style.padding = '20px';
                    panel.resize({
                        width: 'auto',
                        height: 'auto'
                    });

                    // Form gönderimini yönet
                    const form = panel.content.querySelector('#pointForm'); //jspanel içindeki formun bilgilerini alır. 
                    form.addEventListener('submit', function (e) { //formu doldurup kaydet butonuna basarsan ben çalışırım diyor.
                        e.preventDefault();

                        // Form verilerini topla
                        const X = document.getElementById('xCoord').value;
                        const Y = document.getElementById('yCoord').value;
                        const Name = document.getElementById('pointName').value;
                        //formun içindeki x, y ve name alanlarını alır ve apiye istek atarken kullanır.

                        // POST isteği ile form verilerini gönder
                        fetch('https://localhost:7153/api/Point', { //nereye istek atıcağımızı söyledik.
                            method: 'POST', //post methoduna istek atacağımızı da bildirdik.
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                X: X,
                                Y: Y,
                                Name: Name //yukarda elde ettiğimiz x,y ve name alanlarını istek ile beraber gönderiyoruz. 
                            })
                        })
                            .then(response => response.json()) //apiden dönen cevabı alır. respons.json ile bizim cevabı anlayabilceğimiz hale dönüştürür.
                            .then(data => {
                                //console.log('Success:', data);
                                // API yanıtına göre işlem yap
                                // Örneğin, bir mesaj gösterme
                                //eğer işlem başarılı ise önce drawInteraction nesnesini null yapar ki çizim işlemini bitirsin sonra panel.close ile paneli kapatır. çünkü kayıt tanımlandı gatAllPoint() fonksiyonunu çağırarak veritabanından tüm datayı çeker. önceden 4 veri şimdi 5 veri olacak ve harita üzerindeki veriler otomatik olarak güncellenmiş olacak.
                                map.removeInteraction(drawInteraction);
                                panel.close();  // Paneli kapat
                                getAllPoints();
                                //alert('Point saved successfully!');
                                showAlert("Point", "Point saved successfully!", "success");

                            })
                            .catch((error) => {
                                //console.error('Error:', error);
                                // Hata durumunda işlem yap
                                map.removeInteraction(drawInteraction);
                                //alert('An error occurred while saving the point.');
                                showAlert("Point", "An error occurred while saving the point.", "error");
                            });
                    });
                }
            });
        });
    });

    addPolygonBtn.addEventListener('click', function () { //burada aslında addPointBtn izleniyor gibi düşünebiliriz. AddPoint butonuna tıklandığında bu method çalışmaya başlayacak 'click' dediği şey aslında diyor ki sen addPoint butonuna basarsan ben bunu yakalarım ve çalışırım.
        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
        }
        drawInteraction = new ol.interaction.Draw({
            type: 'Polygon'
        });
        map.addInteraction(drawInteraction);
        //addPointe tıkladığında diyor ki tamam sen point çizmek istiyosun o zaman ben bu çizim elemanının type'ını point yapayım sen haritaya her tıkladığında ben bi nokta koyayım diyor.

        drawInteraction.on('drawend', function (event) { //burasıda çizim bitişini kontrol ediyor. bi yere gelip mause ile tıklayıp bıraktığında burası çalışmaya başlar.
            var feature = event.feature;
            var wktFormat = new ol.format.WKT();
            var wkt = wktFormat.writeFeature(feature);

            //bi yere tıklandığında koordinat bilgilerini openlayersin nimetlerinden faydanalanarak bulur.

            jsPanel.create({
                id: 'addPolygonJsPanel',
                container: 'body',
                theme: 'dark',
                headerTitle: 'Polygon Form',
                position: {
                    my: 'right-top',
                    at: 'right-top'
                },
                contentSize: {
                    width: '30%',
                    height: 'auto'
                },
                content: `
        <form id="polygonForm">
            <label for="pointName">Name:</label>
            <input type="text" id="polygonName" name="polygonName"><br>
            <input type="submit" value="Save"> 
        </form>
        `, //jspanel içindeki alanları ekler. x, y ve name alanlarını ekler. x ve y için yukarda bulunduğu koordinat bilgilerini yerlerine yazar.
                callback: function (panel) {
                    panel.content.style.padding = '20px';
                    panel.resize({
                        width: 'auto',
                        height: 'auto'
                    });

                    // Form gönderimini yönet
                    const form = panel.content.querySelector('#polygonForm'); //jspanel içindeki formun bilgilerini alır. 
                    form.addEventListener('submit', function (e) { //formu doldurup kaydet butonuna basarsan ben çalışırım diyor.
                        e.preventDefault();

                        // Form verilerini topla
                        const Wkt = wkt;
                        const Name = document.getElementById('polygonName').value;
                        //formun içindeki x, y ve name alanlarını alır ve apiye istek atarken kullanır.

                        // POST isteği ile form verilerini gönder
                        fetch('https://localhost:7153/api/Polygon', { //nereye istek atıcağımızı söyledik.
                            method: 'POST', //post methoduna istek atacağımızı da bildirdik.
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                WktString: Wkt,
                                Name: Name
                            })
                        })
                            //.then(response => response.json()) //apiden dönen cevabı alır. respons.json ile bizim cevabı anlayabilceğimiz hale dönüştürür.
                            .then(data => {
                                //console.log('Success:', data);
                                // API yanıtına göre işlem yap
                                // Örneğin, bir mesaj gösterme
                                //eğer işlem başarılı ise önce drawInteraction nesnesini null yapar ki çizim işlemini bitirsin sonra panel.close ile paneli kapatır. çünkü kayıt tanımlandı gatAllPoint() fonksiyonunu çağırarak veritabanından tüm datayı çeker. önceden 4 veri şimdi 5 veri olacak ve harita üzerindeki veriler otomatik olarak güncellenmiş olacak.
                                map.removeInteraction(drawInteraction);
                                panel.close();  // Paneli kapat
                                //getAllPolygon();
                                //alert('Polygon saved successfully!');
                                getAllPolygon();
                                showAlert("Polygon", "Polygon saved successfully!", "success");

                            })
                            .catch((error) => {
                                //console.error('Error:', error);
                                // Hata durumunda işlem yap
                                map.removeInteraction(drawInteraction);
                                //alert('An error occurred while saving the polygon.');
                                showAlert("Polygon", "An error occurred while saving the polygon.", "error");
                            });
                    });
                }
            });
        });
    });

    getAllPointsBtn.addEventListener('click', function () {
        drawInteraction = null;
        getAllPoints();
    }); //harita sayfasındaki tüm verileri getir butonuna basınca burası çalışır ve gider getAllPoint() fonksiyonunu çalıştırır.

    queryPointsBtn.addEventListener('click', function () { // queryPointsBtn butonuna tıklanıldığında bu olay çalışır

        var existingPanel = document.getElementById('queryPointListJsPanel');
        if (existingPanel) {
            existingPanel.parentElement.removeChild(existingPanel);
        }

        jsPanel.create({
            id: 'queryPointListJsPanel',
            container: 'body',
            theme: 'dark',
            headerTitle: 'Points List',
            position: {
                my: 'right-top',
                at: 'right-top'
            },
            contentSize: {
                width: '920px',
                height: '450px'
            },
            content: `<div id="pointsList">Loading...</div>'
            `, // jsPanel içindeki alanları ekler. Arama formu için bir input ve submit butonu ekler.
            callback: function (panels) {
                //panel.content.style.padding = '20px';
                //panel.resize({
                //    width: 'auto',
                //    height: 'auto'
                //});

                // API'den tüm noktaları al
                fetch('https://localhost:7153/api/Point')
                    .then(response => response.json())
                    .then(data => {
                        const pointsList = panels.content.querySelector('#pointsList');
                        pointsList.innerHTML = ''; // Mevcut içeriği temizle
                        if (data.length === 0) {
                            pointsList.innerHTML = 'No points available.';
                        } else {
                            const table = document.createElement('table');
                            const thead = document.createElement('thead');
                            const tbody = document.createElement('tbody');

                            // Başlıkları oluştur
                            thead.innerHTML = `
                            <tr>
                                <th>Name</th>
                                <th>X</th>
                                <th>Y</th>
                                <th>Actions</th>
                            </tr>
                        `;

                            // Satırları oluştur
                            data.forEach(point => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                                 <td>${point.name}</td>
                                 <td>${point.x}</td>
                                 <td>${point.y}</td>
                                 <td>
                                     <button class="updateBtn" data-id="${point.id}">Update</button>
                                     <button class="manualBtn" data-id="${point.id}">Manual</button>
                                     <button class="displayBtn" data-id="${point.x}, ${point.y}">Display</button>
                                     <button class="deleteBtn" data-id="${point.id}">Delete</button>
                                 </td>
                            `;
                                tbody.appendChild(tr);
                            });

                            table.appendChild(thead);
                            table.appendChild(tbody);
                            pointsList.appendChild(table);

                            // Güncelle ve Sil butonları için event listener ekle
                            panels.content.querySelectorAll('.updateBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    const point = data.find(p => p.id === parseInt(id));

                                    openUpdatePanel(point);
                                });
                            });
                            panels.content.querySelectorAll('.manualBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    const point = data.find(p => p.id === parseInt(id));
                                    map.removeInteraction(modifyInteraction);

                                    // Sürükleme etkileşimi oluştur
                                    modifyInteraction = new ol.interaction.Modify({
                                        source: vectorSource // Noktalarınızın kaynağı
                                    });

                                    // Haritaya etkileşimi ekle
                                    map.addInteraction(modifyInteraction);

                                    // Özellik değiştirildiğinde (noktayı bıraktığınızda) tetiklenir
                                    modifyInteraction.on('modifyend', function (event) {
                                        event.features.forEach(function (feature) {
                                            var newCoordinates = feature.getGeometry().getCoordinates();
                                            var lonLat = ol.proj.toLonLat(newCoordinates);
                                            var x = lonLat[0]; // X koordinatı
                                            var y = lonLat[1]; // Y koordinatı
                                            // Yeni koordinatları API'ye gönder
                                            fetch('https://localhost:7153/api/Point/' + point.id, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ Id: point.id, Name: point.name, X: x, Y: y })
                                            })
                                                .then(response => response.json())
                                                .then(data => {
                                                    vectorSource.clear();
                                                    getAllPoints();
                                                    queryPointsBtn.click();
                                                })
                                                .catch((error) => {
                                                    console.error('Güncelleme hatası:', error);
                                                });

                                            map.removeInteraction(modifyInteraction);

                                        });
                                    });



                                });
                            });

                            panels.content.querySelectorAll('.displayBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    // Butonun bulunduğu satırı al
                                    var row = button.closest('tr');

                                    // X ve Y koordinatlarını satırdan al
                                    var x = parseFloat(row.cells[1].innerText); // X sütunu
                                    var y = parseFloat(row.cells[2].innerText); // Y sütunu

                                    // Koordinatları WGS 84'ten Web Mercator'a dönüştür
                                    var viewCoordinates = ol.proj.fromLonLat([x, y], 'EPSG:3857');

                                    // Harita görünümünü yeni koordinatlara zoom yapacak şekilde ayarla
                                    map.getView().animate({
                                        center: viewCoordinates,
                                        zoom: 15, // İstediğiniz zoom seviyesi
                                        duration: 1000 // Animasyon süresi (ms)
                                    });
                                });
                            });

                            panels.content.querySelectorAll('.deleteBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    // Silme işlevini burada çağır
                                    if (confirm('Are you sure you want to delete this point?')) {
                                        fetch(`https://localhost:7153/api/Point/${id}`, {
                                            method: 'DELETE'
                                        })
                                            .then(response => response.json())
                                            .then(() => {
                                                panels.close();  // Paneli kapat
                                                vectorSource.clear();

                                                getAllPoints();
                                                //alert('Point updated successfully!');
                                                showAlert("Point", "Point deleted successfully!", "success");
                                            })
                                            .catch(error => {
                                                //alert('An error occurred while updating the point.');
                                                showAlert("Point", "Point deleted successfully!", "error");

                                            });
                                    }

                                });
                            });

                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        panels.content.querySelector('#pointsList').innerHTML = 'Error fetching points.';
                    });
            }
        });
    });

    queryPolygonBtn.addEventListener('click', function () { // queryPolygonsBtn butonuna tıklanıldığında bu olay çalışır
        var existingPanel = document.getElementById('queryPolygonListJsPanel');
        if (existingPanel) {
            existingPanel.parentElement.removeChild(existingPanel);
        }

        jsPanel.create({
            id: 'queryPolygonListJsPanel',
            container: 'body',
            theme: 'dark',
            headerTitle: 'Polygons List',
            position: {
                my: 'right-top',
                at: 'right-top'
            },
            contentSize: {
                width: '920px',
                height: '450px'
            },
            content: '<div id="polygonsList">Loading...</div>', // jsPanel içindeki alanları ekler. Arama formu için bir input ve submit butonu ekler.
            callback: function (panels) {
                //panel.content.style.padding = '20px';
                //panel.resize({
                //    width: 'auto',
                //    height: 'auto'
                //});

                // API'den tüm noktaları al
                fetch('https://localhost:7153/api/Polygon')
                    .then(response => response.json())
                    .then(data => {
                        const polygonsList = panels.content.querySelector('#polygonsList');
                        polygonsList.innerHTML = ''; // Mevcut içeriği temizle
                        if (data.length === 0) {
                            polygonsList.innerHTML = 'No polygons available.';
                        } else {
                            const table = document.createElement('table');
                            const thead = document.createElement('thead');
                            const tbody = document.createElement('tbody');

                            // Başlıkları oluştur
                            thead.innerHTML = `
                            <tr>
                                <th>Name</th>
                                <th>Actions</th>
                            </tr>
                        `;

                            // Satırları oluştur
                            data.forEach(polygon => {
                                const tr = document.createElement('tr');
                                tr.innerHTML = `
                                 <td>${polygon.name}</td>
                                 <td>
                                     <button class="updateBtn" data-id="${polygon.id}">Update</button>
                                     <button class="manualBtn" data-id="${polygon.id}">Manual</button>
                                     <button class="displayBtn" data-id="${polygon.wkt}">Display</button>
                                     <button class="deleteBtn" data-id="${polygon.id}">Delete</button>
                                 </td>
                            `;
                                tbody.appendChild(tr);
                            });

                            table.appendChild(thead);
                            table.appendChild(tbody);
                            polygonsList.appendChild(table);

                            // Güncelle ve Sil butonları için event listener ekle
                            panels.content.querySelectorAll('.updateBtn').forEach(button => {

                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    const polygon = data.find(p => p.id === parseInt(id));

                                    // Poligonu bul ve etkileşime ekle
                                    var feature = vectorSourcePolygon.getFeatures().find(f => f.getId().toString() === id);

                                    // Sürükleme etkileşimi oluştur
                                    var translateInteraction = new ol.interaction.Translate({
                                        features: new ol.Collection([feature]) // Taşınabilir özellikler
                                    });

                                    // Haritaya etkileşimi ekle
                                    map.addInteraction(translateInteraction);

                                    // Özellik değiştirildiğinde (noktayı bıraktığınızda) tetiklenir
                                    translateInteraction.on('translateend', function (event) {
                                        var wktFormat = new ol.format.WKT();
                                        var wkt = wktFormat.writeFeature(feature, {
                                            dataProjection: 'EPSG:3857',
                                            featureProjection: map.getView().getProjection()
                                        });

                                        // Yeni koordinatları API'ye gönder
                                        openUpdatePanelForPolygon(polygon,wkt);


                                        // Haritadan etkileşimi kaldır
                                        map.removeInteraction(translateInteraction);
                                    });
                                });
                            });

                            panels.content.querySelectorAll('.manualBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    const polygon = data.find(p => p.id === parseInt(id));

                                    // Poligonu bul ve etkileşime ekle
                                    var feature = vectorSourcePolygon.getFeatures().find(f => f.getId().toString() === id);
                                    map.removeInteraction(modifyInteraction);

                                    // Sürükleme etkileşimi oluştur
                                    modifyInteraction = new ol.interaction.Modify({
                                        features: new ol.Collection([feature]) // Yalnızca seçilen özellik
                                    });

                                    // Haritaya etkileşimi ekle
                                    map.addInteraction(modifyInteraction);

                                    // Özellik değiştirildiğinde (noktayı bıraktığınızda) tetiklenir
                                    modifyInteraction.on('modifyend', function (event) {
                                        var wktFormat = new ol.format.WKT();
                                        var wkt = wktFormat.writeFeature(feature);

                                        openUpdatePanelForPolygon(polygon, wkt)
                                        // Haritadan etkileşimi kaldır
                                    });
                                });
                            });

                            panels.content.querySelectorAll('.displayBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const wkt = this.dataset.id;
                                    var wktFormat = new ol.format.WKT();
                                    // WKT stringini OpenLayers geometrisine dönüştürün
                                    var feature = wktFormat.readFeature(wkt, {
                                        dataProjection: 'EPSG:3857', // WKT koordinat sistemine bağlı olarak değişebilir
                                        featureProjection: 'EPSG:3857' // Harita koordinat sistemi
                                    });
                                    var extent = feature.getGeometry().getExtent();
                                    map.getView().fit(extent, { duration: 1000 });

                                });
                            });

                            panels.content.querySelectorAll('.deleteBtn').forEach(button => {
                                button.addEventListener('click', function () {
                                    const id = this.dataset.id;
                                    // Silme işlevini burada çağır
                                    if (confirm('Are you sure you want to delete this polygon?')) {
                                        fetch(`https://localhost:7153/api/Polygon/${id}`, {
                                            method: 'DELETE'
                                        })
                                            .then(() => {
                                                panels.close();  // Paneli kapat
                                                vectorSource.clear();

                                                getAllPolygon();
                                                //alert('Polygon updated successfully!');
                                                showAlert("Polygon", "Polygon deleted successfully!", "success");
                                            })
                                            .catch(error => {
                                                //alert('An error occurred while updating the polygon.');
                                                showAlert("Polygon", "Polygon deleted successfully!", "error");

                                            });
                                    }

                                });
                            });

                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        panels.content.querySelector('#polygonsList').innerHTML = 'Error fetching polygons.';
                    });
            }
        });
    });
    function getAllPoints() {
        fetch('https://localhost:7153/api/Point') //tüm datayı çekmek için Point controllerin Get methoduna istek atar.
            .then(response => response.json()) //apiden gelen response'yi alır
            .then(data => {
                vectorSource.clear();
                data.forEach(point => {
                    const coord = ol.proj.fromLonLat([point.x, point.y]);
                    const feature = new ol.Feature({
                        geometry: new ol.geom.Point(coord),
                        name: point.name  //response ile gelen data içinden x ve y bilgilerini alır bunları ol.geom.Point içine alır. 
                    });
                    feature.setStyle(createPointStyle()); //burada ilgili noktanın ne şekilde görünmesini istiyosan ona göre stil veren fonksiyona çağırılır.
                    vectorSource.addFeature(feature); //yukarda eklediğmiz vektör üstüne bu noktalar bu şekil eklenir hangi stil vermişsek harita üzerinde o şekilde görüncek.
                });

                showAlert("Point Get All", "All points in map updeted", "success");
            })
            .catch(error => {
                showAlert("Point Get All", error, "error");

            });
    }
    function getAllPolygon() {
        fetch('https://localhost:7153/api/Polygon') //tüm datayı çekmek için Point controllerin Get methoduna istek atar.
            .then(response => response.json()) //apiden gelen response'yi alır
            .then(data => {
                const wktFormat = new ol.format.WKT();
                const features = data.map(item => {
                    const feature = wktFormat.readFeature(item.wkt, {
                        dataProjection: 'EPSG:3857', // WKT koordinat sistemine bağlı olarak değişebilir
                        featureProjection: 'EPSG:3857'
                    });

                    // Özelliklere id ve name ekleyin
                    feature.setId(item.id);
                    feature.set('name', item.name);

                    feature.setStyle(createPolygonStyle());

                    // Özelliği vektör kaynağına ekleyin
                    vectorSourcePolygon.addFeature(feature);
                });

                //map.addLayer(vectorLayer);

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    // Function to create a style for the points
    function createPointStyle() { //ilgili noktalar bu icon.png olarak göndercek.
        return new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/latest/examples/data/icon.png'
            })
        });
    }

    function createPolygonStyle() { //ilgili noktalar bu icon.png olarak göndercek.
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.1)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0000FF',
                width: 2
            })
        });
    }
    function zoomToLocation(x, y) {
        // Yeni koordinat belirleme
        const newCoordinates = ol.proj.fromLonLat([x, y]);
        view.fit(newCoordinates, { padding: [170, 50, 30, 150], minResolution: 50 });
        //// Haritanın görünümünü yeni koordinata odaklama
        //map.getView().setCenter(newCoordinates);
        //map.getView().setZoom(10); // İstediğiniz zoom seviyesini ayarlayabilirsiniz

        //// Fit methodunu kullanarak haritayı yeni koordinata uydurma
        //map.getView().fit(
        //    new ol.geom.Point(newCoordinates), {
        //    maxZoom: 12 // Maksimum zoom seviyesini ayarlayabilirsiniz
        //}
        //);
    }

    // Güncelleme panelini açma işlevi
    function openUpdatePanel(point) {
        // Mevcut paneli kontrol edip kapatma
        var existingPanel = document.getElementById('updatePanel-' + point.id);
        if (existingPanel) {
            existingPanel.parentElement.removeChild(existingPanel);
        }

        // Yeni panel oluşturma
        jsPanel.create({
            id: 'updatePanel-' + point.id,
            headerTitle: 'Update Point ' + point.id,
            contentSize: { width: 400, height: 350 },
            content: `
            <div id="updateForm-container">
                <form id="updateForm-${point.id}">
                    <label for="name">Name:</label>
                    <input type="text" id="name-${point.id}" name="name" value="${point.name}">
                    <label for="x">X Coordinate:</label>
                    <input type="text" id="x-${point.id}" name="x" value="${point.x}">
                    <label for="y">Y Coordinate:</label>
                    <input type="text" id="y-${point.id}" name="y" value="${point.y}">
                    <input type="submit" value="Save"> 
                </form>
            </div>
        `,
            callback: function (panely) {

                const form = panely.content.querySelector('#updateForm-' + point.id); //jspanel içindeki formun bilgilerini alır. 
                form.addEventListener('submit', function (e) { //formu doldurup kaydet butonuna basarsan ben çalışırım diyor.
                    e.preventDefault();
                    const id = point.id;

                    var name = document.getElementById('name-' + point.id).value;
                    var x = document.getElementById('x-' + point.id).value;
                    var y = document.getElementById('y-' + point.id).value;

                    // API'ye güncelleme isteği gönderme (örneğin PUT isteği)
                    fetch('https://localhost:7153/api/Point/' + point.id, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ Id: point.id, Name: name, X: x, Y: y })
                    })
                        .then(response => response.json())
                        .then(data => {

                            // Paneli kapatma
                            var panel = document.getElementById('updatePanel-' + point.id);
                            if (panel) {
                                panel.parentElement.removeChild(panel);
                            }

                            // Harita üzerindeki noktaları güncelleme
                            vectorSource.clear();
                            getAllPoints();
                            queryPointsBtn.click();

                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });

            }
        });
    }

    function showAlert(title, text, icon = 'info') {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            position: 'bottom-end',
            toast: true,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    };

    function getPolygonForId(id) {
        //fetch('https://localhost:7153/api/Polygon/' + id) //tüm datayı çekmek için Point controllerin Get methoduna istek atar.
        //    .then(data => {
        //        var wktFormat = new ol.format.WKT();
        //        // WKT stringini OpenLayers geometrisine dönüştürün
        //        var feature = wktFormat.readFeature(data, {
        //            dataProjection: 'EPSG:4326', // WKT koordinat sistemine bağlı olarak değişebilir
        //            featureProjection: 'EPSG:3857' // Harita koordinat sistemi
        //        });
        //        var extent = feature.getGeometry().getExtent();
        //        map.getView().fit(extent, { duration: 1000 });
        //    })
        //    .catch(error => {
        //        console.error('Error:', error);
        //    });
    }
    function openUpdatePanelForPolygon(polygon, wkt) {
        // Mevcut paneli kontrol edip kapatma
        var existingPanel = document.getElementById('updatePanel-' + polygon.id);
        if (existingPanel) {
            existingPanel.parentElement.removeChild(existingPanel);
        }

        // Yeni panel oluşturma
        jsPanel.create({
            id: 'updatePanel-' + polygon.id,
            headerTitle: 'Update Polygon ' + polygon.id,
            contentSize: { width: 400, height: 350 },
            content: `
            <div id="updateForm-container">
                <form id="updateForm-${polygon.id}">
                    <label for="name">Name:</label>
                    <input type="text" id="name-${polygon.id}" name="name" value="${polygon.name}">
                    <input type="submit" value="Save"> 
                </form>
            </div>
        `,
            callback: function (panely) {

                const form = panely.content.querySelector('#updateForm-' + polygon.id); //jspanel içindeki formun bilgilerini alır. 
                form.addEventListener('submit', function (e) { //formu doldurup kaydet butonuna basarsan ben çalışırım diyor.
                    e.preventDefault();
                    const id = polygon.id;

                    var name = document.getElementById('name-' + polygon.id).value;

                    // API'ye güncelleme isteği gönderme (örneğin PUT isteği)
                    fetch('https://localhost:7153/api/Polygon/' + polygon.id, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ Id: polygon.id, Name: name, WktString: wkt })
                    })
                        .then(data => {

                            // Paneli kapatma
                            var panel = document.getElementById('updatePanel-' + polygon.id);
                            if (panel) {
                                panel.parentElement.removeChild(panel);
                            }

                            // Harita üzerindeki noktaları güncelleme
                            vectorSourcePolygon.clear();
                            getAllPolygon();
                            queryPolygonBtn.click();
                            map.removeInteraction(modifyInteraction);

                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });

            }
        });
    }

})

