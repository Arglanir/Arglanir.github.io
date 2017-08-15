/**
Main library of jeutir.html
*/

function spaceDisplay(timeInterval) {
    var timeInterval = timeInterval || 0;
    var canvas = document.getElementById("gameArea");
    if (!spaceDisplay.stars) {
        // initialization
        var nbStars = 30;
        spaceDisplay.speed = 10; // pixels per second
        var stars = spaceDisplay.stars = [];
        var colors = spaceDisplay.colors = ["#fff", "#faa", "#ffa", "#fca", "#aaf"];
        for (var i = 0; i < nbStars; i++) {
            stars.push({x:Math.random()*canvas.width, y : Math.random()*canvas.height, size : Math.random()*10+1, color: colors[Math.floor(Math.random()*colors.length)]});
        }
        spaceDisplay.decors = new Array();
        for (var i = 1; i <= 6; i++) {
            var element = document.getElementById("decor"+i);
            if (element) spaceDisplay.decors.push(element);
        }
        spaceDisplay.decor = {img: spaceDisplay.decors[Math.floor(Math.random()*spaceDisplay.decors.length)],
                                        x: Math.random()*(canvas.width+50)-50,
                                        y: Math.random()*(canvas.height-300)+100,
                                        size: Math.random()*50+30,
                                        speed: Math.random()*10+15};
        
    }
    // update each star
    var stars = spaceDisplay.stars;
    var todelete = [];
    for (var i = 0; i < stars.length; i++) {
        stars[i].y += spaceDisplay.speed*timeInterval/1000;
        if (stars[i].y > canvas.height+10) {
            todelete.push(i);
        }
    }
    // remove off-scene stars
    while(todelete.length) {
        var index = todelete.pop();
        stars.splice(index, 1);
        stars.push({x:Math.random()*canvas.width, y : -10-Math.random()*100, size : Math.random()*10+1, color: spaceDisplay.colors[Math.floor(Math.random()*spaceDisplay.colors.length)]});
    }
    
    // update decor
    spaceDisplay.decor.y += spaceDisplay.decor.speed*timeInterval/1000;
    if (spaceDisplay.decor.y > canvas.height) {
        // new one
        spaceDisplay.decor = {img: spaceDisplay.decors[Math.floor(Math.random()*spaceDisplay.decors.length)],
                                        x: Math.random()*(canvas.width+50)-50,
                                        y: -80,
                                        size: Math.random()*50+30,
                                        speed: Math.random()*10+15};
    }
    
    // draw them...
    var ctx = canvas.getContext("2d");
    // reset area
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // display each star
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        //console.log("star at" + star.x+", "+star.y)
        ctx.strokeStyle = star.color;
        ctx.beginPath();
        ctx.moveTo(star.x-star.size, star.y);
        ctx.lineTo(star.x+star.size, star.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(star.x, star.y-star.size);
        ctx.lineTo(star.x, star.y+star.size);
        ctx.stroke();
    }
    // display decor
    ctx.drawImage(spaceDisplay.decor.img,
        // position
        spaceDisplay.decor.x, spaceDisplay.decor.y,
        // size : shrink it to 50px
        spaceDisplay.decor.size, spaceDisplay.decor.size * spaceDisplay.decor.img.height / spaceDisplay.decor.img.width);
}

function Projectile1(x, y, dx, dy, forEnemy, speed) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    this.size = 2;
    this.color = "#ffd";
    
    var distance = Math.sqrt(dx*dx+dy*dy);
    dx = dx / distance;
    dy = dy / distance;
    
    this.pos = {x:x+dx*this.size, y:y+dy*this.size};
    this.forEnemy = forEnemy;
    
    this.iterate = function (timeInterval) {
        // update position
        that.pos.x += dx*speed*timeInterval/1000;
        that.pos.y += dy*speed*timeInterval/1000;
        
        if (that.pos.y < -50) {
            return gloop.REMOVEME;
        }
        
        // draw
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = that.color;
        
        ctx.fillRect(that.pos.x-that.size, that.pos.y-that.size, that.size+1,  that.size+1);
        
    }
    
    
}

