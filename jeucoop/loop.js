/**
Game loop : runs multiple functions in a loop

Functions take one argument: the time since last run (in ms)
They return 
*/

function GameLoop(options) {
    options = options || {};
    var that = this;
    // list of functions to call
    var torun = [];
    // constants
    this.STOPLOOP = "STOPLOOP"; // in order to stop the loop from executing
    this.REMOVEME = "REMOVEME"; // in order to remove the function
    
    
    that.maxFPS = options.maxFPS || 30;
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
    
    // getter for the number of objects in loop
    this.nbObjects = function() {
        return torun.length;
    }
    
    var currentLoopLast = Date.now();
    
    // indicator if loop started (may stop the loop if set to false)
    this.running = false;
    
    // one iteration loop
    var oneIteration = function () {
        if (!that.running) return;
        
        // calculate the current loop interval
        var currentTime = Date.now();
        currentLoopInterval = currentTime - currentLoopLast;
        currentLoopLast = currentTime;
        
        var todelete = [];
        var stoploop = false;
        // loop for executing functions
        for (var i = 0; i < torun.length; i++) {
              var returned = torun[i](currentLoopInterval);
              if (returned == that.REMOVEME) todelete.push(i);
              if (returned == that.STOPLOOP) stoploop = true;
        }
        // loop in order to delete obsolete functions
        while (todelete.length) {
              var index = todelete.pop();
              torun.splice(index, 1);
        }
        
        // update the that.currentFPS
        var displayTime = Date.now() - currentTime;
        if (1000/(that.currentFPS+1) >= displayTime*2) {
            if (that.currentFPS < that.maxFPS) that.currentFPS += 1;
        } else {
            that.currentFPS -= 1;
        }
        if (!stoploop)
            setTimeout(oneIteration, 1000/that.currentFPS - displayTime);
        else
            that.running = false;
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