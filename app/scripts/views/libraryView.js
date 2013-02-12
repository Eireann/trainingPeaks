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
            if (libraryName)
            {
                this.switchLibrary(libraryName);
            }
        },

        switchLibrary: function(libraryName)
        {
            var newLibrary = this.views.hasOwnProperty(libraryName) ? this.views[libraryName] : this.activeLibrary;
            if (newLibrary !== this.activeLibrary)
            {
                if (this.activeLibrary)
                {
                    this.activeLibrary.close();
                    this.turnOffTab(this.activeLibrary.libraryName);
                }
                this.activeLibrary = newLibrary;

                var view = this;
                var showAfterHide = function()
                {
                    setTimeout(
                        function()
                        {
                            view.renderActiveLibrary();
                            view.showLibrary();
                        },
                        300
                    );
                };
                this.hideLibrary(showAfterHide);

            } else
            {
                this.toggleLibrary();
            }
        },

        turnOffTab: function(tabName)
        {
            this.$("#tabs [data-library=" + tabName + "]").removeClass("active");
        },

        turnOnTab: function(tabName)
        {
            this.$("#tabs [data-library=" + tabName + "]").addClass("active");
        },

        showLibrary: function()
        {
            if (!this.$el.parent().hasClass("open"))
            {
                this.ui.activeLibraryContainer.fadeIn(600);
                this.$el.parent().removeClass("closed").addClass("open");
            }
            this.turnOnTab(this.activeLibrary.libraryName);
        },

        hideLibrary: function(afterHide)
        {
            if (this.$el.parent().hasClass("open"))
            {
                var container = this.$el.parent();
                var view = this;
                var callbackAfterHide = function()
                {
                    view.turnOffTab(view.activeLibrary.libraryName);
                    container.removeClass("open").addClass("closed");
                    if (typeof afterHide === 'function')
                    {
                        afterHide();
                    }
                };
                this.ui.activeLibraryContainer.fadeOut(300, callbackAfterHide);
            } else if (typeof afterHide === 'function')
            {

                this.turnOffTab(this.activeLibrary.libraryName);
                afterHide();
            }
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

        renderActiveLibrary: function()
        {
            this.ui.activeLibraryContainer.html("");
            this.activeLibrary.render();
            this.ui.activeLibraryContainer.append(this.activeLibrary.$el);
        }

    });
});