/*
 * Copyright 2013 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Aria.classDefinition({
    $classpath : "test.aria.widgets.form.timefield.checkValue.TimeField",
    $extends : "aria.jsunit.TemplateTestCase",
    $constructor : function () {
        this.$TemplateTestCase.constructor.call(this);
        this.data = {
            time1 : null
        };
        this.currentValue;
        this.testValues = [];
        this.checkValues = [];
        this.separators = // ["/", "\\", "h", ";", ",", ".", "-", ":"];
        this.am = ["am", "a.m.", "a m"];
        this.pm = ["pm", "p.m.", "p m"];
        this.start();
        this.setTestEnv({
            data : this.data
        });
    },
    $prototype : {
        start : function () {
            this.check1Digit();
            this.check2Digits();
            this.check3Digits();
            this.check4Digits();
            this.checkAlphabetic();
            this.checkValuesWithAMPM();
        },
        check1Digit : function () {
            var hour, result, i;

            // 1 digit = [h]
            for (i = 0; i < 10; i++) {
                hour = i + '';
                result = '0' + i + ':00';
                this.testValues.push(hour);
                this.checkValues.push(result);
            }
        },
        check2Digits : function () {
            var hour, result, i;

            // 2 digits = [h][h] (works with any of the separators after the first digit only)
            for (i = 24; i > 22; i--) {
                hour = i + '';
                result = i !== 24 ? hour + ':00' : hour;
                this.testValues.push(hour);
                this.checkValues.push(result);
            }
            this.checkValuesWithSeparator(hour);
        },
        check3Digits : function () {
            var hour, result, m;

            // 3 digits = [h][m][m]/[h][h][m] (works with any of the separators after the first/second digit only)
            hour = '1';
            for (m = 60; m > 58; m--) {
                result = '1' + m.charAt(0) + ':' + '0' + m.charAt(1);
                this.testValues.push(hour + m);
                this.checkValues.push(result);
            }
            this.checkValuesWithSeparator(hour + m);
        },
        check4Digits : function () {
            // 4 digits = [h][h]:[m][m] (works with any of the separators after the second digit only)
            var value = "0000";
            var result = "00:00";
            this.testValues.push(value);
            this.checkValues.push(result);
            this.checkValuesWithSeparator(value);
        },
        checkAlphabetic : function () {
            // alphabetic characters are invalid
            this.testValues.push("12b", "b12", "1xx1", "xx");
            this.checkValues.push("12b", "b12", "1xx1", "xx");

        },
        checkValuesWithAMPM : function () {
            var valid = 1;
            var invalid = 17;
            for (var items = 0; items < this.am.length; items++) {
                // valid AM
                this.testValues.push(valid + this.am[items]);
                this.checkValues.push("01:00");

                // invalid AM
                this.testValues.push(invalid + this.am[items]);
                this.checkValues.push(invalid + this.am[items]);

                // valid PM
                this.testValues.push(valid + this.pm[items]);
                this.checkValues.push("13:00");

                // invalid PM
                this.testValues.push(invalid + this.pm[items]);
                this.checkValues.push(invalid + this.pm[items]);
            }
        },
        checkValuesWithSeparator : function (value) {
            for (var s = 0; s < this.separators.length; s++) {
                if (value.length === 2) {
                    // separator between digits 1 and 2
                    this.testValues.push(value.charAt(0) + this.separators[s] + value.charAt(1));
                    this.checkValues.push('0' + value.charAt(0) + ':0' + value.charAt(1));
                }

                if (value.length === 3) {
                    // separator between digits 1 and 2
                    this.testValues.push(value.charAt(0) + this.separators[s] + value.charAt(1) + value.charAt(2));
                    this.checkValues.push('0' + value.charAt(0) + ':' + value.charAt(1) + value.charAt(2));

                    // separator between digits 2 and 3
                    this.testValues.push(value.charAt(0) + value.charAt(1) + this.separators[s] + value.charAt(2));
                    this.checkValues.push(value.charAt(0) + value.charAt(1) + ':0' + value.charAt(2));
                }

                if (value.length === 4) {
                    // separator between digits 2 and 3
                    this.testValues.push(value.charAt(0) + value.charAt(1) + this.separators[s] + value.charAt(2) + value.charAt(3));
                    this.checkValues.push(value.charAt(0) + value.charAt(1) + ':' + value.charAt(2) + value.charAt(3));
                }

                // separator before the value
                this.testValues.push(this.separators[s] + value);
                this.checkValues.push(this.separators[s] + value);

                // separator after the value
                this.testValues.push(value + this.separators[s]);
                this.checkValues.push(value + this.separators[s]);
            }
        },
        runTemplateTest : function () {
            this.onStart();
        },
        onStart : function () {
            this.synEvent.click(this.getInputField("tf1"), {
                fn : function () {
                    this.waitForWidgetFocus("tf1", this.onFieldFocused);
                },
                scope : this
            });
        },
        onFieldFocused : function () {
            var myField = this.getInputField("tf1");
            this.currentValue = this.testValues.shift();
            this.synEvent.type(myField, this.currentValue, {
                fn : this.changeFocus,
                scope : this
            });
        },
        changeFocus : function () {
            var myField = this.getInputField("tf1");
            myField.blur();
            this.waitForWidgetBlur("tf1", function () {
                var value = this.checkValues.shift();
                this.assertTrue(myField.value === value, "After typing '" + this.currentValue + "', the display value '" + value + "' was expected in the timefield and instead the timefield displays '" + myField.value + "'");
                if (this.testValues.length) {
                    this.onStart();
                } else {
                    this.notifyTemplateTestEnd();
                }
            });
        }
    }
});
