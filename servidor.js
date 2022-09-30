const net = require('net');
const axios = require('axios');
const crc16 = require('node-crc16');
const Pacote = require('./Pacote');

let server = net.createServer();
const buffer = Buffer.alloc(3);
server.on('connection', handleConnection);
server.listen(5353,'127.0.0.1', function() {
  console.log('server listening to %j', server.address());
});
function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);
  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function onConnData(d) {
      console.log('connection data from %s: %j', remoteAddress, d.toString('hex'));
      console.log('Comprimento do Pacote: %j', d[1]);
      console.log('Versão do Hardware: %j', d[4]);
      console.log('Versão do Firmware: %j', d[6]);
      //var imei = Buffer.from(d.buffer,0,14);
      //console.log('IMEI: %s', imei);
      var crcCalc = Buffer.from(d.buffer,0,(d.length - 2));
      var sum = crc16.checkSum(crcCalc, {retType: 'buffer'});
      var tipo_pacote = d[0] == 0x01 ? 'head' : 'Body';
      let pacote = {pacote_blob : d, 
                    pacote_varbinary : d, 
                    tipo_pacote : tipo_pacote, 
                    pacote_hex: d.toString('hex'),
                    buffer_pacote : Buffer.from(d.buffer,0,d.length ), 
                    crc: 0x02 +sum.toString('hex')};
      SalvarPacote(pacote);
      //SalvarBanco()
      console.log(pacote);
      console.log('result: ' + 0x02 + sum.toString('hex'));
      buffer[0] = 0x02;
      buffer[1] = sum[0];
      buffer[2] = sum[1];
      conn.write(buffer);
    
  }
  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }
  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }

  function SalvarBanco(data) {
    axios.post('https://cto.gsantos.eng.br/api/receiving', data).then(res => {
      console.log(`statusCode: ${res.status}`);
    }).catch(error => {
      console.error(error);
    });
  }
  async function SalvarPacote(pacote){
    await Pacote.create(pacote).then(() => {
      console.log("Pacote salvo com sucesso")
    }).catch(() => {
      console.log("Erro ao salvar o Pacote")
    })
  }


}
