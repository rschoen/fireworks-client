(function(document) {
  'use strict';

  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
    appStart();
  });

  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('.app-name');
    var middleContainer = document.querySelector('.middle-container');
    var bottomContainer = document.querySelector('.bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };
  
  app.refreshStats = function() {
    document.getElementById("gamecontroller").requestStats();
  };

})(document);

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var id_token = googleUser.getAuthResponse().id_token;
  document.getElementById("gamecontroller").setPlayer(profile.getId(), id_token);
  
  document.getElementById("gsignin").classList.add("hidden");
  document.getElementById("signout").classList.remove("hidden");
  console.log("Signed in as "+profile)
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
  document.getElementById("gsignin").classList.remove("hidden");
  document.getElementById("signout").classList.add("hidden");
  });
  location.reload();
}

var appStart = function() {
  gapi.load('auth2', initSigninV2);
};

var initSigninV2 = function() {
  auth2 = gapi.auth2.getAuthInstance(); /*init({
      client_id: '168641906858-8egtsbds49ifcjgq7g6n4757q70k14h4.apps.googleusercontent.com',
      scope: 'profile'
  });*/
  
  document.getElementById('signin').appendChild(document.getElementById('gsignin'));

  // Listen for sign-in state changes.
  auth2.isSignedIn.listen(signinChanged);

  // Listen for changes to current user.
  auth2.currentUser.listen(userChanged);

  // Start with the current live values.
  refreshValues();
};

var signinChanged = function (val) {
  console.log('Signin state changed to ', val);
  if(val) {
      onSignIn(googleUser);
  }
};

var userChanged = function (user) {
  console.log('User now: ', user);
  googleUser = user;
};

/**
 * Retrieves the current user and signed in states from the GoogleAuth
 * object.
 */
var refreshValues = function() {
  if (auth2){
    console.log('Refreshing values...');

    googleUser = auth2.currentUser.get();
    onSignIn(googleUser);
  }
}


