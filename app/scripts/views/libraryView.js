define(
[
    "underscore",
    "TP",
    "views/workoutLibraryView",
    "views/mealLibraryView",
    "hbs!templates/views/library"
],
function(_, TP, WorkoutLibraryView, MealLibraryView, libraryTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: libraryTemplate
        },

        initialize: function()
        {
            this.views = {
                workoutLibrary: new WorkoutLibraryView(),
                mealLibrary: new MealLibraryView()
            };

            this.activeLibrary = null;
        },

        ui:
        {
            "activeLibraryContainer": "#activeLibraryContainer"
        },

        events:
        {
            "click #tabs > div": "onTabClick"
        },

        onTabClick: function(e)
        {
            var libraryName = $(e.target).data("library");
            this.switchLibrary(libraryName);
        },

        switchLibrary: function(libraryName)
        {
            var newLibrary = this.views[libraryName];
            if (newLibrary !== this.activeLibrary)
            {
                if (this.activeLibrary)
                {
                    this.activeLibrary.close();
                }
                this.activeLibrary = newLibrary;
                var view = this;
                function callback()
                {
                    view.renderActiveLibrary();
                    view.showLibrary();
                }
                this.ui.activeLibraryContainer.fadeOut(300, callback);
            } else
            {
                this.toggleLibrary();
            }
        },

        showLibrary: function()
        {
            this.ui.activeLibraryContainer.fadeIn(600);
            this.$el.parent().removeClass("closed").addClass("open");
        },

        hideLibrary: function()
        {
            var container = this.$el.parent();
            function callback()
            {
                container.removeClass("open").addClass("closed");
            }
            this.ui.activeLibraryContainer.fadeOut(300, callback);
        },

        toggleLibrary: function()
        {
            if (this.$el.parent().hasClass("open"))
            {
                this.hideLibrary();
            } else
            {
                this.showLibrary();
            }
        },

        onRender: function()
        {
            //this.renderActiveLibrary();
        },

        renderActiveLibrary: function()
        {
            this.ui.activeLibraryContainer.html("");
            this.activeLibrary.render();
            this.ui.activeLibraryContainer.append(this.activeLibrary.$el);
        }

    });
});