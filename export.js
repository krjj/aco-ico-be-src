const os = require('os')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')
const level = require('level')
const Json2csvParser = require('json2csv').Parser
const keys = []

const dbpath = "level" // relative to cwd
var userData = []

// Dump all keys from leveldb using go tool
shell.rm('-rf', 'tmp')
shell.mkdir('-p', 'tmp')
shell.cp('-R', dbpath, 'tmp/level');
shell.exec(`export LEVELDB_DIR=tmp/level && ./leveldbctl keys`, { silent: true }, async (code, stdout, stderr) => {
  if (code != 0 || stderr != '') {
    console.log('Error while generating user data dump. Aborted.')
    process.exit()
  } else {
    var array = stdout.split("\n");
    array.pop()
    db = level('tmp/level')
    for (i = 0; i < array.length; i++) {
      await db.get(array[i]).then((r) => {
        userData.push(JSON.parse(r))
      }).catch((e) => {
        console.log('Error while generating user data dump. Aborted.')
      })
    }
    const parser = new Json2csvParser({
      fields: [
        {
          label: 'userid',
          value: 'userdata.userid',
          default: 'NULL'
        },
        {
          label: 'email',
          value: 'userdata.email',
          default: 'NULL'
        },
        {
          label: 'firstname',
          value: 'userdata.firstname',
          default: 'NULL'
        },
        {
          label: 'lastname',
          value: 'userdata.lastname',
          default: 'NULL'
        },
        {
          label: 'password',
          value: 'userdata.password',
          default: 'NULL'
        },
        {
          label: 'Users ETH Address',
          value: 'userdata.userEthAddress',
          default: 'NULL'
        },
        {
          label: 'Dob',
          value: 'userdata.bio.dob',
          default: 'NULL'
        },
        {
          label: 'Address - Line',
          value: 'userdata.bio.address.line',
          default: 'NULL'
        },
        {
          label: 'Address - Country',
          value: 'userdata.bio.address.country',
          default: 'NULL'
        },
        {
          label: 'Address - City',
          value: 'userdata.bio.address.city',
          default: 'NULL'
        },
        {
          label: 'Address - Postal Code',
          value: 'userdata.bio.address.postalcode',
          default: 'NULL'
        },

      ]
    });
    const csv = parser.parse(userData);
    let efilename = new Date().toISOString()
    shell.mkdir(os.homedir() + `/userdata_dump`)
    fs.writeFileSync(os.homedir() + `/userdata_dump/userdata-${efilename}.csv`, csv)
    console.log("Userdata exported to file : " + os.homedir() + '/userdata_dump/userdata' + efilename)
  }
})
