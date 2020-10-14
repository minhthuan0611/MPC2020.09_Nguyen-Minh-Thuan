const fs = require('fs');
const moment = require('moment');
const EBCDIC = require('nm-ebcdic-converter');
const decompress = require('decompress');
var targz = require('targz');
const fileExists = require('file-exists');
const { runInContext } = require('vm');
const { resolve, toNamespacedPath } = require('path');
var checkFolderExists = require('check-folder-exists');
const { time } = require('console');
/*targz.compress({
    src: '20200928/report_20200328',
    dest: '20200928/report_20200328.tar'
}, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Done!");
    }
});*/
//autoImport2()
sms()

//readAll('20200928/report_20200328.tar')
var today = new Date();
var a = moment(today).format('HH:mm');
var b = moment(today).format('YYYYMMDD')


async function sms() {
    let tmp = -1;
    fs.readFile('test.txt', 'utf8', function(err, data) {
        tmp = parseInt(data);
        if (a == '08:56' || a == '10:00') {
            if (tmp == 0) {
                fileExists('20200928/sbv_20200328.dat', (err, exist) => {
                    if (exist) {
                        autoImport();

                    } else if (err == null) {
                        fileExists('20200928/sbv_20200328.zip', (err, exist) => {
                            if (exist) {
                                autoImport();

                            } else if (err == null) {
                                console.log("Sms chưa có file 1 để import")
                                return;
                            }
                        })
                    }
                })
            }
            if (tmp == 1) {
                console.log('Sms chưa có file R02')
                autoImport();
            }
            if (tmp == 2) {
                console.log("Sms chưa có file R63")
                autoImport();
            }
            if (tmp == 3) {
                console.log("Sms chưa có file statement_master")
                autoImport();
            }
            if (tmp == 4) {
                console.log("Sms chưa có file statement_transaction")
                autoImport();
            }
        } else {
            autoImport()
        }

    })
}

function autoImport2() {
    let tmp = 0;
    let a = [];
    fs.readFile('test.txt', 'utf8', function(err, data) {
        tmp = parseInt(data);
        if (tmp == 0) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('sbv_') != null) {
                    if (file == "sbv_20200328.dat" || file == "sbv_20200328.zip" || file == "sbv_20200328_Masked.dat") {
                        readAll("20200928/" + file)
                        tmp = 1;
                        console.log("Thanh cong file sbv");
                        fs.readdirSync('20200928').forEach(file => {
                            if (file.match('report_20200328') != null) {
                                if (file == 'report_20200328.tar.gz' || file == 'report_20200328.tar') {
                                    readfileReport2('20200928/' + file, () => {
                                        tmp = 3;
                                        console.log(tmp)
                                        fs.readdirSync('20200928').forEach(file => {
                                            if (file.match('statement_master_20170802.dat') != null) {
                                                readAll('20200928/statement_master_20170802.dat');
                                                tmp = 4;
                                                console.log("Thanh cong file master")
                                                fs.readdirSync('20200928').forEach(file => {
                                                    if (file.match('statement_transaction_20170802.dat') != null) {
                                                        readAll('20200928/statement_transaction_20170802.dat')
                                                        tmp = 0;
                                                        console.log("Thanh cong file transaction")
                                                    }
                                                })
                                            }
                                        })
                                        fs.writeFile('test.txt', tmp.toString(), (err) => {
                                            if (err) throw err;
                                        });

                                    });

                                } else if (file == 'report_20200328') {
                                    findFile('20200928/report_20200328', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
                                        readFileR02('20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328')
                                        tmp = 2;
                                        console.log("Thanh cong file r02")
                                        findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
                                            readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
                                            tmp = 3;
                                            console.log("Thanh cong file r63");
                                            fs.readdirSync('20200928').forEach(file => {
                                                if (file.match('statement_master_20170802.dat') != null) {
                                                    readAll('20200928/statement_master_20170802.dat');
                                                    tmp = 4;
                                                    console.log("Thanh cong file master")
                                                    fs.readdirSync('20200928').forEach(file => {
                                                        if (file.match('statement_transaction_20170802.dat') != null) {
                                                            readAll('20200928/statement_transaction_20170802.dat')
                                                            tmp = 0;
                                                            console.log("Thanh cong file transaction ")

                                                        }
                                                    })
                                                }
                                            })
                                        });
                                    })
                                    fs.writeFile('test.txt', tmp.toString(), (err) => {
                                        if (err) throw err;
                                    });
                                }
                            }

                        })

                    }

                }


            })

        }

    })
}


