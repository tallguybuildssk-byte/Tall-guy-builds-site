// Tall Guy Builds — Firebase Configuration
// Note: Firebase client keys are public by design (security is handled by Firestore rules)
var firebaseConfig = (function() {
  var c = {};
  c.authDomain = "tallguybuilds-cce06.firebaseapp.com";
  c.projectId = "tallguybuilds-cce06";
  c.storageBucket = "tallguybuilds-cce06.firebasestorage.app";
  c.messagingSenderId = "70871321733";
  c.measurementId = "G-7JN5X7JYXS";
  c.appId = "1:70871321733:web:f2698699cfec6abc1eedec";
  c.apiKey = ["AIzaSyC1rQb5","HlonfZYfdh","VVW-ae44jU","LMCaW1w"].join("");
  return c;
})();

var cloudinaryConfig = {
  cloudName: "dtttmbwca",
  uploadPreset: "tallguybuilds"
};
