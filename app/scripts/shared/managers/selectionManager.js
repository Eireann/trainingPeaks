define(
[
    "jquery",
    "underscore",
    "backbone",
    "TP",
    "shared/misc/selection",
    "shared/misc/activitySelection",
    "shared/misc/calendarDaySelection",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    $,
    _,
    Backbone,
    TP,
    Selection,
    // Ensure Selection Classes get loaded
    ActivitySelection,
    CalendarDaySelection,
    UserConfirmationView,
    deleteConfirmationTemplate
)
{

    function SelectionManager()
    {
        this.selection = null;
        this.clipboard = null;
        this.stack = [];

        var self = this;

        theMarsApp.getBodyElement().mousedown(function(event)
        {
            var isPrevented = event.isDefaultPrevented();
            var isInModal = $(event.target).closest(".modal, .hoverBox, .modalOverlay").length > 0;
            if(!isPrevented && !isInModal)
            {
                self.clearSelection();
            }
        });

        theMarsApp.getBodyElement().keydown(function(event)
        {

            if(event.isDefaultPrevented())
            {
                return;
            }

            // don't trigger when a masked modal window is present, but allow modal menus
            if(theMarsApp.getBodyElement().find(".modalOverlayMask").length)
            {
                return;
            }

            // don't trigger if the keydown event happens in an input
            var $target = $(event.target);
            if($target.is("input") || $target.is("textarea"))
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
                var dialog = new UserConfirmationView({ template: deleteConfirmationTemplate });
                dialog.render();
                dialog.on("userConfirmed", _.bind(self.execute, self, "delete"));
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

            // If "focus" was left behind, clear it so that "paste" operations will work correctly.
            this._clearFocus();
        },

        execute: function(action, options, selection)
        {
            selection = selection || this.selection;

            var actionFunction = selection && selection[action + "Action"];
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

        _clearFocus: function()
        {
            $(document.activeElement).blur();
        },

        _selectionClassForModel: function(model)
        {
            return model.selectionClass || Selection;
        }

    });

    return SelectionManager;

});
