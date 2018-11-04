/**
 * Created by dell on 2018/3/21.
 */

var CreatePuzzle = function(dom){
    this.domObj = {
        importImage:dom.importImage,
        start:dom.start,
        again:dom.again,
        finish : dom.finish,
        gameClass :dom.gameClass
    };
    this.baseConfig={
        imgStyle :{}
    };
};
CreatePuzzle.prototype = {
    /*创建拼图*/
    create:function(row,col){
        var _this = this;
        //向原型链存入row，col
        _this.row = row;
        _this.col = col;
        _this.blcokNum = row * col;
        //创建存放散乱拼图、拼图结果的底面板
        _this.createBasePanel(_this.row,_this.col);
    },

    /*****************************************************
     * 功能介绍：获取被分割之前的原图像
     * 参数：evt,parentId,id,cfg
     * ****************************************************/
    getImage:function(evt,parentId,id,cfg){
        var _this = this;
        var files=cfg?cfg.files:evt.target.files;
        if(!files){
            //todo 弹窗
            alert("图片不存在！");
            return;
        }
        var config ={
            files:files
        };
        _this.baseConfig["imgStyle"] =config;
        //todo 设置图片长宽
        for(var i=0, file; file=files[i]; i++){
            var imageDom=new Image();
            //创建对应图片路径
            var imageSrc=window.URL.createObjectURL(file);
            imageDom.src=imageSrc;
            imageDom.id = id;
            document.getElementById(parentId).appendChild(imageDom);
            document.getElementById(id).style.width =_this.computeSize(parentId).allWidth+"px";
            document.getElementById(id).style.height =_this.computeSize(parentId).allHeight+"px";
            document.getElementById(id).style.display = "block";
        }
    },
    /*****************************************************
     * 功能介绍：拼图div位置样式生成器
     * 参数：id：存放拼图的区域id
     * ****************************************************/
    createNumber:function(){
        var _this = this;
        var arr = [];
        for(var i=0;i<_this.blcokNum;i++){
            arr.push(i);
        }
        return arr;
    },

    /*****************************************************
     * 功能介绍：拼图div位置样式生成器
     * 参数：id：存放拼图的区域id
     * ****************************************************/
    createSplitPosition:function(id){
        var _this = this;
        //存放拼图div位置的对数组
        var positionArr = [];
        var splitLeft,splitTop;
        //获取拼图所在区域的宽和高
        var maxWidth = document.getElementById(id).offsetWidth;
        var maxHeight = document.getElementById(id).offsetHeight;
        //获取每个拼图的宽和高
        var splitWidth = _this.computeSize("resultBox").splitWidth;
        var splitHeight = _this.computeSize("resultBox").splitHeight;
        // todo 这个方法没有用，只能保证完全不重叠，校验拼图位置是否重叠
        var checkIsOverlap = function(comparArr){
            //自定义生成0至maxWidth-splitWidth的left和toop值，确定每个拼图的在一个区域的位置
            var left = parseInt(_this.randomNumBoth(0, maxWidth - splitWidth));
            var top = parseInt(_this.randomNumBoth(0, maxHeight - splitHeight));
            var len = comparArr.length;
            //使用百分比定位，响应式
            //获取sour的宽、高实际
            if(len!=0){
                for(var i=0;i<len;i++){
                    if(left>=comparArr[i].left &&left<=comparArr[i].left+splitWidth
                        &&top>=comparArr[i].top && top<=comparArr[i].top+splitHeight){
                        //重新生成left、top且进行校验，
                        checkIsOverlap(comparArr);
                    }else{
                        return {
                            left:left,
                            top:top
                        };
                    }
                }
            }
            return {
                left:left,
                top:top
            };
        };
        for(var i=0;i<_this.blcokNum;i++) {
            //校验拼图位置是否重叠，若是重叠则重新生成
            splitLeft = checkIsOverlap(positionArr).left;
            splitTop = checkIsOverlap(positionArr).top;
            positionArr.push({
                left:splitLeft,
                top :splitTop,
                num : i
            })
        }
        return positionArr;
    },

    /*****************************************************
     * 功能介绍：拼图旋转角度样式生成器,返回[{0:"0-3"},...,{n-1:"0-3"}]
     * 参数：id：存放拼图的区域id
     * ****************************************************/
    createSplitTranslate:function(){
        var _this = this;
        var translateArr = [];
        var num= _this.blcokNum;//拼图个数
        //获取0-3整数，旋转90度的倍数
        var angleNum,angle;
        //生成拼图个数个随机角度
        for(var i=0;i<num;i++){
            angleNum = parseInt(_this.randomNumBoth(0,3));
            translateArr.push({
                num:i,
                angleNum:angleNum
            })
        }
        return translateArr;
    },

    //创建每一个拼图
    createImage : function(idNum,partentDom){
        var _this = this;
        var setImagePlace = function(num,imageDom,partentDom){
            /*nuum/每一行个数=商...余数；
            * image的right=商*splitWidth
            * image的top=余数*splitHeight
            * */
            var rightNum = num%_this.col;
            var topNum = parseInt(num/_this.col);
            var partentWidth = partentDom.offsetWidth;
            var partentHeight = partentDom.offsetHeight;
            imageDom.style.position = "relative";
            imageDom.style.right = rightNum*partentWidth +"px";
            imageDom.style.top = -topNum*partentHeight+"px";
        };
        //获取原img的dom
        var image = document.getElementById("showImage");
        //创建n个拼图
        var newImage = new Image();
        newImage.id='splitImage_'+idNum;
        newImage.src =image.src;
        partentDom.appendChild(newImage);
        //设置每个拼图的宽、高
        var imageDom = document.getElementById(newImage.id);
        imageDom.draggable = false;
        imageDom.style.width =_this.computeSize("resultBox").allWidth+"px";
        imageDom.style.height =_this.computeSize("resultBox").allHeight+"px";
        var num = partentDom.getAttribute("number");
        setImagePlace(num,imageDom,partentDom);
    },

   /*创建散乱拼图、完整拼图的底面板*/
    createBasePanel : function(row,col){
        //获取需要创建的总共div个数
        var _this = this;
        var allBlockNum = _this.blcokNum;
        //获取图片分割区域的dom
        var sourDom = document.getElementById("sourBox");
        var resultDom = document.getElementById("resultBox");
        //清除父节点下的所有div子节点
        _this.clearChildNode(sourDom,"DIV");
        //获取原图片
        var isImage = document.getElementById("showImage");
        if(isImage){
            //隐藏分割前的原图片
            isImage.style.display = "none";
            var rowDom,colDom,rowID,splitDom,imgId,imgDom;
            //num用来后期校验拼图是否成功,从0开始
            var num = 0;
            //创建每个拼图的样式{left：，top：，num：}
            var splitStyle = _this.createSplitPosition("sourBox");
            var splitAngle = _this.createSplitTranslate();
            //设置每个拼图的位置\
            //idnex：当前的拼图的索引
            //styleArr：样式数组
            var setSplitPosition = function(dom,index,styleArr){
                var len = styleArr.length;
                for(var i= 0;i<len;i++){
                    if(index ==styleArr[i].num){
                        dom.style.position = 'absolute';
                        dom.style.left = styleArr[i].left+"px";
                        dom.style.top = styleArr[i].top+"px";
                    }
                }
            };
            //设置每个拼图旋转的角度
            //idnex：当前的拼图的索引
            //styleArr：样式数组
            var setSplitAngle = function(dom,index,styleArr){
                var len = styleArr.length;
                var tempAngle;
                for(var i= 0;i<len;i++){
                    if(index ==styleArr[i].num){
                        tempAngle = styleArr[i].angleNum*90%360;
                        dom.style.transform = 'rotate('+tempAngle+'deg)';
                    }
                }
            };

            /*生成无序位置的拼图*/
            //根据总个数创建n个分割拼图
            for(var k =0;k<allBlockNum;k++){
                splitDom = document.createElement("div");
                splitDom.id ="splitBox_"+k;
                splitDom.className ="splitImage_box";
                //分割的图片宽高=目的区域的宽高
                splitDom.style.width =_this.computeSize("resultBox").splitWidth+"px";
                splitDom.style.height = _this.computeSize("resultBox").splitHeight+"px";
                /*拼图源面板的顺序,随机分布*/
                splitDom.setAttribute("number",k);
                //随机分布每个拼图，但需要保证位置不重叠
                setSplitPosition(splitDom,k,splitStyle);
                sourDom.appendChild(splitDom);
                var partDom = document.getElementById(splitDom.id);
                //向每个拼图div存放图片
                _this.createImage(k,partDom);
                //旋转拼图
                imgId = "splitImage_"+k;
                imgDom = document.getElementById(imgId);
                setSplitAngle(imgDom,k,splitAngle);
                //添加鼠标按下事件
                _this.moveEvent(splitDom);
                //添加双击鼠标按下事件
                _this.dbClickEvent(splitDom);
            }
            /*生成结果位置的拼图*/
            for(var i=0;i<row;i++){
                rowDom = document.createElement("div");
                rowDom.id = "block_row_resultBox"+i;
                //设置行的长度、宽度
                rowDom.style.width = _this.computeSize("resultBox").allWidth+"px";//todo width+最大边框值（1px）
                rowDom.style.height = _this.computeSize("resultBox").splitHeight+"px";
                //添加到游戏区域的dom下
                resultDom.appendChild(rowDom);
                for(var j=0;j<col;j++){
                    colDom = document.createElement("div");
                    colDom.id = "block_resultBox"+"_"+i+"_"+j;
                    //边界分隔开
                    colDom.className = "block_col";
                    //设置新创建的div的css属性
                    colDom.style.width = _this.computeSize("resultBox").splitWidth+"px";
                    colDom.style.height = _this.computeSize("resultBox").splitHeight+"px";
                    rowID = "block_row_resultBox"+i;//行id
                    document.getElementById(rowID).appendChild(colDom);
                    /*拼图结果区域面板*/
                    colDom.setAttribute("number",num++);
                }
            }
        }else{
            alert("请导入图片，再开始游戏。");
        }
    },

    /* todo 检查上传图片是否符合规格（宽、高、清晰度）*/
    checkImage:function(){

    },

    /*****************************************************
     * 功能介绍：计算分割的每一块的宽、高
     * 参数：id：存放完整图片dom的id
     * ****************************************************/
     computeSize:function(id){
         var _this = this;
         //todo 可以提出
         var dom = document.getElementById(id);
         var width = dom.offsetWidth,
             height = dom.offsetHeight;
         //todo 是否可以使用百分比
         var splitWidth = Math.round(width/_this.col);//比实际的小，防止子元素溢出
         var splitHeight = Math.round(height/_this.row);
         return {
             allWidth:width,
             allHeight:height,
             splitWidth:splitWidth,
             splitHeight : splitHeight
         }
    },

    /*清除父节点下的指定类型的子节点*/
    clearChildNode:function(partentDom,targetTag){
        var removerTagArr = partentDom.childNodes;
        var len = removerTagArr.length;
        var tagName;
        //删除节点需要从后往前删除
        for(var i=len-1;i>=0;i--){
            tagName = removerTagArr[i].tagName;
            if( tagName== targetTag)
            {
                partentDom.removeChild(removerTagArr[i]);
            }
        }
    },

    /********************************************************************************
     * 功能介绍：获取每一块目的拼图的位置
     * *******************************************************************************/
    getResultBlockPosition:function(){
        var blockArr = document.getElementsByClassName("block_col");
        var len = blockArr.length;
        var resultObj = {};
        var left,top;
        for(var i=0;i<len;i++){
            left = blockArr[i].offsetLeft;
            top = blockArr[i].offsetTop;
            resultObj[i] = {
                left :left,
                top:top
            }
        }
        return resultObj;
    },
    /********************************************************************************
     * 功能介绍：获取每一块移动拼图的位置/旋转角度
     * *******************************************************************************/
    getsplitBlockPosition:function(){
        var blockArr = document.getElementsByClassName("splitImage_box");
        //获取sourDIV的宽
        var sourWidth = document.getElementById("sourBox").offsetWidth;
        var len = blockArr.length;
        var number;
        var resultArr = [];
        var left,top,angle,imgDom;
        for(var i=0;i<len;i++){
            number = blockArr[i].getAttribute("number");
            left = blockArr[i].offsetLeft- sourWidth;//减去sour的宽度
            top = blockArr[i].offsetTop;
            imgDom = blockArr[i].childNodes[0];
            angle = imgDom.style.transform.replace(/[^0-9]/g,"");
            resultArr.push({
                number:number,
                left:left,
                top:top,
                angle:angle
            })
        }
        return resultArr;
    },

    /*初始化html页面*/
    initHtml :function(){
        //清空分割区域下的子dom
        document.getElementById("sourBox").innerHTML = "";
        //清空最终拼图结果区域下的子dom
        document.getElementById("resultBox").innerHTML = "";
    },
    /*-------------------------------------监听事件--------------------------------------*/
    //判断是否成功完成拼图
    isFinishGame:function(){
        var _this = this;
        //获取目的拼图的位置
        var resPosition = _this.getResultBlockPosition();
        //获取可移动图片的最终位置
        var splitPosition = _this.getsplitBlockPosition();
        var splitLen = splitPosition.length;
        var isSuccess = false;
        var num;
        for(var i=0;i<splitLen;i++){
            num = resPosition[i];
            if(resPosition[i]){
                if(splitPosition[i].left >= resPosition[i].left-10 &&
                    splitPosition[i].left <= resPosition[i].left+10 &&
                    splitPosition[i].top >= resPosition[i].top-10 &&
                    splitPosition[i].top <= resPosition[i].top+10 &&
                    splitPosition[i].angle ==0)
                {
                    isSuccess =true;
                }else {
                    isSuccess =false;
                    break;
                }
            }
        }
        if(isSuccess){
            alert("恭喜你，拼图成功！")
        }else {
            alert("亲，在努力一下，成功就在眼前！")
        }
    },
    /*再来一次游戏，恢复到有整个图，sourBox的Dom、resultBox的DOM清空*/
    againGame :function(){
        var _this = this;
        //清空源区域
        document.getElementById("sourBox").innerHTML = "";
        //清空目的区域
        document.getElementById("resultBox").innerHTML = "";
        //在目的区域创建完整图片
        var config = _this.baseConfig["imgStyle"];
        _this.getImage("","resultBox","showImage",config);
    },
    //拼图的移动事件
    moveEvent:function(dom){
        var _this = this;
        dom.onmousedown=function(event){
            //增加当前移动图片的层级
            dom.style.zIndex =999;
            _this.mousedownEvent(event,dom);
        };
    },
    //拼图鼠标的按下事件
    //{1、拖拽事件（移动事件），2、计算拼图实时位置}
    mousedownEvent:function(event,dom){
        event=event||window.event;
        var _this = this;
        // 光标按下时光标和面板之间的距离
        var disX=event.clientX-dom.offsetLeft;
        var disY=event.clientY-dom.offsetTop;
        var fnMove = function(e,posX,posY){//点击点、点击光标距离面板左的距离、光标局里面版右的距离
            e = e||window.e;
            var areaW,areaH,maxW,maxH, l, t,CZ;
            areaW=document.getElementById("operateGame").offsetWidth;
            areaH=document.getElementById("operateGame").offsetHeight;
            CZ = areaW * 0.02;
            maxW=areaW-dom.offsetWidth-CZ;
            maxH=areaH-dom.offsetHeight;
            l= e.clientX-posX;
            t= e.clientY-posY;
            if(l<0){
                l=0;
            }
            if(t<0){
                t=0;
            }
            if(l>maxW){
                l=maxW;
            }
            if(t>maxH){
                t=maxH;
            }
            dom.style.left=l+'px';
            dom.style.top=t+'px';
          /*  //检查移动的位置是否在目标附近，若是在目标位置附近，目标附件高亮
            //获取目标位置
            var resPositionArr = _this.getResultBlockPosition();
            var len = resPositionArr.length;
            var blockArr = document.getElementsByClassName("block_col");
            for(var i=0;i<_this.blcokNum;i++){
                if(Math.abs(l-resPositionArr[i].left)<5 &&
                    Math.abs(t-resPositionArr[i].top<5)){
                    if(!_this.hasClass(blockArr[i],"hightBlock")){
                        blockArr[i].className+=" "+"hightBlock";
                    }
                }else{
                    //删除class含有的hightBlock的盒子
                }
            }*/
        };
        dom.onmousemove=function(event){
            event = event || window.event;
            fnMove(event,disX,disY)

        };
        // 释放鼠标
        dom.onmouseup=function(event){
            //恢复当前移动split的层级
            dom.style.zIndex =1;
            dom.onmousemove=null;
            dom.onmouseup=null;
        };
    },
   //双击拼图进行旋转，每双击一下，增加90度
    dbClickEvent:function(dom){
        dom.ondblclick = function(event){
           //获取img的DOM
            var imgDom = document.getElementById(dom.id).childNodes[0];
           //获取img的旋转角度 (rotate(270deg))
            var currentAngle = imgDom.style.transform;
            //通过正在获取到字符串中的数字
            var angleNum = currentAngle.replace(/[^0-9]/g,"");
            //没双击一下，图片旋转90度
            var resAngel = angleNum*1+90*1;
            if(resAngel>=360){
                resAngel = 0;
            }
            //设置图片旋转的角度
            imgDom.style.transform = 'rotate('+resAngel+'deg)';
        }
    },
    /*-------------------------------------监听事件--------------------------------------*/

    /*-------------------------------------基本方法（不含业务逻辑）--------------------------------------*/
    //计算指定范围内的随机数
    randomNumBoth : function(Min,Max){
        var Range = Max - Min;
        var Rand = Math.random();
        var res = Min + Math.round(Rand * Range); //四舍五入
        return res;
    },
    hasClass:function(element,csName){
        element.className.match(RegExp('(\\s|^)'+csName+'(\\s|$)')); //使用正则检测是否有相同的样式
    }
/*-------------------------------------基本方法（不含业务逻辑）--------------------------------------*/

};