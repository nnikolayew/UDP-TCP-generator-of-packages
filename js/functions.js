function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function sendTcpQuery(query, callback) {
    chrome.sockets.tcp.create(function (socket) {
        chrome.sockets.tcp.connect(
            socket.socketId,
            '0.0.0.0',
            9091,
            function (result) {
                if (result < 0) {
                    alert('Ошибка соединения'); //todo
                    return;
                }

                query.sip = query.sip.split('.').map(parseFloat);
                query.dip = query.dip.split('.').map(parseFloat);
                var buffer = new ArrayBuffer(13 + query.data.length),
                    dataView = new DataView(buffer);

                query.sip.forEach(function (e, i) {
                    dataView.setUint8(3 - i, e);
                });
                dataView.setUint16(4, query.sport, true);
                query.dip.forEach(function (e, i) {
                    dataView.setUint8(9 - i, e);
                });
                dataView.setUint16(10, query.dport, true);
                dataView.setUint8(12, query.data.length);
                for (var i = 0; i < query.data.length; i++) {
                    dataView.setUint8(13 + i, query.data.charCodeAt(i));
                }

                chrome.sockets.tcp.onReceive.addListener(function (info) {
                    if (info.socketId != socket.socketId)
                        return;

                    // todo прием ok/error_msg
                    console.log(info.data);
                    chrome.sockets.tcp.close(socket.socketId);
                });

                chrome.sockets.tcp.send(
                    socket.socketId,
                    buffer,
                    function (sendInfo) {
                        if (sendInfo.resultCode < 0) {
                            alert('Ошибка при отправке данных'); //todo
                            return;
                        }
                    }
                );
            }
        );
    });
}