function readAll2(fileName, callback) {
    if (fileName == '20200928/report_20200328') {
        if (fs.existsSync('20200928/report_20200328') == true) {
            readR63R02();

        }
    } else {
        fileExists(fileName, (err, exists) => {
            if (exists == true) {
                if (fileName == '20200928/sbv_20200328.zip') {
                    decompress('20200928/sbv_20200328.zip', 'dist').then(files => {
                        readFileSBV('dist/sbv_20200328.dat')
                    })
                } else if (fileName == '20200928/sbv_20200328.dat') {
                    readFileSBV(fileName);
                }
                if (fileName == '20200928/report_20200328.tar.gz' || fileName == '20200928/report_20200328.tar') {
                    readfileReport(fileName);
                    callback()
                }
                if (fileName == '20200928/statement_master_20170802.dat') {
                    let dataImportMaster = new Int8Array(fs.readFileSync('20200928/statement_master_20170802.dat'));
                    readMaster(dataImportMaster);
                }
                if (fileName == '20200928/statement_transaction_20170802.dat') {
                    let dataImportTransaction = new Int8Array(fs.readFileSync('20200928/statement_transaction_20170802.dat'));
                    readTransaction(dataImportTransaction);
                }

            } else console.log('Không tìm thấy file: ' + fileName);
            if (err) {
                return err
            }
        })
    }
}

function readAll(fileName) {
    if (fileName == '20200928/report_20200328') {
        if (fs.existsSync('20200928/report_20200328') == true) {
            readR63R02();
        }
    } else {
        fileExists(fileName, (err, exists) => {
            if (exists == true) {
                if (fileName == '20200928/sbv_20200328.zip') {
                    decompress('20200928/sbv_20200328.zip', '20200928/dist').then(files => {
                        readFileSBV('20200928/dist/sbv_20200328.dat')
                    })
                } else if (fileName == '20200928/sbv_20200328.dat') {
                    readFileSBV(fileName);
                }
                if (fileName == '20200928/report_20200328.tar.gz' || fileName == '20200928/report_20200328.tar') {
                    readfileReport(fileName);
                }
                if (fileName == '20200928/statement_master_20170802.dat') {
                    let dataImportMaster = new Int8Array(fs.readFileSync('20200928/statement_master_20170802.dat'));
                    readMaster(dataImportMaster);
                }
                if (fileName == '20200928/statement_transaction_20170802.dat') {
                    let dataImportTransaction = new Int8Array(fs.readFileSync('20200928/statement_transaction_20170802.dat'));
                    readTransaction(dataImportTransaction);
                }

            } else console.log('Không tìm thấy file');
            if (err) {
                return err
            }
        })
    }
}

