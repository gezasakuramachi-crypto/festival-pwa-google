window.APP_CONFIG = {
  googleMapsApiKey: "AIzaSyCExrqcE4MPmievjTlV8wFJrVtKcbKWqX8",
  map: {
    center: [35.966, 140.628],
    zoom: 15
  },
  traccar: {
    baseUrl: "https://traccar-railway.fly.dev",
    deviceId: 1,
    apiKey: "",            // 読み取り専用APIキーがあれば記入
    publicToken: "RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ
"}" // 共有トークンをそのまま入れる
  },
  pollMs: 5000,
  // 祭り期間
  festivalWindow: {
    start: "2025-08-31T17:00:00+09:00",
    end:   "2025-09-02T22:00:00+09:00"
  }
};
