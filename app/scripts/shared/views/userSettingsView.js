define(
[
    "jquery",
    "underscore",
    "TP",
    "backbone",
    "shared/models/userDataSource",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/views/userSettings/userSettingsAccountView",
    "shared/views/userSettings/userSettingsZonesView",
    "shared/views/userSettings/userSettingsEquipmentView",
    "views/userConfirmationView",
    "hbs!templates/views/errors/passwordValidationErrorView",
    "hbs!templates/views/errors/emailValidationErrorView",
    "hbs!templates/views/confirmationViews/discardConfirmationView",
    "hbs!shared/templates/userSettings/userSettingsFooterTemplate"
],
function(
    $,
    _,
    TP,
    Backbone,
    UserDataSource,
    TabbedLayout,
    OverlayBoxView,
    UserSettingsAccountView,
    UserSettingsZonesView,
    UserSettingsEquipmentView,
    UserConfirmationView,
    passwordValidationErrorTemplate,
    emailValidationErrorTemplate,
    discardConfirmationTemplate,
    userSettingsFooterTemplate
)
{

    var UserSettingsFooterView = TP.ItemView.extend({

        className: "userSettingsButtons",
        
        template:
        {
            type: "handlebars",
            template: userSettingsFooterTemplate
        },

        events:
        {
            "click button": "triggerButton"
        },

        triggerButton: function(e)
        {
            var actionName = $(e.currentTarget).attr("class");
            this.trigger(actionName);
        }
    });

    var UserSettingsContentView = TabbedLayout.extend({

        modelEvents: {},

        initialize: function()
        {
            this.changed = false;
            this._copiesOfModels = [];
            this._copiesOfCollections = [];
            this._initializeNavigation();
            this._initializeFooter();
            this.on("before:switchView", this._applyFormValuesToModels, this);
        },

        onRender: function()
        {
            this.$el.on("change.userSettingsView", "input, select", _.bind(this._setChanged, this));
        },

        _initializeNavigation: function()
        {
            var models = {
                athleteSettings: this._copyModel(this.model.getAthleteSettings())
            };

            this.navigation =
            [
                {
                    title: "Account",
                    view: UserSettingsAccountView,
                    options:
                    {
                        userModel: this._copyModel(this.model, { changesToApplyImmediately: ["profilePhotoUrl"] }),
                        accountSettingsModel: this._copyModel(this.model.getAccountSettings()),
                        athleteSettingsModel: models.athleteSettings,
                        passwordSettingsModel: this.model.getPasswordSettings()
                    }
                },
                {
                    title: "Zones",
                    view: UserSettingsZonesView,
                    options:
                    {
                        model: models.athleteSettings
                    }
                },
                {
                    title: "Equipment",
                    view: UserSettingsEquipmentView,
                    options:
                    {
                        collection: this._copyCollection(this.model.getAthleteSettings().getEquipment())
                    }
                }
            ];
        },

        _copyModel: function(originalModel, options)
        {
            var copiedModel = new TP.Model(TP.utils.deepClone(originalModel.attributes));
            copiedModel.originalModel = originalModel;
            this._copiesOfModels.push(copiedModel);

            if(options && options.changesToApplyImmediately)
            {
                _.each(options.changesToApplyImmediately, function(attributeName)
                {
                    originalModel.listenTo(copiedModel, "change:" + attributeName, function()
                    {
                        originalModel.set(attributeName, copiedModel.get(attributeName));
                    });
                });
            }

            return copiedModel;
        },

        _copyCollection: function(originalCollection)
        {
            var copiedCollection = new originalCollection.constructor(null, { model: originalCollection.model, userModel: this.model });
            copiedCollection.originalCollection = originalCollection;
            this._copiesOfCollections.push(copiedCollection);

            originalCollection.each(function(model) {
                var copiedModel = new originalCollection.model(TP.utils.deepClone(model.attributes));
                copiedModel.originalModel = model;

                copiedCollection.push(copiedModel);
            });

            return copiedCollection;
        },

        _applyCopiedCollectionToRealCollection: function()
        {
            _.each(this._copiesOfCollections, function(collection)
            {
                collection.originalCollection.set(collection.toJSON());
            });
        },

        _applyCopiedModelsToRealModels: function()
        {
            _.each(this._copiesOfModels, function(copiedModel)
            {
                copiedModel.originalModel.set(TP.utils.deepClone(copiedModel.attributes));
            });
        },

        _initializeFooter: function()
        {
            this.footerView = new UserSettingsFooterView();
            this.on("render", this._showFooter, this);
            this.listenTo(this.footerView, "cancel", _.bind(this._cancel, this));
            this.listenTo(this.footerView, "save", _.bind(this._save, this));
            this.listenTo(this.footerView, "saveAndClose", _.bind(this._saveAndClose, this));
        },

        _showFooter: function()
        {
            this.footerRegion.show(this.footerView);
        },

        _applyFormValuesToModels: function()
        {
            if(this.currentView && _.isFunction(this.currentView.applyFormValuesToModels))
            {
                this.currentView.applyFormValuesToModels();
            }
        },

        _save: function()
        {
            this._applyFormValuesToModels();
            this._applyCopiedModelsToRealModels();
            this._applyCopiedCollectionToRealCollection();

            if(this._validateForSave())
            {
                this.$el.addClass("waiting");
                var self = this;
                return $.when(
                    this._saveUser(),
                    this._saveZones(),
                    this._saveEquipment()
                ).done(
                    function()
                    {
                        self.$el.removeClass("waiting");
                    }
                );
            }
            else
            {
                return new $.Deferred().reject();
            }
        },

        _saveAndClose: function()
        {
            var self = this;
            this._save().done(
                function()
                {
                    self.close();
                }
            );
        },

        _saveUser: function()
        {
            this._copyUserAttributesToAthlete();    
            return UserDataSource.saveUserSettingsAndPassword({
                models: [this.model, this.model.getAthleteSettings(), this.model.getAccountSettings()],
                password: this.model.getPasswordSettings().get("password")
            });
        },

        _copyUserAttributesToAthlete: function()
        {
            if(this.model.getCurrentAthleteId() === this.model.get("userId"))
            {
                var athleteSettings = this.model.getAthleteSettings();
                _.each(this.model.attributes, function(value, key)
                {
                    if(_.has(athleteSettings.attributes, key))
                    {
                        athleteSettings.set(key, value);
                    }
                });
            }
        },

        _saveZones: function()
        {
            return UserDataSource.saveZones(this.model.getAthleteSettings());
        },

        _saveEquipment: function()
        {
            this.model.getAthleteSettings().getEquipment().save();
        },

        _setChanged: function()
        {
            this.changed = true;
        },

        _cancel: function()
        {
            if(this.changed)
            {
                this.discardConfirmation = new UserConfirmationView({ template: discardConfirmationTemplate });
                this.discardConfirmation.render();
                this.discardConfirmation.on("userConfirmed", this.close, this);
            }
            else
            {
                this.close(); 
            }
        },

        _validateForSave: function()
        {
            if(!this._isPasswordValid())
            {
                new UserConfirmationView({ template: passwordValidationErrorTemplate }).render();
                return false;
            }

            if(!this._isEmailValid())
            {
                new UserConfirmationView({ template: emailValidationErrorTemplate }).render();
                return false;
            }

            return true;
        },

        _isPasswordValid: function()
        {
            var password = this.model.getPasswordSettings().get("password");
            var retypePassword = this.model.getPasswordSettings().get("retypePassword"); 
            if((password || retypePassword) && (password !== retypePassword))
            {
                return false;
            }
            return true;
        },

        _isEmailValid: function()
        {
            var email = this.model.get("email");
            var validEmail = new RegExp(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i);

            if(!validEmail.test(email))
            {
                return false;
            }

            return true;
        },



    });

    OverlayBoxView.wrap(UserSettingsContentView, { className: "userSettings" });

    return UserSettingsContentView;
});
