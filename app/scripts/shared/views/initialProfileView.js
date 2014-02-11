define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "shared/utilities/formUtility",
    "shared/data/countriesAndStates",
    "views/userConfirmationView",
    "shared/views/userSettingsView",
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
    UserSettingsView,
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
            "submit form": "_onSubmit",
            "click .accountSettings": "_onAccountSettingsClicked"
        },

        initialize: function(options)
        {

            this.userModel = options.userModel || theMarsApp.user;
            this.analytics = options.analytics || TP.analytics;
            this.timeZones = options.timeZones || theMarsApp.timeZones.get("zonesWithLabels");
            this.calendarManager = options.calendarManager || theMarsApp.calendarManager;

            var birthday = moment(this.userModel.get("birthday"));

            var powerThreshold = this.userModel.getAthleteSettings().get("powerZones.0.threshold") || 200;
            var heartRateThreshold = this.userModel.getAthleteSettings().get("heartRateZones.0.threshold") || 160;
            var speedThreshold = this.userModel.getAthleteSettings().get("speedZones.0.threshold") || 2.68224;
            var swimThreshold = 0.762;

            var swimZones = _.find(this.userModel.getAthleteSettings().get("speedZones"), { workoutTypeId: 1 });
            if(swimZones && swimZones.threshold)
            {
                swimThreshold = swimZones.threshold;
            }

            this.model = new TP.Model(
            {
                language: this.userModel.get("language") || "en-us",
                unitPreference: this.userModel.get("units") || 1,
                country: this.userModel.get("country") || "US",
                timeZone: this.userModel.get("timeZone"),
                birthdayMonth: birthday && (birthday.month() + 1),
                birthdayYear: birthday && birthday.year(),
                swimUnits: 1,
                thresholdPower: powerThreshold,
                thresholdHeartRate: heartRateThreshold,
                runPaceSpeed: speedThreshold,
                runDistance: "10k",
                swimPace: swimThreshold
            });
        },

        formUtilityOptions: function()
        {
            var self = this;
            var formatters =
            {
                swimPace: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue("pace", value, { workoutTypeId: 1 });
                }
            };

            var parsers =
            {
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
            this.$("input[name=weight]").focus();
        },

        serializeData: function()
        {
            var data = TP.ItemView.prototype.serializeData();

            _.extend(data, {
                countries: countriesAndStates.countries,
                timeZones: this.timeZones 
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
            var userPromise = this._saveUserModel();
            var profilePromise = this._saveProfileData();

            var athleteDeferred = new $.Deferred();
            profilePromise.then(function()
            {
                var xhr = self._fetchAthleteSettings();
                xhr.then(athleteDeferred.resolve, athleteDeferred.reject);
            });

            return $.when(profilePromise, userPromise, athleteDeferred.promise()).then(function()
            {
                if(self.$("#interestedIn"))
                {
                    var interestedIn = self.$("#interestedIn").val();
                    self.analytics("send", { "hitType": "event", "eventCategory": "persona", "eventAction": "submitProfile", "eventLabel": interestedIn });
                }

                self.calendarManager.reset();
                self.close();
            });
        },

        _saveUserModel: function()
        {
            return this.userModel.save(
            {
                language: this.model.get("language"),
                units: this.model.get("unitPreference"),
                birthday: moment("1900-01-01").year(this.model.get("birthdayYear") || 0).month(this.model.get("birthdayMonth") - 1 || 0).format("YYYY-MM-DD"),
                timeZone: this.model.get("timeZone"),
                country: this.model.get("country")
            });
        },

        _saveProfileData: function()
        {
            return $.ajax(
                {
                method: "PUT",
                url: apiConfig.apiRoot + "/fitness/v1/athletes/" + this.userModel.getCurrentAthleteId() + "/profile",
                data:
                {
                    weightInKg: this.model.get("weight"),
                    heartRateThreshold: this.model.get("thresholdHeartRate"),
                    powerThreshold: this.model.get("thresholdPower"),
                    swimPace: this.model.get("swimPace"),
                    runPace: this.model.get("runPaceSpeed"),
                    runDistance: this.model.get("runDistance") === "10k" ? 3 : 2
                }
            });
        },

        _fetchAthleteSettings: function()
        {
            return this.userModel.getAthleteSettings().fetch();
        },

        _updateUnits: function(event)
        {
            this.userModel.set("units", this.model.get("unitPreference"));
            this.userModel.set("unitsBySportType.1", this.model.get("swimUnits"));
            FormUtility.applyValuesToForm(this.$el, this.model, this.formUtilityOptions());
            this.$(".weightUnits").text(TP.utils.units.getUnitsLabel("kg"));
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
        },

        _onAccountSettingsClicked: function()
        {
            var userSettingsView = new UserSettingsView.OverlayBox({ model: this.userModel });
            userSettingsView.render();
            this.close();
        },

    });

    return InitialProfileView;

});
