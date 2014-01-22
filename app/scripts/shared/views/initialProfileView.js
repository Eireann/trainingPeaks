define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "shared/utilities/formUtility",
    "shared/data/countriesAndStates",
    "views/userConfirmationView",
    "hbs!shared/templates/initialProfileTemplate"
],
function(
    $,
    _,
    moment,
    TP,
    FormUtility,
    countriesAndStates,
    UserConfirmationView,
    initialProfileTemplate
)
{
    // HR: 137 - 195
    // Swim Pace: Max: 25:21 / 100m / 1km

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
            var birthday = moment(theMarsApp.user.get("birthday"));

            var powerThreshold = theMarsApp.user.getAthleteSettings().get("powerZones.0.threshold") || 200;
            var heartRateThreshold = theMarsApp.user.getAthleteSettings().get("heartRateZones.0.threshold") || 160;
            var speedThreshold = theMarsApp.user.getAthleteSettings().get("speedZones.0.threshold") || 2.68224;
            var swimThreshold = 0.762;

            var swimZones = _.find(theMarsApp.user.getAthleteSettings().get("speedZones"), { workoutTypeId: 1 });
            if(swimZones && swimZones.threshold)
            {
                swimThreshold = swimZones.threshold;
            }

            this.model = new TP.Model(
            {
                language: theMarsApp.user.get("language") || "en-us",
                unitPreference: theMarsApp.user.get("units") || 1,
                country: theMarsApp.user.get("country") || "US",
                timeZone: theMarsApp.user.get("timeZone"),
                birthdayMonth: birthday && (birthday.month() + 1),
                birthdayYear: birthday && birthday.year(),
                runUnits: "pace",
                swimUnits: 1,
                thresholdPower: powerThreshold,
                thresholdHeartRate: heartRateThreshold,
                runPaceSpeed: speedThreshold,
                swimPace: swimThreshold
            });
        },

        formUtilityOptions: function()
        {
            var self = this;
            var formatters =
            {
                runPace: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue(self.model.get("runUnits"), value, { workoutTyoeId: 3 });
                },
                swimPace: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue("pace", value, { workoutTypeId: 1 });
                }
            };

            var parsers =
            {
                runPace: function(value)
                {
                    return TP.utils.conversion.parseUnitsValue(self.model.get("runUnits"), value, { workoutTypeId: 3 });
                },
                swimPace: function(value)
                {
                    return TP.utils.conversion.parseUnitsValue("pace", value, { workoutTypeId: 1 });
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

            if(this._validate())
            {
                this.$("input[type=submit]").attr("disabled", true);

                this._saveAndClose().fail(function()
                {
                    self._showError("Failed to save profile");
                    self.$("input[type=submit]").attr("disabled", false);
                });
            }
        },

        _saveAndClose: function()
        {
            this.waitingOn();
            var self = this;
            var userPromise = theMarsApp.user.save(
            {
                language: this.model.get("language"),
                units: this.model.get("unitPreference"),
                birthday: moment("1900-01-01").year(this.model.get("birthdayYear") || 0).month(this.model.get("birthdayMonth") - 1 || 0).format("YYYY-MM-DD"),
                timeZone: this.model.get("timeZone"),
                country: this.model.get("country")
            });

            var profilePromise = $.ajax(
            {
                method: "PUT",
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

            var athleteDeferred = new $.Deferred();
            profilePromise.then(function()
            {
                var xhr = theMarsApp.user.getAthleteSettings().fetch();
                xhr.then(athleteDeferred.resolve, athleteDeferred.reject);
            });

            return $.when(profilePromise, userPromise, athleteDeferred.promise()).then(function()
            {
                if(self.$("#interestedIn"))
                {
                    var interestedIn = self.$("#interestedIn").val();
                    TP.analytics("send", { "hitType": "event", "eventCategory": "persona", "eventAction": "submitProfile", "eventLabel": interestedIn });
                }

                theMarsApp.calendarManager.reset();
                self.close();
            });
        },

        _updateUnits: function(event)
        {
            theMarsApp.user.set("units", this.model.get("unitPreference"));
            theMarsApp.user.set("unitsBySportType.1", this.model.get("swimUnits"));
            FormUtility.applyValuesToForm(this.$el, this.model, this.formUtilityOptions());
            this.$(".weightUnits").text(TP.utils.units.getUnitsLabel("kg"));
            this.$("label[for=runUnitsPace]").text(TP.utils.units.getUnitsLabel("pace", 3));
            this.$("label[for=runUnitsSpeed]").text(TP.utils.units.getUnitsLabel("speed", 3));
        },

        _validate: function()
        {
            var errors = FormUtility.validate(this.$el, _.defaults(this.formUtilityOptions) );

            if(errors.length === 0)
            {
                return true;
            }
            else
            {
                this._showError("Errors:\n" + errors.join("\n"));
                return false;
            }
        },

        _showError: function(message)
        {
            var view = new UserConfirmationView({ message: message });
            view.render();
        }

    });

    return InitialProfileView;

});
