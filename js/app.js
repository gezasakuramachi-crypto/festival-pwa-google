async function fetchPosition() {
  const { baseUrl, deviceId, apiKey, publicToken } = C.traccar;
  // Traccar API: latest=true で最新のみ取得
  let url = `${baseUrl}/api/positions?deviceId=${deviceId}&latest=true`;
  const headers = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (publicToken) {
    headers['Authorization'] = `Bearer ${publicToken}`;
  }

  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !data.length) return;

  const p = data[data.length - 1];
  const pos = { lat: p.latitude, lng: p.longitude };

  if (!marker) {
    marker = new google.maps.Marker({
      position: pos,
      map,
      title: "山車",
      icon: {
        url: "https://www.dropbox.com/scl/fi/echpcekhl6f13c9df5uzh/sakura.png?raw=1",
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(24, 24)
      }
    });
    map.panTo(pos);
  } else {
    marker.setPosition(pos);
  }

  // 軌跡の描画
  if (!path) {
    path = new google.maps.Polyline({
      map,
      strokeColor: "#1a73e8",
      strokeOpacity: 0.9,
      strokeWeight: 3
    });
  }
  const pathArr = path.getPath();
  const last = pathArr.getLength() ? pathArr.getAt(pathArr.getLength() - 1) : null;
  if (!last || last.lat() !== pos.lat || last.lng() !== pos.lng) {
    pathArr.push(pos);
  }

  // 更新日時を表示
  const t = new Date(p.fixTime || p.deviceTime || p.serverTime || Date.now());
  const mm = String(t.getMonth() + 1).padStart(1, " ");
  const dd = String(t.getDate()).padStart(1, " ");
  const HH = String(t.getHours()).padStart(2, "0");
  const II = String(t.getMinutes()).padStart(2, "0");
  document.getElementById("updated").textContent = `${mm}/${dd} ${HH}:${II}`;
}
