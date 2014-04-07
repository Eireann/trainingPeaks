define(
[
    "setImmediate",
    "underscore",
    "moment",
    "backbone",
    "TP",
    "views/userConfirmationView",
    "shared/utilities/calendarUtility",
    "hbs!quickview/templates/qvShellTemplate",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/confirmationViews/discardConfirmationView",
    "hbs!quickview/metric/templates/failedToSaveTemplate"
],
function(
    setImmediate,
    _,
    moment,
    Backbone,
    TP,
    UserConfirmationView,
    CalendarUtility,
    qvShellTemplate,
    deleteConfirmationTemplate,
    discardConfirmationTemplate,
    failedToSaveTemplate
)
{

    var QVShellView = TP.ItemView.extend({

        constructor: function(options)
        {
            this.originalModel = options.model;
            options.model = options.model.clone();
            TP.ItemView.apply(this, arguments);
            this.on("render", this._onRenderShell, this);
            this.children = new Backbone.ChildViewContainer();
        },

        template:
        {
            template: qvShellTemplate,
            type: "handlebars"
        },

        ui:
        {
            qvBody: ".QVBody",
            qvBar: ".QVBar"
        },

        modal:
        {
            mask: true,
            shadow: true
        },

        modelEvents: {},

        events:
        {
            "click .closeIcon": "close",
            "click .date": "_onDateClicked",
            "click .okButton": "saveAndClose",
            "click .discardButton": "_onDiscardClicked",
            "click .deleteButton": "_onDestroyClicked",
            "change .timeInput": "_onTimeChanged"
        },

        closeOnResize: false,

        className: "qvShell",

        showThrobbers: false,

        close: function()
        {
            if(this.closing)
            {
                QVShellView.__super__.close.apply(this, arguments);
            }
            else
            {
                this.saveAndClose();
            }
        },

        saveAndClose: function()
        {
            if(this.model.isEmpty())
            {
                this.destroyAndClose();
                return;
            }

            var self = this;
            var promise = this.originalModel.save(this.model.attributes, { wait: true });
            promise.then(function()
            {
                if(self.model.isNew())
                {
                    // TODO: Remove coupling
                    theMarsApp.calendarManager.addItem(self.originalModel);
                }

                self.closing = true;
                self.close();
            }, function()
            {
                var dialog = new UserConfirmationView({ template: failedToSaveTemplate });
                dialog.render();
            });
        },

        _onDestroyClicked: function()
        {
            var dialog = new UserConfirmationView({ template: deleteConfirmationTemplate });
            dialog.render();
            this.listenTo(dialog, "userConfirmed", _.bind(this.destroyAndClose, this));
        },

        destroyAndClose: function()
        {
            if(!this.originalModel.isNew())
            {
                this.originalModel.destroy();
            }
            this.closing = true;
            this.close();
        },

        _onDiscardClicked: function()
        {
            var dialog = new UserConfirmationView({ template: discardConfirmationTemplate });
            dialog.render();
            this.listenTo(dialog, "userConfirmed", _.bind(this.revertAndClose, this));
        },

        revertAndClose: function()
        {
            this.closing = true;
            this.close();
        },

        serializeData: function()
        {
            var data = QVShellView.__super__.serializeData.apply(this, arguments);

            data.activityDate = this.model.getCalendarDay();
            data.activityTime = this.model.getTimestamp();

            return data;
        },

        _onRenderShell: function()
        {
            this.$(".timeInput").timepicker({ appendTo: this.$el, timeFormat: "g:i a", step: 15 });
            this._updateDate();

            this.children.add(new this.bodyView({ model: this.model, el: this.ui.qvBody }));
            this.children.add(new this.barView({ model: this.model, el: this.ui.qvBar }));

            this.children.call("render");
        },

        _updateDate: function()
        {
            var date = moment(this.model.getCalendarDay());
            this.$(".calendarDate").text(TP.utils.datetime.format(date, "MMMM D, YYYY"));
            this.$(".dayName").text(TP.utils.datetime.format(date, "dddd"));
        },

        onClose: function()
        {
            this.children.call("close");
        },

        _onDateClicked: function()
        {

            var offset = this.$(".date").offset();
            var position = [offset.left, offset.top + this.$(".date").height()];

            var settings = {
                dateFormat: "yy-mm-dd",
                firstDay: CalendarUtility.startOfWeek
            };

            var widget = this.$(".date").datepicker(
                "dialog",
                this.model.getCalendarDay(),
                _.bind(this._onDateChanged, this),
                settings,
                position
            ).datepicker("widget");

            // hide then show, or else it flashes for some reason
            widget.hide();

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1));
            widget.css("opacity", 1);

            // animate instead of just show directly, or else it flashes for some reason
            widget.show(100);
        },

        _onDateChanged: function(date)
        {
            this.$(".date").datepicker("hide");
            this.model.setCalendarDay(date);
            this._updateDate();
        },

        _onTimeChanged: function()
        {
            this.model.setTimestamp(this.$(".timeInput").val());
        }

    });

    return QVShellView;
});
