define(
[
    "jquery",
    "underscore",
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteLapTemplate"
],
function(
    $,
    _,
    TP,
    UserConfirmationView,
    deleteLapTemplate
)
{

    var EditableLapView = TP.ItemView.extend(
    {

        className: "lap clickable",

        modelEvents:
        {
            "state:change:isFocused": "_onFocusedChange",
            "state:change:isDeleted": "_onDeletedChange"
        },

        events:
        {
            "click .delete": "_onClickDelete",
            "click": "_onClick",
            "blur input.lapName": "_stopEditing",
            "enter input.lapName": "_stopEditing",
            "cancel input.lapName": "_cancelEditing"
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.featureAuthorizer = options.featureAuthorizer ? options.featureAuthorizer : theMarsApp.featureAuthorizer;
        },

        onRender: function()
        {
            this._onFocusedChange();
            this._onDeletedChange();            
        },

        _onFocusedChange: function()
        {
            var focused = !!this.model.getState().get("isFocused");
            this.$el.toggleClass("highlight", focused);

            if(!focused && this.model.getState().get("isLap"))
            {
                this._stopEditing();
            }
        },

        _onDeletedChange: function()
        {
            if(this.model.getState().get("isDeleted"))
            {
                this.$el.addClass('deleted');
                this.undelegateEvents();
                this.$('input').attr('disabled', true);
            }
        },

        _onClick: function(e)
        {
            if(e.isDefaultPrevented() || $(e.target).is("input"))
            {
                return;
            }

            var self = this;

            // first clicks sets model as focused, second click begins editing
            if(self.model.getState().get("isFocused"))
            {
                this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    this.featureAuthorizer.features.EditLapNames,
                    function()
                    {
                        if(self.model.getState().get("isLap") && !self.model.getState().get("isEditing"))
                        {
                            self._startEditing();
                        }
                        else if(self.model.getState().get("isLap") && !$(e.target).is("input.lapName"))
                        {
                            self._stopEditing(e);
                        }
                    }
                );
            }
            else
            {
                this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    this.featureAuthorizer.features.ViewGraphRanges,
                    function()
                    {
                        self.stateModel.set("primaryRange", self.model);
                    }
                );
            }
        },

        _startEditing: function()
        {
            this.model.getState().set("isEditing", true);
            this.$el.addClass("editing");
            this.$("input.lapName").focus().select();
        },

        _cancelEditing: function(e)
        {
            e.preventDefault();
            this._stopEditing(e, true);
        },

        _stopEditing: function(e, cancel)
        {
            // check whether we are in edit state, not just if the isEditing flag, as the lapView could also be editin
            if(this.$el.is(".editing"))
            {
                this.model.getState().set("isEditing", false);
                if(!cancel)
                {
                    this.model.set("name", this.$("input.lapName").val());
                }
                this.$el.removeClass("editing");
            }
        },

        _onClickDelete: function(e)
        {
            e.preventDefault();
            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.ViewGraphRanges,
                _.bind(this._confirmDelete, this)
            );
        },

        _confirmDelete: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteLapTemplate });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", _.bind(this._deleteLap, this));
        },

        _deleteLap: function()
        {
            if(this.model.getState().get("isFocused"))
            {
                this.stateModel.set("primaryRange", null);
            }
            this.model.getState().set({ isDeleted: true });
            this.stateModel.removeRange(this.model);
        }

    });

    return EditableLapView;

});
