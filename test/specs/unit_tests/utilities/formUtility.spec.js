requirejs(
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

                expect($el.find("input").val()).toEqual("value");
            });

            it("should apply a value to text box (with a type attribute)", function()
            {
                var $el = $("<div><input type='text' name='key'></div>");
                var model = new TP.Model({key: "value"});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input").val()).toEqual("value");
            });

            it("should apply a value to a radio button group", function()
            {
                var $el = $("<div><input type='radio' name='key' value='1'><input type='radio' name='key' value='2'></div>");
                var model = new TP.Model({key: "2"});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input:checked").val()).toEqual("2");
            });

            it("should apply a value to a check button", function()
            {
                var $el = $("<div><input type='checkbox' name='key' value='test'></div>");
                var model = new TP.Model({key: true});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("input").val()).toEqual("test");
            });

            it("should apply a value to a select box", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: 'value'});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).toEqual("value");
            });

            it("should add an Unknown entry to a select box when the value is not included in the list", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: '?!?!'});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).toEqual("?!?!");
                expect($el.has("option[value='?!?!']")).toBeTruthy();
            });

            it("should add a blank entry to a select box when the value is ''", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: ''});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).toEqual("");
                expect($el.has("option[value='']")).toBeTruthy();
            });

            it("should add a blank entry to a select box when the value is null", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: null});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).toEqual("");
                expect($el.has("option[value='']")).toBeTruthy();
            });

            it("should add a blank entry to a select box when the value is undefined", function()
            {
                var $el = $("<div><select name='key'><option value='value'>Value</option></select></div>");
                var model = new TP.Model({key: undefined});

                FormUtility.applyValuesToForm($el, model);

                expect($el.find("select").val()).toEqual("");
                expect($el.has("option[value='']")).toBeTruthy();
            });

        });

    });

});
