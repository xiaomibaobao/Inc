function mergeChunk (source, trunkSize, checksumcode) {
    var strResult = '';
    for (var i = 0; i < checksumcode.length; i++) {
        var code = checksumcode[i];
        if (typeof (code) === 'string') {
            strResult += code;
        } else {
            var start = code[0] * trunkSize;
            var end = code[1] * trunkSize;
            var oldcode = source.substr(start, end);
            strResult += oldcode;
        }
    }

    return strResult;
}

function mergeLcs (src, diff) {
    var strBuffer = '';
    for (var i = 0; i < diff.length; i++) {
        var item = diff[i];
        if (typeof (item) === 'string') {
            strBuffer = strBuffer + item;
        } else {
            strBuffer = strBuffer + src.substr(item[0] - 1, item[1]);
        }
    }
    return strBuffer;
}

function merge (source, trunkSize, checksumcode, diffAlg) {
    if (diffAlg === 'lcs') {
        return mergeLcs(source, checksumcode);
    }

    return mergeChunk(source, trunkSize, checksumcode);
}

module.exports = {
    merge: merge
};
