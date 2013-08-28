define(
[
    "setImmediate",
    "jquerySelectBox",
    "underscore",
    "TP",
    "./dashboardChartSettingsBase",
    "./dashboardDatePicker",
    "hbs!templates/views/dashboard/dashboardChartSettings"
],
function(
    setImmediate,    
    jquerySelectBox,
    _,
    TP,
    DashboardChartSettingsBase,
    DashboardDatePicker,
    dashboardChartSettingsTemplate
    )
{
    var DashboardHeaderDatePicker = {

        className:"dashboardChartSettings dashboardHeaderDatePicker",

        template:
        {
            type: "handlebars",
            template: dashboardChartSettingsTemplate
        },

        modal: true,

        
        initialize: function(options)
        {
            this.originalModel = this.model;
            this.settingsKey = options.key || (options.settingsKey ? options.settingsKey + ".dateOptions" : "dateOptions");
            this.model = new TP.Model({ dateOptions: this.originalModel.get(this.settingsKey) });

            this.on("close", this.saveOnClose, this);
            this.children = new Backbone.ChildViewContainer();
        },

        saveOnClose: function()
        {
            this.originalModel.set(this.settingsKey, this.model.get("dateOptions"));
            this.originalModel.trigger("applyDates");
        },

        onRender: function ()
        {
            this.settingsKey = "settings.dashboard.dateOptions";
            this.model.off("change", this.render);
            if (dashboardChartSettingsTemplate)
            {
                this.datepickerView = new DashboardDatePicker({ model: this.model, includeGlobalOption: false });
                this.datepickerView.setElement(this.$(".datepickerContainer")).render();
                this.children.add(this.datepickerView);
            }
        },

        alignArrowTo: function (top)
        {

            // make sure we're fully on the screen
            var windowBottom = $(window).height() - 10;
            this.top(top - 25);
            var myBottom = this.$el.offset().top + this.$el.height();

            if (myBottom > windowBottom)
            {
                var arrowOffset = (myBottom - windowBottom) + 30;
                this.top(windowBottom - this.$el.height());
                this.$(".arrow").css("top", arrowOffset + "px");
            }
        },

        setTomahawkDirection: function (direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        },

        onShow: function ()
        {
            this.children.call("show");
        },

        onClose: function ()
        {
            this.children.call("close");
        }

        

    };

    return TP.ItemView.extend(DashboardHeaderDatePicker);
});