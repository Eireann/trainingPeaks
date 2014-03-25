define(
[
    "webfonts",
    "underscore",
    "jquery",
    "jqueryui/position",
    "backbone.marionette.handlebars",
    "TP",
    "shared/models/userModel",
    "models/library/trainingPlan",
    "views/calendar/library/trainingPlanApplyView",
    "hbs!../templates/applyTrainingPlan"
],
function(
         webfonts,
         _,
         $,
         Position,
         bmhbs,
         TP,
         UserModel, 
         TrainingPlanModel,
         TrainingPlanApplyView,
         applyTrainingPlanTemplate
         )
{

    var ApplyTrainingPlan = TP.ItemView.extend({

        className: "applyTrainingPlanContainer",

        template:
        {
            type: "handlebars",
            template: applyTrainingPlanTemplate
        },

        initialize: function(options)
        {
            this.loaded = false;
            this.model = new TrainingPlanModel({ planId: options.trainingPlanId });
            this.user = new UserModel();
            this._setupApiConfig();
            this._setupMarsApp();
            this._loadExternalStylesheets();
            this._loadExternalScripts();
            webfonts.loadFonts();
        },

        load: function()
        {
            $.ajaxSetup(
            {
                xhrFields:
                {
                    withCredentials: true
                }
            });

            var promise = new $.Deferred();
            var self = this;

            // do not allow to fetch the user from localstorage
            self.user.fetch({ nocache: true }).done(function()
            {
                var athletes = self.user.get("athletes");
                var athleteId = athletes && athletes.length ? athletes[0].athleteId : self.user.get("userId");
                self.user.setCurrentAthlete(new TP.Model({ athleteId: athleteId }));
                self.model.details.fetch().done(function()
                {
                    self.loaded = true;
                    self.render();
                    promise.resolve();
                });
            });
            
            return promise;
        },

        onRender: function()
        {
            if(!this.loaded)
            {
                this.$(".yourPlanHasBeenApplied").hide();
                this.$(".applyYourTrainingPlan").hide();
            }
            else if(this._planHasBeenApplied())
            {
                this.$(".applyYourTrainingPlan").hide();
                this.$(".loginToTrainingPeaks").hide();
                if(_.isFunction(this.options.onSuccess))
                {
                    this.options.onSuccess();
                }
            }
            else
            {
                this.$(".yourPlanHasBeenApplied").hide();
                this.planApplyView = new TrainingPlanApplyView({model: this.model});
                this.$(".applyTrainingPlan").append(this.planApplyView.render().$el);
                this.on("close", this.planApplyView.close, this.planApplyView);
                this.listenTo(this.planApplyView, "planApplied", this._onPlanApplied);
            }
        },

        serializeData: function()
        {
            var data = this.model.toJSON();

            if(this._planHasBeenApplied())
            {
                data.planApplication = this.model.details.get("planApplications.0");
            }

            return data;
        },

        _planHasBeenApplied: function()
        {
            var planApplications = this.model.details.get("planApplications");
            return planApplications && planApplications.length;
        },

        _onPlanApplied: function()
        {
            this.model.details.fetch().done(_.bind(this.render, this));
        },

        _setupApiConfig: function()
        {
            var env = "local";
            var hostNameMatch = document.location.hostname.match(/([a-z]+)\.trainingpeaks\.com/);
            if(hostNameMatch && hostNameMatch.length === 2)
            {
                env = hostNameMatch[1];
            }

            this.apiConfig = _.defaults({}, window.apiConfig, {
                wwwRoot: "//www." + env + ".trainingpeaks.com",
                appRoot: "//app." + env + ".trainingpeaks.com",
                apiRoot: "//tpapi." + env + ".trainingpeaks.com",
                cmsRoot: "//home." + env + ".trainingpeaks.com"
            });

            if(!this.apiConfig.assetsRoot)
            {
                this.apiConfig.assetsRoot = this.apiConfig.appRoot + "/assets/";
            }

            if(!this.apiConfig.cssRoot)
            {
                this.apiConfig.cssRoot = this.apiConfig.appRoot + ( this.apiConfig.appRoot.indexOf("local") >= 0 ? "/build/debug" : "");
            }
        },

        _setupMarsApp: function()
        {
            var $body = $("body");

            window.theMarsApp = {
                
                user: this.user,
                
                getBodyElement: function()
                {
                    return $body;
                },

                featureAuthorizer: {

                    canAccessFeature: function(featureValue){
                        return !!featureValue;
                    },

                    runCallbackOrShowUpgradeMessage: function(featureChecker, callback, attributes, options){
                        if(this.canAccessFeature(featureChecker))
                        {
                            callback(); 
                        }
                    },

                    features: {
                        ViewGraphRanges: true,
                        EditLapNames: false
                    }
                },

                trigger: function(){}

            };

            _.extend(window.theMarsApp, this.apiConfig);
        },

        _loadExternalScripts: function()
        {
            var scripts = [
                "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js"
            ];

            _.each(scripts, function(script)
            {
                $("<script>").attr("src", script).appendTo("head");
            });     

        },

        _loadExternalStylesheets: function()
        {
            var stylesheets = [
                "//code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css",
                this.apiConfig.cssRoot + "/app/css/webfonts.css"
            ];

            _.each(stylesheets, function(stylesheet)
            {
                $("<link>").attr("rel", "stylesheet").attr("href", stylesheet).insertBefore("link:first");
            });
        }
    });

    return ApplyTrainingPlan;
});
