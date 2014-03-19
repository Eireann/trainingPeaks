define(
[
    "jquery",
    "setImmediate",
    "TP",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/workoutCommentsEditor/workoutComments",
    "hbs!templates/views/workoutCommentsEditor/editableWorkoutComments"
],
function($, setImmediate, TP, UserConfirmationView, deleteConfirmationTemplate, workoutCommentsTemplate, editableWorkoutCommentsTemplate)
{
    return TP.ItemView.extend(
    {
        showThrobbers: false,
        tagName: "div",
        className: "comment",

        ui:
        {
            "editedComment": "textarea.commentBody"    
        },
        
        events:
        {
            "mouseenter": "onMouseOver",
            "mouseleave": "onMouseOut",
            "click .deleteButton": "onDeleteClicked",
            "mousedown .commentBody": "onCommentBodyClicked",
            "blur .commentBody": "onCommentBodyBlur",
            "keyup textarea": "onCommentBodyChanged"
        },
        
        initialize: function()
        {
            this.template =
            {
                type: "handlebars",
                template: workoutCommentsTemplate
            };
        },

        onMouseOver: function ()
        {
            this.$el.addClass("hover");
            if (this.editable || this.model.get("commenterPersonId") !== theMarsApp.user.id)
            {
                this.$(".deleteButton").hide();
            }
        },

        onMouseOut: function (e)
        {
            if (e && e.toElement && $(e.toElement).is(".workoutCommentMenuModalOverlay"))
            {
                return;
            }
            this.$el.removeClass("hover");
        },

        onDeleteClicked: function (e)
        {
            if (this.model.get("commenterPersonId") !== theMarsApp.user.id)
            {
                return;
            }
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteConfirmed, this);
        },

        onDeleteConfirmed: function ()
        {
            this.model.collection.remove(this.model);
        },

        onCommentBodyClicked: function ()
        {
            if (!this.editable)
            {
                var self = this;
                this.editable = true;
                this.template.template = editableWorkoutCommentsTemplate;
                this.render();
                this.$el.addClass("editable");
                setImmediate(function() { self.$(".commentBody").focus(); });
            }
        },
        
        onCommentBodyBlur: function()
        {
            // If the blur event is a consequence of re-rendering upon a "save", no action is required.
            // If the blur event occurs because the user clicked outside the comment textarea, we need to detect any change and save.
            if (this.saving)
            {
                this.saving = false;
                return;
            }

            if (this.saveTimeout)
                clearTimeout(this.saveTimeout);
            
            if (this.editable)
            {
                var comment = TP.utils.conversion.parseUnitsValue("text", this.ui.editedComment.val());
                if (comment !== this.model.get("comment"))
                {
                    this.model.set("comment", comment);
                    this.trigger("commentedited", self);
                }
                
                this.editable = false;
                this.template.template = workoutCommentsTemplate;
                this.render();
                this.$el.removeClass("editable");
            }
        },
        
        onCommentBodyChanged: function()
        {
            if (this.saveTimeout)
                clearTimeout(this.saveTimeout);

            var self = this;
            this.saveTimeout = setTimeout(function()
            {
                //console.debug("check for save");
                var comment = TP.utils.conversion.parseUnitsValue("text", self.ui.editedComment.val());
                if (comment !== self.model.get("comment"))
                {
                    self.saving = true;
                    self.model.set("comment", comment);
                    self.trigger("commentedited", self);
                }
            }, 2000);
        }
    });
});
