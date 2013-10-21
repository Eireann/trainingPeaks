define(
[
    "underscore",
    "TP",
    "shared/misc/selection"
],
function(
    _,
    TP,
    Selection
)
{

    function SelectionManager()
    {
    }

    _.extend(SelectionManager.prototype, Backbone.Events,
    {

        /* 
         * model: the model to be selected
         * event: the event triggering the selection, used to select ranges (optional)
         */
        setSelection: function(model, event)
        {

            var klass = this._selectionClassForModel(model);

            var success = false;
            if(event && event.shiftKey)
            {
                success = this.tryExtendSelection(model, event);
            }

            if(!success)
            {
                this.clearSelection();
                this.selection = new klass([model]);
                this.selection.activate();
            }

        },

        setMultiSelection: function(models, event)
        {
            this.clearSelection();

            if(models)
            {
                var klass = this._selectionClassForModel(models[0]);
                this.selection = new klass(models);
                this.selection.activate();
            }
        },

        tryExtendSelection: function(model, event)
        {
            var success = false;
            if(this.selection instanceof this._selectionClassForModel(model) && _.isFunction(this.selection.extendTo))
            {
                success = this.selection.extendTo(model, event);
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
        },

        _selectionClassForModel: function(model)
        {
            return model.selectionClass || Selection;
        }

    });

    return SelectionManager;

});
