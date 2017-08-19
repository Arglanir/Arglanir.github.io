/**
Main library of jeutir.html
*/

var score = 0;

function spaceDisplay(timeInterval) {
    var timeInterval = timeInterval || 0;
    var canvas = document.getElementById("gameArea");
    if (!spaceDisplay.stars) {
        // initialization
        var nbStars = 30;
        spaceDisplay.speed = 10; // pixels per second
        var stars = spaceDisplay.stars = [];
        var colors = spaceDisplay.colors = ["#fff", "#faa", "#ffa", "#fca", "#aaf", "#aff"];
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
        
        var grd=ctx.createRadialGradient(star.x,star.y,1,star.x,star.y,star.size*2);
        grd.addColorStop(0,star.color);
        grd.addColorStop(1,"rgba(0, 0, 0, 0.0)");
        //console.log("star at" + star.x+", "+star.y)
        ctx.strokeStyle = grd;//star.color;
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
    
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(Math.floor(score),10,30);
    
    
    // run intersections
    var listEnemies = [];
    var listAllies = [];
    gloop.forEach(function(element) {
        if (!element.mayHurt) return;
        (element.enemy ? listEnemies : listAllies).push(element);
    });
    // TODO: optimize by grouping by y
    for (var ie in listEnemies) {
        for (var ia in listAllies) {
            var enemy = listEnemies[ie];
            var ally = listAllies[ia];
            
            var x1 = enemy.pos.x;
            var y1 = enemy.pos.y;
            if (enemy.offsetCenterY) y1 += enemy.offsetCenterY;
            var x2 = ally.pos.x;
            var y2 = ally.pos.y;
            if (ally.offsetCenterY) y2 += ally.offsetCenterY;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var distance = Math.sqrt(dx*dx + dy*dy);
            if (distance*2 < enemy.size + ally.size) {
                // intersection
                ally.PV -= enemy.damage;
                enemy.PV -= ally.damage;
                
                if (ally.hurtcallback) {
                    ally.hurtcallback(enemy);
                }
                if (enemy.hurtcallback) {
                    enemy.hurtcallback(ally);
                }
            }
        }
    }
}

function Projectile1(x, y, dx, dy, forEnemy, speed, damage) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    this.size = 2;
    this.color = forEnemy ? "#ffd" : "#F66";
    
    var distance = Math.sqrt(dx*dx+dy*dy);
    dx = dx / distance;
    dy = dy / distance;
    
    this.pos = {x:x+dx*this.size, y:y+dy*this.size};
    this.forEnemy = forEnemy;
    
    this.enemy = !forEnemy;
    this.mayHurt = true;
    this.damage = damage;
    this.PV = 1;
        
    this.iterate = function (timeInterval) {
        if (that.PV<=0) return gloop.REMOVEME;
        
        // update position
        that.pos.x += dx*speed*timeInterval/1000;
        that.pos.y += dy*speed*timeInterval/1000;
        
        if (that.pos.y < -50 || that.pos.y > canvas.height + 50) {
            return gloop.REMOVEME;
        }
        
        // draw
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = that.color;
        
        ctx.fillRect(that.pos.x-that.size, that.pos.y-that.size, that.size+1,  that.size+1);
        
    }
    
}

function Asteroid(x, y, img, speed, damage) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    this.size = 50;
    this.color = "#ffd";
    
    var dx = 0;
    var dy = 1;
    
    var distance = Math.sqrt(dx*dx+dy*dy);
    dx = dx / distance;
    dy = dy / distance;
    
    this.pos = {x:x+dx*this.size, y:y+dy*this.size};
    this.forEnemy = false;
    
    this.enemy = true;
    this.mayHurt = true;
    this.damage = damage;
    this.PV = 1000;
    
    this.iterate = function (timeInterval) {
        if (that.PV<=0) return gloop.REMOVEME;

        // update position
        that.pos.x += dx*speed*timeInterval/1000;
        that.pos.y += dy*speed*timeInterval/1000;
        
        if (that.pos.y > canvas.height + 50) {
            return gloop.REMOVEME;
        }
        
        // draw
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img,
            // position
            that.pos.x - that.size/2, that.pos.y - that.size/2,
            // size : shrink it to 50px
            that.size, that.size * img.height / img.width);
    }
    
}

