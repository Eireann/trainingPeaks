define(
[
    "underscore",
    "TP",
    "shared/misc/selection",
    "shared/misc/activitySelection",
    "shared/misc/calendarDaySelection"
],
function(
    _,
    TP,
    Selection,
    // Ensure Selection Classes get loaded
    ActivitySelection,
    CalendarDaySelection
)
{

    function SelectionManager()
    {
        this.selection = null;
        this.clipboard = null;
        this.stack = [];

        var self = this;

        $("body").mousedown(function(event)
        {
            var isPrevented = event.isDefaultPrevented();
            var isInModal = $(event.target).closest(".modal, .hoverBox, .modalOverlay").length > 0;
            if(!isPrevented && !isInModal)
            {
                self.clearSelection();
            }
        });

        $("body").keydown(function(event)
        {

            if(event.isDefaultPrevented())
            {
                return;
            }

            if(event.ctrlKey || event.metaKey)
            {
                switch(event.which)
                {
                    case "C".charCodeAt():
                        self.copySelectionToClipboard();
                        break;
                    case "X".charCodeAt():
                        self.cutSelectionToClipboard();
                        break;
                    case "V".charCodeAt():
                        self.pasteClipboardToSelection();
                        break;
                }

            }
            else if(event.which === 46) // Delete
            {
                self.execute("delete");
            }

        });
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

        execute: function(action, options, selection)
        {
            selection = selection || this.selection;

            actionFunction = selection && selection[action + "Action"];
            if(_.isFunction(actionFunction))
            {
                return actionFunction.call(selection, options);
            }
            else
            {
                return false;
            }
        },

        copySelectionToClipboard: function()
        {
            this.clipboard = this.execute("copy");
        },

        cutSelectionToClipboard: function()
        {
            this.clipboard = this.execute("cut");
        },

        pasteClipboardToSelection: function()
        {
            this.execute("paste", { target: this.selection }, this.clipboard);
        },

        clearClipboard: function()
        {
            this.clipboard = null;
        },

        _selectionClassForModel: function(model)
        {
            return model.selectionClass || Selection;
        }

    });

    return SelectionManager;

});
