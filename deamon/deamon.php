<?php
$serverSocket = socket_create(AF_INET, SOCK_STREAM, 0);
socket_bind($serverSocket, '0.0.0.0', 9091);
socket_listen($serverSocket, 3);

$rawSocket = socket_create(AF_INET, SOCK_RAW, 255);
if (socket_last_error()) {
    echo "raw_create: " . socket_strerror(socket_last_error()) . PHP_EOL;
}

while (true) {

    $querySocket = socket_accept($serverSocket);

    socket_recv($querySocket, $query, 13, MSG_WAITALL);
    $query = unpack('Lsip/Ssport/Ldip/Sdport/Csize', $query);

    socket_recv($querySocket, $data, $query['size'], MSG_WAITALL);
    $query['data'] = $data;
    sendTcpPacket($query);

    socket_close($querySocket);
}

function sendTcpPacket($query)
{
    global $rawSocket;

    $headers = [
        'ip' =>
            'Cip_ver_len/'
            . 'Ctos/'
            . 'ntot_len/'
            . 'nidentification/'
            . 'nfrag_off/'
            . 'Cttl/'
            . 'Cprotocol/'
            . 'nip_checksum/'
            . 'Nsource/'
            . 'Ndest',
        'tcp' =>
            'nsource_port/'
            . 'ndest_port/'
            . 'Nsequence_number/'
            . 'Nacknowledgement_number/'
            . 'Coffset_reserved/'
            . 'Ctcp_flags/'
            . 'nwindow_size/'
            . 'nchecksum/'
            . 'nurgent_pointer'
    ];

    $ip = pack('CCnnnCCnNN',
        0x45,
        0x0,
        (20 + 20 + strlen($query['data'])), // total length
//        40, // total length
        0x1234,
        0x4000,
        0xA,
        0x6,
        0x0, // checksum
//        0,0
        $query['sip'],
        $query['dip']
    );

    $tcp = pack('nnNNCCnnn',
        $query['sport'],
        $query['dport'],
        0x1,
        0x0,
        0x5 << 4,
        0x2,
        200,
        0x0, // checksum
        0x0
    );

    $ipChecksum = ipChecksum($ip . $tcp . $query['data']);

    $ip = pack('CCnnnCCnNN',
        0x45,
        0x0,
        (20 + 20 + strlen($query['data'])), // total length
        0x1234,
        0x4000,
        0xA,
        0x6,
        $ipChecksum, // checksum
        $query['sip'],
        $query['dip']
    );

    socket_sendto(
        $rawSocket,
        $ip . $tcp . $query['data'],
        (strlen($ip) + strlen($tcp) + strlen($query['data'])),
        0,
        long2ip($query['dip']), $query['dport']);
    if (socket_last_error()) {
        echo "raw_send: " . socket_strerror(socket_last_error()) . PHP_EOL;
    }
}

function ipChecksum($data)
{
    $bit = unpack('n*', $data);
    $sum = array_sum($bit);

    if (strlen($data) % 2) {
        $temp = unpack('C*', $data[strlen($data) - 1]);
        $sum += $temp[1];
    }

    $sum = ($sum >> 16) + ($sum & 0xffff);
    $sum += ($sum >> 16);

    return pack('n*', ~$sum);
}