var debugfirst = true;

function Explosion(x, y) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    this.rSpeed = 40;
    
    this.animationTotTime = 1000;
    this.animationTime = 0;
    
    this.radius = this.minRadius = 20;
    this.maxRadius = 40;
    
    this.colorCenter = "#fff";
    this.colorMiddle = "#FF0";
    this.colorEnd = "rgba(0,0,0,0.0)";
    
    this.iterate = function(timeInterval) {
        if (that.animationTime > that.animationTotTime) {
            return gloop.REMOVEME;
        }
        var ctx = canvas.getContext("2d");
        var theta = that.animationTime/that.animationTotTime;
        var blueColor = that.animationTime < that.animationTotTime/2 ? 255*(1-2*theta) : 0;
        var opacity = that.animationTime < that.animationTotTime/2 ? 1 : (2-2*theta);
        var color = "rgba("+Math.floor(255*opacity)+", "+Math.floor(255*opacity)+", "+Math.floor(blueColor)+", "+opacity+")";
        that.radius = that.minRadius + theta * (that.maxRadius-that.minRadius);
        
        var grd=ctx.createRadialGradient(x,y,1,x,y,that.radius);
        grd.addColorStop(0, color);
        grd.addColorStop(0.8, color);
        grd.addColorStop(1, "rgba(0, 0, 0, 0.0)");

        ctx.fillStyle = grd;
        
        ctx.beginPath();
        ctx.arc(x, y, that.radius, 0, 2*Math.PI);
        ctx.fill();
        
        that.animationTime += timeInterval;
    }
}

function Bonus(type, x, y) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    this.enemy = true;
    
    this.damage = 0;
    this.mayHurt = true;
    this.PV = 1;
    
    this.pos = {x:x, y:y};
    this.speed = 200;
    
    this.iterate = function(timeInterval) {
        
        
    };
    
    this.hurtcallback = function(ally) {
        
        
    }
    
    
}

function SpaceshipEnemy(speedY, damage, img, origY, destinationY, PVmax) {
    var that = this;
    var canvas = document.getElementById("gameArea");
    
    // initialize
    this.pos = {x: canvas.width/2, y: origY};
    this.size = 50;
    
    this.enemy = true;
    this.mayHurt = true;
    
    this.speed = 200; // pixels per second for moving
    this.speedY = speedY;
    
    // the spaceship image
    this.img = img;
    
    // life points
    this.PV = this.PVmax = PVmax || damage * 3;
    
    // time between shoots
    this.timeBetweenShoots = 1500; // in ms
    
    this.timeBeforeNextShoot = this.timeBetweenShoots * Math.random();
    
    // shoot power
    this.shootMode = 0;
    this.shootPV = damage;
    
    this.damage = 20;
    
    var imgSize = 70;
    var sizeY = imgSize * that.img.height / that.img.width;
    
    var destinationX = Math.random() * canvas.width;
    
    this.iterate = function (timeInterval) {
        if (that.PV<=0) {
            //console.log("I am dead!");
            score += that.PVmax;
            gloop.add(new Explosion(that.pos.x, that.pos.y));
            gloop.add(new SpaceshipEnemy(50, damage*1.1, img, -100, destinationY));
            return gloop.REMOVEME; // TODO: add explosion
        }

        // move spaceship
        // update position
        if (destinationY>origY) {
            that.pos.y += that.speedY*timeInterval/1000;
            if (that.pos.y > destinationY) that.pos.y = destinationY;
        }
        if (destinationX < that.pos.x) {
            that.pos.x -= that.speed*timeInterval/1000;
            if (that.pos.x < destinationX) that.pos.x = destinationX;
        }
        if (destinationX > that.pos.x) {
            that.pos.x += that.speed*timeInterval/1000;
            if (that.pos.x > destinationX) that.pos.x = destinationX;
        }
        if (that.pos.x == destinationX) {
            destinationX = Math.random() * canvas.width;
        }
        
        // draw spaceship
        var ctx = canvas.getContext("2d");
        ctx.drawImage(that.img,
            // position
            that.pos.x - imgSize/2, that.pos.y - sizeY/2,
            // size : shrink it to 50px
            imgSize, sizeY);
        
        // shoot ?
        that.timeBeforeNextShoot -= timeInterval;
        
        if (that.timeBeforeNextShoot < 0) {
            var proj = new Projectile1(that.pos.x, that.pos.y, 0, 1, false, 700, that.shootPV);
            gloop.add(proj);
            that.timeBeforeNextShoot = that.timeBetweenShoots-200+Math.random()*400;
        }
    }
    
}

