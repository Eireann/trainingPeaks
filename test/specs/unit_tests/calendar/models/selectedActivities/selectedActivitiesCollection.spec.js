define(
[
    "underscore",
    "jquery",
    "backbone",
    "testUtils/testHelpers",
    "TP",
    "shared/models/metricModel",
    "models/workoutModel",
    "shared/models/selectedActivitiesCollection"
],
function (
          _,
          $,
          Backbone,
          testHelpers,
          TP,
          MetricModel,
          WorkoutModel,
          SelectedActivitiesCollection
          )
{
    describe("SelectedActivitiesCollection", function()
    {

        var models;
        var athleteId = 1234;

        beforeEach(function()
        {
            models = [
                new MetricModel({
                    id: 1,
                    athleteId: athleteId
                }),
                new WorkoutModel({
                    workoutId: 2,
                    athleteId: athleteId
                })
            ];
        });


        describe("Delete Activities", function()
        {

            it("should throw if an invalid model is passed", function()
            {
                var badModel = function()
                {
                    var collection = new SelectedActivitiesCollection([
                        new TP.Model({ id: 5, athleteId: athleteId })
                    ]);

                    return collection.deleteSelectedItems();
                };

                expect(badModel).to.throw();
            });

            it("should not trigger a destroy on each model until after request", function ()
            {
                sinon.stub(Backbone, "ajax").returns(new $.Deferred());
                var collection = new SelectedActivitiesCollection(models);

                _.each(models, function(item, index)
                {
                    sinon.stub(item, "trigger");
                }, this);

                collection.deleteSelectedItems();
                
                _.each(models, function (item, index)
                {
                    expect(item.trigger).to.not.have.been.called;
                }, this);
            });

            it("should call a delete on the appropriate url, with the appropriate parameters", function()
            {

                sinon.stub(Backbone, "ajax").returns(new $.Deferred());

                var collection = new SelectedActivitiesCollection(models);

                collection.deleteSelectedItems();

                var postData = {
                    workoutIds: [2],
                    metricIds: [1]
                };

                var expectedAjaxOptions = 
                {
                    url: testHelpers.theApp.apiRoot + "/baseactivity/v1/athletes/" + athleteId + "/commands/deleteactivities",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(postData)
                };

                expect(Backbone.ajax).to.have.been.calledWith(expectedAjaxOptions);

            });
            
            it("should trigger destroy after request returns", function ()
            {
                var deferred = new $.Deferred();
                sinon.stub(Backbone, "ajax").returns(deferred);
                var collection = new SelectedActivitiesCollection(models);

                _.each(models, function (item, index)
                {
                    sinon.stub(item, "trigger");
                }, this);

                collection.deleteSelectedItems();

                deferred.resolve();
                
                _.each(models, function (item, index)
                {
                    expect(item.trigger).to.have.been.calledWith('destroy', item);
                }, this);

            });

        });

    });

});
