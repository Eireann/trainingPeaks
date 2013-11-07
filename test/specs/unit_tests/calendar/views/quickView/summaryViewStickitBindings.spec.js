define(
[
    "TP",
    "views/quickView/summaryView/summaryViewStickitBindings"
],
function (TP, summaryViewStickitBindings)
{
    describe("summaryViewStickitBindings QuickView Extension", function ()
    {
        beforeEach(function ()
        {
        });

        it("has an initializer", function()
        {
            expect(summaryViewStickitBindings.initializeStickit).to.not.be.undefined;
            expect(typeof summaryViewStickitBindings.initializeStickit).to.equal("function");
        });

        it("performs StickIt bindings on render, only once", function()
        {
            _.extend(summaryViewStickitBindings, TP.Events);
            _.extend(summaryViewStickitBindings,            
            {
                model:
                {
                    off: function()
                    {

                    },
                    on: function()
                    {

                    }
                },
                stickit: function()
                {

                }
            });

            summaryViewStickitBindings.initializeStickit();
            sinon.stub(summaryViewStickitBindings, "stickit");
            summaryViewStickitBindings.trigger("render");

            expect(summaryViewStickitBindings.stickit).to.have.been.called;
            expect(summaryViewStickitBindings.stickit.callCount).to.equal(1);

            summaryViewStickitBindings.trigger("render");
            expect(summaryViewStickitBindings.stickit.callCount).to.equal(1);
        });

        it("removes StickIt bindings on close", function()
        {
            _.extend(summaryViewStickitBindings, TP.Events);
            _.extend(summaryViewStickitBindings,
            {
                model:
                {
                    off: function ()
                    {

                    },
                    on: function()
                    {

                    }
                },
                stickit: function ()
                {

                },
                unstickit: function()
                {
                    
                }
            });

            summaryViewStickitBindings.initializeStickit();
            sinon.stub(summaryViewStickitBindings, "unstickit");

            summaryViewStickitBindings.trigger("close");
            expect(summaryViewStickitBindings.unstickit).to.have.been.called;

        });

        describe("updateModel method which triggers a conditional model update when a StickIt bindings is fired", function()
        {
        });

        describe("checkIfModelSaveRequired method which returns true/false if model needs to be updated", function()
        {
            it("returns false when the new and old values are the same", function()
            {
                var oldValue = 100;
                var newValue = 100;

                var options =
                {
                    observe: "testModelProperty",
                    onGet: "onGet"
                };

                var context =
                {
                    onGet: function (value)
                    {
                        return value;
                    },

                    model: new TP.Model()
                };

                context.model.set(options.observe, oldValue);

                expect(summaryViewStickitBindings.checkIfModelSaveRequired.call(context, newValue, options)).to.equal(false);
            });

            it("returns true when the new and old values differ", function ()
            {
                var oldValue = 100;
                var newValue = 120;

                var options =
                {
                    observe: "testModelProperty",
                    onGet: "onGet"
                };

                var context =
                {
                    onGet: function (value)
                    {
                        return value;
                    },

                    model: new TP.Model()
                };

                context.model.set(options.observe, oldValue);

                expect(summaryViewStickitBindings.checkIfModelSaveRequired.call(context, newValue, options)).to.equal(true);
            });
        });

        // needs refactoring
        xdescribe("performModelSave method which performs the model update (TODO: fix or remove this test)", function()
        {
            it("sets a non-description value in the model", function()
            {
                var oldValue = 100;
                var newValue = 150;

                var options =
                {
                    observe: "testModelProperty",
                    onSet: "onSet"
                };

                var context =
                {
                    onSet: function (value)
                    {
                        return value;
                    },

                    model: new TP.Model()
                };

                sinon.stub(context.model, "save");
                context.model.set(options.observe, oldValue);

                summaryViewStickitBindings.performModelUpdate.call(context, newValue, options);

                expect(context.model.get(options.observe)).to.equal(newValue);
                expect(context.model.save).to.have.been.called;
            });
            
            it("sets a new description value in the model", function()
            {
                var oldValue = "old description";
                var newValue = "new description";

                var options =
                {
                    observe: "description"
                };

                var context =
                {
                    model: new TP.Model()
                };

                sinon.stub(context.model, "save");
                context.model.set(options.observe, oldValue);

                summaryViewStickitBindings.performModelUpdate.call(context, newValue, options);

                expect(context.model.get(options.observe)).to.equal(newValue);
                expect(context.model.save).to.have.been.called;
            });
        });
    });
});
