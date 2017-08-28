/**
This maps regions of a canvas to key events
*/
if (!window.KeyListener) {
    console.log("Please load keys.js first");
}

function Touch2Key(canvas) {
    var that = this;
    
    var zones = [];
    // zones may be {x1, y1, x2, y2, key} or {x, y, r, key}
    
    // stores the touch id and the key associated
    var touchid2key = {};
    
    // finding which key is pressed
    var findtouchkey = function(x, y) {
        for (var i in zones) {
            var zone = zones[i];
            if (zone.r) { // a circle
                var dx = x - zone.x;
                var dy = y -zone.y;
                var d2 = dx*dx+dy*dy;
                if (d2 <= zone.r * zone.r) {
                    return zone.key;
                }
            } else { // a rectangle
                if (zone.x1 <= x && x <= zone.x2 && zone.y1 <= y && y <= zone.y2) {
                    return zone.key;
                }
            }
        }
        // no key
        return false;
    }
    
    var sendkeyevent = function(type, key) { // type=keyup or keydown
        var e = new KeyboardEvent(type, {bubbles : true, cancelable : true, key : key, char : key, shiftKey : false});
        canvas.dispatchEvent(e);
    }
    
    var listener = function(event) {
        // touch event
        event.preventDefault();
        var touches = evt.changedTouches;
        if (event.type == "touchstart") {
            // like a key press, find which key
            for (var i in touches) {
                var touch = touches[i];
                var id = touch.identifier;
                var evX = touch.pageX - getOffsetLeft(canvas); 
                var evY = touch.pageY - getOffsetTop(canvas); 
                var key = findtouchkey(evX, evY);
                if (key) {
                    // raise KeyDown event
                    sendkeyevent("keydown", key);
                    touchid2key[id] = key;
                }
            }
        }
        if (event.type == "touchend") {
            // like a key up, key already registered
            for (var i in touches) {
                var touch = touches[i];
                var id = touch.identifier;
                if (touchid2key[id]) {
                    // raise KeyUp event
                    sendkeyevent("keyup", key);
                    touchid2key[id] = false;
                }
            }
        }
        // what to do with touchmove ?        
    }
    
    // registering listener
    canvas.addEventListener("touchstart", listener, false);
    canvas.addEventListener("touchend", listener, false);
    //canvas.addEventListener("touchcancel", listener, false);
    //canvas.addEventListener("touchleave", listener, false);
    //canvas.addEventListener("touchmove", listener, false);
    
    // adding buttons to the canvas
    this.addRectButtonKey = function(x1, y1, x2, y2, key) {
        // make sure it is ordered
        if (x2 < x1) {
            var temp = x2; x2 = x1; x1 = temp;
        }
        if (y2 < y1) {
            var temp = y2; y2 = y1; y1 = temp;
        }
        // adding a rectangle
        zones.push({x1:x1, x2:x2, y1:y1, y2:y2, key:key});
    };
    this.addCircleButtonKey = function(x, y, r, key) {
        // adding a circle
        zones.push({x:x, y:y, r:r, key:key});
    };
    
    // the following functions allow saving the state, restoring it, and reset it
    var stored = {};
    this.saveAs = function(name) {
        stored[name] = JSON.stringify(zones);
    }
    this.restore = function(name) {
        that.reset();
        zones = JSON.parse(stored[name]);
    }
    this.reset = function() {
        zones = [];
        // send keyup events
        for (var id in touchid2key) {
            var key = touchid2key[id];
            if (key) {
                sendkeyevent("keyup", key);
            }
        }
        touchid2key = {};
    }
}

// https://stackoverflow.com/questions/17165382/getting-the-correct-coordinates-of-a-canvas-touch-event
function getOffsetLeft( elem )
{
    var offsetLeft = 0;
    do {
      if ( !isNaN( elem.offsetLeft ) )
      {
          offsetLeft += elem.offsetLeft;
      }
    } while( elem = elem.offsetParent );
    return offsetLeft;
    //evX= ev.targetTouches[0].pageX- getOffsetLeft(liCanvas); 
}
function getOffsetTop( elem )
{
    var offsetTop = 0;
    do {
      if ( !isNaN( elem.offsetTop ) )
      {
          offsetTop += elem.offsetTop;
      }
    } while( elem = elem.offsetParent );
    return offsetTop;
}

// https://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document
function getCoords(elem) { // crossbrowser version
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}


    