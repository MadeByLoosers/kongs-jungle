/*
 * Actor class should have no knowledge of
 * of the Level or HealthBar classes to
 * keep it decoupled
 */
function Actor(config){
    this.controller = config.controller;
    this.normalSpriteSheet = config.normalSpriteSheet;
    this.hitSpriteSheet = config.hitSpriteSheet;
    this.x = config.x; // absolute x
    this.y = config.y; // absolute y
    this.playerSpeed = config.playerSpeed; // px / s
    this.motions = config.motions;
    this.startMotion = config.startMotion;
    this.facingRight = config.facingRight;
    this.moving = config.moving;
    this.spriteInterval = config.spriteInterval; // ms
    this.maxHealth = config.maxHealth;
    this.attackRange = config.attackRange;
    this.minAttackInterval = config.minAttackInterval;
    
    this.SPRITE_SIZE = 144;
	this.FADE_RATE = 1; // full fade in 1s
    this.spriteSheet = this.normalSpriteSheet;
    this.vx = 0;
    this.vy = 0;
    this.spriteSeq = 0;
    this.motion = this.startMotion;
    this.lastMotion = this.motion;
    this.airborne = false;
    this.attacking = false;
    this.canAttack = true;
    this.health = this.maxHealth;
    this.alive = true;
    this.opacity = 1;
    this.timeSinceLastSpriteFrame = 0;
}

Actor.prototype.attack = function(){
    this.attacking = true;
    this.canAttack = false;
    var that = this;
    setTimeout(function(){
       that.canAttack = true;
    }, this.minAttackInterval);
};

Actor.prototype.stop = function(){
    this.moving = false;
};

Actor.prototype.isFacingRight = function(){
    return this.facingRight;
};

Actor.prototype.moveRight = function(){
    this.moving = true;
    this.facingRight = true;
};

Actor.prototype.moveLeft = function(){
    this.moving = true;
    this.facingRight = false;
};

Actor.prototype.jump = function(){
    if (!this.airborne) {
        this.airborne = true;
        this.vy = -1;
    }
};

Actor.prototype.draw = function(pos){
    var context = this.controller.view.context;
    var sourceX = this.spriteSeq * this.SPRITE_SIZE;
    var sourceY = this.motion.index * this.SPRITE_SIZE;
    
    context.save();
	context.translate(pos.x, pos.y);

    if (this.facingRight) {
        context.translate(this.SPRITE_SIZE, 0);
        context.scale(-1, 1);
    }
    
    context.globalAlpha = this.opacity;
    context.drawImage(this.spriteSheet, sourceX, sourceY, this.SPRITE_SIZE, this.SPRITE_SIZE, 0, 0, this.SPRITE_SIZE, this.SPRITE_SIZE);
    context.restore();
};

Actor.prototype.fade = function(){
	var opacityChange = this.controller.anim.getTimeInterval() * this.FADE_RATE / 1000;
    this.opacity -= opacityChange;
    if (this.opacity < 0) {
        this.opacity = 0;
    }
};

Actor.prototype.updateSpriteMotion = function(){
	// if attack sequence has finished, set attacking = false
    if (this.attacking && this.spriteSeq == this.motion.numSprites - 1) {
        this.attacking = false;
    }
			
    if (this.attacking) {
        this.motion = this.motions.ATTACKING;
    }
    else {
        if (this.airborne) {
            this.motion = this.motions.AIRBORNE;
        }
        else {
            this.vy = 0;
            if (this.moving) {
                this.motion = this.motions.RUNNING;
            }
            else {
                this.motion = this.motions.STANDING;
            }
        }
    }
};

Actor.prototype.updateSpriteSeqNum = function() {
    var anim = this.controller.anim;
    this.timeSinceLastSpriteFrame += anim.getTimeInterval();
    
    if (this.timeSinceLastSpriteFrame > this.spriteInterval) {
        if (this.spriteSeq < this.motion.numSprites - 1) {
            this.spriteSeq++;
        }
        else {
            if (this.motion.loop) {
                this.spriteSeq = 0;
            }
        }
        
        this.timeSinceLastSpriteFrame = 0;
    }
    
    if (this.motion != this.lastMotion) {
        this.spriteSeq = 0;
        this.lastMotion = this.motion;
    }
};

Actor.prototype.damage = function(){
    this.health = this.health <= 0 ? 0 : this.health - 1;
    
    this.spriteSheet = this.hitSpriteSheet;
    var that = this;
    setTimeout(function(){
        that.spriteSheet = that.normalSpriteSheet;
    }, 200);
};

Actor.prototype.getCenter = function(){
    return {
        x: Math.round(this.x) + this.SPRITE_SIZE / 2,
        y: Math.round(this.y) + this.SPRITE_SIZE / 2
    };
};
