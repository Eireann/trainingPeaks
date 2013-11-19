define(
[
    "jquery",
    "underscore",
    "TP",
    "shared/utilities/formUtility",
    "shared/data/countriesAndStates",
    "hbs!shared/templates/initialProfileTemplate"
],
function(
    $,
    _,
    TP,
    FormUtility,
    countriesAndStates,
    initialProfileTemplate
)
{

    var InitialProfileView = TP.ItemView.extend(
    {

        modal:
        {
            mask: true,
            shadow: true,
            onOverlayClick: function(){}
        },
        closeOnResize: false,
        className: "",

        template:
        {
            type: "handlebars",
            template: initialProfileTemplate
        },

        events:
        {
            "submit form": "_onSubmit"
        },

        initialize: function()
        {
            this.model = new TP.Model();
        },

        onRender: function()
        {
            this.$("select").selectBoxIt();

            // Bind Form to "Model"
            FormUtility.bindFormToModel(this.$el, this.model, {});
        },

        serializeData: function()
        {
            var data = TP.ItemView.prototype.serializeData();

            _.extend(data, {
                countries: countriesAndStates.countries,
                timeZones: theMarsApp.timeZones.get("zonesWithLabels")
            });

            return data;
        },

        _onSubmit: function(event)
        {
            var self = this;

            event.preventDefault();

            var userPromise = this.model.save(
            {
            });

            var profilePromise = $.ajax(
            {
                method: "POST",
                url: apiConfig.apiRoot + "/fitness/v1/athletes/" + this.model.getCurrentAthleteId() + "/profile",
                data:
                {
                    weightInKg: TP.utils.conversion.parseUnitsValue("kg", this.$("#weight").val()),
                    heartRateThreshold: TP.utils.conversion.parseUnitsValue("heartrate", this.$("#thresholdHeartRate").val()),
                    powerThreshold: TP.utils.conversion.parseUnitsValue("power", this.$("#thresholdPower").val()),
                    swimPace: TP.utils.conversion.parseUnitsValue("pace", this.$("#swimPace").val()),
                    runPace: TP.utils.conversion.parseUnitsValue("pace", this.$("#runPaceSpeed").val())
                }
            });

            $.when(profilePromise, userPromise).then(function()
            {
                theMarsApp.calendarManager.reset();
                self.close();
            },
            function()
            {
                alert("Failed to save");
            });
        }

    });

    return InitialProfileView;

});
