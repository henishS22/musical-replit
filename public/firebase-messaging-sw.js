// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js")
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js")

const firebaseConfig = {
	apiKey: "AIzaSyDSOrWEyDLLQ8xBedk6A1p5kWST5CReyvQ",
	authDomain: "gold-episode-346919.firebaseapp.com",
	projectId: "gold-episode-346919",
	storageBucket: "gold-episode-346919.firebasestorage.app",
	messagingSenderId: "673829109532",
	appId: "1:673829109532:web:442a74a380342cb62d44d9"
}
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig)
// eslint-disable-next-line no-undef
const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
	const notificationTitle = payload.notification.title
	const notificationOptions = {
		body: payload.notification.body,
		icon: "./logo.svg"
	}
	// eslint-disable-next-line no-undef
	self.registration.showNotification(notificationTitle, notificationOptions)
})
