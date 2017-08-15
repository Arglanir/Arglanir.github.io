/**
This library listens to pressed keys
*/
function KeyListener(targetElement) {
    var that = this;
    targetElement = targetElement || document;
    var keyCodes = {};
    var keyNames = {};
    // maps accessible (like keyListener.a)
    this.keyCodes = keyCodes;
    this.keyNames = keyNames;
    // the listener function
    this.listener = function(e) {
        e = e || event;
        keyCodes[e.keyCode] = e.type == 'keydown';
        keyNames[e.key] = e.type == 'keydown';
    }
    // start to listen
    this.start = function() {
        targetElement.addEventListener("keydown", that.listener, false);
        targetElement.addEventListener("keyup", that.listener, false);
    }
    // stop listening
    this.stop = function () {
        targetElement.removeEventListener("keydown", that.listener, false);
        targetElement.removeEventListener("keyup", that.listener, false);
    }
    // reset (all keys down
    this.reset = function() {
        for (var k in  keyCodes) {
            keyCodes[k] = false;
        }
        for (var k in  keyNames) {
            keyNames[k] = false;
        }
    }
    // function to display a map (used in dumpCodes and dumpNames)
    var dumpMap = function(map, separator) {
        separator = separator || ", ";
        var toreturn = "";
        for (var key in map) {
            if (!map[key]) continue;
            if (toreturn.length) toreturn += separator;
            toreturn += key;
        }
        return toreturn;
    }
    // dump codes info
    this.dumpCodes = function(separator) {
        return dumpMap(keyCodes, separator);
    }
    // dump names info
    this.dumpNames = function(separator) {
        return dumpMap(keyNames, separator);
    }
    // telling if a key is pressed
    this.isPressed = function(letterLowerCase) {
        return keyNames[letterLowerCase] || keyNames[letterLowerCase.toUpperCase()];
    }
}
