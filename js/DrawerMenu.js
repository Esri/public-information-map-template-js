define([
    "dojo/Evented",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "esri/kernel",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dojo/on",
    // load template
    "dojo/text!application/dijit/templates/DrawerMenu.html",
    "dojo/dom-construct",
    "dojo/dom-class"
],
function (
    Evented,
    declare,
    lang,
    has, esriNS,
    _WidgetBase, _TemplatedMixin,
    on,
    dijitTemplate,
    domConstruct, domClass
) {
    var Widget = declare("esri.dijit.DrawerMenu", [_WidgetBase, _TemplatedMixin, Evented], {
        templateString: dijitTemplate,
        options: {
            menus: []
        },
        // lifecycle: 1
        constructor: function (options, srcRefNode) {
            // mix in settings and defaults
            var defaults = lang.mixin({}, this.options, options);
            // widget node
            this.domNode = srcRefNode;
            // properties
            this.set("menus", defaults.menus);
            // classes
            this.css = {
                container: 'drawer-menu-container',
                menuItems: 'drawer-menu-buttons',
                menuItemCount: 'drawer-menu-',
                menuItem: 'item',
                menuItemSelected: 'item-selected',
                menuItemContainer: 'item-container',
                menuItemTitle: 'title',
                menuItemArrow: 'arrow',
                menuItemFirst: "item-first",
                menuPanels: 'drawer-menu-panels',
                menuPanel: 'panel',
                menuPanelSelected: 'panel-selected',
                clear: 'clear'
            };
        },
        // start widget. called by user
        startup: function () {
            this._init();
        },
        // connections/subscriptions will be cleaned up during the destroy() lifecycle phase
        destroy: function () {
            this._removeEvents();
            this.inherited(arguments);
        },
        /* ---------------- */
        /* Public Events */
        /* ---------------- */
        // load
        // select
        /* ---------------- */
        /* Public Functions */
        /* ---------------- */
        select: function (index) {
            if (this._nodes && this._nodes.length) {
                // remove all selected menu items
                for (var i = 0; i < this._nodes.length; i++) {
                    domClass.remove(this._nodes[i].button, this.css.menuItemSelected);
                    domClass.remove(this._nodes[i].content, this.css.menuPanelSelected);
                }
                // set menu button selected
                domClass.add(this._nodes[index].button, this.css.menuItemSelected);
                // set menu selected
                domClass.add(this._nodes[index].content, this.css.menuPanelSelected);
                // menu selected
                this.emit('select', {
                    index: index,
                    menu: this.get("menus")[index],
                    nodes: this._nodes[index]
                });
            }
        },
        /* ---------------- */
        /* Private Functions */
        /* ---------------- */
        _removeEvents: function () {
            if (this._events && this._events.length) {
                for (var i = 0; i < this._events.length; i++) {
                    this._events[i].remove();
                }
            }
            this._events = [];
        },
        _createMenuItem: function (index) {
            var menus = this.get("menus");
            if (menus && menus.length) {
                var item = menus[index];
                // container class
                var menuClass = this.css.menuItem;
                var panelClass = this.css.menuPanel;
                // first item
                if (index === 0) {
                    menuClass += ' ' + this.css.menuItemFirst + ' ' + this.css.menuItemSelected;
                    panelClass += ' ' + this.css.menuPanelSelected;
                }
                // create item node
                var button = domConstruct.create('div', {
                    className: menuClass
                });
                domConstruct.place(button, this._buttonsNode, 'last');
                // button container
                var buttonContainer = domConstruct.create('div', {
                    className: this.css.menuItemContainer,
                    title: item.title || ''
                });
                domConstruct.place(buttonContainer, button, 'last');
                // title
                var buttonTitle = domConstruct.create('div', {
                    className: this.css.menuItemTitle,
                    innerHTML: item.label
                });
                domConstruct.place(buttonTitle, buttonContainer, 'last');
                // arrow
                var buttonArrow = domConstruct.create('div', {
                    className: this.css.menuItemArrow
                });
                domConstruct.place(buttonArrow, buttonContainer, 'last');
                // panel content
                var content = domConstruct.create('div', {
                    className: panelClass,
                    innerHTML: item.content
                });
                domConstruct.place(content, this._panelsNode, 'last');
                // clear node
                var clear;
                // if last item
                if (index === (menus.length - 1)) {
                    clear = domConstruct.create('div', {
                        className: this.css.clear
                    });
                    domConstruct.place(clear, this._buttonsNode, 'last');
                }
                // save nodes
                this._nodes.push({
                    button: button,
                    buttonContainer: buttonContainer,
                    buttonTitle: buttonTitle,
                    buttonArrow: buttonArrow,
                    content: content,
                    clear: clear
                });
                // click event
                this._createMenuEvent(index);
            }
        },
        _createMenuEvent: function (index) {
            if (this._nodes[index]) {
                // menu button click
                var clickEvt = on(this._nodes[index].button, 'click', lang.hitch(this, function () {
                    this.select(index);
                }));
                // store event
                this._events.push(clickEvt);
            }
        },
        _init: function () {
            // remove events if any
            this._removeEvents();
            // reference to nodes
            this._nodes = [];
            // menu objects
            var menus = this.get("menus");
            // menus set
            if (menus && menus.length) {
                // add panel count css
                domClass.add(this.domNode, this.css.menuItemCount + menus.length);
                // create menu nodes
                for (var i = 0; i < menus.length; i++) {
                    // create menu item
                    this._createMenuItem(i);
                }
            }
            this.set("loaded", true);
            this.emit("load", {});
        }
    });
    if (has("extend-esri")) {
        lang.setObject("dijit.DrawerMenu", Widget, esriNS);
    }
    return Widget;
});
