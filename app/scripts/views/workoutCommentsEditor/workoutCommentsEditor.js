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
                saveTimeout: 60000,
                onGet: "formatForStickit",
                onSet: "parseForStickit"
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                units: "text",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                saveTimeout: 60000,
                onGet: "formatForStickit",
                onSet: "parseForStickit"
            },
            "#preActivityCommentsInput":
            {
                observe: "coachComments",
                units: "text",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                onGet: "formatForStickit",
                onSet: "parseForStickit"
            },
            "#descriptionPrintable":
            {
                observe: "description",
                units: "text",
                onGet: "formatForStickit",
                onSet: "parseForStickit"
            },
            "#postActivityCommentsPrintable":
            {
                observe: "newComment",
                units: "text",
                onGet: "formatForStickit",
                onSet: "parseForStickit"
            },
            "#preActivityCommentsPrintable":
            {
                observe: "coachComments",
                units: "text",
                onGet: "formatForStickit",
                onSet: "parseForStickit"
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

            if (!theMarsApp.user.get("isAthlete") || this.model.get("coachComments"))
            {
                this.$("#preActivityComments").css("display", "block");
            }
        },

        saveComments: function(workoutCommentView)
        {
            this.model.set("workoutComments",  this.getCommentsAsArray(), { silent: true });

            // A DOM blur event may have removed the focus from the text area used to edit the comment.
            // Restore it here and move the cursor to the end of the data input.
            // If this "save" was prompted by an acutal blur event (i.e., the user clicked outside the text area),
            // workoutCommentView.onCommentBodyBlur will take care of re-rendering the view as intended.
            this.model.autosave({}).done(
                function()
                {
                    var $commentBody = workoutCommentView.$(".commentBody");
                    var text = $commentBody.val();
                    $commentBody.focus().val("").val(text);
                }
            );
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

        formatForStickit: function(value, options)
        {
            if(!options.units)
            {
                throw new Error("Stickit bindings requires units option or onGet method: " + JSON.stringify(options));
            }
            return this.formatUnitsValue(options.units, value, options);
        },

        parseForStickit: function(value, options)
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
