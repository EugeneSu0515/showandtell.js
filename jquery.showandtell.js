/**
 * jquery.hide-event.js
 * Currently supported hides: hide, fadeOut, slideUp, remove, toggle, fadeToggle, slideToggle,
 *     css (display), animate (height: hide, opacity: hide).
 * When a hide `h` is called, the event "hide" is triggered, with the additional parameter ["h"]. If it is
 * called as an action, the second parameter will be "action". If it is set as a CSS property it will be
 * "css".
 * TODO: Setting of the style attribute .style(...)
 * TODO: Class toggles: .addClass('hidden'), .toggleClass(...), etc.
 * TODO: Consider Mutation Observer https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 * TODO: Figure out if http://weblog.west-wind.com/posts/2008/Sep/12/jQuery-CSS-Property-Monitoring-Plugin-updated
 *     is an alernative. (Project seems to be closed, maybe rewrite?)
 */
(function ($) {

    function applyIfExistsOrNull(fun, self, args) {
        return typeof fun !== "undefined" ? fun.apply(self, args) : null;
    }

    function proxy$Functions(functionProxies) {
        $.each(functionProxies, function(old_function_name, proxy_settings) {
            var old_function = $.fn[old_function_name];

            $.fn[old_function_name] = function() {
                var pre_result = applyIfExistsOrNull(proxy_settings.pre, this, arguments);

                var result = old_function.apply(this, arguments);

                var postArguments = [result, pre_result, arguments];
                applyIfExistsOrNull(proxy_settings.post, this, postArguments);

                return result;
            }
        });
    }

    function checkIfElementWasHidden() {
        return $(this).is(":hidden");
    };

    //Only register if not already registered
    if(!$.showandtell) {

        //Indicate that showandtell has been registered.
        $.showandtell = true;

        proxy$Functions({
            hide: {
                pre: checkIfElementWasHidden,
                post: function(result, elementWasHidden, old_args) {
                    if(!elementWasHidden)
                        this.trigger("hide",{
                            type: "action"
                        });
                }
            },
            show: {
                pre: checkIfElementWasHidden,
                post: function(result, elementWasHidden, old_args) {
                    if(elementWasHidden)
                        this.trigger("show",{
                            type: "action"
                        });
                }
            },
            remove: {
                //Remove has to trigger event before removing. After removal, there is no element to
                //  trigger the event on.
                pre: function(old_args) {
                    this.trigger("remove",{
                        type: "action"
                    });
                }
            },
            css: {
                pre: checkIfElementWasHidden,
                post: function(result, elementWasHidden, old_args) {
                    if(!elementWasHidden && old_args[0] == "display" && old_args[1] == "none")
                        $(this).trigger("hide",{
                            type: "css"
                        });

                    if(elementWasHidden && old_args[0] == "display" && old_args[1] != "none")
                        $(this).trigger("show",{
                            type: "css"
                        });
                }
            }
        });

    }
})(jQuery);