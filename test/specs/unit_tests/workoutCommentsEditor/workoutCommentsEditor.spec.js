define(
[
    "TP",
    "models/workoutModel",
    "views/workoutCommentsEditor/workoutCommentsEditor"
],
function(TP, WorkoutModel, WorkoutCommentsEditorView)
{
    describe("WorkoutCommentsEditor View", function()
    {

        it("Should render workout description", function()
        {

            var descriptionText = "Here is my description";

            var workoutModel = new WorkoutModel({ description: descriptionText });

            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            expect(view.$("#descriptionInput").val()).to.eql(descriptionText);
        });

        it("Should render post activity comments", function()
        {

            var comments = [
                { comment: "here is my comment" }
            ];
            var workoutModel = new WorkoutModel({ workoutComments: comments });

            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            expect(view.$el.html().indexOf(comments[0].comment)).to.not.eql(-1);
        });

        it("Should see changes to description", function()
        {
            var workoutModel = new WorkoutModel();
            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            var newDescription = "Here is a new description";
            sinon.stub(workoutModel, "save");
            view.$el.find("#descriptionInput").val(newDescription).blur();

            expect(workoutModel.get("description")).to.eql(newDescription);
            expect(workoutModel.save).to.have.been.called;
        });

        it("Should see new comments", function()
        {
            var workoutModel = new WorkoutModel();
            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            var newComment = "Here is a new comment";
            sinon.stub(workoutModel, "save");
            view.$el.find("#postActivityCommentsInput").val(newComment).blur();

            expect(workoutModel.get("newComment")).to.eql(newComment);
            expect(workoutModel.save).to.have.been.called;
        });

        it("Should make comment editable on click", function()
        {
            var comments = [
                { comment: "here is my comment" },
                { comment: "here is another comment" }
            ];
            var workoutModel = new WorkoutModel({ workoutComments: comments });


            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            expect(view.$el.html().indexOf(comments[0].comment)).to.not.eql(-1);
            expect(view.$el.html().indexOf(comments[1].comment)).to.not.eql(-1);
            expect(view.$el.find("textarea.commentBody").length).to.eql(0); 

            view.$el.find(".commentBody:first").trigger("mousedown");

            expect(view.$el.find("textarea.commentBody").length).to.eql(1);
        });

        it("Should save an edited comment on blur", function()
        {
            var comments = [
                { comment: "here is my comment" },
                { comment: "here is another comment" }
            ];
            var workoutModel = new WorkoutModel({ workoutComments: comments });


            var view = new WorkoutCommentsEditorView({ model: workoutModel });
            view.render();

            sinon.stub(workoutModel, "save");

            view.$el.find(".commentBody:first").trigger("mousedown");

            var editedComment = "an edited comment";
            expect(view.$el.find("textarea.commentBody").length).to.eql(1);
            view.$el.find("textarea.commentBody").val(editedComment);
            view.$el.find("textarea.commentBody").trigger("blur");

            // save it
            expect(workoutModel.getPostActivityComments().models[0].get("comment")).to.eql(editedComment);
            expect(workoutModel.save).to.have.been.called;

            // hide the input
            expect(view.$el.find("textarea.commentBody").length).to.eql(0);
        });
    });
});
