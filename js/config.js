window.APP_CONFIG = {
  // 初期表示の中心座標（鹿嶋市付近）とズーム設定
  map: {
    center: [35.9659, 140.6297], // 緯度・経度（必ず修正してください）
    zoom: 15
  },
  
  // Google Maps APIキー（Google Cloud Consoleで取得したものをここに設定）
  googleMapsApiKey: 'AIzaSyCExrqcE4MPmievjTlV8wFJrVtKcbKWqX8',

  // Traccar読取り用設定
  traccar: {
    baseUrl: 'https://traccar-railway.fly.dev:5055', // 例: https://traccar.example.com
    deviceId: 1,                             // 公開する“山車デバイス”のID
    apiKey: '',                               // 読み取り専用APIキー
    // Traccar共有リンクのトークンを使用する場合はここに記入してください
    publicToken: 'RzBFAiAaeMvmv32ZrmskwLBY7hx0jHxCezE-NGOh_K2-QFuHgQIhAOY_es0TTwL-GX4pbel4G6wxKQcYjJd1EgtRzGKhSlQ7eyJ1Ijo2LCJlIjoiMjAyNS0wOC0yN1QxNTowMDowMC4wMDArMDA6MDAifQ
'
  },

  // 位置更新のポーリング間隔（ミリ秒）
  pollMs: 8000,

  // 祭り期間（表示などに使用）
  festivalWindow: {
    start: '2025-08-31T17:00:00+09:00',
    end: '2025-09-02T22:00:00+09:00'
  }
};