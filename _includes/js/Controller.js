/*
 * Game controller
 *
 * The controller is responsible for instantiating
 * the view and the model, initializing the game,
 * controlling the game state, and managing keyboard events
 */
function Controller(canvasId){
    this.imageSources = {
        levelBounds         : "./_includes/img/level_bounds.png",
        level               : "./_includes/img/level.png",
        heroSprites         : "./_includes/img/hero_sprites.png",
        heroHitSprites      : "./_includes/img/hero_hit_sprites.png",
        badGuySprites       : "./_includes/img/bad_guy_sprites.png",
        badGuyHitSprites    : "./_includes/img/bad_guy_hit_sprites.png",
        background          : "./_includes/img/background.png",
        readyScreen         : "./_includes/img/readyScreen.png",
        gameoverScreen      : "./_includes/img/gameoverScreen.png",
        winScreen           : "./_includes/img/winScreen.png"
    };
    this.images = {};

    this.states = {
        INIT: "INIT",
        READY: "READY",
        PLAYING: "PLAYING",
        WON: "WON",
        GAMEOVER: "GAMEOVER"
    };

    this.keys = {
        ENTER: 13,
        UP: 38,
        LEFT: 37,
        RIGHT: 39,
        A: 65
    };

    this.anim = new Animation(canvasId);
    this.state = this.states.INIT;
    this.model = new Model(this);
    this.view = new View(this);
    this.avgFps = 0;
    this.leftKeyup = true;
    this.rightKeyup = true;
    this.addKeyboardListeners();
    this.loadImages();

    if (('ontouchstart' in document.documentElement)) {
        this.addTouchListeners();
    }
}

Controller.prototype.loadImages = function(){
    /*
     * we need to load the loading image first
     * so go ahead and insert it into the dom
     * and them load the rest of the images
     */
    this.view.canvas.style.background = "url('./_includes/img/loadingScreen.png')";

    var that = this;
    var loadedImages = 0;
    var numImages = 0;
    for (var src in this.imageSources) {
        numImages++;
    }
    for (var src in this.imageSources) {
        this.images[src] = new Image();
        this.images[src].onload = function(){
            if (++loadedImages >= numImages) {
                that.initGame();
            }
        };
        this.images[src].src = this.imageSources[src];
    }
};

Controller.prototype.addKeyboardListeners = function(){
    var that = this;
    document.onkeydown = function(evt){
        that.handleKeydown(evt);
    };
    document.onkeyup = function(evt){
        that.handleKeyup(evt);
    };
};


Controller.prototype.addTouchListeners = function(){
    var that = this,
        btns = false,
        up, left, right, attack;

    document.addEventListener("touchstart", function(evt){

        // imitate game start
        if (that.state != that.states.INIT && that.state != that.states.PLAYING) {
            that.handleKeydown({keyCode:that.keys.ENTER});
            // create buttons
            if (!btns) {
                btns = true;

                up     = that.addEl('up');
                left   = that.addEl('left');
                right  = that.addEl('right');
                attack = that.addEl('attack');

                up.addEventListener("touchstart",     function(evt){ that.handleKeydown({keyCode:that.keys.UP}); });
                left.addEventListener("touchstart",   function(evt){ that.handleKeydown({keyCode:that.keys.LEFT}); });
                right.addEventListener("touchstart",  function(evt){ that.handleKeydown({keyCode:that.keys.RIGHT}); });
                attack.addEventListener("touchstart", function(evt){ that.handleKeydown({keyCode:that.keys.A}); });

                up.ontouchend     = function(evt){ that.handleKeyup({keyCode:that.keys.UP}); };
                left.ontouchend   = function(evt){ that.handleKeyup({keyCode:that.keys.LEFT}); };
                right.ontouchend  = function(evt){ that.handleKeyup({keyCode:that.keys.RIGHT}); };
                attack.ontouchend = function(evt){ that.handleKeyup({keyCode:that.keys.A}); };
            }
        }
    });
};


Controller.prototype.addEl = function(name) {
    var body = document.querySelector("body");
    var el = document.createElement("span");
    el.className = "button " + name;
    body.appendChild(el);
    return el;
}

Controller.prototype.handleKeyup = function(evt){
    keycode = ((evt.which) || (evt.keyCode));

    switch (keycode) {
        case this.keys.LEFT:
            this.leftKeyup = true;
            if (this.leftKeyup && this.rightKeyup) {
                this.model.hero.stop();
            }
            break;

        case this.keys.UP:
            break;

        case this.keys.RIGHT:
            this.rightKeyup = true;
            if (this.leftKeyup && this.rightKeyup) {
                this.model.hero.stop();
            }
            break;
    }
};

Controller.prototype.handleKeydown = function(evt){
    var that = this;
    keycode = ((evt.which) || (evt.keyCode));
    switch (keycode) {
        case this.keys.ENTER: // enter
            if (this.state == this.states.READY) {

                // switch audio on game start
                var audio_player = $("#main-audio");
                var source = $("#main-audio source");
                source.attr('src', './_includes/mp3/voodoo.mp3');
                audio_player.load();

                this.state = this.states.PLAYING;
                // start animation
                this.anim.start();
            }
            else if (this.state == this.states.GAMEOVER || this.state == this.states.WON) {
                this.resetGame();
                this.state = this.states.PLAYING;
            }
            break;
        case this.keys.LEFT:
            this.leftKeyup = false;
            this.model.hero.moveLeft();
            break;

        case this.keys.UP:
            this.model.hero.jump();
            break;

        case this.keys.RIGHT:
            this.rightKeyup = false;
            this.model.hero.moveRight();
            break;

        case this.keys.A: // attack
            var model = this.model;
            var hero = model.hero;
            hero.attack();

            // most touch devices can only play one song at a time so leave the bg music playing
            if (!('ontouchstart' in document.documentElement)) {
                var snd = new Audio("./_includes/mp3/punch.mp3"); // buffers automatically when created
                snd.play();
            }

            setTimeout(function(){
                for (var n = 0; n < model.badGuys.length; n++) {
                    (function(){
                        var badGuy = model.badGuys[n];
                        if (model.nearby(hero, badGuy)
                            && ((badGuy.x - hero.x > 0 && hero.isFacingRight()) || (hero.x - badGuy.x > 0 && !hero.isFacingRight()))) {
                            badGuy.damage();
                        }
                    })();
                }
            }, 200);
            break;
    }
};

Controller.prototype.initGame = function(){
    var model = this.model;
    var view = this.view;
    model.initLevel();
    model.initHero();
    model.initBadGuys();
    model.initHealthBar();

    // set stage function
    this.anim.setStage(function(){
        model.updateStage();
        view.drawStage();
    });
    // game is now ready to play
    this.state = this.states.READY;
    view.drawScreen(this.images.readyScreen);
};

Controller.prototype.resetGame = function(){
    var model = this.model;
    model.level = null;
    model.hero = null;
    model.healthBar = null;
    model.badGuys = [];

    model.initLevel();
    model.initHero();
    model.initBadGuys();
    model.initHealthBar();
};

