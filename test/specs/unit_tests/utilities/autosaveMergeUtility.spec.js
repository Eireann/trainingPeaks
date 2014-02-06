define(
[
    "jquery",
    "backbone",
    "shared/utilities/autosaveMergeUtility"
],
function(
    $,
    Backbone,
    AutosaveMergeUtility
)
{

    describe("AutosaveMergeUtility", function()
    {

        describe("merge", function()
        {
            it("should prefer local changes to server changes", function()
            {
                var base = { a: 1 };
                var local = { a: 3 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(3);
            });

            it("should use server changes", function()
            {
                var base = { a: 1 };
                var local = { a: 1 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(5);
            });

            it("should only include fields from server", function()
            {
                var base = { a: 1, b: 1, c: 1 };
                var local = { a: 1, b: 1, c: 3 };
                var server = { a: 5 };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.equal(5);
                expect(merged.b).to.be.undefined;
                expect(merged.c).to.be.undefined;
            });

            it("should merge nested objects", function()
            {
                var base = { a: { b: 1, c: 2 } };
                var local = { a: { b: 11, c: 2 } };
                var server = { a: { b: 1, c: 22 } };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a.b).to.equal(11);
                expect(merged.a.c).to.equal(22);
            });

            it("should merge array's by id (using join)", function()
            {
                var base = { a: [{id: 1, value: 1}] };
                var local = { a: [{id: 1, value: 2}, {id: 2, value: 42}] };
                var server = { a: [{id: 1, value: 1}, {id: 3, value: 11}] };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.eql([{id: 1, value: 2}, {id: 2, value: 42}, {id: 3, value: 11}]);
            });

            it("should not attempt to merge objects with arrays", function()
            {
                var base = { a: [] };
                var local = { a: [] };
                var server = { a: {} };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.eql({});
            });

            it("should not attempt to merge arrays with null", function()
            {
                var base = { a: [] };
                var local = { a: null };
                var server = { a: [] };

                var merged = AutosaveMergeUtility.merge(base, local, server);

                expect(merged.a).to.eql(null);
            });
        });


        describe("join (with ids)", function()
        {
            it("should use items added locally", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }, { id: 3 }];
                var server = [{ id: 1 }, { id: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
            });

            it("should use items added by the server", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }];
                var server = [{ id: 1 }, { id: 2 }, { id: 3 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }, { id: 2 }, { id: 3 }]);
            });

            it("should delete items removed by the server", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }, { id: 2 }];
                var server = [{ id: 1 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }]);
            });

            it("should delete items removed locally", function()
            {
                var base = [{ id: 1 }, { id: 2 }];
                var local = [{ id: 1 }];
                var server = [{ id: 1 }, { id: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ id: 1 }]);
            });
        });

        describe("join (without ids)", function()
        {
            it("should use items added locally", function()
            {
                var base = [{ value: 1 }, { value: 2 }];
                var local = [{ value: 1 }, { value: 42 }, { value: 3 }];
                var server = [{ value: 1 }, { value: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ value: 1 }, { value: 42 }, { value: 3 }]);
            });

            it("should use items added by the server", function()
            {
                var base = [{ value: 1 }, { value: 2 }];
                var local = [{ value: 1 }, { value: 2 }];
                var server = [{ value: 1 }, { value: 2 }, { value: 3 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ value: 1 }, { value: 2 }, { value: 3 }]);
            });

            it("should delete items removed by the server", function()
            {
                var base = [{ value: 1 }, { value: 2 }];
                var local = [{ value: 1 }, { value: 2 }];
                var server = [{ value: 1 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ value: 1 }]);
            });

            it("should delete items removed locally", function()
            {
                var base = [{ value: 1 }, { value: 2 }];
                var local = [{ value: 1 }];
                var server = [{ value: 1 }, { value: 2 }];

                var joined = AutosaveMergeUtility.join(base, local, server);

                expect(joined).to.eql([{ value: 1 }]);
            });
        });

        describe("mixin.autosave", function()
        {

            var model, deferreds;
            beforeEach(function()
            {
                model = new Backbone.Model();
                deferreds = [];
                sinon.stub(model, "save", function()
                {
                    var deferred = new $.Deferred();
                    deferreds.push(deferred);
                    return deferred.promise();
                });
            });

            it("should require an options parameter", function()
            {
                var autosaveWithoutOptions = function()
                {
                    AutosaveMergeUtility.mixin.autosave.call(model);
                };

                expect(autosaveWithoutOptions).to.throw();
            });

            it("should serialize save calls", function()
            {
                AutosaveMergeUtility.mixin.autosave.call(model, {});
                AutosaveMergeUtility.mixin.autosave.call(model, {});
                expect(model.save).to.have.been.called.once;

                deferreds.shift().resolve();

                expect(model.save).to.have.been.called.twice;

                deferreds.shift().resolve();
            });

            it("should add an autosaved flag to the save options", function()
            {
                AutosaveMergeUtility.mixin.autosave.call(model, {});
                expect(model.save).to.have.been.called.once;

                var saveOptions = model.save.firstCall.args[1];
                expect(_.isObject(saveOptions)).to.be.ok;
                expect(saveOptions.autosaved).to.be.ok;
            });

            it("should not trigger a save if the autosaved flag is present in save options", function()
            {
                AutosaveMergeUtility.mixin.autosave.call(model, { autosaved: true });
                expect(model.save).not.to.have.been.called;
            });

        });

        describe("mixin.parse", function()
        {

            it("should not fail without options", function()
            {
                var model = new Backbone.Model();
                AutosaveMergeUtility.mixin.parse.call(model, {});
            });

        });

    });

});
