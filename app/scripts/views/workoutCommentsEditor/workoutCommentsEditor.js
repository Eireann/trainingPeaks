define(
[
    "underscore",
    "setImmediate",
    "TP",
    "./workoutCommentsCollectionView",
    "utilities/stickitMixin",
    "hbs!templates/views/workoutCommentsEditor/workoutCommentsEditor"
],
function(_, setImmediate, TP, WorkoutCommentsCollectionView, stickitMixin, workoutCommentsEditorTemplate)
{
    var workoutCommentsEditorView =
    {
        template:
        {
            type: "handlebars",
            template: workoutCommentsEditorTemplate
        },

        bindings:
        {
            "#descriptionInput":
            {
                events: [ "blur", "keyup", "change", "cut", "paste"],
                observe: "description",
                units: "text",
                updateModel: "updateModel",
                ignoreOnSetForUpdateModel: true,
                saveTimeout: 60000,
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                units: "text",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                saveTimeout: 60000,
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            },
            "#preActivityCommentsInput":
            {
                observe: "coachComments",
                units: "text",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            },
            "#descriptionPrintable":
            {
                observe: "description",
                units: "text",
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            },
            "#postActivityCommentsPrintable":
            {
                observe: "newComment",
                units: "text",
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            },
            "#preActivityCommentsPrintable":
            {
                observe: "coachComments",
                units: "text",
                onGet: "defaultOnGet",
                onSet: "defaultOnSet"
            }
        },

        initialize: function()
        {
            if (!this.model)
                throw "WorkoutCommentsEditorView requires a model. Aborting";

            this.on("render", this.renderComments, this);
            this.model.on("change:newComment", this.onNewCommentChange, this);

            this.on("close", this.unstickit, this);
            this.once("render", this.initializeStickit, this);

            this.fixNewlinesOnModelDescriptionChange();
        },

        fixNewlinesOnModelDescriptionChange: function()
        {
            // FIXME - we need to handle this on an api level
            this.model.on("change:description", function ()
            {
                this.model.set("description",
                    this.parseUnitsValue("text", this.model.get("description")),
                    { silent: true });
            }, this);

        },

        initializeStickit: function ()
        {
            this.model.off("change", this.render);
            this.stickit();
        },

        onNewCommentChange: function()
        {
            var input = this.$("#postActivityCommentsInput");
            setImmediate(function()
            {
                if (!input.val())
                {
                    input.css("height", "");
                }
            });
        },

        renderComments: function()
        {
            this.postActivityCommentsView = new WorkoutCommentsCollectionView(
            {
                collection: this.model.getPostActivityComments()
            });

            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

            this.postActivityCommentsView.on("item:removed", this.saveComments, this);
            this.postActivityCommentsView.on("itemview:commentedited", this.saveComments, this);

            if (!theMarsApp.user.get("settings.account.isAthlete") || this.model.get("coachComments"))
            {
                this.$("#preActivityComments").css("display", "block");
            }
        },

        saveComments: function()
        {
            this.model.set("workoutComments",  this.getCommentsAsArray(), { silent: true });
            this.model.autosave();
        },

        getCommentsAsArray: function()
        {
            var commentsCollection = this.model.getPostActivityComments();
            var commentsArray = [];
            commentsCollection.each(function(commentsModel)
            {
                commentsArray.push(commentsModel.attributes);
            });
            return commentsArray;
        },

        defaultOnGet: function(value, options)
        {
            if(!options.units)
            {
                throw new Error("Stickit bindings requires units option or onGet method: " + JSON.stringify(options));
            }
            return this.formatUnitsValue(options.units, value, options);
        },

        defaultOnSet: function(value, options)
        {
            if(!options.units)
            {
                throw new Error("Stickit bindings requires units option or onSet method: " + JSON.stringify(options));
            }
            return this.parseUnitsValue(options.units, value, options);
        }
    };

    _.extend(workoutCommentsEditorView, stickitMixin);
    return TP.ItemView.extend(workoutCommentsEditorView);
});
