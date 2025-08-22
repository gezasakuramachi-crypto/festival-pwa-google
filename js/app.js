// アプリのメインロジック。Google Maps APIを利用して地図を構築し、
// Traccarから取得した山車の現在地とPOI、交通規制情報を表示します。
(function () {
  const C = window.APP_CONFIG;
  let map;
  let marker;

  /**
   * Google Maps 初期化関数。config.jsの設定に基づいて地図を表示します。
   * この関数はGoogle Mapsのcallbackとして参照されるため、
   * window.initMapに割り当てられています。
   */
  function initMap() {
    // マップの生成
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: C.map.center[0], lng: C.map.center[1] },
      zoom: C.map.zoom,
      fullscreenControl: false,
      mapTypeControl: false
    });

    // 山車マーカーの生成（初期値は地図の中心）
    marker = new google.maps.Marker({
      position: { lat: C.map.center[0], lng: C.map.center[1] },
      map: map
    });

    // イベント用マーカー（スターアイコン）を配置する関数
    function addEventMarkers() {
      const starIcon =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28' fill='#FFD54F' stroke='#C9A300' stroke-width='1'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z'/></svg>`
        );
      const places = [
        {
          title: "年番引継ぎ会場",
          pos: { lat: 35.9658889, lng: 140.6268333 },
          desc: "9月2日18:15〜<br>山車の運行を執り仕切るのが「山車年番」で、今年の年番が、次年度年番町内にお伺いをたて引継ぐことを「年番引継」といいます。"
        },
        {
          title: "にぎわい広場",
          pos: { lat: 35.9664167, lng: 140.6277778 },
          desc: "飲食ブースや、トイレ施設、休憩スペースもあります"
        },
        {
          title: "総踊りのの字廻し会場",
          pos: { lat: 35.9679445, lng: 140.6300278 },
          desc: "9月1日18:00〜<br>町内の山車が勢ぞろいして、全町内が年番区の演奏にあわせて総踊りをします。<br>その後は各町内による、のの字廻しが披露されます。"
        },
        {
          title: "一斉踊り会場",
          pos: { lat: 35.9670556, lng: 140.6306945 },
          desc: "9月2日13:30〜<br>5町内が終結し、各町内が順番に踊りを踊っていきます。<br>その後年番区を先頭に役曳きをして全町内を曳きまわします。"
        }
      ];
      const info = new google.maps.InfoWindow();
      places.forEach(p => {
        const m = new google.maps.Marker({
          position: p.pos,
          map,
          title: p.title,
          icon: { url: starIcon, scaledSize: new google.maps.Size(28, 28), anchor: new google.maps.Point(14, 14) }
        });
        if (p.desc) {
          m.addListener("click", () => {
            info.setContent(`<strong>${p.title}</strong><br>${p.desc}`);
            info.open(map, m);
          });
        }
      });
    }
    // 地図初期化後にイベント会場マーカーを配置
    addEventMarkers();

    // Traccarから最新位置を取得
    async function fetchPosition() {
      const { baseUrl, deviceId, apiKey, publicToken } = C.traccar;
      if (!baseUrl || !deviceId) return;
      // 最新位置のみ取得するURL
      let url = `${baseUrl}/api/positions?deviceId=${deviceId}&latest=true`;
      const headers = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (publicToken) {
        headers['Authorization'] = `Bearer ${publicToken}`;
      }
      try {
        const res = await fetch(url, {
          cache: 'no-store',
          headers
        });
        if (!res.ok) throw new Error('位置取得失敗');
        const data = await res.json();
        const pos = Array.isArray(data) ? data[data.length - 1] : data;
        if (pos && pos.latitude && pos.longitude) {
          const lat = pos.latitude;
          const lng = pos.longitude;
          marker.setPosition({ lat, lng });
          // 初回のみズームして中心にする
          if (!fetchPosition._centered) {
            map.setCenter({ lat, lng });
            map.setZoom(Math.max(map.getZoom(), 16));
            fetchPosition._centered = true;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    // 定期ポーリング
    fetchPosition();
    setInterval(fetchPosition, C.pollMs);

    // ボタン操作
    document.getElementById('btnLocate').onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const lat = p.coords.latitude;
          const lng = p.coords.longitude;
          map.setCenter({ lat, lng });
          map.setZoom(Math.max(map.getZoom(), 17));
        }, () => {
          alert('現在地を取得できませんでした');
        });
      }
    };
    document.getElementById('btnGmaps').onclick = () => {
      const pos = marker.getPosition();
      const url = `https://maps.google.com/?q=${pos.lat()},${pos.lng()}`;
      window.open(url, '_blank');
    };
    document.getElementById('btnNav').onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const s = `${p.coords.latitude},${p.coords.longitude}`;
          const dPos = marker.getPosition();
          const d = `${dPos.lat()},${dPos.lng()}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${s}&destination=${d}&travelmode=walking`;
          window.open(url, '_blank');
        }, () => alert('現在地を取得できませんでした'));
      }
    };
  }

  // Google Mapsスクリプトの読み込み
  (function loadGoogleMaps() {
    const key = C.googleMapsApiKey;
    if (!key) {
      console.warn('Google Maps APIキーが設定されていません。config.jsのgoogleMapsApiKeyにキーを設定してください。');
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  })();

  // callbackとして使われるためグローバルに公開
  window.initMap = initMap;
})();