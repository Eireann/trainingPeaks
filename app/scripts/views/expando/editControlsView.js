define(
[
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/expando/unableToSaveEditsTemplate",
    "hbs!templates/views/expando/editControlsTemplate"
],
function(
    TP,
    UserConfirmationView,
    unableToSaveEditsTemplate,
    editControlsTemplate
    )
{
    return TP.ItemView.extend({

        className: "expandoEditControls",

        events:
        {
            "click .apply": "_applyEdits",
            "click .cancel": "_cancelEdits"
        },

        template:
        {
            type: "handlebars",
            template: editControlsTemplate
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.listenTo(this.model.get("detailData"), "change", _.bind(this.render, this));
        },

        onRender: function()
        {
            if(this.model.get("detailData").hasEdits())
            {
                this.$el.removeClass("disabled");
            }
            else
            {
                this.$el.addClass("disabled");
            }
        },

        _cancelEdits: function()
        {
            this.model.get("detailData").undoEdits();
        },

        _applyEdits: function()
        {
            this.waitingOn();
            this.model.get("detailData").once("sync", _.bind(this.waitingOff, this));

            this.model.get("detailData").saveEdits()
                .fail(_.bind(this._handleApplyFail, this));
        },

        _handleApplyFail: function()
        {
            var confirmationView = new UserConfirmationView(
            {
                template: unableToSaveEditsTemplate
            });               

            confirmationView.render();
            this.model.get("detailData").undoEdits();
            this.waitingOff();
        }
    });
});
