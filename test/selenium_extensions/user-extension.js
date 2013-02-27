Selenium.prototype.doBetterDragAndDrop = function(fromLocator, toLocator) {
    var fromElement = this.page().findElement(fromLocator);
    var toElement = this.page().findElement(toLocator);
    this.echo("Found elements");
}
