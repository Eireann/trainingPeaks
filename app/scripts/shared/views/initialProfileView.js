define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "shared/utilities/formUtility",
    "shared/data/countriesAndStates",
    "hbs!shared/templates/initialProfileTemplate"
],
function(
    $,
    _,
    moment,
    TP,
    FormUtility,
    countriesAndStates,
    initialProfileTemplate
)
{

    var InitialProfileView = TP.ItemView.extend(
    {
        modelEvents:
        {
            "change:unitPreference change:swimUnits change:runUnits": "_updateUnits",
        },

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
            this.model = new TP.Model({
                language: theMarsApp.user.get("language") || "en-us",
                unitPreference: theMarsApp.user.get("units") || 1,
                country: theMarsApp.user.get("country") || "US",
                swimUnits: "metric",
                runUnits: "pace"
            });
        },

        formUtilityOptions: function()
        {
            var self = this;
            var formatters =
            {
                runPace: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue(self.model.get("runUnits"), value);
                },
                swimPace: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue("pace", value, { units: self.model.get("swimUnits") });
                }
            };

            var parsers =
            {
                runPace: function(value)
                {
                    return TP.utils.conversion.parseUnitsValue(self.model.get("runUnits"), value);
                },
                swimPace: function(value)
                {
                    return TP.utils.conversion.parseUnitsValue("pace", value, { units: self.model.get("swimUnits") });
                }
            };

            // Bind Form to "Model"
            return {
                filterSelector: ":not([type=submit])",
                formatters: formatters,
                parsers: parsers
            };
        },

        onRender: function()
        {
            // Bind Form to "Model"
            FormUtility.bindFormToModel(this.$el, this.model, this.formUtilityOptions());
            this._updateUnits();

            this.$("select").selectBoxIt();
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

            var userPromise = theMarsApp.user.save(
            {
                language: this.model.get("language"),
                units: this.model.get("unitPreference"),
                birthday: moment("1900-01-01").year(this.model.get("birthdayYear") || 0).month(this.model.get("birthdayMonth") || 0).format("YYYY-MM-DD"),
                timeZone: this.model.get("timeZone"),
                country: this.model.get("country")
            });

            var profilePromise = $.ajax(
            {
                method: "POST",
                url: apiConfig.apiRoot + "/fitness/v1/athletes/" + theMarsApp.user.getCurrentAthleteId() + "/profile",
                data:
                {
                    weightInKg: this.model.get("weight"),
                    heartRateThreshold: this.model.get("thresholdHeartRate"),
                    powerThreshold: this.model.get("thresholdPower"),
                    swimPace: this.model.get("swimPace"),
                    runPace: this.model.get("runPaceSpeed")
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
        },

        _updateUnits: function(event)
        {
            theMarsApp.user.set("units", this.model.get("unitPreference"));
            FormUtility.applyValuesToForm(this.$el, this.model, this.formUtilityOptions());
            this.$(".weightUnits").text(TP.utils.units.getUnitsLabel("kg"));
            this.$("label[for=runUnitsPace]").text(TP.utils.units.getUnitsLabel("pace", 3));
            this.$("label[for=runUnitsSpeed]").text(TP.utils.units.getUnitsLabel("speed", 3));
        }

    });

    return InitialProfileView;

});
