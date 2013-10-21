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

        setMultiSelection: function(models, event, klass)
        {

            klass = klass || SelectionCollection;

            this.clearSelection();
            this.selection = new klass(models);
            this.selection.activate();

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