function autoImport() {
    let tmp = 0;
    fs.readFile('test.txt', 'utf8', function(err, data) {
        tmp = parseInt(data);
        if (tmp == 0) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('sbv_') != null) {
                    if (file == "sbv_20200328.dat" || file == "sbv_20200328.zip" || file == "sbv_20200328_Masked.dat") {
                        readAll("20200928/" + file)
                        tmp = 1;
                        console.log("Thanh cong file sbv");
                        fs.readdirSync('20200928').forEach(file => {
                            if (file.match('report_20200328') != null) {
                                fs.mkdir("20200928/report", function(err) {})
                                if (file == 'report_20200328.tar.gz' || file == 'report_20200328.tar') {
                                    decompress('20200928/' + file, '20200928/report')
                                        .then(files => {},
                                            fs.readdirSync('20200928/report').forEach(file => {
                                                if (file.match('R02-Transaction_Journal_By_Account_Number_20200328') != null) {
                                                    readFileR02('20200928/report/R02-Transaction_Journal_By_Account_Number_20200328')
                                                    tmp = 2;
                                                    console.log("Thanh cong file r02");
                                                    fs.readdirSync('20200928/report').forEach(file => {
                                                        if (file.match('R63_Trial_Balance_20200328') != null) {
                                                            readFileR63('20200928/report/R63_Trial_Balance_20200328')
                                                            tmp = 3;
                                                            console.log("Thanh cong file r63");
                                                            fs.readdirSync('20200928').forEach(file => {
                                                                if (file.match('statement_master_20170802.dat') != null) {
                                                                    readAll('20200928/statement_master_20170802.dat');
                                                                    tmp = 4;
                                                                    console.log("Thanh cong file master")
                                                                    fs.readdirSync('20200928').forEach(file => {
                                                                        if (file.match('statement_transaction_20170802.dat') != null) {
                                                                            readAll('20200928/statement_transaction_20170802.dat')
                                                                            tmp = 0;
                                                                            console.log("Thanh cong file transaction")
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        }

                                                    })
                                                    fs.writeFile('test.txt', tmp.toString(), (err) => {
                                                        if (err) throw err;
                                                    });
                                                }
                                            })
                                        )
                                } else if (file == 'report_20200328') {
                                    findFile('20200928/report_20200328', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
                                        readFileR02('20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328')
                                        tmp = 2;
                                        console.log("Thanh cong file r02")
                                        findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
                                            readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
                                            tmp = 3;
                                            console.log("Thanh cong file r63");
                                            fs.readdirSync('20200928').forEach(file => {
                                                if (file.match('statement_master_20170802.dat') != null) {
                                                    readAll('20200928/statement_master_20170802.dat');
                                                    tmp = 4;
                                                    console.log("Thanh cong file master")
                                                    fs.readdirSync('20200928').forEach(file => {
                                                        if (file.match('statement_transaction_20170802.dat') != null) {
                                                            readAll('20200928/statement_transaction_20170802.dat')
                                                            tmp = 0;
                                                            console.log("Thanh cong file transaction ")
                                                        }
                                                    })
                                                }
                                            })
                                        });
                                    })
                                    fs.writeFile('test.txt', tmp.toString(), (err) => {
                                        if (err) throw err;
                                    });
                                }
                            }
                        })
                    }
                }

            })
        }
        if (tmp == 1) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('report_20200328') != null) {
                    if (file == 'report_20200328.tar.gz' || file == 'report_20200328.tar') {
                        fs.mkdir("20200928/report", function(err) {})
                        decompress('20200928/' + file, '20200928/report')
                            .then(files => {},
                                fs.readdirSync('20200928/report').forEach(file => {
                                    if (file.match('R02-Transaction_Journal_By_Account_Number_20200328') != null) {
                                        readFileR02('20200928/report/R02-Transaction_Journal_By_Account_Number_20200328')
                                        tmp = 2;
                                        console.log("Thanh cong file r02");
                                        fs.readdirSync('20200928/report').forEach(file => {
                                            if (file.match('R63_Trial_Balance_20200328') != null) {
                                                readFileR63('20200928/report/R63_Trial_Balance_20200328')
                                                tmp = 3;
                                                console.log("Thanh cong file r63");
                                                fs.readdirSync('20200928').forEach(file => {
                                                    if (file.match('statement_master_20170802.dat') != null) {
                                                        readAll('20200928/statement_master_20170802.dat');
                                                        tmp = 4;
                                                        console.log("Thanh cong file master")
                                                        fs.readdirSync('20200928').forEach(file => {
                                                            if (file.match('statement_transaction_20170802.dat') != null) {
                                                                readAll('20200928/statement_transaction_20170802.dat')
                                                                tmp = 0;
                                                                console.log("Thanh cong file transaction")
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            )

                    } else if (file == 'report_20200328') {
                        findFile('20200928/report_20200328', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
                            readFileR02('20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328')
                            tmp = 2;
                            console.log("Thanh cong file r02")
                            findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
                                readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
                                tmp = 3;
                                console.log("Thanh cong file r63");
                                fs.readdirSync('20200928').forEach(file => {
                                    if (file.match('statement_master_20170802.dat') != null) {
                                        readAll('20200928/statement_master_20170802.dat');
                                        tmp = 4;
                                        console.log("Thanh cong file master")
                                        fs.readdirSync('20200928').forEach(file => {
                                            if (file.match('statement_transaction_20170802.dat') != null) {
                                                readAll('20200928/statement_transaction_20170802.dat')
                                                tmp = 0;
                                                console.log("Thanh cong file transaction")
                                            }
                                        })
                                    }
                                })
                            });
                        })

                    }

                }

            })
            fs.writeFile('test.txt', tmp.toString(), (err) => {
                if (err) throw err;
            });
        }
        if (tmp == 2) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('report_20200328') != null) {
                    if (file == 'report_20200328.tar.gz' || file == 'report_20200328.tar') {
                        fs.mkdir("20200928/report", function(err) {})
                        decompress('20200928/' + file, '20200928/report')
                            .then(files => {},
                                fs.readdirSync('20200928/report').forEach(file => {
                                    if (file.match('R63_Trial_Balance_20200328') != null) {
                                        readFileR63('20200928/report/R63_Trial_Balance_20200328')
                                        tmp = 3;
                                        console.log("Thanh cong file r63");
                                        fs.readdirSync('20200928').forEach(file => {
                                            if (file.match('statement_master_20170802.dat') != null) {
                                                readAll('20200928/statement_master_20170802.dat');
                                                tmp = 4;
                                                console.log("Thanh cong file master")
                                                fs.readdirSync('20200928').forEach(file => {
                                                    if (file.match('statement_transaction_20170802.dat') != null) {
                                                        readAll('20200928/statement_transaction_20170802.dat')
                                                        tmp = 0;
                                                        console.log("Thanh cong file transaction")
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            )
                    } else if (file == 'report_20200328') {
                        findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
                            readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
                            tmp = 3;
                            console.log("Thanh cong file r63")
                            fs.readdirSync('20200928').forEach(file => {
                                if (file.match('statement_master_20170802.dat') != null) {
                                    readAll('20200928/statement_master_20170802.dat');
                                    tmp = 4;
                                    console.log("Thanh cong file master")
                                    fs.readdirSync('20200928').forEach(file => {
                                        if (file.match('statement_transaction_20170802.dat') != null) {
                                            readAll('20200928/statement_transaction_20170802.dat')
                                            tmp = 0;
                                            console.log("Thanh cong file transaction")

                                        }
                                    })
                                }
                            })
                        });

                    }

                }
            })
            fs.writeFile('test.txt', tmp.toString(), (err) => {
                if (err) throw err;
            });
        }
        if (tmp == 3) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('statement_master_20170802.dat') != null) {
                    readAll('20200928/statement_master_20170802.dat');
                    tmp = 4;
                    console.log("Thanh cong file master")
                    fs.readdirSync('20200928').forEach(file => {
                        if (file.match('statement_transaction_20170802.dat') != null) {
                            readAll('20200928/statement_transaction_20170802.dat')
                            tmp = 0;
                            console.log("Thanh cong file transaction")
                        }
                    })
                }
            })
            fs.writeFile('test.txt', tmp.toString(), (err) => {
                if (err) throw err;
            });
        }
        if (tmp == 4) {
            fs.readdirSync('20200928').forEach(file => {
                if (file.match('statement_transaction_20170802.dat') != null) {
                    readAll('20200928/statement_transaction_20170802.dat')
                    tmp = 0;
                    console.log("Thanh cong file transaction")
                }
            })
            fs.writeFile('test.txt', tmp.toString(), (err) => {
                if (err) throw err;
            });
        }

    })
}


function findFile(dir, filename, callback) {
    fs.readdirSync(dir).forEach(file => {
        if (file.match(filename) != null) {
            callback();
        } else return;
    })
}



function writeFiles(a) {
    fs.writeFile('test.txt', a, (err) => {
        if (err) throw err;
    });
}

function readR63R02() {
    findFile('20200928/report_20200328', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
        readFileR02('20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328')
        console.log('Thanh cong file r02');
        findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
            readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
            console.log('Thanh cong file r63');
        });
    })
}

