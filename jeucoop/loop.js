/**
Game loop : runs multiple functions in a loop

Functions take one argument: the time since last run (in ms)
They return 
*/

// request animation frame instead of timeout
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {setTimeout(callback, 1000/60);};

function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
}
                              
                              
function GameLoop(options) {
    options = options || {};
    var that = this;
    // list of functions to call
    var torun = [];
    // constants
    this.STOPLOOP = "STOPLOOP"; // in order to stop the loop from executing
    this.REMOVEME = "REMOVEME"; // in order to remove the function
    
    
    that.maxFPS = options.maxFPS || 100;
    that.currentFPS = that.maxFPS;
    
    // add something to the loop
    this.add = function (func) {
        torun.push(func);
    }
    
    // add something to the loop
    this.remove = function (func) {
        var index = torun.indexOf(func);
        torun.splice(index,1);
    }
    
    this.game = false;
    
    this.hud = false;
    
    // getter for the number of objects in loop
    this.nbObjects = function() {
        return torun.length;
    }

    // running a function on each element (probably used in order to see if there is an intersection)
    this.forEach = function(func) {
        for (var i = 0; i < torun.length; i++) {
            func(torun[i]);
        }
    }
    
    var currentLoopLast = Date.now();
    this.currentLoopInterval = 0;
    
    // indicator if loop started (may stop the loop if set to false)
    this.running = false;
    
    // one iteration loop
    var oneIteration = function () {
        if (!that.running) return;
        window.requestAnimationFrame(oneIteration);
        //setTimeout(oneIteration, 1000/that.currentFPS);
        
        // calculate the current loop interval
        var currentTime = Date.now();
        var currentLoopInterval = that.currentLoopInterval = currentTime - currentLoopLast;
        currentLoopLast = currentTime;
        that.currentFPS = 1000/currentLoopInterval;
        
        if (currentLoopInterval > 1000) {
            // after a pause
            currentLoopInterval = 1;
        }

        // run game at start
        if (that.game) {
            var returned = (that.game.iterate ? that.game.iterate : that.game)(currentLoopInterval);
            if (returned == that.STOPLOOP) stoploop = true;
        }
        
        var todelete = [];
        var stoploop = false;
        // loop for executing functions
        for (var i = 0; i < torun.length; i++) {
            var functorun = torun[i].iterate ? torun[i].iterate : torun[i];
            var returned = functorun(currentLoopInterval);
            if (returned == that.REMOVEME) todelete.push(i);
            if (returned == that.STOPLOOP) stoploop = true;
        }
        // loop in order to delete obsolete functions
        while (todelete.length) {
              var index = todelete.pop();
              torun.splice(index, 1);
        }
        
        // run hud at the end
        if (that.hud) {
            var returned = (that.hud.iterate ? that.hud.iterate : that.hud)(currentLoopInterval);
            if (returned == that.STOPLOOP) stoploop = true;
        }
        
        if (stoploop) {
            that.running = false;
        }
    }
    
    // stopping the loop
    this.stop = function() {
        that.running = false;
    }
    
    // starting the loop
    this.start = function() {
        that.running = true;
        currentLoopLast = Date.now();
        oneIteration();
    }
    
}