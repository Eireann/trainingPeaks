define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var Selection = TP.Collection.extend(
    {

        initialize: function()
        {
            this.on("add", this._onAdd, this);
            this.on("remove", this._onRemove, this);
        },

        activate: function()
        {
            this.active = 1;
            this.each(this._activateItem, this);
        },

        deactivate: function()
        {
            this.each(this._deactivateItem, this);
            this.active = 0;
        },

        extendTo: function()
        {
            return false;
        },

        _activateItem: function(item)
        {
            item.getState().set("isSelected", (item.getState().get("isSelected") || 0) + this.active);
        },

        _deactivateItem: function(item)
        {
            item.getState().set("isSelected", (item.getState().get("isSelected") || 0) - this.active);
        },

        _onAdd: function(model, collection, options)
        {
            collection._activateItem(model);
        },

        _onRemove: function(model, collection, options)
        {
            collection._deactivateItem(model);
        }

    });

    return Selection;

});