function readR63R022(callback) {
    findFile('20200928/report_20200328', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
        readFileR02('20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328')
        console.log('Thành cong file r02');
        findFile('20200928/report_20200328', 'R63_Trial_Balance_20200328', () => {
            readFileR63('20200928/report_20200328/R63_Trial_Balance_20200328')
            console.log('Thành cong file r63');
            callback();
        });
    })
}



function readfileReport(filename) {
    if (filename == '20200928/report_20200328.tar.gz' || filename == '20200928/report_20200328.tar') {
        decompress(filename, '20200928/report_20200328').then(files => {
            readR63R02()
        });
    }

}

function readfileReport2(filename, callback) {
    if (filename == '20200928/report_20200328.tar.gz' || filename == '20200928/report_20200328.tar') {
        decompress(filename, '20200928/report').then(files => {
            findFile('20200928/report', 'R02-Transaction_Journal_By_Account_Number_20200328', () => {
                readFileR02('20200928/report/R02-Transaction_Journal_By_Account_Number_20200328')
                console.log('Thành cong file r02');
                findFile('20200928/report', 'R63_Trial_Balance_20200328', () => {
                    readFileR63('20200928/report/R63_Trial_Balance_20200328')
                    console.log('Thành cong file r63');
                    callback();
                });
            })

        });
    } else return

}

