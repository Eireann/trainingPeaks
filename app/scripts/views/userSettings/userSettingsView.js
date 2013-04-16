define(
[
    "TP",
    "utilities/printUnitsValue",
    "hbs!templates/views/userSettings"
],
function(TP, printUnitsValue, userSettingsTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "userSettings",

        modal: {
            mask: true,
            shadow: true
        },

        template:
        {
            type: "handlebars",
            template: userSettingsTemplate
        },

        events:
        {
            "click button.userSettingsReset": "onResetSettings",
            "click button.userSettingsSaveClose": "onClose"
        },

        bindings:
        {
            "#firstNameSettingField":
            {
                observe: "firstName",
                updateModel: "updateModel"
            },
            "#lastNameSettingField":
            {
                observe: "lastName",
                updateModel: "updateModel"
            },
            "#userNameSettingField":
            {
                observe: "userName",
                updateModel: "updateModel"
            },
            "#athleteTypeSettingField":
            {
                observe: "athletes.0.athleteType",
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "Duathlete", value: 0 }, { label: "Triathlete", value: 1 }];
                    },
                    labelPath: "label",
                    valuePath: "value"
                }
            },
            "#birthdaySettingField":
            {
                observe: "birthday",
                updateModel: "updateModel"
            },
            "#genderSettingField":
            {
                observe: "gender",
                updateModel: "updateModel"
            },
            "#emailSettingField":
            {
                observe: "email",
                updateModel: "updateModel"
            },
            "#addressSettingField":
            {
                observe: "address",
                updateModel: "updateModel"
            },
            "#address2SettingField":
            {
                observe: "address2",
                updateModel: "updateModel"
            },
            "#citySettingField":
            {
                observe: "city",
                updateModel: "updateModel"
            },
            "#stateSettingField":
            {
                observe: "state", 
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "Colorado", value: 0 }, { label: "New York", value: 1 }];
                    },
                    labelPath: "label",
                    valuePath: "value"
                } 
            },
            "#zipCodeSettingField":
            {
                observe: "zipCode",
                updateModel: "updateModel"
            },
            "#countrySettingField":
            {
                observe: "country",
                selectOptions:
                {
                    collection: function()
                    {
                        return [{ label: "USA", value: 0 }, { label: "Italy", value: 1 }];
                    },
                    labelPath: "label",
                    valuePath: "value"
                }
            },
            "#phoneSettingField":
            {
                observe: "phone",
                updateModel: "updateModel"
            },
            "#cellPhoneSettingField":
            {
                observe: "cellPhone",
                updateModel: "updateModel"
            },
            "input[name=unitsSettingField]":
            {
                observe: "units",
                updateModel: "updateModel"
            },
            "input[name=dateFormatSettingField]":
            {
                observe: "dateFormat"
            },
            "input[name=emailPMNotificationSettingField]": "settings.account.enablePrivateMessageNotifications",
            "input[name=newsletterNotificationSettingField]": "settings.account.allowMarketingEmails",
            "input[name=workoutColorizationSettingField]":
            {
                observe: "settings.calendar.workoutColorization",
                onGet: function(value, options)
                {
                    return value;
                },
                onSet: function(value, options)
                {
                    return value;
                }
            },
            "#accountExpiresSettingField": "settings.account.expirationDate"
        },
        
        onBeforeRender: function()
        {
            _.bindAll(this, "onResetSettings", "onClose");
        },
        
        onRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);
                this.stickit();
                this.model.checkpoint();
                this.model.on("change", this.saveSettings, this);
                this.$("#profileImageSettingField").attr("src", "http://www.trainingpeaks.com/" + this.model.get("profilePhotoUrl"));

                this.stickitInitialized = true;
            }
        },

        saveSettings: function()
        {
            this.model.save();
        },

        onClose: function ()
        {
            this.unstickit();
            this.model.off("change", this.saveSettings);
            this.close();
        },

        onResetSettings: function()
        {
            this.model.revert();
        },
        
        updateModel: function(newViewValue, options)
        {
            var self = this;

            var updateModel = function ()
            {
                if (self.checkIfModelUpdateRequired(newViewValue, options))
                    self.performModelUpdate(newViewValue, options);
            };

            if (this.updateModelTimeout)
                clearTimeout(this.updateModelTimeout);

            // TODO: This required a hack at line ~100 of the Backbone.StickIt library in order to work
            // properly. There does not seem to be any other way to catch which type of event triggered
            // this update request.
            if (options.eventType === "blur")
                updateModel();
            else
                this.updateModelTimeout = setTimeout(updateModel, 2000);

            return false;
        },

        checkIfModelUpdateRequired: function (newViewValue, options)
        {
            var currentModelValue = this.model.get(options.observe);
            var currentViewValue = currentModelValue;

            // DO coerce type in this situation, since we only care about truthy/falsy'ness.
            /*jslint eqeq: true*/
            var doUpdateModel = (currentViewValue == newViewValue) ? false : true;
            /*jsline eqeq: false*/

            return doUpdateModel;
        },

        performModelUpdate: function (newViewValue, options)
        {
            // Do the save!
            var newModelValue = newViewValue;
            this.model.set(options.observe, newModelValue);
            this.model.save();
        }
    });
});