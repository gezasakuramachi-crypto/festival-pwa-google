(function() {
  const C = window.APP_CONFIG;

  function loadMap() {
    return new Promise((resolve) => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${C.googleMapsApiKey}&callback=__gmcb`;
        script.async = true;
        window.__gmcb = () => { resolve(); };
        document.head.appendChild(script);
      }
    });
  }

  async function init() {
    await loadMap();
    const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: C.map.center[0], lng: C.map.center[1] },
      zoom: C.map.zoom,
      mapTypeId: 'roadmap'
    });

    // 山車マーカー
    const marker = new google.maps.Marker({
      position: { lat: C.map.center[0], lng: C.map.center[1] },
      map: map,
      icon: null
    });

    // POI読み込み
    fetch('data/pois.json').then(r => r.json()).then(pois => {
      pois.forEach(p => {
        const m = new google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map: map,
          label: p.type === 'toilet' ? 'T' : 'E',
          title: p.name
        });
        const info = new google.maps.InfoWindow({
          content: `<b>${p.name}</b>${p.time ? `<br>${p.time}` : ''}${p.note ? `<br>${p.note}` : ''}`
        });
        m.addListener('click', () => info.open(map, m));
      });
    });

    // 道路と規制ルール
    const [roads, restrictions] = await Promise.all([
      fetch('data/roads.geojson').then(r => r.json()),
      fetch('data/restrictions.json').then(r => r.json())
    ]);
    const ruleMap = new Map(restrictions.map(r => [r.roadId, r]));
    const roadPolylines = [];

    function colorFor(roadId) {
      const set = ruleMap.get(roadId);
      if (!set) return '#3388ff';
      const now = new Date();
      const hit = set.rules.find(rr => now >= new Date(rr.from) && now < new Date(rr.to));
      return hit ? hit.color : (set.defaultColor || 'transparent');
    }

    roads.features.forEach(f => {
      const path = f.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
      const roadId = f.properties.roadId;
      const poly = new google.maps.Polyline({
        path: path,
        strokeColor: colorFor(roadId),
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: map
      });
      poly.roadId = roadId;
      roadPolylines.push(poly);
    });

    function updateRoadColors() {
      roadPolylines.forEach(poly => {
        const c = colorFor(poly.roadId);
        poly.setOptions({ strokeColor: c });
      });
    }
    // 1分ごとに更新
    setInterval(updateRoadColors, 60000);

    // Traccarから最新位置
    async function fetchPosition() {
      const { baseUrl, deviceId, apiKey } = C.traccar;
      const url = `${baseUrl}/api/positions?deviceId=${deviceId}&limit=1`;
      try {
        const res = await fetch(url, {
          headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
        });
        if (!res.ok) return;
        const data = await res.json();
        const pos = Array.isArray(data) ? data[0] : data;
        if (pos && pos.latitude && pos.longitude) {
          marker.setPosition({ lat: pos.latitude, lng: pos.longitude });
        }
      } catch (e) {
        // ignore
      }
    }

    fetchPosition();
    setInterval(fetchPosition, C.pollMs);

    // ボタン操作
    document.getElementById('btnLocate').addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
          map.setCenter(pos);
          if (map.getZoom() < 17) map.setZoom(17);
        });
      }
    });

    document.getElementById('btnGmaps').addEventListener('click', () => {
      const pos = marker.getPosition();
      const url = `https://maps.google.com/?q=${pos.lat()},${pos.lng()}`;
      window.open(url, '_blank');
    });

    document.getElementById('btnNav').addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(p => {
          const origin = `${p.coords.latitude},${p.coords.longitude}`;
          const dest = `${marker.getPosition().lat()},${marker.getPosition().lng()}`;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`;
          window.open(url, '_blank');
        });
      }
    });
  }

  init();
})();
