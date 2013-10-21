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
    var SelectionCollection = TP.Collection.extend(
    {

        initialize: function()
        {
            this.on("add", this._onAdd, this);
            this.on("remove", this._onRemove, this);
        },

        activate: function()
        {
            this.active = true;
            this.each(function(item) { item.getState().set("isSelected", true); });
        },

        deactivate: function()
        {
            this.active = false;
            this.each(function(item) { item.getState().set("isSelected", false); });
        },

        _onAdd: function(collection, model, options)
        {
            if(this.active)
            {
                model.getState().set("isSelected", true);
            }
        },

        _onRemove: function(collection, model, options)
        {
            if(collection.active)
            {
                model.getState().set("isSelected", false);
            }
        }

    });

    function SelectionManager()
    {
    }

    _.extend(SelectionManager.prototype,
    {

        /* 
         * model: the model to be selected
         * event: the event triggering the selection, used to select ranges (optional)
         */
        setSelection: function(model, event, klass)
        {

            klass = klass || SelectionCollection;

            var success = false;
            if(event && event.shiftKey)
            {
                success = this.tryExtendSelection(model, event, klass);
            }

            if(!success)
            {
                this.clearSelection();
                this.selection = new klass([model]);
                this.selection.activate();
            }

        },

        tryExtendSelection: function(model, event, klass)
        {
            var success = false;
            if(this.selection instanceof klass && _.isFunction(this.selection.extendTo))
            {
                success = this.selection.extendTo(model);
            }
            return success;
        },

        clearSelection: function()
        {
            if(this.selection)
            {
                this.selection.deactivate();
                this.selection = null;
            }
        }

    });

    return SelectionManager;

});
