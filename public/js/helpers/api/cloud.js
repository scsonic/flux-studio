'use strict';

define([], function () {
    // const ip = 'https://35.161.43.14:3000';
    var _ip = {
        dev: 'https://127.0.0.1:3000',
        prod: 'https://cloudserv1.flux3dp.com:3000'
    };
    var ip = window.FLUX.dev ? _ip.dev : _ip.prod;
    var userProtocol = '/users';
    var deviceProtocol = '/devices';
    var headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8' });

    var userUrl = function userUrl(name) {
        return '' + ip + userProtocol + '/' + name;
    };
    var deviceUrl = function deviceUrl(name) {
        return '' + ip + deviceProtocol + '/' + name;
    };

    var constructBody = function constructBody(obj) {
        return Object.keys(obj).map(function (key) {
            return key + '=' + encodeURIComponent(obj[key]);
        }).join('&');
    };

    var post = function post(targetUrl, body) {
        return fetch(targetUrl, { method: 'POST', credentials: 'include', headers: headers, body: body });
        // return fetch(url, {method: 'POST', headers, body });
    };

    var get = function get(targetUrl) {
        return fetch(targetUrl, { method: 'GET', credentials: 'include', headers: headers });
    };

    // User

    var signIn = function signIn(email, password) {
        var body = constructBody({ email: email, password: password });
        return post(userUrl('signIn'), body);
    };

    var signUp = function signUp(nickname, email, password) {
        var body = constructBody({ nickname: nickname, email: email, password: password });
        return post(userUrl('signUp'), body);
    };

    var signOut = function signOut() {
        return post(userUrl('logout'), '');
    };

    var resendVerification = function resendVerification(email) {
        var body = constructBody({ email: email });
        return post(userUrl('resendVerification'), body);
    };

    var resetPassword = function resetPassword(email) {
        var body = constructBody({ email: email });
        return post(userUrl('forgotPassword'), body);
    };

    var changePassword = function changePassword(param) {
        var body = constructBody(param);
        return post(userUrl('updateInfo'), body);
    };

    var getMe = function getMe() {
        return get(userUrl('me'), '');
    };

    var getDevices = function getDevices() {
        return get(deviceUrl('list'), '');
    };

    // Device

    var bindDevice = function bindDevice(uuid, token, accessId, signature) {
        var body = constructBody({ token: token, accessId: accessId, signature: signature }),
            bindDeviceUrl = '' + ip + deviceProtocol + '/' + uuid + '/bind';
        console.log("Trying to bind ", body);
        return post(bindDeviceUrl, body);
    };

    var unbindDevice = function unbindDevice(uuid) {
        var body = constructBody({ uuid: uuid }),
            unbindDeviceUrl = '' + ip + deviceProtocol + '/' + uuid + '/unbind';
        return post(unbindDeviceUrl, body);
    };

    return {
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        getDevices: getDevices,
        resendVerification: resendVerification,
        resetPassword: resetPassword,
        changePassword: changePassword,
        getMe: getMe,
        bindDevice: bindDevice,
        unbindDevice: unbindDevice
    };
});