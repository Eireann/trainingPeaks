define(
[
    "TP",
    "jqueryui/dialog",
    "utilities/printUnitsValue",
    "hbs!templates/views/userSettings"
],
function (TP, jqueryuiDialog, printUnitsValue, userSettingsTemplate)
{
    return TP.ItemView.extend(
    {
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
                eventsOverride: ["blur"]
            },
            "#lastNameSettingField":
            {
                observe: "lastName",
                eventsOverride: [ "blur" ]
            },
            "#userNameSettingField":
            {
                observe: "userName",
                eventsOverride: [ "blur" ]
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
                eventsOverride: [ "blur" ]
            },
            "#genderSettingField":
            {
                observe: "gender",
                eventsOverride: [ "blur" ]
            },
            "#emailSettingField":
            {
                observe: "email",
                eventsOverride: [ "blur" ]
            },
            "#addressSettingField":
            {
                observe: "address",
                eventsOverride: ["blur"]
            },
            "#address2SettingField":
            {
                observe: "address2",
                eventsOverride: [ "blur" ]
            },
            "#citySettingField":
            {
                observe: "city",
                eventsOverride: [ "blur" ]
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
                eventsOverride: [ "blur" ]
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
                eventsOverride: [ "blur" ]
            },
            "#cellPhoneSettingField":
            {
                observe: "cellPhone",
                eventsOverride: [ "blur" ]
            },
            "input[name=unitsSettingField]":
            {
                observe: "units"
            },
            "input[name=dateFormatSettingField]":
            {
                observe: "dateFormat"
            },
            "input[name=emailPMNotificationSettingField]": "enablePrivateMessageNotifications",
            "input[name=postActivityNotificationSettingField]": "enablePrivateMessageNotifications",
            "input[name=newsletterNotificationSettingField]": "allowMarketingEmails",
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
            "#accountExpiresSettingField": "expirationDate"
        },
        
        onBeforeRender: function()
        {
            _.bindAll(this, "onResetSettings", "onClose");
            this.$el.dialog(
            {
                autoOpen: false,
                height: 700,
                width: 600,
                modal: true,
                resizable: false,
                overlay: { opacity: 0.5 }
            });
        },
        
        onRender: function()
        {
            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);
                this.stickit();
                this.model.checkpoint();
                this.model.on("change", this.saveSettings, this);
                this.$el.dialog("open");
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
            this.unstickModel();
            this.model.off("change", this.saveSettings);
            this.close();
        },

        onResetSettings: function()
        {
            this.model.revert();
        }
    });
});