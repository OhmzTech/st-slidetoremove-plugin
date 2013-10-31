/*
Plugin: Ext.plugin.SlideToRemove
Version: 1.2.0
Tested: Sencha Touch 2.1
Author: OhmzTech (www.ohmztech.com)
*/

Ext.define('Ext.plugin.SlideToRemove', {
    extend: 'Ext.Component',
    alias: 'plugin.slidetoremove',

    config: {
        list: null,
        handler: null,
        removeText: 'Delete',
        buttonWidth: '25%'
    },
    
    init: function(list) {
        this.setList(list);
        list.getItemTpl().html += '<div class="x-list-delete-comp"></div>';
        list.on({
            itemswipe: this.showDelete,
            itemtouchstart: this.checkDeletes, 
            hide: this.closeDeletes,
            scope: this
        });
    },

    showDelete: function(view, index, target, rec, e) {
        var element = (!target.dom ? target.innerElement : target),
            listElement = element.up('.x-list-item');
        if (e.direction == 'left' && element.down('.x-list-item-remove') === null) {
            var button = this.createButton(listElement,element,rec);
            button.show({
                type: 'slide',
                duration: 500                            
            });        
        } else if (e.direction == 'right' && element.down('.x-list-item-remove')) {
            this.hideDelete(element.down('.x-list-item-remove'));
        }
    },

    hideDelete: function(n) {
        Ext.Anim.run(Ext.get(n), 'slide', {
            out: true,
            duration: 500,
            autoClear: false,
            direction: 'right',
            after: function(el) {
                el.destroy();
            }
        });
    },

    closeDeletes: function(view) {
        Ext.DomQuery.select('div[class*=x-list-delete]', view.element.dom).forEach(function(node) {
            node.parentNode.style.removeProperty('-webkit-transform');
            node.parentNode.removeChild(node);
        });
    },
    
    checkDeletes: function(view,index,target,rec,e) {
        if(e.target.getAttribute('class') && e.target.getAttribute('class').indexOf('button') > -1) {
            view.suspendEvents();
        }
    },
    
    createButton: function(listElement,element,record) {
            return Ext.create('Ext.Button', {
                ui: 'decline',
                cls: 'x-list-item-remove',
                text: this.getRemoveText(),
                height: parseInt(listElement.getStyle('min-height')) - 8,
                margin: 4,
                width: this.getButtonWidth(),
                bottom: ((element.getHeight() - parseInt(listElement.getStyle('min-height'))) / 2),
                right: 0,
                hidden: true,
                showAnimation: {
                    type: 'slide',
                    duration: 500
                },
                renderTo: element.down('.x-list-delete-comp'),
                handler: function(btn) {
                    if (this.getHandler() == null) {
                        this.getList().getStore().remove(record);
                    } else {
                        this.getHandler().call();
                    }
                    Ext.Function.createDelayed(function(){
                        this.getList().resumeEvents(false);
                    },350,this)();
                },
                scope: this
            });       
    }
});