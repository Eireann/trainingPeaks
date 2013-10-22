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
            this.active = 0;
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
            this._changeIsSelectedDepth(item, this.active);
        },

        _deactivateItem: function(item)
        {
            this._changeIsSelectedDepth(item, -this.active);
        },

        _changeIsSelectedDepth: function(item, delta)
        {
            var state = item.getState();
            var depth = (state.get("isSelectedDepth") || 0) + delta;
            state.set({ isSelectedDepth: depth, isSelected: !!depth });
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