function SpaceshipPlayer(keyLeft, keyRight, ypos, img) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    // initialize
    this.pos = {x: canvas.width/2, y: ypos};
    this.size = 50;
    
    this.speed = 200; // pixels per second for moving
    
    // the spaceship image
    this.img = img;
    
    // life points
    this.PV = this.PVmax = 100;
    
    // time between shoots
    this.timeBetweenShoots = 750; // in ms
    
    this.timeBeforeNextShoot = this.timeBetweenShoots * Math.random();
    
    // shoot power
    this.shootMode = 0;
    this.shootPV = 0;
    
    this.iterate = function (timeInterval) {
        // update position
        if (keylistener.isPressed(keyLeft)) {
            that.pos.x -= that.speed*timeInterval/1000;
            if (that.pos.x < 0) that.pos.x = 0;
        }
        if (keylistener.isPressed(keyRight)) {
            that.pos.x += that.speed*timeInterval/1000;
            if (that.pos.x > canvas.width) that.pos.x = canvas.width;
        }
        
        // draw spaceship
        var ctx = canvas.getContext("2d");
        ctx.drawImage(that.img,
            // position
            that.pos.x - that.size/2, that.pos.y,
            // size : shrink it to 50px
            that.size, that.size * that.img.height / that.img.width);
        
        // shoot ?
        that.timeBeforeNextShoot -= timeInterval;
        
        if (that.timeBeforeNextShoot < 0) {
            var proj = new Projectile1(that.pos.x, that.pos.y, 0, -1, true, 700);
            gloop.add(proj.iterate);
            that.timeBeforeNextShoot = that.timeBetweenShoots;
        }
    }
    
}


function spaceShipDisplay(timeInterval) {
    var timeInterval = timeInterval || 0;
    var canvas = document.getElementById("gameArea");
    if (!spaceShipDisplay.pos) {
        // initialization
        spaceShipDisplay.pos = {x: canvas.width/2, y: canvas.height-100};
        //spaceShipDisplay.color = "#00F";
        spaceShipDisplay.size = 50;
        spaceShipDisplay.speed = 200; // pixels per second for moving
        spaceShipDisplay.img = document.getElementById("spaceship");
    }
    // update position
    if (keylistener.isPressed("q")) {
        spaceShipDisplay.pos.x -= spaceShipDisplay.speed*timeInterval/1000;
        if (spaceShipDisplay.pos.x < 0) spaceShipDisplay.pos.x = 0;
    }
    if (keylistener.isPressed("d")) {
        spaceShipDisplay.pos.x += spaceShipDisplay.speed*timeInterval/1000;
        if (spaceShipDisplay.pos.x > canvas.width) spaceShipDisplay.pos.x = canvas.width;
    }
    // draw spaceship
    var ctx = canvas.getContext("2d");
    ctx.drawImage(spaceShipDisplay.img,
        // position
        spaceShipDisplay.pos.x - spaceShipDisplay.size/2, spaceShipDisplay.pos.y,
        // size : shrink it to 50px
        spaceShipDisplay.size, spaceShipDisplay.size * spaceShipDisplay.img.height / spaceShipDisplay.img.width);
}

var gloop = false;
var keylistener = false;
var spaceShips = false;
function startMoving() {
    keylistener = new KeyListener();
    keylistener.start();
    gloop = new GameLoop();
    gloop.add(spaceDisplay);
    spaceShips = [new SpaceshipPlayer("q", "d", document.getElementById("gameArea").height - 100, document.getElementById("spaceship")),
            new SpaceshipPlayer("k", "m", document.getElementById("gameArea").height - 75, document.getElementById("spaceship")),
            new SpaceshipPlayer("ArrowLeft", "ArrowRight", document.getElementById("gameArea").height - 50, document.getElementById("spaceship"))];
    for (var i = 0; i < spaceShips.length; i++) {
        gloop.add(spaceShips[i].iterate);
    }
    
    gloop.start();
}