function readFileSBV2(file) {
    fs.readFile(file, 'utf8', function(err, data) {
        let sbvList = []
        lines = data.split("\n");
        for (var line of lines) {
            if (line.length != 4077 && line.length != 0) {
                let item = line.split(";")
                for (var i = 0; i < 73; i++) {
                    let c = {}
                    let cif = item[i];
                    let a = i.toString();
                    c.i = cif.trim();
                    sbvList.push(c);
                }

            }
        }
        fs.writeFile('SBV.txt', JSON.stringify(sbvList), (err) => {
            if (err) throw err;
        });

    })
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
                let colum8 = item[7];
                c.colum8 = colum8.trim();
                let colum9 = item[8];
                c.colum9 = colum9.trim();
                let colum10 = item[9];
                c.colum10 = colum10.trim();

                let colum11 = item[10];
                c.colum11 = colum11.trim();

                let colum12 = item[11];
                c.colum12 = colum12.trim();
                let colum13 = item[12];
                c.colum13 = colum13.trim();
                let colum14 = item[13];
                c.colum14 = colum14.trim();
                let colum15 = item[14];
                c.colum15 = colum15.trim();
                let colum16 = item[15];
                c.colum16 = colum16.trim();
                let colum17 = item[16];
                c.colum17 = colum17.trim();
                let colum18 = item[17];
                c.colum18 = colum18.trim();
                let colum19 = item[18];
                c.colum19 = colum19.trim();
                let colum20 = item[19];
                c.colum20 = colum20.trim();
                let colum21 = item[20];
                c.colum21 = colum21.trim();
                let colum22 = item[21];
                c.colum22 = colum22.trim();
                let colum23 = item[22];
                c.colum23 = colum23.trim();
                let colum24 = item[23];
                c.colum24 = colum24.trim();
                let colum25 = item[24];
                c.colum25 = colum25.trim();

                sbvList.push(c);
            }
        }
        fs.writeFile('SBV.txt', JSON.stringify(sbvList), (err) => {
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

        fs.writeFile('r63.txt', JSON.stringify(r63), (err) => {
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
        fs.writeFile('r02.txt', JSON.stringify(r02), (err) => {
            if (err) throw err;
        });
    })
}

function readData() {
    let dataImportMaster = new Int8Array(fs.readFileSync('20200928/statement_master_20170802.dat'));
    readMaster(dataImportMaster)
    let dataImportTransaction = new Int8Array(fs.readFileSync('20200928/statement_transaction_20170802.dat'));
    readTransaction(dataImportTransaction);
}

function readMaster(dataImportMaster) {
    let masterList = [];
    let firstRedundant = 0;
    const STM_MST_LENGTH = 750;
    while (dataImportMaster.length > 0) {
        if (firstRedundant == 0) {
            dataImportMaster = dataImportMaster.subarray(STM_MST_LENGTH - 1);
            firstRedundant = 1;
        } else {
            const checkLength = dataImportMaster.subarray(0, STM_MST_LENGTH).length;
            if (checkLength == STM_MST_LENGTH) {
                statementItem = dataImportMaster.subarray(0, STM_MST_LENGTH);
                dataImportMaster = dataImportMaster.subarray(STM_MST_LENGTH);
                if (dataImportMaster.length < 750) {
                    return fs.writeFile('data_master.txt', JSON.stringify(masterList), (err) => {
                        if (err) throw err;
                    });
                }
                let statementMaster = {};
                let account_number = printHexBinary(statementItem.subarray(14, 14 + 9));
                if (account_number.length > 16) account_number = account_number.substring(account_number.length - 17, account_number.length - 1);
                statementMaster.account_number = account_number;


                let cif_number = printHexBinary(statementItem.subarray(45, 45 + 9));
                if (cif_number.length > 16) cif_number = cif_number.substring(cif_number.length - 17, cif_number.length - 1);
                statementMaster.cif_number = cif_number;

                let customer_name = new Buffer.from(statementItem.subarray(494, 494 + 26));
                statementMaster.customer_name = ebcdicToAscii(customer_name).trim();

                let customer_phone_no = new Buffer.from(statementItem.subarray(521, 521 + 18));
                statementMaster.customer_phone_no = ebcdicToAscii(customer_phone_no).trim();

                let customer_address_1 = new Buffer.from(statementItem.subarray(539, 539 + 33));
                statementMaster.customer_address_1 = ebcdicToAscii(customer_address_1).trim();

                let customer_address_2 = new Buffer.from(statementItem.subarray(571, 571 + 33));
                statementMaster.customer_address_2 = ebcdicToAscii(customer_address_2).trim();

                let customer_address_3 = new Buffer.from(statementItem.subarray(605, 605 + 32));
                statementMaster.customer_address_3 = ebcdicToAscii(customer_address_3).trim();

                let card_name = new Buffer.from(statementItem.subarray(636, 636 + 26));
                statementMaster.card_name = ebcdicToAscii(card_name).trim();

                let card_no = ebcdicToAscii(new Buffer.from(statementItem.subarray(663, 663 + 19)));
                statementMaster.card_no = card_no.slice(0, 7) + '******' + card_no.slice(7, 13);

                let card_type = new Buffer.from(statementItem.subarray(682, 682 + 19));
                statementMaster.card_type = ebcdicToAscii(card_type).trim();

                let statement_date = printHexBinary(new Buffer.from(statementItem.subarray(333, 333 + 4)));
                statementMaster.statement_date = moment(statement_date.slice(0, -1), 'YYYYDDD').format('YYYY-MM-DD');

                let payment_due_date = printHexBinary(new Buffer.from(statementItem.subarray(341, 341 + 4)));
                statementMaster.payment_due_date = moment(payment_due_date.slice(0, -1), 'YYYYDDD').format('YYYY-MM-DD');


                let current_balance = new Buffer.from(statementItem.subarray(140, 140 + 6));
                statementMaster.current_balance = Number(printHexBinary(current_balance).slice(0, -1)) ? Number(printHexBinary(current_balance).slice(0, -1)) : null;

                let credit_limit = new Buffer.from(statementItem.subarray(328, 328 + 5));
                statementMaster.credit_limit = Number(printHexBinary(credit_limit).slice(0, -1)) ? Number(printHexBinary(credit_limit).slice(0, -1)) : null;

                let amount_past_due = new Buffer.from(statementItem.subarray(316, 316 + 6));
                statementMaster.amount_past_due = Number(printHexBinary(amount_past_due.slice(0, -1))) ? Number(printHexBinary(amount_past_due.slice(0, -1))) : null;

                let current_payment_due = new Buffer.from(statementItem.subarray(322, 322 + 6));
                statementMaster.current_payment_due = Number(printHexBinary(current_payment_due).slice(0, -1));

                let point_balance = new Buffer.from(statementItem.subarray(702, 702 + 6));
                statementMaster.point_balance = Number(printHexBinary(point_balance).slice(0, -1));

                let point_this_month = new Buffer.from(statementItem.subarray(708, 708 + 6));
                statementMaster.point_this_month = Number(printHexBinary(point_this_month).slice(0, -1));

                let point_expiry_date = printHexBinary(new Buffer.from(statementItem.subarray(714, 714 + 4)));
                statementMaster.point_expiry_date = moment(payment_due_date.slice(0, -1), 'YYYYDDD').format('YYYY-MM-DD');

                let point_expired = new Buffer.from(statementItem.subarray(718, 718 + 6));
                statementMaster.point_expired = Number(printHexBinary(point_expired).slice(0, -1));

                let previous_balance_1 = new Buffer.from(statementItem.subarray(75, 75 + 6));
                previous_balance_1 = getDoubleFromSignedString(printHexBinary(previous_balance_1).slice(0, -1))

                let previous_balance_2 = new Buffer.from(statementItem.subarray(209, 209 + 6));

                previous_balance_2 = getDoubleFromSignedString(printHexBinary(previous_balance_2).slice(0, -1))

                statementMaster.previous_balance = previous_balance_1 + previous_balance_2

                let amount_payment_credit_1 = new Buffer.from(statementItem.subarray(104, 104 + 6));
                let amount_payment_credit_2 = new Buffer.from(statementItem.subarray(238, 238 + 6));
                amount_payment_credit_1 = getDoubleFromSignedString(printHexBinary(amount_payment_credit_1).slice(0, -1));
                amount_payment_credit_2 = getDoubleFromSignedString(printHexBinary(amount_payment_credit_2).slice(0, -1))

                statementMaster.totalAmountPaymentsCredits = amount_payment_credit_1 + amount_payment_credit_2;

                let amount_purchases = new Buffer.from(statementItem.subarray(96, 96 + 6));
                statementMaster.totalAmountPurchases = getDoubleFromSignedString(printHexBinary(amount_purchases).slice(0, -1));

                let amount_cash = new Buffer.from(statementItem.subarray(230, 230 + 6));
                statementMaster.totalAmountCash = getDoubleFromSignedString(printHexBinary(amount_cash).slice(0, -1));

                let amount_interest_1 = new Buffer.from(statementItem.subarray(128, 128 + 6));
                let amount_interest_2 = new Buffer.from(statementItem.subarray(262, 262 + 6));
                amount_interest_1 = getDoubleFromSignedString(printHexBinary(amount_interest_1).slice(0, -1));
                amount_interest_2 = getDoubleFromSignedString(printHexBinary(amount_interest_2).slice(0, -1));

                statementMaster.totalAmountInterest = amount_interest_1 + amount_interest_2;

                let amount_balance_1 = new Buffer.from(statementItem.subarray(140, 140 + 6));
                let amount_balance_2 = new Buffer.from(statementItem.subarray(268, 268 + 6));
                amount_balance_1 = getDoubleFromSignedString(printHexBinary(amount_balance_1).slice(0, -1));
                amount_balance_2 = getDoubleFromSignedString(printHexBinary(amount_balance_2).slice(0, -1));

                statementMaster.statementBalance = amount_balance_1 + amount_balance_2;
                masterList.push(statementMaster);

            } else {
                return;
            }

        }
    }
}


function readTransaction(dataImportTransaction) {
    let firstRedundant = 0;
    let transactionList = [];
    const STM_TRANS_LENGTH = 505;
    while (dataImportTransaction.length > 0) {
        if (firstRedundant == 0) {
            dataImportTransaction = dataImportTransaction.subarray(STM_TRANS_LENGTH - 1);
            firstRedundant = 1;
        } else {
            const checkLength = dataImportTransaction.subarray(0, STM_TRANS_LENGTH).length;
            if (checkLength == STM_TRANS_LENGTH) {
                statementItem = dataImportTransaction.subarray(0, STM_TRANS_LENGTH);
                dataImportTransaction = dataImportTransaction.subarray(STM_TRANS_LENGTH);
                if (dataImportTransaction.length < 750) {
                    return;
                }
                let statementTrans = {};

                let account_number = printHexBinary(statementItem.subarray(10, 10 + 9));
                if (account_number.length > 16) account_number = account_number.substring(account_number.length - 17, account_number.length - 1);
                statementTrans.account_number = account_number;

                let transactionDate = printHexBinary(new Buffer.from(statementItem.subarray(38, 38 + 4)));
                statementTrans.transactionDate = moment(transactionDate.slice(0, -1), 'YYYYDDD').format('YYYY-MM-DD');

                let postingDate = printHexBinary(new Buffer.from(statementItem.subarray(56, 56 + 4)));
                statementTrans.postingDate = moment(postingDate.slice(0, -1), 'YYYYDDD').format('YYYY-MM-DD');

                let cardNo = ebcdicToAscii(new Buffer.from(statementItem.subarray(19, 19 + 19)));
                statementTrans.cardNo = cardNo.substring(cardNo.length - 4)

                let merchantName = ebcdicToAscii(new Buffer.from(statementItem.subarray(99, 99 + 25)));
                statementTrans.merchantName = merchantName.trim();

                let merchantCity = ebcdicToAscii(new Buffer.from(statementItem.subarray(124, 124 + 13)));
                statementTrans.merchantCity = merchantCity.trim();

                let merchantCountry = ebcdicToAscii(new Buffer.from(statementItem.subarray(137, 137 + 2)));
                statementTrans.merchantCountry = merchantCountry.trim();

                let transactionAmount = printHexBinary(new Buffer.from(statementItem.subarray(50, 50 + 6)));
                statementTrans.transactionAmount = Number(transactionAmount.trim().slice(0, -1));

                let transactionAmountSign = printHexBinary(new Buffer.from(statementItem.subarray(305, 305 + 2)));
                statementTrans.transactionAmountSign = transactionAmountSign.trim().slice(0, -1);
                transactionList.push(statementTrans);
                // console.log('@@@@@@ ', transactionList);
                fs.writeFile('data_transaction.txt', JSON.stringify(transactionList), (err) => {
                    if (err) throw err;
                });

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

/*function ebcdicToAscii(uintArray) {
    return cptable.utils.decode(500, uintArray, 'arr');
}*/

function ebcdicToAscii(uintArray) {
    //cptable.utils.decode(500, uintArray, 'arr');
    let tmp = ''

    //cptable.utils.decode(500, uintArray, 'arr');
    uintArray.toString("hex").match(/.{1,2}/g).forEach(char => {
        const val = EBCDIC.toASCII(char.toUpperCase());
        tmp += val;

    });

    return tmp.toString()
}

function getDoubleFromSignedString(numString) {
    if (Number(numString)) {
        if (numString < 0) return Number(numString) * -1;
        else return Number(numString);
    } else {
        return 0;
    }
}
































/*var fs = require("fs"),
    zlib = require("zlib"),
    filename = "20200928/sbv_20200328.dat",
    compress = zlib.createGzip(), // compress
    decompress = zlib.createGunzip(), // decompress
    readstream = fs.createReadStream(filename);

function compressfile(filename) {
    var newfilename = filename + ".zip",
        writestream = fs.createWriteStream(newfilename);
    readstream.pipe(compress).pipe(writestream);
}

function decompressfile(filename) {
    var newfilename = filename.replace(".zip", ""),
        writestream = fs.createWriteStream(newfilename);
    readstream.pipe(decompress).pipe(writestream);
}

if (/.zip$/i.test(filename) == true) {
    decompressfile(filename)
} else {
    compressfile(filename);
}*/