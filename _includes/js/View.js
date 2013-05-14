/*
 * Game view
 * 
 * The view has access to the canvas context
 * and is responsible for the drawing logic
 */
function View(controller){
    this.controller = controller;
    this.canvas = controller.anim.getCanvas();
    this.context = controller.anim.getContext();
}

View.prototype.drawScreen = function(screenImg){
    this.context.drawImage(screenImg, 0, 0, this.canvas.width, this.canvas.height);
};

View.prototype.drawBadGuys = function() {
    var controller = this.controller;
    var model = controller.model;
	for (var n = 0; n < model.badGuys.length; n++) {
	    var badGuy = model.badGuys[n];
		var offsetPos = {
			x: badGuy.x + model.level.x,
			y: badGuy.y + model.level.y
		};
	    badGuy.draw(offsetPos);
	}
};

View.prototype.drawFps = function() {
    var context = this.context;
    context.fillStyle = "black";
    context.fillRect(this.canvas.width - 0, 0, 0, 0);
    
    context.font = "18pt Calibri";
    context.fillStyle = "white";
    context.fillText("fps: " + this.controller.avgFps.toFixed(1), this.canvas.width - 0, 0);
};

View.prototype.drawStage = function(){
    var controller = this.controller;
    var model = controller.model;
    if (controller.state == controller.states.PLAYING || controller.state == controller.states.GAMEOVER || controller.state == controller.states.WON) {
        model.level.draw();
		this.drawBadGuys();
        model.hero.draw(model.heroCanvasPos);
        model.healthBar.draw();
        
        // draw screen overlay
        if (controller.state == controller.states.GAMEOVER) {
            this.drawScreen(controller.images.gameoverScreen);
        }
        else if (controller.state == controller.states.WON) {
            this.drawScreen(controller.images.winScreen);
        }
        
        this.drawFps();
    }
    else if (controller.state == controller.states.READY) {
        this.drawScreen(controller.images.readyScreen);
    }
};
