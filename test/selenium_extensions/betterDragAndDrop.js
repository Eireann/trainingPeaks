Selenium.prototype.doBetterDragAndDrop = function(fromLocator, toLocator) {
    var fromEl = window.$(fromLocator.replace("css=","")).offset();
    var toEl = window.$(toLocator.replace("css=","")).offset();
    if(fromLocator.indexOf("css=") !== 0) {
    	fromLocator = "css=" + fromLocator;
    }
    var diffX = toEl.left - fromEl.left;
    var diffY = toEl.top - fromEl.top;
    var coords = diffX + "," + diffY;
    this.doEcho("Dragging by " + coords);
    this.doDragAndDrop(fromLocator, coords);
}
