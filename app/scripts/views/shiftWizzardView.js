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
            "click button#ok": "doFakeOk"
        },

        template:
        {
            type: "handlebars",
            template: shiftWizzard
        },

        onRender: function ()
        {
            $('body').append(this.$el);
            this.$el.dialog({
                modal: true,
                width: 400,
            });
        },

        doFakeOk: function()
        {

            // show throbber
            this.onWaitStart();

            // seutp shift command
            var shiftCommand = new ShiftWorkoutsCommand();
            shiftCommand.set("startDate", moment(prompt("Start Date YYYY-MM-DD")).format("YYYY-MM-DD"));
            shiftCommand.set("endDate", moment(prompt("End Date YYYY-MM-DD")).format("YYYY-MM-DD"));
            shiftCommand.set("days", prompt("How many days?", 2));

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