import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCEla31RbJxtOVs-8BzRnY-leC0GszztlA",
  authDomain: "hbm-project-001-49de4.firebaseapp.com",
  projectId: "hbm-project-001-49de4",
  storageBucket: "hbm-project-001-49de4.firebasestorage.app",
  messagingSenderId: "428350572808",
  appId: "1:428350572808:web:df949a173b3038e35d84bd",
  measurementId: "G-XJ6MD8SWXP",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
