(function (document) {
    'use strict';

    var app = document.querySelector('#app');

    app.displayInstalledToast = function () {
        document.querySelector('#caching-complete').show();
    };

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function decodeJwtResponse(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

        return JSON.parse(jsonPayload);
    }

    function signIn(id, token) {
        document.getElementById("gamecontroller").setPlayer(id, token);
        document.querySelector('#signin').style.display = "none";
        document.querySelector('#signout').style.display = "block";
    }

    function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        const responsePayload = decodeJwtResponse(response.credential);

        console.log("ID: " + responsePayload.sub);
        console.log('Given Name: ' + responsePayload.given_name);
        setCookie("google_id", responsePayload.sub, 6); // 7 days expiry baked into the server; expire before that
        setCookie("google_token", response.credential, 6);
        signIn(responsePayload.sub, response.credential)

    }

    app.addEventListener('dom-change', function () {
        console.log('Our app is ready to rock!');
        var google_id = getCookie("google_id");
        var google_token = getCookie("google_token");
        if (google_id && google_token) {
            signIn(google_id, google_token);
        }

        google.accounts.id.initialize({
            client_id: "168641906858-8egtsbds49ifcjgq7g6n4757q70k14h4.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("signin"), {
            theme: "outline",
            size: "large",
            text: "signin"
        });

    });

    addEventListener('paper-header-transform', function (e) {
        var appName = document.querySelector('.app-name');
        var middleContainer = document.querySelector('.middle-container');
        //var bottomContainer = document.querySelector('.bottom-container');
        var detail = e.detail;
        var heightDiff = detail.height - detail.condensedHeight;
        var yRatio = Math.min(1, detail.y / heightDiff);
        var maxMiddleScale = 0.50; // appName max size when condensed. The smaller the number the smaller the condensed size.
        var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1 - maxMiddleScale)) + maxMiddleScale);
        var scaleBottom = 1 - yRatio;

        // Move/translate middleContainer
        Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

        // Scale bottomContainer and bottom sub title to nothing and back
        //Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

        // Scale middleContainer appName
        Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onMenuSelect = function () {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    app.refreshStats = function () {
        document.getElementById("gamecontroller").requestStats();
    };

    app.handleResponse = function (r) {
        var response = r.detail.response;
        var url = r.detail.xhr.responseURL;
        var span = document.getElementById("serverversion");
        if (url.includes("client")) {
            span = document.getElementById("clientversion");
        }
        span.innerHTML = response;
    };

    app.navigate = function (e) {
        page.show("/games/" + e.detail.id)
    }

})(document);
