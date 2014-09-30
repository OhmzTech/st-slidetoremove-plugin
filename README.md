st-slidetoremove-plugin
=======================

Slide to Remove Plugin for Sencha Touch Lists

SlideToRemove is a simple plugin for Sencha Touch 2 that adds the ability to swipe list items to remove them upon confirmation, very similiar to the native iOS controls seen on iPhones/iPads.

*Currently supports Sencha Touch 2.1 & 2.2*<br/>
<b>*Make sure you use the file for the correct version until they can be combined!*</b>

Usage Notes:<br/>
1. Add this plugin to any list.<br/>
2. User can now swipe the list item to display delete button, and swipe it back to hide the delete button. Multiple delete buttons can be open at one time.<br/>
3. Set removeText in plugin configuration to change text on the delete button, and buttonWidth to change the width of the button.<br/>
4. Easily change the button configuration manually in this plugin for advanced customization.<br/>
5. By default the handler for the button will remove the record from the store.<br/>
6. The closeDeletes method will close all open delete buttons.

<b>2.4 Version - Adds more customization, only tested with Sencha 2.4</b>
Can specify 
-btnUI
-btnIcon
-hideDeletesOnTap (iOS like list functionality)
-itemTapFn (used in conjuntion with hideDeltesOnTap)

Usage Example:<br/>
<pre>
Ext.create('Ext.List', {
    store: 'Bookmarks',
    plugins: {
        xclass: 'Ext.plugin.SlideToRemove',
        buttonWidth: '40%',
        removeText: 'Remove'
    },
    itemTpl: new Ext.XTemplate(
        '<b>{Title}</b>'
    )
});
</pre>
