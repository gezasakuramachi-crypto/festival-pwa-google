/*
 * アプリのメインロジック。Google Maps APIを利用して地図を構築し、
 * Traccarから取得した山車の現在地を表示します。
 */
(function () {
  const C = window.APP_CONFIG;
  let map;
  let marker;

  // Google Maps 初期化
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: C.map.center[0], lng: C.map.center[1] },
      zoom: C.map.zoom,
      fullscreenControl: false,
      mapTypeControl: false
    });

    // 山車マーカー（初期位置は地図中心）
    marker = new google.maps.Marker({
      position: { lat: C.map.center[0], lng: C.map.center[1] },
      map: map
    });

    // イベント会場を★マーカーで表示
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
          desc: "9月2日18:15〜<br>山車年番の引継ぎ式を行います。"
        },
        {
          title: "にぎわい広場",
          pos: { lat: 35.9664167, lng: 140.6277778 },
          desc: "飲食ブースやトイレ施設があります"
        },
        {
          title: "総踊りのの字廻し会場",
          pos: { lat: 35.9679445, lng: 140.6300278 },
          desc: "9月1日18:00〜<br>総踊りが行われ、その後のの字廻しが披露されます。"
        },
        {
          title: "一斉踊り会場",
          pos: { lat: 35.9670556, lng: 140.6306945 },
          desc: "9月2日13:30〜<br>全町内が順番に踊りを披露します。"
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
        m.addListener("click", () => {
          info.setContent(`<strong>${p.title}</strong><br>${p.desc}`);
          info.open(map, m);
        });
      });
    }
    addEventMarkers();

    // Traccarから最新位置を取得
    async function fetchPosition() {
      const { baseUrl, deviceId, apiKey, publicToken } = C.traccar;
      if (!baseUrl || !deviceId) return;
      let url = `${baseUrl}/api/positions?deviceId=${deviceId}&latest=true`;
      const headers = {};
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (publicToken) {
        headers['Authorization'] = `Bearer ${publicToken}`;
      }
      try {
        const res = await fetch(url, { cache: 'no-store', headers });
        if (!res.ok) throw new Error('位置取得失敗');
        const data = await res.json();
        const pos = Array.isArray(data) ? data[data.length - 1] : data;
        if (pos && pos.latitude && pos.longitude) {
          const lat = pos.latitude;
          const lng = pos.longitude;
          marker.setPosition({ lat, lng });
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
    fetchPosition();
    setInterval(fetchPosition, C.pollMs);

    // ボタン: 現在地表示
    document.getElementById('btnLocate').onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const lat = p.coords.latitude;
          const lng = p.coords.longitude;
          map.setCenter({ lat, lng });
          map.setZoom(Math.max(map.getZoom(), 17));
        }, () => alert('現在地を取得できませんでした'));
      }
    };
    // ボタン: Googleマップで開く
    document.getElementById('btnGmaps').onclick = () => {
      const pos = marker.getPosition();
      window.open(`https://maps.google.com/?q=${pos.lat()},${pos.lng()}`, '_blank');
    };
    // ボタン: ナビ開始
    document.getElementById('btnNav').onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const s = `${p.coords.latitude},${p.coords.longitude}`;
          const dPos = marker.getPosition();
          const d = `${dPos.lat()},${dPos.lng()}`;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${s}&destination=${d}&travelmode=walking`, '_blank');
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

  window.initMap = initMap;
})();
