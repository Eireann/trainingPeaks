// setup a stub for localStorage
define(
[
    "underscore"
],
function(
         _
         )
{
    function FakeLocalStorage() {}

    FakeLocalStorage.prototype.getItem = function(key) {
            return this.hasOwnProperty(key) ? this[key] : null 
        };
        
    FakeLocalStorage.prototype.setItem = function(key, value) { 
        if(!_.isString(value)){
            throw new Error("LocalStorage values should be strings");
        }
        this[key] = value; 
    };
    
    FakeLocalStorage.prototype.removeItem = function(key) {
        delete this[key];
    };

    FakeLocalStorage.prototype.clear = function() {
        _.each(this, function(value, key)
        {
            this.removeItem(key);
        }, this);
    };

    return new FakeLocalStorage();
});
