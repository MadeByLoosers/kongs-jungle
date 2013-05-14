/*
 * HealthBar class should have no knowledge
 * of the Actor or Level classes to
 * keep it decoupled
 */
function HealthBar(config){
	this.controller = config.controller;
    this.maxHealth = config.maxHealth;
    this.x = config.x;
    this.y = config.y;
    this.maxWidth = config.maxWidth;
    this.height = config.height;
    
    this.health = this.maxHealth;
}

HealthBar.prototype.setHealth = function(health){
    this.health = health;
};

HealthBar.prototype.draw = function(){
	var context = this.controller.view.context;
    context.beginPath();
    context.rect(this.x, this.y, this.maxWidth, this.height);
    context.fillStyle = "#520f27";
    context.fill();
    context.closePath();
    
    context.beginPath();
    var width = this.maxWidth * this.health / this.maxHealth;
    context.rect(this.x, this.y, width, this.height);
    context.fillStyle = "#36d725";
    context.fill();
    context.closePath();

};
