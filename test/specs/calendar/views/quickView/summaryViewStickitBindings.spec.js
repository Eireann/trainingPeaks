// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
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
            expect(summaryViewStickitBindings.initializeStickit).toBeDefined();
            expect(typeof summaryViewStickitBindings.initializeStickit).toBe("function");
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

                    }
                },
                stickit: function()
                {

                }
            });

            summaryViewStickitBindings.initializeStickit();
            spyOn(summaryViewStickitBindings, "stickit");
            summaryViewStickitBindings.trigger("render");

            expect(summaryViewStickitBindings.stickit).toHaveBeenCalled();
            expect(summaryViewStickitBindings.stickit.callCount).toBe(1);

            summaryViewStickitBindings.trigger("render");
            expect(summaryViewStickitBindings.stickit.callCount).toBe(1);
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
            spyOn(summaryViewStickitBindings, "unstickit");

            summaryViewStickitBindings.trigger("close");
            expect(summaryViewStickitBindings.unstickit).toHaveBeenCalled();

        });

        describe("updateModel method which triggers a conditional model update when a StickIt bindings is fired", function()
        {
            it("clears an existing un-triggered update timeout", function()
            {
                // Creating global variable on purpose in order to be able to spy on it 
                // and fake-inject it into the updateModel method.
                clearTimeout = jasmine.createSpy();

                var context =
                {
                    
                };
                
                summaryViewStickitBindings.updateModel.call(context, 100, {});
                expect(window.clearTimeout).not.toHaveBeenCalled();

                summaryViewStickitBindings.updateModel.call(context, 100, {});
                expect(window.clearTimeout).toHaveBeenCalled();
            });
        });

        describe("checkIfModelUpdateRequired method which returns true/false if model needs to be updated", function()
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

                expect(summaryViewStickitBindings.checkIfModelUpdateRequired.call(context, newValue, options)).toBe(false);
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

                expect(summaryViewStickitBindings.checkIfModelUpdateRequired.call(context, newValue, options)).toBe(true);
            });
        });

        describe("performModelUpdate method which performs the model update", function()
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

                spyOn(context.model, "save");
                context.model.set(options.observe, oldValue);

                summaryViewStickitBindings.performModelUpdate.call(context, newValue, options);

                expect(context.model.get(options.observe)).toBe(newValue);
                expect(context.model.save).toHaveBeenCalled();
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

                spyOn(context.model, "save");
                context.model.set(options.observe, oldValue);

                summaryViewStickitBindings.performModelUpdate.call(context, newValue, options);

                expect(context.model.get(options.observe)).toBe(newValue);
                expect(context.model.save).toHaveBeenCalled();
            });
        });
    });
});