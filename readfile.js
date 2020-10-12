var fs = require("fs"),
    zlib = require("zlib")
const fileExists = require('exists-file');
const EBCDIC = require('nm-ebcdic-converter');
const fileName = '20200928/sbv_20200328.dat'
decompress = zlib.createGunzip();
const testFolder = '20200928/report_20200328';

const findName = /R02/
readfile(fileName)

function readfile(fileName) {
    fs.readdirSync(testFolder).forEach(file => {
        if (file.match(findName) != null) {

            console.log('20200928/' + file)
        }
    })
    readFileSBV('20200928/sbv_20200328.dat')
        //readFileR02('20200928/R02-Transaction_Journal_By_Account_Number_20200328')
        // readFileR63('20200928/R63_Trial_Balance_20200328')
}


function readFileSBV(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let sbvList = []
        lines = data.split("\n");
        for (var line of lines) {
            if (line.length != 4077 && line.length != 0) {
                let item = line.split(";")
                let c = {}
                let cif = item[0];
                c.cifColumn = cif.trim();
                let colum1 = item[1].trim();
                c.colum1 = colum1;
                let colum2 = item[2].trim();
                c.colum2 = colum2;
                let colum3 = item[3].trim();
                c.colum3 = colum3;
                let colum4 = item[4].trim();
                c.colum4 = colum4;
                let colum5 = item[5].trim();
                c.colum5 = colum5.replace(/\s+/g, " ");
                let colum6 = item[6].trim();
                c.colum6 = colum6;
                sbvList.push(c);
            }
        }
        fs.writeFile('sbv.txt', JSON.stringify(sbvList), (err) => {
            if (err) throw err;
        });
    })
}


function readFileR02(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let r02 = [];
        lines = data.split("\n");
        for (var line of lines) {

            if (line.trim().length == 134) {
                ojR02 = {};
                /*  if (line.trim().length == 21) {
                      let carNumber = line.slice(2, 23);
                      ojR02.carNumber = carNumber;
                  }*/
                let accountNumber = line.slice(2, 18);
                ojR02.accountNumber = accountNumber;
                let startDay = line.slice(22, 30);
                ojR02.startDay = startDay;
                let endDay = line.slice(31, 39);
                ojR02.endDay = endDay;
                let code = line.slice(40, 44);
                ojR02.code = code;
                let amount = line.slice(45, 56);
                ojR02.amuont = amount.trim();

                let number = line.slice(57, 70);
                ojR02.number = number.trim();

                let cde = line.slice(72, 73);
                ojR02.cde = cde;

                let b = line.slice(74, 75);
                ojR02.b = b.trim();
                let note = line.slice(76, 113);
                ojR02.note = note.trim();
                let custumerNumber = line.slice(114, 136);
                ojR02.custumerNumber = custumerNumber.trim();
                r02.push(ojR02)
            }

        }
        console.log(r02)
        fs.writeFile('r02.txt', JSON.stringify(r02), (err) => {
            if (err) throw err;
        });
    })
}



function readFileR63(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let r63 = [];
        lines = data.split("\n"), toString();
        for (var line of lines) {
            if (line.replace(/�/g, "").trim().length == 131) {
                let jbr63 = {};

                let ACCOUNTNUMBER = line.slice(2, 19);
                jbr63.ACCOUNTNUMBER = ACCOUNTNUMBER.trim();

                let shortName = line.slice(19, 35);
                jbr63.shortName = shortName.trim();

                let colum1 = line.slice(35, 36);
                jbr63.colum1 = colum1;

                let colum2 = line.slice(37, 39);
                jbr63.colum2 = colum2;

                let colum3 = line.slice(40, 42);
                jbr63.colum3 = colum3;

                let colum4 = line.slice(43, 44);
                jbr63.colum4 = colum4;

                let colum5 = line.slice(45, 46);
                jbr63.colum5 = colum5;

                let colum6 = line.slice(49, 50);
                jbr63.colum6 = colum6;

                let colum7 = line.slice(51, 52);
                jbr63.colum7 = colum7;

                let colum8 = line.slice(53, 54);
                jbr63.colum8 = colum8;

                let colum9 = line.slice(55, 57);
                jbr63.colum9 = colum9;

                let CurentBalace = line.slice(58, 71);
                jbr63.CurentBalace = CurentBalace.trim();

                let creditLimit = line.slice(72, 80);
                jbr63.creditLimit = creditLimit.trim();

                let avaiLimit = line.slice(81, 90);
                jbr63.avaiLimit = avaiLimit.trim();

                r63.push(jbr63);
            }
        }
        console.log(r63)
        fs.writeFile('r63.txt', JSON.stringify(r63), (err) => {
            if (err) throw err;
        });
    })
}

/*
    const readLineFile = require("read-line-file");
    readLineFile(file, 'utf8',
        (line) => {
            let r63 = [];
            //console.log(line)
            if (line.replace(/�/g, "").trim().length == 131) {
                let lines = line.replace(/� /g, "").split("\n")

                for (var item of lines) {
                    let jbr63 = {};
                    let ACCOUNTNUMBER = item.slice(0, 16);
                    jbr63.ACCOUNTNUMBER = ACCOUNTNUMBER.trim();
                    let shortName = item.slice(16, 33);
                    jbr63.shortName = shortName.trim();
                    r63.push(jbr63);
                }
                // console.log(r63)
            }

        },
        () => console.log('close'),
        (err) => console.log('error')
    )

}*/
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