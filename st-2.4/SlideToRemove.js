/*
Plugin: Ext.plugin.SlideToRemove
Version: 1.4.0
Tested: Sencha Touch 2.4
Author: OhmzTech (www.ohmztech.com)
*/

Ext.define('Ext.plugin.SlideToRemove', {
    extend: 'Ext.Component',
    alias: 'plugin.slidetoremove',
	requires:'Ext.Anim',
    config: {
        list: null,
        removeText: 'Delete',
        buttonWidth: '25%',
		btnIcon:'',
		btnUi:'decline',
		hideDeletesOnTap:false,
		itemTapFn:''
    },
    deleteCount:0,
    init: function(list) {
        this.setList(list);
        list.on({
            itemswipe: this.showDelete,
			itemtap:this.itemTapHandler,
            itemtouchstart: this.checkDeletes, 
            hide: this.closeDeletes,
            scope: this
        });
		
    },

    showDelete: function(view, index, target, rec, e) {
        var element = (!target.dom ? target.innerElement : target);       
        if (e.direction == 'left' && element.down('.x-list-item-remove') === null) {
            Ext.DomHelper.append(element,'<div class="x-list-delete-comp"></div>');
            var button = this.createButton(element,rec);
            button.show({
                type: 'slide',
                duration: 500                            
            });
			this.deleteCount += 1;      
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
            	var parentEl = el.up('.x-list-delete-comp');
                Ext.getCmp(el.getId()).destroy();
                parentEl.destroy();
            }
        });
		this.deleteCount -= 1;    
    },

    closeDeletes: function(view) {
        Ext.DomQuery.select('div[class*=x-list-delete]', view.element.dom).forEach(function(node) {
            node.parentNode.style.removeProperty('-webkit-transform');
            node.parentNode.removeChild(node);
        });
		this.deleteCount = 0;
		
    },
    
    checkDeletes: function(view,index,target,rec,e) {
		if(Ext.get(e.target).hasCls('x-button')) {
            view.suspendEvents();
        } 
    },
    createButton: function(element,record) {
            return Ext.create('Ext.Button', {
                ui: this.getBtnUi(),
                cls: 'x-list-item-remove',
                text: this.getRemoveText(),
                height: parseInt(element.getStyle('min-height')) - 8,
				iconCls:this.getBtnIcon(),
                width: this.getButtonWidth(),
                bottom: ((element.getHeight() - parseInt(element.getStyle('min-height'))) / 2),
                right: 0,
                hidden: true,
                showAnimation: {
                    type: 'slide',
                    duration: 500
                },
                renderTo: element.down('.x-list-delete-comp'),
                handler: function(btn,e) {
                    e.preventDefault();e.stopPropagation();
                    this.getList().getStore().remove(record);
                    Ext.Function.createDelayed(function(){
                        this.getList().resumeEvents(false);
                        btn.hide();
                    },350,this)();
                },
                scope: this
            });       
    },
	itemTapHandler: function(view,index,target,rec,e){
        if (this.getItemTapFn()) {
			if ( (this.deleteCount > 0) && this.getHideDeletesOnTap()){
				this.closeDeletes(view);
			}
			else {
				//Call itemTapFn
				this.getItemTapFn().call(this, view,index,target,rec,e);
			}
        } else {    
            return;
        }
	}
});
