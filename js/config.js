window.APP_CONFIG = {
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  map: {
    center: [35.966, 140.628],
    zoom: 15
  },
  traccar: {
    baseUrl: "https://traccar-railway.fly.dev",
    deviceId: 1,
    apiKey: "",            // 読み取り専用APIキーがあれば記入
    publicToken: "RzBFAiAaeMvmv32...SlQ7eyJ1IjoxLCJlIjoi2025-08-27T15:00:00.000+00:00\"}" // 共有トークンをそのまま入れる
  },
  pollMs: 5000,
  // 祭り期間
  festivalWindow: {
    start: "2025-08-31T17:00:00+09:00",
    end:   "2025-09-02T22:00:00+09:00"
  }
};
