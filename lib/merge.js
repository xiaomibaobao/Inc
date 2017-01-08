//根据旧数据和增量数据合成新js内容
function mergejs(source,trunkSize,checksumcode,diffAlg) {
    if(diffAlg=='lcs'){
        return mergeLcs(source,checksumcode);
    }
    else{
        return mergeChunk(source,trunkSize,checksumcode);
    }

}

// chunk 算法
function mergeChunk(source,trunkSize,checksumcode) {
    var strResult="";
    for(var i=0;i<checksumcode.length;i++){
        var code=checksumcode[i];
        if(typeof (code)=='string'){
            strResult+=code;
        }
        else{
            var start=code[0]*trunkSize;
            var end=code[1]*trunkSize;
            var oldcode=source.substr(start,end);
            strResult+=oldcode;
        }
    }

    return strResult;
}

// 基于编辑距离计算
function mergeLcs(src,diff) {
    var strBuffer='';
    for(var i=0;i<diff.length;i++){
        var item=diff[i];
        if(typeof(item)=='string'){
            strBuffer=strBuffer+item;
        }
        else{
            strBuffer=strBuffer+src.substr(item[0]-1,item[1]);
        }
    }
    return strBuffer;
}

module.exports = mergejs;
