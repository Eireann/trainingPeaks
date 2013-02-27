Selenium.prototype.doBetterDragAndDrop = function(fromLocator, toLocator) {
   
    fromLocator = fromLocator.replace("css=","");
    toLocator = toLocator.replace("css=","");

    this.doEcho(fromLocator);
    this.doEcho(toLocator);

	for(var key in this) {
	this.doEcho(key);
	}
	this.doEcho(this.window);
	this.doEcho(this.window.$);
    this.doEcho(window.$(fromLocator));
    var fromOffset = window.$(fromLocator).offset();
    var toOffset = window.$(toLocator).offset();

    this.doEcho(fromOffset);
    this.doEcho(toOffset);
    var diffX = toOffset.left - fromOffset.left;
    var diffY = toOffset.top - fromOffset.top;
    var coords = diffX + "," + diffY;
    this.doEcho("Dragging by " + coords);
    this.doDragAndDrop("css=" + fromLocator, coords);
}
