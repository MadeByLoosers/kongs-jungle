/*
 * Level class should have no knowledge of
 * of the Actor or HealthBar classes to
 * keep it decoupled
 */
function Level(config){
	this.controller = config.controller;
    this.x = config.x;
    this.y = config.y;
    this.leftBounds = config.leftBounds;
    this.rightBounds = config.rightBounds;
	this.boundsData = null;
    this.GRAVITY = 3; // px / second^2
    this.MID_RGB_COMPONENT_VALUE = 128; 
	this.LEVEL_WIDTH = 6944;
	
	this.setBoundsData();
}

Level.prototype.setBoundsData = function(){
	var controller = this.controller;
	var canvas = controller.view.canvas;
	var context = controller.view.context;
    canvas.width = 6944;
    context.drawImage(controller.images.levelBounds, 0, 0);
    imageData = context.getImageData(0, 0, 6944, 600);
    this.boundsData = imageData.data;
    canvas.width = 900;
};

Level.prototype.draw = function(){
	var context = this.controller.view.context;
    context.drawImage(this.controller.images.background, 0, 0);
    context.drawImage(this.controller.images.level, this.x, this.y);
};

Level.prototype.getZoneInfo = function(pos){
	var x = pos.x;
	var y = pos.y;
    var red = this.boundsData[((this.LEVEL_WIDTH * y) + x) * 4];
    var green = this.boundsData[((this.LEVEL_WIDTH * y) + x) * 4 + 1];
    var blue = this.boundsData[((this.LEVEL_WIDTH * y) + x) * 4 + 2];
    
    var inBounds = false;
    var levitating = false;
    
    /*
     * COLOR KEY
     *
     * PINK: 255 0   255
     * CYAN: 0   255 255
     *
     * COLOR NOTATION
     *
     * PINK: player is in bounds and can jump
     * CYAN: player is in bounds and is levitating
     */
	var mid = this.MID_RGB_COMPONENT_VALUE;
    if ((red > mid && green < mid && blue > mid) || (red < mid && green > mid && blue > mid)) {
        inBounds = true;
    }
    if (red < mid && green > mid && blue > mid) {
        levitating = true;
    }
	
    return {
        inBounds: inBounds,
        levitating: levitating
    };
};


