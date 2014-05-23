/*global define*/
;(function(window, document, undefined) {

    "use strict";

    var _, hoopear, dialog, note, block,
        HTMLBody = document.body, supportedTrans = '',

    _createElement = function(wrapper) {
        var element;
        if(typeof wrapper === "object")
        {
            if(typeof wrapper.tag !== "undefined")
                element = document.createElement(wrapper.tag);
            if(typeof wrapper.klass !== "undefined")
                element.className = wrapper.klass;
            if(typeof wrapper.content !== "undefined")
                element.innerHTML = wrapper.content;
        }
        else
            element = document.createElement(wrapper);
        return element;
    },
    _getElement = function (selector) {
        return document.querySelector(selector);
        //return document.getElementById(id);
    },
    _appendElement = function(target, element) {
        target.appendChild(element);
    },
    _prependElement = function(target, element) {
        target.insertBefore(element, target.firstChild);
    },
    _removeElement = function(element) {
        element.parentNode.removeChild(element);
    },
    _addClass = function(element, klass) {
        if (!_hasClass(element, klass))
            element.className += ' ' + klass;
    },
    _removeClass = function(e, klass) {
        e.className = e.className.replace(new RegExp('(\\s|^)' + klass + '(\\s|$)'), ' ');
    },
    _hasClass = function (element, klass) {
        return element.className.match(new RegExp('(\\s|^)' + klass + '(\\s|$)'));
    },
    /*_setAttributes = function (el, attrs) {
        for (var key in attrs) el.setAttribute(key, attrs[key]);
    },
    _prevent = function (event) {
        if (event)
            if (event.preventDefault)
                event.preventDefault();
            else
                event.returnValue = false;
    },*/
    _on = function (element, event, fn) {
        if (document.addEventListener){
            element.addEventListener(event, fn, false);
        } else if (document.attachEvent){
            element.attachEvent("on" + event, fn);
        }
    },
    _off = function (element, event, fn) {
        if (document.removeEventListener) {
            element.removeEventListener(event, fn, false);
        } else if (document.detachEvent) {
            element.detachEvent("on" + event, fn);
        }
    },
    _transition = function () {
        if (supportedTrans == '')
        {
            var fakeElement = _createElement('hoopear'),
                transEndEventNames = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition'    : 'transitionend',
                    'OTransition'      : 'oTransitionEnd otransitionend',
                    'transition'       : 'transitionend'
                },
                transName, returns = false;

            for (transName in transEndEventNames)
                if (fakeElement.style[transName] !== undefined)
                    returns = transEndEventNames[transName];

            // save for another call
            supportedTrans = returns;

            return returns; // explicit for ie8 (  ._.)
        }
        else
            return supportedTrans;
    },
    _extend = function () {
        for (var i = 1; i < arguments.length; i++)
            for (var key in arguments[i])
                if (arguments[i].hasOwnProperty(key))
                    arguments[0][key] = arguments[i][key];
        return arguments[0];
    },
    _show = function (element) {
        // using timeout to wait till the element is available
        //setTimeout(function(){ _addClass(element, "in"); }, 0); not work on firefox
        if (element && element.scrollTop !== null) {
            if (_transition()) _addClass(element, "in"); // using css transition if supported
            else _fade(element, true); // else using js fade in
        } else
            _show(element);
    },
    _hide = function (element, callback) {
        if (_transition()) {
            _removeClass(element, "in");
            _on(element, _transition(), callback);
        } else
            _fade(element, false);
    },
    _fade = function (element, fadeIn) {
        element.style.right = 0;
        var op = !fadeIn ? 0.9 : 0.1, // initial opacity
            timer = setInterval(function () {
                if ((op <= 0) || (op >= 1)) {
                    clearInterval(timer);
                    if (!fadeIn) _removeElement(element);
                }
                element.style.opacity = op;
                element.style.filter = 'alpha(opacity=' + op * 100 + ")";
                op = !fadeIn ? op - 0.1 : op + op * 0.3;
            }, 30);
    };

    dialog = (function () {

        var config, defaults, elContainer, elHeader,
            elTitle, elCross, elBody, elFooter, elOverlay,
            fnInit, fnCreate, fnClose;

        defaults = {
            width : "400px",
            message : "",
            /*type : "alert",
            title : {
                alert : "Alert",
                confirm : "Confirmation",
                prompt : "Prompt"
            },*/
            title : false,
            cross : true,
            buttons : ["close"],
            wrapper : {
                overlay : { tag: "div", klass: "hoopear-overlay" },
                container : { tag: "div", klass: "hoopear-dialog" },
                header : { tag: "div", klass: "hoopear-dialog-header" },
                title : { tag: "h3", klass: "hoopear-dialog-title" },
                body : { tag: "div", klass: "hoopear-dialog-body" },
                footer : { tag: "div", klass: "hoopear-dialog-footer" },
                cross : { tag: "button", klass: "hoopear-dialog-cross", content: "&times;" },
                button : { tag: "a", klass: "hoopear-dialog-button" }
            }
        };

        fnInit = function () {
            elOverlay = _createElement(config.wrapper.overlay);
            _appendElement(HTMLBody, elOverlay);
            return elOverlay;
        };

        fnCreate = function (options) {
            config = _extend({}, defaults, options);
            elOverlay = elOverlay || fnInit();
            _removeClass(elOverlay, "hide");
            elOverlay.className = config.wrapper.overlay.klass + " in";
            _on(elOverlay, "click", fnClose);

            //--------------------------------------------------------------------------------

            elContainer = _createElement(config.wrapper.container);
            _addClass(elContainer, config.type);
            elContainer.style.width = config.width;

            // stop event from overlay when click on modal
            _on(elContainer, "click", function (e) { e.stopPropagation(); });

            //--------------------------------------------------------------------------------

            if (config.title !== false)
            {
                //config.wrapper.title.content = ((typeof config.title === "string") ? config.title : config.title[config.type]);
                config.wrapper.title.content = config.title;
                elTitle = _createElement(config.wrapper.title);
                elHeader = _createElement(config.wrapper.header);
                if(config.cross === true)
                {
                    elCross = _createElement(config.wrapper.cross);
                    _appendElement(elHeader, elCross);
                    _on(elCross, "click", fnClose);
                }
                _appendElement(elHeader, elTitle);
                _appendElement(elContainer, elHeader);
            }

            //--------------------------------------------------------------------------------

            config.wrapper.body.content = config.message;
            elBody = _createElement(config.wrapper.body);
            _appendElement(elContainer, elBody);

            //--------------------------------------------------------------------------------

            // generate footer with button inside
            if (config.buttons !== false)
            {
                elFooter = _createElement(config.wrapper.footer);
                /*for(i=0; i<config.buttons.length; i++) {
                    btnConfig = config.wrapper.button;
                    if (typeof config.buttons[i] === "object")
                        btnConfig = _extend({}, btnConfig, config.buttons[i]);
                    else btnConfig.caption = config.buttons[i];
                    btnConfig.content = btnConfig.caption;
                    btn = _createElement(btnConfig);
                    _on(btn, "click", fnClose);
                    if(typeof btnConfig.action == "function")
                        _on(btn, "click", btnConfig.action);
                    _appendElement(elFooter, btn);
                }*/

                var btnConfig = config.buttons,
                    btnCaption, btnCallback,
                    btnPrep, btn;

                for(btnCaption in btnConfig) {
                    btnPrep = config.wrapper.button;
                    btnCallback = btnConfig[btnCaption];
                    // set button caption
                    btnPrep.content = (typeof btnCallback == "function") ? btnCaption : btnConfig[btnCaption];
                    btn = _createElement(btnPrep);
                    _on(btn, "click", fnClose);
                    if(typeof btnCallback == "function")
                        _on(btn, "click", btnCallback);
                    _appendElement(elFooter, btn);
                }
                _appendElement(elContainer, elFooter);
            }

            //--------------------------------------------------------------------------------

            _appendElement(elOverlay, elContainer);
            _show(elContainer);
        };

        fnClose = function (event) {
            _off(this, "click", fnClose);
            _off(elOverlay, "click", fnClose);

            _hide(elContainer, function (e) {
                if (e.propertyName == 'opacity')
                {
                    _removeClass(elOverlay, "in");
                    _addClass(elOverlay, "hide");
                    _removeElement(elContainer);
                }
            });

            var source = event.target || event.srcElement;
            if (_hasClass(source, config.wrapper.button.klass))
                if (typeof config.callback == "function")
                    config.callback(source.innerHTML);
            else
                return false;
        };

        return function (options) { return fnCreate(options) }

    }());

    note = (function () {

        var defaults, elParentNormal, elParentInline, elChild,
            fnInit, fnCreate, fnClose;

        defaults = {
            //width     : "auto",
            timeout   : 4000,
            message   : "",
            type      : "",
            container : false,
            prepend   : false,
            maxItems  : 3,
            wrapper   : {
                container : { tag: "div", klass: "hoopear-notes" },
                items : { tag: "div", klass: "hoopear-note" }
            }
        };

        // init parent element
        fnInit = function () {
            elParentNormal = _createElement(defaults.wrapper.container);
            _appendElement(HTMLBody, elParentNormal);
            return elParentNormal;
        };

        // create item
        fnCreate = function (options) {
            //extend config with global config
            var config = _extend({}, defaults, options), elParent;

            //check note type
            config.type = ((typeof config.type === "string" && config.type !== "") ? " " + config.type : "");
            // create item element add klass
            elChild = _createElement(config.wrapper.items);
            elChild.className = config.wrapper.items.klass + config.type;
            //elChild.style.width = config.width;

            elChild.innerHTML = (typeof options === "string") ? options : config.message;

            // check inline message or not
            if (config.container === false)
            {
                elParentNormal = elParentNormal || fnInit(); //check if wrapper alrady exist
                elParent = elParentNormal;
            }
            else
            {
                elParentInline = _getElement(config.container);
                elParent = elParentInline;
            }

            var currItems = elParent.getElementsByClassName(config.wrapper.items.klass).length;
            //console.log(currItems);

            if (config.prepend)
            {
                if (currItems >= config.maxItems)
                    //_removeElement(elParent.lastChild);
                fnClose(elParent.lastChild, -1);
                _prependElement(elParent, elChild);
            }
            else
            {
                if (currItems >= config.maxItems)
                    //_removeElement(elParent.firstChild);
                fnClose(elParent.firstChild, -1);
                _appendElement(elParent, elChild);
            }

            //add animation class
            _show(elChild);

            // add listener to close event
            fnClose(elChild, config.timeout);
        };

        // close item
        fnClose = function (element, wait) {
            // this sets the hide klass to transition out
            // or removes the child if css transitions aren't supported
            var hideItem = function (e) {
                e = this || e; // handle element from timeout or from click
                _off(e, "click", hideItem);
                clearTimeout(timer);
                _hide(e, function(event) {
                    // stop from removing element every event property transition
                    if (event.propertyName == 'opacity') _removeElement(e);
                });
            };
            // remove imediatly if wait == false
            if (wait == -1)
            {
                hideItem(element);
                return;
            }
            // set click event on log messages
            _on(element, "click", hideItem);
            // Unary Plus: +"2" === 2
            wait = (wait && !isNaN(wait)) ? + wait : config.timeout;
            // never close (until click) if wait is set to 0
            if (wait === 0) return;
            // set timeout to auto close the log message
            var timer = setTimeout(function () { hideItem(element); }, wait);
        };

        return function (options) { fnCreate(options); };

    }());

    block = (function () {

        var elOverlay, elInner, elContainer,
            config, defaults,
            fnCreate, fnRemove;

        defaults = {
            closeable : false,
            container : false,
            parentClass : "hoopear-block-parent",
            message : "Loading..",
            overlay : { tag: "div", klass: "hoopear-block" },
            inner : { tag: "div", klass: "inner" }
        };

        // create block loading
        fnCreate = function (options) {
            //extend config with global config
            config = _extend({}, defaults, options);

            // prevent from multiple block element
            if (_getElement("." + config.overlay.klass)) return false;

            config.inner.content = config.message;

            //create overlay and inner message
            elOverlay = _createElement(config.overlay);
            elInner = _createElement(config.inner);
            _appendElement(elOverlay, elInner);

            // check if page block or content block
            if (config.container !== false) {
                elContainer = _getElement(config.container);
                _addClass(elContainer, config.parentClass);
                _addClass(elOverlay, "inline");
            } else {
                elContainer = HTMLBody;
            }

            // place block element to the container
            _appendElement(elContainer, elOverlay);
            _show(elOverlay);

            // set click event on the block element
            if (config.closeable)
                _on(elOverlay, "click", fnRemove);
        };

        // remove block element
        fnRemove = function () {
            //elOverlay = document.querySelector(".hoopear-block");
            if (elOverlay) {
                elContainer = elOverlay.parentNode;

                _hide(elOverlay, function(event) {
                    // stop from removing element every event property transition
                    if (event.propertyName == 'opacity')
                    {
                        _removeElement(elOverlay);
                        _removeClass(elContainer, config.parentClass);
                    }
                });
            }
        };

        return {
            create: function (options) { return fnCreate(options); },
            remove: function () { return fnRemove(); },
            defaults: function (options) {
                defaults = _extend({}, defaults, options);
                return this;
            }
        }

    }());

    hoopear = {
        dialog  : dialog,
        note    : note,
        block   : block.create,
        unblock : block.remove
    };

    window.hoopear = hoopear;

})(window, document);