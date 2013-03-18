define(
[
    "TP",
    "models/commands/ShiftWorkouts",
    "hbs!templates/views/shiftWizzard"
],
function (TP, ShiftWorkoutsCommand, shiftWizzard)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",

        events:
        {
            "click button#cancel": "close",
            "click button#ok": "onOkClicked"
        },

        template:
        {
            type: "handlebars",
            template: shiftWizzard
        },

        initialize: function(options)
        {
            this.selectionStartDate = options.selectionStartDate;
            this.selectionEndDate = options.selectionEndDate;
        },

        onRender: function ()
        {
            if (this.selectionStartDate)
            {
                this.$("#selectItemsOnSelectedDays").attr("checked", "checked");
            }
            $('body').append(this.$el);
            this.$el.dialog({
                modal: true
            });
        },

        onOkClicked: function()
        {

            // show throbber
            this.onWaitStart();

            // seutp shift command
            var shiftCommand = new ShiftWorkoutsCommand();
            shiftCommand.set("startDate", this.selectionStartDate);
            shiftCommand.set("endDate", this.selectionEndDate);
            shiftCommand.set("days", this.$("#SelectNewStartDate").val());

            // execute = send it to server
            var deferred = shiftCommand.execute();

            // close this view when remote command finishes
            var self = this;
            deferred.always(function() { self.close(); });

            // pass the deferred on through an event so CalendarContainerView can act on it
            this.trigger("shifted", deferred);
        }
    });
});