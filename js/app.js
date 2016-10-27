document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#button').addEventListener('click', function (e) {

        var sip = document.querySelector('#sip'),
            sport = document.querySelector('#sport'),
            dip = document.querySelector('#dip'),
            dport = document.querySelector('#dport'),
            data = document.querySelector('#data');

        sip.style.outline = '';
        sport.style.outline = '';
        dip.style.outline = '';
        dport.style.outline = '';
        data.style.outline = '';

        if (!sip.value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            sip.style.outline = '2px solid red';
        } else if (isNaN(parseFloat(sport.value)) || parseFloat(sport.value) < 1025 || parseFloat(sport.value) > 65536) {
            sport.style.outline = '2px solid red';
        } else if (!dip.value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
            dip.style.outline = '2px solid red';
        } else if (isNaN(parseFloat(dport.value)) || parseFloat(dport.value) < 1025 || parseFloat(dport.value) > 65536) {
            dport.style.outline = '2px solid red';
        } else if (data.value.length > 255) {
            data.style.outline = '2px solid red';
        } else {
            sendTcpQuery({
                sip: sip.value,
                sport: sport.value,
                dip: dip.value,
                dport: dport.value,
                data: data.value
            }, function () {
                //todo
            });
        }
    });
});