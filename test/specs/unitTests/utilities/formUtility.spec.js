define(
[
    "jquery",
    "TP",
    "shared/utilities/formUtility"
],
function(
    $,
    TP,
    FormUtility
)
{

    describe("FormUtility", function()
    {

        describe("applyValuesToForm", function()
        {

            it("should apply a value to a text box (without a type attribute)", function()
            {
                var $el = $("<div><input name='key'></div>");
                var model = new TP.Model({key: "value"});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input").val()).to.eql("value");
            });

            it("should apply a value to text box (with a type attribute)", function()
            {
                var $el = $("<div><input type='text' name='key'></div>");
                var model = new TP.Model({key: "value"});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input").val()).to.eql("value");
            });

            it("should apply a string value to a radio button group", function()
            {
                var $el = $("<div><input type='radio' name='key' value='1'><input type='radio' name='key' value='2'></div>");
                var model = new TP.Model({key: "2"});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input:checked").val()).to.eql("2");
            });

            it("should apply an int value to a radio button group", function()
            {
                var $el = $("<div><input type='radio' name='key' value='1'><input type='radio' name='key' value='2'></div>");
                var model = new TP.Model({key: 2});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input:checked").val()).to.eql("2");
            });

            it("should apply checked state to a checkbox", function()
            {
                var $el = $("<div><input type='checkbox' name='key'></div>");
                var model = new TP.Model({key: true});
                FormUtility.applyValuesToForm($el, model);
                expect($el.find("input").is(":checked")).to.equal(true);
            });

            it("should apply unchecked state to a checkbox", function()
            {
                var $el = $("<div><input type='checkbox' name='key' checked></div>");
                var model = new TP.Model({key: false});
                FormUtility.applyValuesToForm($el, model);
                expect($el.find("input").is(":checked")).to.equal(false);
            });

            it("should apply a string value to a select box", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: 'value'});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("value");
            });

            it("should apply an int value to a select box", function()
            {
                var $el = $("<div><select name='key'><option value='1'>Value</option><option value='2'>Two</option></select></div>");
                var model = new TP.Model({key: 2});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("2");
            });

            it("should add an Unknown entry to a select box when the value is not included in the list", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: '?!?!'});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("?!?!");
                expect($el.has("option[value='?!?!']")).to.be.ok;
            });

            it("should add a blank entry to a select box when the value is ''", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: ''});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("");
                expect($el.has("option[value='']")).to.be.ok;
            });

            it("should add a blank entry to a select box when the value is null", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: null});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("");
                expect($el.has("option[value='']")).to.be.ok;
            });

            it("should add a blank entry to a select box when the value is undefined", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: undefined});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).to.eql("");
                expect($el.has("option[value='']")).to.be.ok;
            });

            it("should support filtering options", function()
            {
                var $el = $("<div><input name='key1' data-modelname='model1' value='originalvalue' /><input name='key2' data-modelname='model2' value='originalvalue' /></div>");
                var model = new TP.Model({key1: 'key1value', key2: 'key2value'});

                FormUtility.applyValuesToForm($el, model, { filterSelector: "[data-modelname=model2]"});

                expect($el.find("input[name=key1]").val()).to.eql("originalvalue");
                expect($el.find("input[name=key2]").val()).to.eql("key2value");
            });
        });

        describe("applyValuesToModel", function()
        {

            it("should apply a value to model from a text box (without a type attribute)", function()
            {
                var $el = $("<div><input name='key' value='newvalue'></div>");
                var model = new TP.Model({key: "oldvalue"});

                FormUtility.applyValuesToModel($el, model);

                expect(model.get("key")).to.eql("newvalue");
            });

            it("should apply a value to model from a text box (with a type attribute)", function()
            {
                var $el = $("<div><input type='text' name='key' value='newvalue'></div>");
                var model = new TP.Model({key: "oldvalue"});

                FormUtility.applyValuesToModel($el, model);

                expect(model.get("key")).to.eql("newvalue");
            });

            it("should apply a numeric value to model from a text box (without a number format attribute)", function()
            {
                var $el = $("<div><input type='text' name='key' value='2'></div>");
                var model = new TP.Model({key: 1});

                FormUtility.applyValuesToModel($el, model);

                expect(model.get("key")).to.equal("2");
            });

            it("should apply a numeric value to model from a text box (with a number format attribute)", function()
            {
                var $el = $("<div><input data-format='number' type='text' name='key' value='2'></div>");
                var model = new TP.Model({key: 1});

                FormUtility.applyValuesToModel($el, model);

                expect(model.get("key")).to.equal(2);
            });

            it("should apply a value to model from a radio button group", function()
            {
                var $el = $("<div><input type='radio' name='key' value='1'><input type='radio' name='key' value='2' checked></div>");
                var model = new TP.Model({key: "1"});

                FormUtility.applyValuesToModel($el, model);
                expect(model.get("key")).to.eql("2");
            });

            it("should apply a value to model from a checked checkbox", function()
            {
                var $el = $("<div><input type='checkbox' name='key' checked></div>");
                var model = new TP.Model({key: false});
                FormUtility.applyValuesToModel($el, model);
                expect(model.get("key")).to.equal(true);
            });

            it("should apply a value to model from an unchecked checkbox", function()
            {
                var $el = $("<div><input type='checkbox' name='key'></div>");
                var model = new TP.Model({key: true});
                FormUtility.applyValuesToModel($el, model);
                expect(model.get("key")).to.equal(false);
            });

            it("should apply a value to model from a select box", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option><option value='anothervalue' selected>Another Value</option></select></div>");
                var model = new TP.Model({key: 'value'});

                FormUtility.applyValuesToModel($el, model);
                expect(model.get("key")).to.eql("anothervalue");
            });

            it("should support filtering options", function()
            {
                var $el = $("<div><input name='key1' data-modelname='model1' value='key1value' /><input name='key2' data-modelname='model2' value='key2value' /></div>");
                var model = new TP.Model({key1: 'originalvalue', key2: 'originalvalue'});

                FormUtility.applyValuesToModel($el, model, { filterSelector: "[data-modelname=model2]"});

                expect(model.get("key1")).to.eql("originalvalue");
                expect(model.get("key2")).to.eql("key2value");
            });

            it("should treat empty strings as null", function()
            {
                var $el = $("<div><input type='text' name='key' value=''></div>");
                var model = new TP.Model({key: "something"});
                FormUtility.applyValuesToModel($el, model);
                expect(model.get("key")).to.equal(null);
            });
        });
    });

});
