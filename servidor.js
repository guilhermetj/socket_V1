const net = require('net');
const axios = require('axios');
const crc16 = require('node-crc16');
const Pacote = require('./Pacote');

let server = net.createServer();
const buffer = Buffer.alloc(3);
server.on('connection', handleConnection);
server.listen(9990,'127.0.0.1', function() {
  console.log('server listening to %j', server.address());
});
function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
  console.log('new client connection from %s', remoteAddress);
  let finalData = [];
  let isFinish = false;
  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  function  onConnData(data) {
      finalData.push(data);
      console.log("push teste");
      setTimeout(onFinishPackage, 1000);
  }
  function onConnClose() {
    console.log('connection from %s closed', remoteAddress);
  }
  function onConnError(err) {
    console.log('Connection %s error: %s', remoteAddress, err.message);
  }
  function onFinishPackage(){
    if(isFinish){
      return
    }
      finalData = Buffer.concat(finalData);
      //console.log(finalData);
      let crcCalc = Buffer.from(finalData.buffer,0,(finalData.length - 2));
      let sum = crc16.checkSum(crcCalc, {retType: 'buffer'});
      var tipo_pacote = finalData[0] == 0x01 ? 'head' : 'Body';
      let pacote = {pacote_blob : finalData, 
                   pacote_varbinary : finalData, 
                   tipo_pacote : tipo_pacote, 
                   pacote_hex: finalData.toString('hex'),
                   crc: 0x02 +sum.toString('hex')};
      SalvarPacote(pacote);
      console.log(pacote);;
      //SalvarBanco()
      console.log('result: ' + 0x02 + sum.toString('hex'));
      buffer[0] = 0x02;
      buffer[1] = sum[0];
      buffer[2] = sum[1];
      conn.write(buffer);
      isFinish = true;
      setTimeout(onReleaseSend, 1000);
  }
  function onReleaseSend(){
    isFinish = false
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
