var fs = require("fs"),
    zlib = require("zlib")
const fileExists = require('exists-file');

const EBCDIC = require('nm-ebcdic-converter');
const fileName = '20200928/sbv_20200328.dat'

decompress = zlib.createGunzip();
const testFolder = '20200928/report_20200328';

const findName = /R02/
fs.readdirSync(testFolder).forEach(file => {
    if (file.match(findName) != null) {
        console.log(file)
    }
});
let index = 0;
let tmp = '',
    contend = [];
//chuyển sang ascii

//console.log(data);
/*
fileExists(fileName, (err, exists) => {
    if (exists == true) {
        if (fileName == "20200928/statement_master_20170802.dat" || fileName == '20200928/statement_transaction_20170802.dat') {
            //chuyển sáng ascii
            const data = fs.readFileSync(fileName).toString("hex");
            (data.match(/.{1,2}/g) || []).forEach(char => {
                const val = EBCDIC.toASCII(char.toUpperCase());
                tmp += val;
                if (++index === 750) {
                    contend.push(tmp);
                    tmp = '';
                    index = 0;
                }
            });
            fs.writeFileSync("20200928/test.txt", contend.join("\n"));
            const size = fs.statSync('20200928/test.txt');

            if (size.size > 0) {

                fs.readFile("20200928/test.txt", 'utf8', function(err, data) {
                    lines = data.split("\n");
                    for (var line of lines) {
                        let a = ''
                        item = line.split("\s")
                            //console.log(item.index)
                        const b = line.trim().replace(/[^A-Za-z 0-9]/g, " ").replace(/[a-z]/g, "")
                            .replace(/\s+/g, " ") + "\t\t";
                        a += b;
                        console.log(a + "\n");
                        a = ''
                        for (let i of line) {
                            //console.log()
                            break;
                        }
                    }

                })
            } else
                console.log("file không có dung lượng")

        } else if (fileName == "20200928/sbv_20200328.dat.zip") {
            readstream = fs.createReadStream(fileName);
            //giải nén
            var newfilename = fileName.replace(".zip", ""),
                writestream = fs.createWriteStream(newfilename);
            readstream.pipe(decompress).pipe(writestream);
            readFileSBV('20200928/sbv_20200328.dat')
        } else
            readFileSBV('20200928/sbv_20200328.dat')
    } else console.log("File không tồn tại")

})
*/
readFileSBV('20200928/sbv_20200328.dat')

function readFileSBV(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let sbvList = []
        lines = data.split("\n");
        let c = {}
        for (var line of lines) {
            for (var item of line.split(";")) {
                let cif = item;
                c.cifColumn = cif.trim();

                break;
            }
            sbvList.push(c);
        }
        console.log(sbvList)


        fs.writeFile('sbv.txt', JSON.stringify(sbvList), (err) => {
            if (err) throw err;
        });
    })
}

//readFileRR('20200928/sbv_20200328.dat')

function readFileRR(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let sbvList = []
        let jb = {}
        lines = data.split("\n");
        //console.log(lines)
        let a = ''
        console.log(lines.toString().slice(0, 16))
        for (var line of lines) {

            item = line.split(";")
            for (var i of item) {
                var b = i.trim().replace(/\s+/g, " ");
                a += b.padEnd(25, " ");

            }
            console.log(a)
            a = ''
        }

    })
}


function readFileR(file) {
    let dataImportMaster = new Int8Array(fs.readFileSync('20200928/sbv_20200328.dat'));
    let sbvList = []
    let a = ''
    let masterList = [];
    let firstRedundant = 0;
    const STM_MST_LENGTH = 347;
    while (dataImportMaster.length > 0) {
        if (firstRedundant == 0) {
            dataImportMaster = dataImportMaster.subarray(STM_MST_LENGTH - 1);
            firstRedundant = 1;
        } else {
            const checkLength = dataImportMaster.subarray(0, STM_MST_LENGTH).length;
            if (checkLength == STM_MST_LENGTH) {
                statementItem = dataImportMaster.subarray(0, STM_MST_LENGTH);
                dataImportMaster = dataImportMaster.subarray(STM_MST_LENGTH);
                if (dataImportMaster.length < 347) {
                    return fs.writeFile('sbv.txt', JSON.stringify(masterList), (err) => {
                        if (err) throw err;
                    });
                }
                let statementMaster = {};
                let account_number = statementItem.subarray(0, 0 + 16);
                console.log(account_number.toString())
                if (account_number.length > 16) account_number = account_number.substring(account_number.length - 17, account_number.length - 1);
                statementMaster.account_number = account_number;
                masterList.push(statementMaster);

            } else {
                return;
            }

        }
    }
}

function printHexBinary(data) {
    const hexCode = Array.from("0123456789ABCDEF");
    let r = '';
    for (b of data) {
        r += hexCode[((b >> 4) & 0xF)];
        r += hexCode[(b & 0xF)];
    }
    return r;
}

/*const lineReader = require('line-reader');
lineReader.eachLine('20200928/statement_master_20170802.dat', function(line, last) {
    console.log(line);
});


*/


// đọc từng dòng
/*
const readLineFile = require("read-line-file");
readLineFile('20200928/sbv.dat', 'utf8',
    (line) => console.log(line),
    () => console.log('close'),
    (err) => console.log('error')
)*/
/*
fs.readFile("20200928/test.txt", 'utf8', function(err, data) {
    //console.log(data)
    lines = data.split("\n");
    for (var line of lines) {
        let a = ''
        item = line.split(";")

        for (var i of item) {

            if (i.lenght == 11) {
                a = '';
                break;
            }
            const b = i.trim().replace(/[^A-Za-z 0-9  \.,\?""4AFF4F!7C7B\5B6C\^1A\5C5F\(\)60_=\+;:4C6E\/\\\|\}\{\[\]79A1]/g, " ")
                .replace(/\s+/g, " ") + "\t\t";
            // console.log(b)
            a += b;
        }
        //console.log(a + "\n");
        a = ''

    }

}*/