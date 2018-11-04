/**
 * Created by dell on 2018/3/21.
 */
window.onload = function(){
    //缓存需要的dom
    var domObj = {
        importImage:document.getElementById("importImage"),
        start:document.getElementById("start"),
        again:document.getElementById("restart"),
        finish : document.getElementById("finish"),
        gameClass :document.getElementById("gameClass")
    };
    //注册监听事件
    var createPuzzle = new CreatePuzzle(domObj);
    //为导入图片按钮监听change事件
    domObj.importImage.onchange=function(event){
        //html初始化
        createPuzzle.initHtml();
        //获取原图片
        createPuzzle.getImage(event,"resultBox","showImage");
    };
    //为开始游戏按钮添加点击事件
    domObj.start.onclick = function(){
        //获取选择游戏难度
        var val = domObj.gameClass.selectedIndex;
        var gameClass = {
            0:{row:3,col:3},
            1:{row:5,col:5},
            2:{row:8,col:8},
            3:{row:10,col:10},
            4:{row:10,col:12}
        };
        var row = gameClass[val].row;
        var col = gameClass[val].col;
        createPuzzle.create(row,col);
    };
    //再来一次游戏
    domObj.again.onclick = function(){
        createPuzzle.againGame();
    };
    //完成游戏
    domObj.finish.onclick = function(){
        createPuzzle.isFinishGame();
    }
};