/**
 * Created by Maxwell on 2016/6/21.
 * 参考http://www.tuicool.com/articles/2eUBjq
 */
/**
 * 投影判断
 * @type {Function}
 */
var Projection = cc.Class.extend({
    min:0,
    max:0,
    ctor:function(min,max){
        this.min = min;
        this.max = max;
    },

    getMin:function(){
        return this.min;
    },

    getMax:function(){
        return this.max;
    },

    overlap:function(proj){
        if(this.min > proj.getMax())    return false;
        if(this.max < proj.getMin())    return false;

        return true;
    }
});

var OBB = cc.Class.extend({
    pList:[],                   //保存盒子4个顶点
    ctor:function() {
        this.pList = [];
        this.pList.push(cc.p(0,0));     //初始化
        this.pList.push(cc.p(0,0));
        this.pList.push(cc.p(0,0));
        this.pList.push(cc.p(0,0));
    },

    getVertex:function(idx){
        return this.pList[idx];
    },

    setVertex:function(idx , x, y)
    {
        this.pList[idx].x = x;
        this.pList[idx].y = y;
    },

    //计算OBB盒的四条边的四个分离轴，你可以看到我这里使用的法向量计算方法是这样的：
    //如果边向量为(x,y)那么法向量为(-y,x)，你也可以设置为(y,-x)。结果没有什么变化。
    getAxies:function(){
        var axies = [cc.p(0,0),cc.p(0,0),cc.p(0,0),cc.p(0,0)];
        for(var i = 0 ; i < 4 ; i++)
        {
            var point = cc.pSub(this.pList[i],this.pList[(i+1)%4]);
            var length = Math.sqrt(point.x*point.x + point.y * point.y);
            var pOut = cc.p(0,0);
            pOut.x = point.x / length ;
            pOut.y = point.y / length ;
            axies[i].x = -pOut.y ;
            axies[i].y = pOut.x ;
        }
        return axies;
    },

    //计算出一个投影线条
    //只是保存了两个float形的数据，分别表示OBB盒在分离轴上投影的最小值和最大值
    getProjection:function(axies){
        var min = cc.pDot(this.pList[0],axies);
        var max = min ;

        for(var i = 1 ; i < 4 ; i ++)
        {
            var temp = cc.pDot(this.pList[i], axies);
            if(temp > max)
                max = temp ;
            else if(temp < min)
                min = temp ;
        }// end for

        return new Projection(min, max);
    },

    //对传递进来的OBB判断是否与调用这个方法的OBB发生了交叉
    isCollidWithOBB:function(obb)
    {
        //Get the seperat axie
        var axies1 = this.getAxies();
        var axies2 = obb.getAxies();

        var p1 = null;
        var p2 = null;
        //Check for overlap for all of the axies
        for(var i = 0 ; i < 4 ; i ++)
        {
            p1 = this.getProjection(axies1[i]);
            p2 = obb.getProjection(axies1[i]);
            if(!p1.overlap(p2))
            {
                return false ;
            }
        }

        for(var j = 0 ; j < 4 ; j ++)
        {
            p1 = this.getProjection(axies2[j]);
            p2 = obb.getProjection(axies2[j]);
            if(!p1.overlap(p2))
            {
                return false ;
            }
        }
        return true ;
    }
});

var TestUI = cc.Layer.extend({
    ctor:function(){
        this._super();

        this.sprite1 = new cc.LayerColor(cc.color(255,0,255,255),128,128);
        //this.sprite1 = new cc.Sprite("res/texture/zhaoyun_bomb_bg.png");
        this.addChild(this.sprite1);
        this.sprite1.setPosition(300,300);
        this.sprite1.runAction(cc.sequence(cc.rotateBy(8,360)).repeatForever());

        this.sprite2 = new cc.LayerColor(cc.color(255,0,255,255),128,128);
        //this.sprite2 = new cc.Sprite("res/texture/zhaoyun_bomb_bg.png");
        this.addChild(this.sprite2);
        this.sprite2.setPosition(470,300);
        this.sprite2.runAction(cc.sequence(cc.rotateBy(6,360)).repeatForever());

        //创建两obb盒子
        this.obb1 = new OBB();
        this.obb2 = new OBB();

        this.scheduleUpdate();
    },

    update:function(dt){
        //Collision Check
        var pt = this.sprite1.convertToWorldSpace(cc.p(0,0));
        this.obb1.setVertex(0, pt.x, pt.y);
        pt = this.sprite1.convertToWorldSpace(cc.p(128,0));
        this.obb1.setVertex(1, pt.x, pt.y);
        pt = this.sprite1.convertToWorldSpace(cc.p(128,128));
        this.obb1.setVertex(2, pt.x, pt.y);
        pt = this.sprite1.convertToWorldSpace(cc.p(0,128));
        this.obb1.setVertex(3, pt.x, pt.y);

        pt = this.sprite2.convertToWorldSpace(cc.p(0,0));
        this.obb2.setVertex(0,pt.x, pt.y);
        pt = this.sprite2.convertToWorldSpace(cc.p(128,0));
        this.obb2.setVertex(1,pt.x, pt.y);
        pt = this.sprite2.convertToWorldSpace(cc.p(128,128));
        this.obb2.setVertex(2,pt.x, pt.y);
        pt = this.sprite2.convertToWorldSpace(cc.p(0,128));
        this.obb2.setVertex(3,pt.x, pt.y);

        if(this.obb1.isCollidWithOBB(this.obb2))
        {
            this.sprite1.setColor(cc.color(0,0,255,255));
            this.sprite2.setColor(cc.color(0,0,255,255));
        }else{
            this.sprite1.setColor(cc.color(255,0,255,255));
            this.sprite2.setColor(cc.color(255,0,255,255));
        }
    }
});