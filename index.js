    var imageCanvas = document.getElementById('image-canvas')
    var drawCanvas = document.getElementById('draw-canvas')
	var ctx = imageCanvas.getContext('2d')
    var ctx1 = drawCanvas.getContext('2d')

    var type = 'png';

    var drawType = 'rect';

    var files = null;       // 文件夹的所有图片，一个数组来的
    var cavs = null;        // 当前页面画的红框缓存位置，是个数组
    var file = null;        // 当前页面的图片
    var cav = null;         // 当前页面红框的内容
    var tables = null;      // 表格的信息数组
    var index = 0;          // 当前页面的图片索引号
    var length = 0;         // 文件夹照片长度
    var imgdata = null;     // 画标记后的图

    var table = {
        original_image:null,
        edit_image:null,	
        main_type:'',		
        sub_type:'',			
        happen_place:'',		
        happen_date:'',
        belong_street:'',	
        brief_desc:'',			
        remark:'',	
    };

    Date.prototype.Format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds()
            // 毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                    : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

    function addChild(){
        var mainType = document.getElementById("main-type").innerText;
        if(mainType === "文明安全"){
            var list = ["闯红灯","车辆横冲直撞"];
            for(var i=0;i<2;i++){
                var newOption = document.createElement("option");
                newOption.value = list[i];
                newOption.innerText = list[i];
                document.getElementById("sub-type").appendChild(newOption);
            }
        }else{
            var list = ["乱摆放","乱扔垃圾","共享单车乱放"];
            for(var i=0;i<3;i++){
                var newOption = document.createElement("option");
                newOption.value = list[i];
                newOption.innerText = list[i];
                document.getElementById("sub-type").appendChild(newOption);
            }
        }
    }
    function deleteChild(){
        var mainType = document.getElementById("main-type").innerText;
        if(mainType === "文明安全"){
            for(var i=0;i<3;i++){
                document.getElementById("sub-type").removeChild(document.getElementById("sub-type").lastElementChild);
            }
        }else{
            for(var i=0;i<2;i++){
                document.getElementById("sub-type").removeChild(document.getElementById("sub-type").lastElementChild);
            }
        }
    }

    function bindMainAndSub(){
        // var mainType = document.getElementById("main-type").innerText;
        var lastChild = document.getElementById("sub-type").lastElementChild;
        if(lastChild === null) { // 表示暂无元素在内
            addChild();
        }else{  //已有元素，需要删除
            deleteChild();
            addChild();
        }

    }

    window.onload = function(){
        document.getElementById("happen-date").value = new Date().Format("yyyy-MM-dd");
        bindMainAndSub();
    }

    function useRect(){
        drawType = 'rect';
    }
    function useCircle(){
        drawType='circle'
    }

    function clearDraw(){
        drawCanvas.width = drawCanvas.width;
    }
    function clearAll(){
        drawCanvas.width = drawCanvas.width;
        imageCanvas.width = imageCanvas.width;
        files = null;
        cavs = null;
        file = null;
        cav = null;
        index = 0; 
        length = 0;
        imgdata = null;
        document.getElementById('page-num').innerText=0;
        document.getElementById('page-length').innerText=0;
    }

    function imgToCav(){

        var imgUrl=URL.createObjectURL(file);
        var image=new Image();
        image.src=imgUrl;
        image.onload=function (ev) {
            ctx.drawImage(image,0,0,imageCanvas.width,imageCanvas.height);
            drawCanvas.height = imageCanvas.height;
            drawCanvas.width = imageCanvas.width;
            // if(callback) callback();
            // URL.revokeObjectURL(imgUrl);

            if(cavs[index]!==undefined) ctx1.putImageData(cavs[index],0,0);
            if(tables!==null&&tables[index]!==undefined) {
                table.main_type = tables[index].main_type;
                document.getElementById("main-type").innerText = table.main_type;
                table.sub_type = tables[index].sub_type;
                document.getElementById("sub-type").value = table.sub_type;
                table.happen_place = tables[index].happen_place;
                document.getElementById("happen-place").value = table.happen_place;
                table.happen_date = tables[index].happen_date;
                document.getElementById("happen-date").value = table.happen_date;
                table.belong_street = tables[index].belong_street;
                document.getElementById("belong-street").value = table.belong_street;
                table.brief_desc = tables[index].brief_desc;
                document.getElementById("brief-desc").value = table.brief_desc;
                table.remark = tables[index].remark;
                document.getElementById("remark").value = table.remark;
            }else{
                // document.getElementById("sub-type").value = null;
                document.getElementById("happen-place").value = '';
                document.getElementById("happen-date").value = new Date().Format("yyyy-MM-dd");
                document.getElementById("belong-street").value = '';
                document.getElementById("brief-desc").value = '';
                document.getElementById("remark").value = '';
            }
        }

    }

    function deepClone (obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        var cpObj = obj instanceof Array ? [] : {};
        for (var key in obj) cpObj[key] = deepClone(obj[key]);
        return cpObj;
    }

    function getTable(){
        //将原图转换为base64格式
        var temp = imageCanvas;
        var tempdata = temp.toDataURL(type);
        var fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }
        tempdata = tempdata.replace('mime-type', fixtype(type));
        table.original_image = tempdata

        // 获取编辑后的图片
        cavToImg();
        table.edit_image = imgdata;

        table.main_type = document.getElementById("main-type").innerText;
        table.sub_type = document.getElementById("sub-type").options[document.getElementById("sub-type").selectedIndex].value;
        table.happen_place = document.getElementById("happen-place").value;
        table.happen_date = document.getElementById("happen-date").value;
        table.belong_street = document.getElementById("belong-street").value;
        table.brief_desc = document.getElementById("brief-desc").value;
        table.remark = document.getElementById("remark").value;

        tables[index] = deepClone(table);
        console.log(tables);
        
        imgToCav();

        // var xhr = new XMLHttpRequest();
        // xhr.open('post', '/insert/');
        // xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
        // var sendData = {'table':table};
        // xhr.send(JSON.stringify(sendData));
        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState == 4 && xhr.status == 200) {
        //         $('.alert').html('提交成功！').addClass('alert-success').show().delay(1000).fadeOut(); 
        //     }
        // };

        $('.alert').html('提交成功！').addClass('alert-success').show().delay(1000).fadeOut();


    }

    function chooseMainType(ths){
        document.getElementById('main-type').innerText=ths.innerText;
        console.log("选择了主属性");
        bindMainAndSub();
    }
    
    document.getElementById('upload-pic').onchange=function(){
        files = document.getElementById('upload-pic').files;
        document.getElementById('upload-dir').value = null;
        cavs = new Array();
        index = 0;
        length = files.length;
        document.getElementById('page-length').innerHTML=length;
        document.getElementById('page-num').innerHTML=index+1;
        file = files[index];

        imgToCav();
    }

    document.getElementById('upload-dir').onchange=function(){
        
        files = document.getElementById('upload-dir').files;
        document.getElementById('upload-pic').value = null;
        cavs = new Array();
        tables = new Array();
        index = 0;
        length = files.length;
        document.getElementById('page-length').innerHTML=length;
        document.getElementById('page-num').innerHTML=index+1;
        file = files[index];

        imgToCav();
        
    }

    document.getElementById('last-picture').onclick=function(){
        if(index-1 >= 0 && files!=null){
            index = index-1;
            document.getElementById('page-num').innerHTML=index+1;
            file = files[index];
            imgToCav();  
        }else{
            console.log("这是第一张");
        }
    }

    document.getElementById('next-picture').onclick=function(){
        if(files!=null && index+1 < files.length){
            index = index+1;
            document.getElementById('page-num').innerHTML=index+1;
            file = files[index];
            imgToCav();
        }else{
            console.log("这是最后一张")
        }
    }

    function cavToImg(){

        cav = ctx1.getImageData(0,0,drawCanvas.width,drawCanvas.height);
        cavs[index] = cav;

        ctx.drawImage(drawCanvas,0,0);
        //设置保存图片的类型
        imgdata = imageCanvas.toDataURL(type);
        //将mime-type改为image/octet-stream,强制让浏览器下载
        var fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }
        imgdata = imgdata.replace('mime-type', fixtype(type));
        // console.log(imgdata);
    }

    function saveImg(){
        cavToImg();
        var saveFile = function (data, filename) {
            var link = document.createElement('a');
            link.href = data;
            link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        }
        var filename = new Date().toLocaleDateString() + '.' + type;
        saveFile(imgdata, filename);
        // drawCanvas.height=drawCanvas.height;
        // canvas1.height=canvas1.height; 
        createURLImg(file);
    }

    function createURLImg(file1,callback) {
        // var c=document.getElementById("myCanvas");
        // var ctx=c.getContext("2d");
        // //加载入canvas
        var imgUrl=URL.createObjectURL(file1);
        var image=new Image();
        image.src=imgUrl;
        image.onload=function (ev) {
            ctx.drawImage(image,0,0,imageCanvas.width,imageCanvas.height);
            if(callback) callback();
            URL.revokeObjectURL(imgUrl);
        }
    }
   
    function MyPaint(id,color='red'){
        var canvas = document.getElementById(id);
        this.canvas = canvas;
        this.color = color;
        this.ctx = this.canvas.getContext('2d');
        this.p1= {};
        this.p2 = {};
    }

    MyPaint.prototype.paintRect = function(){

        var myPaint = this;

        this.canvas.addEventListener('mousedown',function(e){
            // console.log("点击了图片");
            this.p1.x = e.offsetX;
            this.p1.y = e.offsetY;
            this.canvas.addEventListener("mousemove",myDrect);
            this.canvas.addEventListener("mouseup",function(){
                this.removeEventListener("mousemove",myDrect);
            })
        }.bind(this));

        function myDrect(e){
            myPaint.p2.x = e.offsetX;
            myPaint.p2.y = e.offsetY;
            myPaint.ctx.width = myPaint.width;
            myPaint.ctx.height = myPaint.height;
            myPaint.ctx.fillStyle = '#FF0000';
            myPaint.ctx.strokeStyle = '#FF0000';
            var width = Math.abs(myPaint.p1.x-myPaint.p2.x);
            var height = Math.abs(myPaint.p1.y-myPaint.p2.y);
            myPaint.ctx.clearRect(0,0,myPaint.canvas.width,myPaint.canvas.height);
            myPaint.ctx.beginPath();
            if(drawType==='rect'){
                if(myPaint.p2.x>=myPaint.p1.x){
                    if(myPaint.p2.y>=myPaint.p1.y){
                        myPaint.ctx.rect(myPaint.p1.x,myPaint.p1.y,width,height);
                    }else{
                        myPaint.ctx.rect(myPaint.p1.x,myPaint.p1.y,width,-height);
                    }
                }else{
                    if(myPaint.p2.y>=myPaint.p1.y){
                        myPaint.ctx.rect(myPaint.p1.x,myPaint.p1.y,-width,height);
                    }else{
                        myPaint.ctx.rect(myPaint.p1.x,myPaint.p1.y,-width,-height);
                    }
                }
            }else{
                var x = (myPaint.p2.x + myPaint.p1.x)/2;
                var y = (myPaint.p2.y + myPaint.p1.y)/2;
                var r = Math.abs(myPaint.p1.x-myPaint.p2.x)/2
                myPaint.ctx.arc(x,y,r,0,2*Math.PI);
            }
            myPaint.ctx.stroke();
            myPaint.ctx.save();
        }
    }

    var mp = new MyPaint('draw-canvas');
    mp.paintRect();