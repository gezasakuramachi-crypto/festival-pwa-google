window.APP_CONFIG = {
  // 初期表示の中心座標（鹿嶋市付近）とズーム設定
  map: {
    center: [35.966, 140.628],
    zoom: 15
  },

  // Google Maps APIキー
  googleMapsApiKey: 'AIzaSyCExrqcE4MPmievjTlV8wFJrVtKcbKWqX8',

  // Traccar 読み取り用設定
  traccar: {
    baseUrl: 'https://traccar-railway.fly.dev:5055',
    deviceId: 1,
    apiKey: '',
    publicToken: 'RzBFAiAaeMvmv32ZrmskwLBY7hx9jHczeC-NGOh_k2-QFuHgQHIA0y_es0TTWL-GX4Pble4G6wxKQcYjJdiEgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ'
  },

  // 位置更新のポーリング間隔（ミリ秒）
  pollMs: 5000,

  // 祭り期間（表示などに使用）
  festivalWindow: {
    start: '2025-08-31T17:00:00+09:00',
    end: '2025-09-02T22:00:00+09:00'
  }
};
