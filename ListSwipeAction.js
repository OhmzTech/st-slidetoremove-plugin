/*
 Plugin: Ext.plugin.ListSwipeAction
 Version: 3.0.0
 Tested: Sencha Touch 2.4
 Author: OhmzTech (www.ohmztech.com)

 Note: this is an experimental version of the old SlideToRemove plugin.
 This has not yet been optimized or fully tested.
 It is slated to be finalized and merged with Ext JS 6 framework when released.
 */

Ext.define('Ext.plugin.ListSwipeAction', {
    extend: 'Ext.Component',
    alias: 'plugin.listswipeaction',

    requires: ['Ext.Button','Ext.draw.Color','Ext.Anim'],

    config: {

        /**
         * @private
         * @cfg {Ext.List} list Local reference to the List this plugin is bound to
         */
        list: null,

        /**
         * @private
         * @cfg {Ext.data.Record} The active record to perform actions on
         */
        activeRecord: null,

        /**
         * @private
         * @cfg {Object} animations defined on initialization
         */
        animations: null,

        /**
         * @cfg {Array} buttons
         * Array of button components to use
         */
        buttons: [],

        /**
         * @cfg {Boolean/Ext.Button} deleteButton
         * Specific delete button configuration to use, pass true to enable the default delete button
         * Defaults to false (no delete button)
         */
        deleteButton: false,


        /**
         * @cfg {Boolean} singleOpen
         * Flag to only allow a single menu to be open at a time
         * Defaults to true
         */
        singleOpen: true,

        /**
         * @cfg {Boolean} syncDelete
         * When a record is deleted using the preset delete button, the store is synced
         * Defaults to false
         */
        syncDelete: false,

        /**
         * @cfg {string} buttonWidth
         * Default width of any buttons
         */
        buttonWidth: '25%',

        // Default delete button config
        // Any configuration passed through deleteButton merges here
        deleteCfg: {
            xtype: 'button',
            text: 'Delete',
            icon: false,
            ui: 'decline',
            color: 'red'
        }

    },

    init: function(list) {

        // Set the parent list element for this plugin
        this.setList(list);

        // Set the default handler for the delete button
        if(!this.getDeleteCfg().handler) {
            this.getDeleteCfg().handler = Ext.bind(this.onDeleteButtonTap,this);
        }

        // Merge the delete button configuration
        var buttons = this.getButtons().reverse(),
            deleteButton = this.getDeleteButton();
        if(deleteButton) {
            buttons.unshift(Ext.Object.merge((typeof deleteButton == 'object' ? deleteButton : {}),this.getDeleteCfg()));
        }

        // Add listeners
        list.on({
            itemswipe: this.createButtons,
            hide: this.closeButtons,
            refresh: this.closeButtons,
            itemtap: this.checkButtons,
            scope: this
        });

        // Configure animations
        this.setAnimations({
            slideOut: Ext.create('Ext.Anim',{
                autoClear: false,
                duration: 600,
                easing: 'linear',
                from: {'right': '0%' },
                to: {'right': '100%' }
            }),
            slideIn: Ext.create('Ext.Anim',{
                autoClear: false,
                duration: 300,
                easing: 'linear',
                from: {'right': '100%' },
                to: {'right': '0%' }
            })
        });
    },

    createButtons: function(view, index, listItem, rec, e) {
        var element = (!listItem.dom ? listItem.innerElement : target),
            me = this;
        if(!element.down('.x-list-action-wrap')) {

            // Close open buttons if necessary
            if(me.getSingleOpen()) {
                me.closeButtons();
            }

            var buttons = this.getButtons();
            var wrapEl = Ext.DomHelper.append(element, '<div class="x-list-action-wrap" style="position:absolute;top:0px;left:0px;width:100%;height:100%;"></div>');
            var totalBtnRight = 0;
            Ext.each(buttons,function(btn){

                // Determine horizontal positioning
                var btnWidth = btn.width || this.getButtonWidth();
                var right = parseFloat(btnWidth);

                // Create the button and intercept the handler
                var button = this.createButton(wrapEl,rec,btn || btn.config,((totalBtnRight)+String(btnWidth).replace(/[0-9]/g,'')));
                button.setHandler(Ext.Function.createInterceptor(Ext.pass(button.getHandler(),[rec]),function(){
                    me.getList().suspendEvents();
                    setTimeout(function(){
                        me.getList().resumeEvents(true);
                    },1000);
                    if(button.closeOnHandler) {
                        me.toggleButtons({direction: 'right', target: button.element});
                    }
                }));

                // Save the record as active
                this.setActiveRecord(rec);

                // Increment button positioning
                totalBtnRight+=right;

            },this);
        }
        this.toggleButtons(e);
    },

    toggleButtons: function(swipeEvent) {
        var targetEl = Ext.get(swipeEvent.target),
            listItemEl = (targetEl.up('.x-list-item') || targetEl),
            actionWrapEl = listItemEl.down('.x-list-action-wrap'),
            buttonEls = actionWrapEl.select('.x-button').elements;
        if (swipeEvent.direction == 'left') {
            listItemEl.down('.x-innerhtml').setStyle('position','relative');
            this.getAnimations().slideOut.run(listItemEl.down('.x-innerhtml'));
            Ext.each(buttonEls,function(btn,i){
                Ext.getCmp(Ext.get(btn).getId()).show({
                    type: 'slide',
                    duration: (400+(50*i))
                });
            });
        } else if (swipeEvent.direction == 'right') {
            this.getAnimations().slideIn.run(listItemEl.down('.x-innerhtml'));
            var	activeButtons = buttonEls.length;
            Ext.each(buttonEls,Ext.bind(function(btn,i){
                Ext.getCmp(Ext.get(btn).getId()).hide({
                    type: 'slide',
                    duration: (500-(100*i)),
                    direction: 'right',
                    out: true,
                    autoClear: false,
                    listeners: {
                        animationend: function(animation,component) {
                            activeButtons--;
                            Ext.getCmp(component.getId()).destroy();
                            if(activeButtons === 0) {
                                actionWrapEl.destroy();
                                this.getList().resumeEvents(true);
                            }
                        },
                        scope: this
                    }
                });
            },this));
        }
    },

    closeButtons: function(view) {
        view = view || this.getList();
        Ext.DomQuery.select('div[class*=x-list-action-wrap]', view.element.dom).forEach(function(node) {
            Ext.get(node.parentNode).down('.x-innerhtml').setStyle('right','0%');
            node.parentNode.removeChild(node);
        });
    },

    checkButtons: function(view, index, target, rec, e) {
        var btnEl = Ext.get(e.target).hasCls('x-button') ? Ext.get(e.target) : Ext.get(e.target).up('.x-button'),
            tappedButton = Ext.getCmp(btnEl && btnEl.getId ? btnEl.getId() : null);
        if (tappedButton) {
            tappedButton.doTap(tappedButton,e,null);
        } else {
            this.getList().resumeEvents(true);
        }
    },

    onDeleteButtonTap: function(record,btn,e,opts) {
        e.stopEvent();
        this.getList().suspendEvents();
        this.getList().getStore().remove(record);
        this.getList().resumeEvents(true);
        btn.hide();
        this.closeButtons();
        if(this.getSyncDelete()) {
            this.getList().getStore().sync();
        }
    },

    createButton: function(element, record, btnCfg, right) {
        var plugin = this,
            list = plugin.getList();
        var textColor = btnCfg.textColor || (Ext.draw.Color.fly(btnCfg.color).getGrayscale() > 120 ? 'black' : 'white');
        return Ext.create('Ext.Button',Ext.Object.merge({
            text: null,
            height: '100%',
            width: this.getButtonWidth(),
            hidden: true,
            showAnimation: {
                type: 'slide',
                duration: 500
            },
            style: 'border-radius:0px;position:absolute;right:'+right+';border-width:0px;background-color:'+btnCfg.color+';',
            renderTo: element,
            initialize: function() {
                var style = {
                    color: textColor
                };
                this.iconElement.setStyle(style);
                if(this.getIconAlign() == 'center') {
                    style.display = 'inline-block';
                    style['padding-left'] = '6px';
                }
                this.textElement.setStyle(style);
            },
            listeners: {
                swipe: function(event,target) {
                    Ext.pass(this.toggleButtons,[event],this)();
                },
                element: 'element',
                scope: this
            }
        },btnCfg));
    }
});