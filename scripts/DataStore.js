
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/**
 * This is a utility to manage using a database (Firebase Store). It also uses Firebase authentication
 * to athorize who is allowed to access the database.
 */
export class DataStore {

  constructor() {

    // The firebase configuration. the apiKey is an id of the project, not a securit key, 
    // so it's okay to check in the code.
    this.firebaseConfig = {
      apiKey: "AIzaSyDjFOn3ls8rqd_LVEl3wkHWL4SX6XGoVc4",
      authDomain: "pingster-db.firebaseapp.com",
      projectId: "pingster-db",
      storageBucket: "pingster-db.firebasestorage.app",
      messagingSenderId: "318746586861",
      appId: "1:318746586861:web:8b37ad3a7563af122726e4",
      measurementId: "G-7BW30WBR65"
    };

    // Initialize the app to access the database
    this.app = initializeApp(this.firebaseConfig);
    // this.analytics = getAnalytics(this.app);

    // Get Firestore instance
    this.db = getFirestore(this.app);

    // Authentication
    this.auth = getAuth(this.app);
    this.provider = new GoogleAuthProvider();
    this.isApprovedUser = false;
    this.approvedEmails = ['youpingh@gmail.com', 'peterhu86@gmail.com', 'peter@TheGoodNeighbors.com'];
  }

  static getInstance() {
    if (!DataStore._instance) {
      DataStore._instance = new DataStore();
    }
    return DataStore._instance;
  }

  /**
   * Checks if the current user is an approved user.
   * @returns 
   */
  static isApprovedUser() {
    const store = this.getInstance();
    return store.isApprovedUser;
  }

  /**
   * Signs in the current Google user silently if the visitor is already logged in his/her Google account
   * and displays the footer for the approved users.
   * @param {*} buttonId 
   */
  static async signInSilently() {

    const store = this.getInstance();

    // Try silent login (Google keeps session)
    // if (!store.auth.currentUser) {
    //   await store.auth.signInWithRedirect?.(); // for older fallback
    // }
    await setPersistence(store.auth, browserLocalPersistence);

    // show/hide the specified element for the approved users.
    const dbBtn = document.getElementById('page-footer');
    const loginBtn = document.getElementById('login-btn');
    onAuthStateChanged(store.auth, user => {
      if (user && store.approvedEmails.includes(user.email)) {
        store.isApprovedUser = true;
        dbBtn.className = 'footer';
        loginBtn.style.display = 'none';
        console.log(`Welcome ${user.email}`);
      } else {
        dbBtn.className = 'footer-invisible';
        loginBtn.style.display = 'block';
        store.isApprovedUser = false;
      }
      const info = user
        ? `Logged in as: ${user.displayName} (${user.email})`
        : 'Not signed in';
      console.log(info);
    });
  }

  static signIn() {
    const store = this.getInstance();
    signInWithPopup(store.auth, store.provider)
      .then(result => console.log("Signed in:", result.user))
      .catch(error => console.error("Sign-in error:", error));
  }

  static signOut() {
    const store = this.getInstance();
    signOut(store.auth).then(() => {
      console.log("Signed out");
    });
  }

  static saveProgress() {
    const store = this.getInstance();
    const user = store.auth.currentUser;
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    const userId = user.email;
    const now = new Date();
    const progress = { level: 'A3', lesson: 5, time: now };

    const colRef = collection(store.db, 'progress');
    const docRef = doc(colRef, userId);

    setDoc(docRef, progress)
      .then(() => {
        console.log('Progress saved:', JSON.stringify(progress));
      })
      .catch(error => console.error('Error:', error));
  }
}
window.DataStore = DataStore;
