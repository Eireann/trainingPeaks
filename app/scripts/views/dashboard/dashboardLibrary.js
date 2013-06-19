define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardLibrary"
],
function(TP, dashboardLibraryTemplate)
{
    var DashboardLibraryView =
    {

        activeLibraryName: "chartsLibrary",
        widthClosed: 40,
        widthOpen: 310,

        template:
        {
            type: "handlebars",
            template: dashboardLibraryTemplate
        },

        events:
        {
            //"click #tabs > div": "onTabClick"
            "click #tabs #chartsLibrary": "onTabClick"
        },

        initialize: function()
        {
            _.bindAll(this, "resizeContainerHeight");
            $(window).on("resize", this.resizeContainerHeight);
        },

        onTabClick: function(e)
        {
            this.toggleLibrary(e.target.id);
        },

        toggleLibrary: function(newLibraryName)
        {
            if (this.isOpen())
            {
                this.hideLibrary();
            }
            else
            {
                this.showLibrary();
            }
        },

 
        showLibrary: function()
        {
            this.$el.parent().removeClass("closed").addClass("open");
            this.animate({ width: this.widthOpen });
            this.turnOnTab(this.activeLibraryName);
            this.resizeContainerHeight();
        },

        hideLibrary: function()
        {
            if (!this.isOpen())
                return;

            this.$el.parent().removeClass("open").addClass("closed");
            this.animate({ width: this.widthClosed });
            if (this.activeLibraryName)
            {
                this.turnOffTab(this.activeLibraryName);
            }
        },

        animate: function(cssAttributes)
        {
            // allow the calendar or other listeners to hook into our animation
            var duration = 300;
            this.trigger("animate", cssAttributes, duration);

            // run the animation
            this.$el.closest("#libraryContainer").animate(cssAttributes, { duration: duration });
        },

        turnOffTab: function(tabName)
        {
            this.$("#tabs #" + tabName).removeClass("active");
        },

        turnOnTab: function(tabName)
        {
            this.$("#tabs #" + tabName).addClass("active");
        },

        isOpen: function()
        {
            return this.$el.parent().hasClass("open");
        },

        onRender: function()
        {
            this.resizeContainerHeight();
        },

        onShow: function()
        {
            this.resizeContainerHeight();
        },

        resizeContainerHeight: function(event)
        {
            var headerHeight = $("#navigation").height();
            var windowHeight = $(window).height();
            var libraryHeight = windowHeight - headerHeight - 75 + 'px';
            if (this.$el)
            {
                this.$el.height(libraryHeight);
            }
            this.$("#tabs").css({ height: libraryHeight });
            this.$("#activeLibraryContainer").css({ height: libraryHeight });
        }

    };

    return TP.ItemView.extend(DashboardLibraryView);
});