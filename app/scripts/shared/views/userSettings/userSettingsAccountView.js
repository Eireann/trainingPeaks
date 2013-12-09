define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettingsFormView",
    "hbs!shared/templates/userSettings/userSettingsAccountTemplate"
],
function(
    _,
    TP,
    Backbone,
    UserSettingsFormView,
    userSettingsAccountTemplate
)
{

    var UserSettingsView = TP.ItemView.extend(
    {

        modelEvents: {},
        
        template:
        {
            type: "handlebars",
            template: userSettingsAccountTemplate
        },

        events:
        {
            "click .closeIcon": "close",
            "click .save": "save"
        },

        initialize: function(options)
        { 
            if(!options || !options.userModel)
            {
                throw new Error("UserSettingsFormView requires a user model");
            }

            UserSettingsView.__super__.initialize.apply(this, arguments);

            this.userModel = options.userModel;
            this.children = new Backbone.ChildViewContainer();
            this.options = options;

            this.on("render", this._addChildViews, this);
        },

        subNavigation:
        [
            {
                title: "Profile",
                target: "profile"
            },
            {
                title: "Settings",
                target: "account"
            },
            {
                title: "Calendar",
                target: "calendar"
            },
            {
                title: "Email Options",
                target: "email"
            }
        ],
        
        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModels");
        },

        _addChildViews: function()
        {
            this._addView(".userSettingsForm", UserSettingsFormView, this.options, "userSettingsForm");
        },

        close: function()
        {
            this.children.apply("close", arguments);
            UserSettingsView.__super__.close.apply(this, arguments);
        },

        _addView: function(selector, klass, options, name)
        {
            var el = this.$(selector);
            options = _.extend(options, { el: el });
            var view = new klass(options);
            this.children.add(view, name);
            view.render();
        }
    });

    return UserSettingsView;
});
