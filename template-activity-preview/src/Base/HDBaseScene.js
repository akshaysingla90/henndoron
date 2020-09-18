var HDBaseScene = cc.Scene.extend({
    size : null,
    ctor : function(){
        this._super();
        this.size = cc.winSize;
    },

    onEnter : function(){
        this._super();
    },

    onExit : function(){
        this._super();
    }

});
