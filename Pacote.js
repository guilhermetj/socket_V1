const Sequelize = require('sequelize');
const bd = require('./bd');

const Pacote = bd.define('pacotes', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    pacote_blob:{
        type: Sequelize.BLOB
    },
    pacote_varbinary:{
        type: 'VARBINARY(1024)'
    },
    pacote_text:{
        type: Sequelize.TEXT
    },
    pacote_hex:{
        type: Sequelize.TEXT
    },
    crc:{
        type: Sequelize.TEXT
    }
});

Pacote.sync();

module.exports = Pacote;