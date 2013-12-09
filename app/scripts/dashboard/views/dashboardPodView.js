define(
[
    "jquery",
    "moment",
    "underscore",
    "setImmediate",
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/dashboard/dashboardChart",
    "hbs!templates/views/confirmationViews/closeChartsConfirmationView"
],
function(
    $,
    moment,
    _,
    setImmediate,
    TP,
    UserConfirmationView,
    podTemplate,
    closeChartsConfirmationTemplate
    )
{
    var DashboardPodView = TP.ItemView.extend(
    {
        className: "dashboardChart",

        template:
        {
            type: "handlebars",
            template: podTemplate
        },

        modelEvents: {},

        initialize: function(options)
        {
            if(!this.model)
            {
                throw "Dashboard Chart requires a settings model";
            }

            if(this.model.template)
            {
                this.template = this.model.template;
            }

            //trigger redraw instead of dashboardDatesChange
            this.listenTo(this.model, "dashboardDatesChange", _.bind(this._onDashboardReset, this));
            this.listenTo(this.model, "dataManagerReset", _.bind(this._onDashboardReset, this));
            this.on("show", this._renderPod, this);

            this.listenTo(theMarsApp.user, "change:units", _.bind(this._renderPod, this));
            this.listenTo(theMarsApp.user, "change:dateFormat", _.bind(this._renderPod, this));

            this._setChartCssClass();
        },

        ui:
        {
            chartContainer: ".chartContainer",
            chartTitle: ".chartTitle"
        },

        events:
        {
            "mousedown .settings": "_onSettingsClicked",
            "mousedown .expand": "_onExpandClicked",
            "mousedown .collapse": "_onExpandClicked",
            "mousedown .close": "_onCloseClicked",
            "dblclick": "_onExpandClicked"
        },

        onRender: function()
        {
            this.contentView = this.model.createContentView({ model: this.model, el: this.el });
        },

        _renderPod: function()
        {
            if(this.contentView) this.contentView.render();
        },

        _onSettingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            this._disableDrag();
            e.preventDefault();

            this._keepSettingsButtonVisible();

            var offset = $(e.currentTarget).offset();
            var windowWidth = $(window).width();

            var direction = (windowWidth - offset.left) > 450 ? "right" : "left";
            var icon = this.$(".settings");

            this.chartSettings = this.model.createSettingsView(); 

            this.chartSettings.setTomahawkDirection(direction);

            this.chartSettings.render();
            if (direction === "left")
            {
                this.chartSettings.right(offset.left - 15);
            } else
            {
                this.chartSettings.left(offset.left + $(e.currentTarget).width() + 15);
            }

            this.chartSettings.alignArrowTo(offset.top + ($(e.currentTarget).height() / 2));

            this.listenTo(this.chartSettings, "close", _.bind(this._onChartSettingsClose, this));
            this.listenTo(this.chartSettings, "apply", _.bind(this._renderPod, this));
        },

        _onChartSettingsClose: function()
        {
            this._allowSettingsButtonToHide();
            this._enableDrag();
            this._renderPod();
        },

        _keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        _allowSettingsButtonToHide: function()
        {
            this.$el.removeClass("menuOpen");
        },

        _onExpandClicked: function()
        {
            this.$el.toggleClass("doubleWide");
            this.$el.toggleClass("fullScreen");          
            this.$el.toggleClass("expanded");

            if(!this.chartsContainer)
            {
                this.chartsContainer = this.$el.parent();
            }

            if(this.$el.is(".expanded"))
            {
                this._popOut();
            }
            else if(this._previousPosition)
            {
                this._popIn();
            }

        },

        _popOut: function()
        {
            this._disableDrag();
            var $chartContainer = this.$(this.ui.chartContainer);
            this._previousPosition = {
                top: this.$el.css("top"),
                left: this.$el.css("left"),
                bottom: "auto",
                right: "auto"
            };

            var newPosition = {
                top: "30px",
                bottom: "40px",
                left: "30px",
                right: "30px"
            };

            // Can't use .hide() because the $chartContainer needs to remain in the layout
            // so Flot can internally calculate axis label widths
            $chartContainer.toggleClass('invisible');
            var self = this;
            this.$el.appendTo($("body")).animate(newPosition, 200, function(){ self.setupModalOverlay(); $chartContainer.toggleClass('invisible'); });
            this.trigger('popOut');
        },

        _popIn: function()
        {
            var $chartContainer = this.$(this.ui.chartContainer);
            $chartContainer.toggleClass('invisible');
            this.$el.appendTo(this.chartsContainer).animate(this._previousPosition, 200, function(){ $chartContainer.toggleClass('invisible'); });
            this.closeModal();
            this._previousPosition = null;
            this._enableDrag();
            this.trigger('popIn');
        },

        setupModalOverlay: function()
        {
            
            this.createOverlay({ onOverlayClick: this._onExpandClicked, mask: true });
            this.$overlay.css("z-index", this.$el.css("z-index") - 1);
        },

        _onCloseClicked: function()
        {
            this.discardConfirmation = new UserConfirmationView({ template: closeChartsConfirmationTemplate });
            this.discardConfirmation.render();
            this.discardConfirmation.on("userConfirmed", this.onDiscardChangesConfirmed, this);
        },

        onDiscardChangesConfirmed: function()
        {
            this.model.destroy();
        },

        _disableDrag: function()
        {
            if(this.$el.data("ui-draggable"))
            {
                this.$el.draggable("disable");
            } 
        },

        _enableDrag: function()
        {
            if(this.$el.data("ui-draggable"))
            {
                this.$el.draggable("enable");
            }
        },

        onClose: function()
        {
            if(this.contentView) this.contentView.close();
        },

        _setChartCssClass: function()
        {
            var className = this.model.getChartName().replace(/[^a-zA-Z]/g,"");
            className = className.substring(0, 1).toLowerCase() + className.substring(1);
            this.$el.addClass(className); 
        },

        _onDashboardReset: function()
        {
            this._renderPod();
        }

    });

    return DashboardPodView;
});