function SpaceshipPlayer(keyLeft, keyRight, ypos, img) {
    var that = this;
    var canvas = document.getElementById("gameArea");

    this.ypostheta = ypos*Math.PI/2;
    
    this.yposthetaSpeed = 0.20;// radian/s
    
    // initialize
    this.pos = {x: (canvas.width-100)*Math.random()+50, y: ypos};
    this.size = 50;
    
    
    this.speed = 200; // pixels per second for moving

    // the spaceship image
    this.img = img;
    var imgRotation = parseInt(img.getAttribute("rotate") || "0") * Math.PI/180;
    var imgSize = 70; // because opacity
    var imgHeight = imgSize * img.height / img.width;

    
    // attributes for intersection
    this.enemy = false;
    this.mayHurt = true;
    this.damage = 10000;

    
    // life points
    this.PV = this.PVmax = 200;
    
    // time between shoots
    this.timeBetweenShoots = 750; // in ms
    
    this.timeBeforeNextShoot = this.timeBetweenShoots * Math.random();
    
    // shoot power
    this.shootMode = 0;
    this.shootPV = 50;
    
    // animation when hurt
    this.hurtAnimationTotTime = 1000;
    this.hurtAnimationTime = 1000;
    
    // activation of shield
    this.shieldActivatedMaxTime = 3000;
    this.shieldActivatedRemainingTime = this.shieldActivatedMaxTime;
    this.shieldRecharge = this.shieldActivatedMaxTime/10; // milliseconds per second
    
    
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
        that.ypostheta += that.yposthetaSpeed*timeInterval/1000;
        that.pos.y = document.getElementById("gameArea").height-150-50*Math.sin(that.ypostheta)
        
        // draw spaceship
        var ctx = canvas.getContext("2d");
        if (that.PV<=0) {
            // dead... make it transparent
            ctx.save();
            ctx.globalAlpha = 0.4;
        }
        
        var x = that.pos.x;
        var y = that.pos.y;
        
        if (imgRotation) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(imgRotation);
            ctx.drawImage(img, -imgSize / 2, -imgHeight / 2, imgSize, imgHeight);
            //ctx.drawImage(img, 0, 0, imgSize, imgHeight);
            ctx.restore();
            //ctx.rotate(-imgRotation);
            //ctx.translate(-x, -y);
        } else {
            ctx.drawImage(that.img,
                // position
                that.pos.x - imgSize/2, that.pos.y - imgHeight/2,
                // size : shrink it to 50px
                imgSize, imgHeight);
        }
        
        if (that.PV<=0) {
            ctx.restore();
            return; // no more shooting
        }
        
        // shield animation
        var shieldPressed = keylistener.isPressed(keyLeft) && keylistener.isPressed(keyRight);
        var shieldActivated = shieldPressed && that.shieldActivatedRemainingTime > 0;
        if (!shieldPressed) {
            that.shieldActivatedRemainingTime += that.shieldRecharge*timeInterval/1000;
            that.shieldActivatedRemainingTime = that.shieldActivatedRemainingTime > that.shieldActivatedMaxTime ? that.shieldActivatedMaxTime : that.shieldActivatedRemainingTime;
        }
        if (shieldActivated) {
            // shield activated
            that.shieldActivatedRemainingTime -= timeInterval;
            
            // circle animation from color to black transparent
            var theta = that.shieldActivatedRemainingTime / that.shieldActivatedMaxTime;
            var colorR = 255*(theta < 0.5 ? 0 : theta-0.5);
            var colorG = colorR;
            var colorB = 255*(theta > 0.5 ? 1: theta*2);
            var opacity = theta > 0.5 ? 1: 0.5+theta;
            var color = "rgba("+Math.floor(colorR*opacity)+", "+Math.floor(colorG*opacity)+", "+Math.floor(colorB*opacity)+", "+opacity+")";
        
            ctx.strokeStyle = color;
        
            ctx.beginPath();
            ctx.arc(that.pos.x, that.pos.y, imgSize/2, 0, 2*Math.PI);
            ctx.stroke();
        }
        // hurt animation
        else if (that.hurtAnimationTime < that.hurtAnimationTotTime) {
            // circle animation from color to black transparent
            var theta = that.hurtAnimationTime / that.hurtAnimationTotTime;
            var hitPercent = 1 - that.PV / that.PVmax;
            var colorR = hitPercent < 0.5 ? 255*2*hitPercent : 255;
            var colorG = 255*(1-hitPercent);
            var colorB = 0;
            var opacity = theta < 0.5 ? 1 : 2-2*theta;
            var color = "rgba("+Math.floor(colorR*opacity)+", "+Math.floor(colorG*opacity)+", "+Math.floor(colorB*opacity)+", "+opacity+")";
        
            ctx.strokeStyle = color;
        
            ctx.beginPath();
            ctx.arc(that.pos.x, that.pos.y, imgSize/2, 0, 2*Math.PI);
            ctx.stroke();
            
            that.hurtAnimationTime += timeInterval;
        }
        

        // shoot ?
        that.timeBeforeNextShoot -= timeInterval;
        
        if (that.timeBeforeNextShoot < 0 && !shieldPressed) {
            var proj = new Projectile1(that.pos.x, that.pos.y, 0, -1, true, 700, that.shootPV);
            gloop.add(proj);
            that.timeBeforeNextShoot = that.timeBetweenShoots-200+Math.random()*400;
        }
    }
    
    this.hurtcallback = function(enemy) {
        if (enemy.bonus) { // it's a bonus, all is well
            return;
        }
        if (keylistener.isPressed(keyLeft) && keylistener.isPressed(keyRight) && that.shieldActivatedRemainingTime > 0) {
            // shield pressed !
            that.PV += enemy.damage;
            return;
        }
        if (that.PV > 0) {
            that.hurtAnimationTime = 0;
            return;
        }
        if (enemy.damage > -that.PV)  {// just hurt
            gloop.add(new Explosion(that.pos.x, that.pos.y));
        }
    }
    
}


var gloop = false;
var keylistener = false;
var spaceShips = false;
function startMoving() {
    keylistener = new KeyListener();
    keylistener.start();
    gloop = new GameLoop();
    gloop.add(spaceDisplay);
    spaceShips = [new SpaceshipPlayer("q", "d", 1, document.getElementById("spaceship1")),
            new SpaceshipPlayer("k", "m", 2, document.getElementById("spaceship2")),
            new SpaceshipPlayer("ArrowLeft", "ArrowRight", 3, document.getElementById("spaceship3")),
            new SpaceshipPlayer("4", "6", 4, document.getElementById("spaceship4")),
            ];
    for (var i = 0; i < spaceShips.length; i++) {
        gloop.add(spaceShips[i]);
    }
    for (var i = 1; i <= 4; i++) {
        gloop.add(new SpaceshipEnemy(50, 30, document.getElementById("enemy"+i), -100, 50*i));
    }
    
    
    gloop.start();
}