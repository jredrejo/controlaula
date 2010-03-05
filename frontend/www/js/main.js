/*
 * mail.js
 *
 * Copyright (c) 2009-2010 Manu Mora Gordillo <manuito @nospam@ gmail.com>
 * Licensed under the GPL (GPL-LICENSE.txt) license.
 *
 * 
 */

Ext.onReady(function() {
	Ext.QuickTips.init();	
	initScreens();


      tree.setRootNode(root);

      // render the tree
      tree.render('tree');
      root.expand(false,false);
      tree.bodyFocus.fi.setFrameEl(tree.el);
      tree.getSelectionModel().select(tree.getRootNode());
      tree.enter.defer(100, tree);
});
