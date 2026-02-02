importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Parse query parameters to get config
// This allows us to pass environment variables from the main app to the service worker
// without hardcoding them in this static file.
// Usage: navigator.serviceWorker.register(`/firebase-messaging-sw.js?apiKey=${...}&...`)

const urlParams = new URLSearchParams(location.search);

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId'),
};

// Initialize Firebase only if config is present
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon-192x192.png', // Fallback icon
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[firebase-messaging-sw.js] Firebase config missing. Service worker not initialized fully.');
}
