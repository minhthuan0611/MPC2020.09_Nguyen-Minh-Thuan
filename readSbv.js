const decompress = require('decompress');
const fs = require('fs');
const moment = require('moment');
const readAllFile = require('./index.js');

var isImportStatementDate = false;
var isImportSuccess = false;
const readFiles = require('./index.js')




class DataImportHistoryEntity {
    constructor(id, importDate, startTime, endTime, status) {
        this.id = id;
        this.importDate = importDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status
    }
    toDto() {
        return {
            id: +this.id,
            importDate: this.importDate,
            startTime: moment(this.startTime).format(
                DATE_TIME_PATTERN
            ),
            endTime: moment(this.endTime).format(
                DATE_TIME_PATTERN
            ),
            status: this.status
        };
    }
}
class DataImportHistoryDetailsEntity {
    constructor(id,
        fileName,
        affectedRecordNumber,
        fileType,
        startTime,
        endTime,
        status,
        log,
        dataImportHistoryId) {
        this.id = id;
        this.fileName = fileName;
        this.affectedRecordNumber = affectedRecordNumber;
        this.fileType = fileType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.log = log;

    }

    toDto() {
        return {
            id: +this.id,
            fileName: this.fileName,
            affectedRecordNumber: this.affectedRecordNumber,
            fileType: this.fileType,
            startTime: moment(this.startTime).format(
                SystemConstant.DATE_TIME_PATTERN
            ),
            endTime: moment(this.endTime).format(
                SystemConstant.DATE_TIME_PATTERN
            ),
            status: this.status,
            log: this.log,
            dataImportHistoryId: this.dataImportHistoryId
        };
    }
}

const BATCH_HEADER = 'BH';
const BATCH_TRAILER = 'BT';
const IMPORT_FILE_NAME_DATE_PATTERN = 'yyyyMMDD';
const DATE_PATTERN = '{{date}}';
const FILE_EXTENSION = '.dat';
//const DATE_PATTERN = 'DD/MM/YYYY';
const DATE_TIME_PATTERN = 'DD/MM/YYYY HH:mm:ss';
const DATE_PATTERN_UTC = 'YYYY/MM/DD';
//const IMPORT_FILE_NAME_DATE_PATTERN = 'YYYYMMDD';
const DEFAULT_FROM_DATE = '01/01/0001';
const FILE_DELIMITER = ';';
const PASSWORD_EXPIRED_DAYS = 180;
const FILE_DASH = '-';
const IMPORT_SUCCESS = 1;
const IMPORT_FAILED = 2;
const IMPORT_PENDING = 3;
const IMPORT_PROCESSING = 4;

const TYPE_CARD_INFO = 1;
const TYPE_TRANSACTION = 2;
const TYPE_BALANCE = 3;
const TYPE_STATEMENT = 4;

const MAX_RETRY = 3;
const SLEEP_MINUTES = 5;

//Messages constants
const LOGGER_NAME = 'import-file-log';
const FILE_FORMAT_INVALID_MSG = 'File format invalid';
const FILE_NOT_FOUND_MSG = 'File not found';
const IMPORT_TO_DB_FAILED_MSG = 'Saving to Database failed';
const IMPORT_PENDING_DUE_TO_PREVIOUS_FAIL =
    'Pending import task due to previous file failed';
const IMPORT_UPDATED_TO_FAILED = 'Updated status from pending to failed';
const IMPORT_EMPTY_RECORD_MSG = 'No record is imported';
const IMPORT_SERVICE_NULL = 'Import service is null';
const SAVED_TO_DB_SUCCESSFULLY = ' record(s) saved to Database';
const IMPORT_STATUS_MUST_BE_FAILED =
    'Status of re-import file must be failed';
const dir = '20200928'

async function giainen() {
    if (isFileExist(dir + '/sbv_20200328.zip') == true) {
        decompress(dir + '/sbv_20200328.zip', dir)
    }
    if (isFileExist(dir + '/report_20200328.tar') == true) {
        decompress(dir + '/report_20200328.tar', dir)
    } else if (isFileExist(dir + '/report_20200328.tar.gz') == true) {
        decompress(dir + '/report_20200328.tar.gz', dir)
    }
}


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
giainen().then(i => { importData() })
const startCronTime1 = moment();

async function importData() {

    // Setting start time
    const startCronTime = moment();
    // Setting MUST end time - cron must run within 1 hour
    const endCronTime = moment().add(1, 'hour');
    console.log(`**************************`);
    console.log(`* DAILY AUTO IMPORT DATA *`);
    console.log(`**************************`);
    console.log(`Starting import job at: ${startCronTime}`);
    console.log(
        `Latest time to wait or set job to be failed: ${endCronTime}`
    );
    const yesterdayDate = moment(startCronTime.subtract(1, 'day').toDate()).format('YYYYMMDD');

    // Preparing detail
    const cardInfoFileName = '20200928/sbv_20200328.dat';

    const dailyTransactionFileName = '20200928/report_20200328/R02-Transaction_Journal_By_Account_Number_20200328';
    const balanceName = '20200928/report_20200328/R63_Trial_Balance_20200328';
    const fileNames = await [cardInfoFileName, dailyTransactionFileName, balanceName];
    dataImportHistoryDetailsCardInfo = await createDetailHistory(cardInfoFileName, IMPORT_PENDING, TYPE_CARD_INFO);
    dataImportHistoryDetailsDailyTransaction = await createDetailHistory(dailyTransactionFileName, IMPORT_PENDING, TYPE_TRANSACTION);
    dataImportHistoryDetailsBalance = await createDetailHistory(balanceName, IMPORT_PENDING, TYPE_BALANCE);

    const statementMstName = '20200928/statement_master_20170802.dat';
    const statementTransName = '20200928/statement_transaction_20170802.dat';
    const statementFileNames = await [statementMstName, statementTransName];
    dataImportHistoryDetailsStatementMaster = await createDetailHistory(statementMstName, IMPORT_PENDING, TYPE_STATEMENT);
    dataImportHistoryDetailsStatementTransaction = await createDetailHistory(statementTransName, IMPORT_PENDING, TYPE_STATEMENT);

    //Checking files exist
    console.log('Kiểm tra tất cả file có tồn tại');
    let currentStartTime = moment();
    while (isAllFileExist(fileNames) == false && currentStartTime.isBefore(endCronTime)) {
        console.log("Thời gian hiện hành: " + currentStartTime);
        console.log("Không đủ file trong dir: " + dir);
        console.log(`Dừng ${SLEEP_MINUTES} phút trước khi thử lại...`);
        await sleep(0.1 * 60 * 1000);
        currentStartTime = moment();
        console.log('Thử kiểm tra lại ...');
    }
    if (isAllFileExist(fileNames)) {
        console.log('Tất cả file tồn tại - bắt đầu import');
    }
    /*
     * Importing card info file
     */
    runningTime = 0;
    detailStart = moment().toString();
    while (runningTime++ < MAX_RETRY) {
        console.log("========================================================");
        console.log("Starting import Card Information File - Time : " + runningTime);
        try {
            dataImportHistoryDetailsCardInfo = await importFile(cardInfoFileName, 'sbv_20200328.dat');
            dataImportHistoryDetailsCardInfo.startTime = detailStart;
            break;
        } catch (ex) {
            console.log(`Importing Card Information FAILED ${ex}`);
            if (runningTime < MAX_RETRY) {
                console.log("Retrying ...");
                await sleep(10 * 1000);
            } else {
                dataImportHistoryDetailsCardInfo = createDetailHistory('sbv_20200328.dat', IMPORT_FAILED, TYPE_CARD_INFO);
                dataImportHistoryDetailsCardInfo.startTime = detailStart;
                dataImportHistoryDetailsCardInfo.log = ex.toString();
                dataImportHistoryDetailsCardInfo.endTime = moment().toString();
                return checkingImportStatement(statementFileNames);
            }
        }
    }

    /*
     * Importing daily transaction file
     */
    runningTime = 0;
    detailStart = moment().toString();
    while (runningTime++ < MAX_RETRY) {
        console.log("========================================================");
        console.log("Starting import Daily Transaction File - Time : " + runningTime);
        try {
            dataImportHistoryDetailsDailyTransaction = await importFile(dailyTransactionFileName, 'R02-Transaction_Journal_By_Account_Number_20200328');
            dataImportHistoryDetailsDailyTransaction.startTime = detailStart;
            break;
        } catch (e) {
            console.log("Import Daily Transaction FAILED", e);
            if (runningTime < MAX_RETRY) {
                console.log("Retrying ...");
                await sleep(10 * 1000);
            } else {
                dataImportHistoryDetailsDailyTransaction = createDetailHistory('R02-Transaction_Journal_By_Account_Number_20200328', IMPORT_FAILED, TYPE_TRANSACTION);
                dataImportHistoryDetailsDailyTransaction.startTime = detailStart;
                dataImportHistoryDetailsDailyTransaction.log = e.toString();
                dataImportHistoryDetailsDailyTransaction.endTime = moment().toString();
                return checkingImportStatement(statementFileNames);
            }
        }
    }
    /*
     * Importing balance file
     */
    runningTime = 0;
    detailStart = moment().toString();
    while (runningTime++ < MAX_RETRY) {
        console.log("========================================================");
        console.log("Starting import Balance File - Time : " + runningTime);
        try {
            dataImportHistoryDetailsBalance = await importFile(balanceName, 'R63_Trial_Balance_20200328');
            dataImportHistoryDetailsBalance.startTime = detailStart.toString();
            isImportSuccess = true;
            break;
        } catch (e) {
            console.log("Import Balance FAILED", e);
            if (runningTime < ImportFileConstant.MAX_RETRY) {
                console.log("Retrying ...");
                await sleep(10 * 1000);
            } else {
                dataImportHistoryDetailsBalance = createDetailHistory('R63_Trial_Balance_20200328', IMPORT_FAILED, TYPE_BALANCE);
                dataImportHistoryDetailsBalance.startTime = detailStart;
                dataImportHistoryDetailsBalance.log = e;
                dataImportHistoryDetailsBalance.endTime = moment().toString();
                return checkingImportStatement(statementFileNames);
            }
        }
    }

    //call handle success
    return checkingImportStatement(statementFileNames);
}

/**
 * Handle finished job
 */
async function handleFinish() {
    let endTime = moment().toString();
    console.log(
        'Imported Card Info : ' +
        JSON.stringify(dataImportHistoryDetailsCardInfo) + '\n'
    );
    console.log(
        'Imported Card Transaction : ' +
        JSON.stringify(dataImportHistoryDetailsDailyTransaction) + '\n'
    );
    console.log(
        'Imported Balance : ' +
        JSON.stringify(dataImportHistoryDetailsBalance) + '\n'
    );
    if (isImportStatementDate) {
        console.log(
            'Imported Statement Master : ' +
            JSON.stringify(dataImportHistoryDetailsStatementMaster) + '\n'
        );
        console.log(
            'Imported Statement Transaction : ' +
            JSON.stringify(dataImportHistoryDetailsStatementTransaction)
        );
    }

    let dataImportHistory = new DataImportHistoryEntity();
    dataImportHistory.startTime = startCronTime1.toString();
    dataImportHistory.importDate = String(moment().format('YYYY-MM-DD'));
    if (isImportSuccess) {
        dataImportHistory.status = IMPORT_SUCCESS;
        if (isImportStatementDate)
            dataImportHistory.endTime = endTime;
        else {
            dataImportHistory.endTime = assumeEndTime.toString();
        }
    } else {
        dataImportHistory.status = IMPORT_FAILED;
        dataImportHistory.endTime = endTime;
    }


    if (isImportSuccess) {
        console.log(`Tự động import đã hoàn thành lúc ${endTime} với trạng thái Success`);
        console.log('Gửi thông báo cho quản trị viên qua Email');
        console.log('*******************************************');
        console.log('* Import thành công*');
        console.log('*******************************************');
    } else {
        console.log(`Tự động import đã hoàn thành lúc ${endTime} với trạng thái Fail`);
        console.log('Gửi thông báo cho quản trị viên qua Email');
        console.log('****************************');
        console.log('* Import thất bại*');
        console.log('****************************');
    }

    return dataImportHistory;
}

/**
 * checkingImportStatement
 *
 * @return
 * @throws InterruptedException
 */

async function checkingImportStatement(statementFileNames) {
    const endCronTime = moment().add(1, 'hour');
    /*
     *  Checking if it is statement Import file
     */
    assumeEndTime = moment();
    let currentStartTime = moment();
    console.log('****************************');
    console.log('* KIỂM TRA FILE STATEMENT *');
    console.log('****************************');
    console.log('kiểm tra lúc: ' + currentStartTime.toString());
    while (isAllFileExist(statementFileNames) == false &&
        currentStartTime.isBefore(endCronTime)
    ) {
        console.log('Thời gian hiện hành: ' + currentStartTime);
        console.log('Không đủ file statement trong dir: ' + dir);
        console.log(`Dừng ${SLEEP_MINUTES} phút trước khi thử lại...`);
        await sleep(0.1 * 60 * 1000);
        currentStartTime = moment();
        console.log('Thử kiểm tra lại ...');
    }
    if (
        isFileExist2(statementFileNames[0]) == true || isFileExist2(statementFileNames[1] == true)
    ) {
        console.log('****************************************');
        console.log('* CHECKING DONE - IMPORT STATEMENT DAY *');
        console.log('****************************************');
        isImportStatementDate = true;
        if (isImportSuccess)
            await callImportStatement(
                statementFileNames[0],
                statementFileNames[1]
            );
    } else {
        isImportStatementDate = false;
        console.log('********************************************');
        console.log('* CHECKING DONE - NOT IMPORT STATEMENT DAY *');
        console.log('********************************************');
    }
    return handleFinish();
}

async function callImportStatement(statementMstName, statementTransName) {
    console.log("Start importing");
    let runningTime = 0;
    let detailStart = moment();
    while (runningTime++ < MAX_RETRY) {
        //Importing statement file
        console.log('========================================================');
        console.log('Starting import Statement File - Time : ' + runningTime);
        console.log('========================================================');
        try {
            const result1 = await importFile(statementMstName, 'statement_master_20170802.dat');
            const result2 = await importFile(statementTransName, 'statement_transaction_20170802.dat');
            dataImportHistoryDetailsStatementMaster = result1;
            dataImportHistoryDetailsStatementTransaction = result2;
            dataImportHistoryDetailsStatementMaster.startTime = detailStart.toString();
            dataImportHistoryDetailsStatementTransaction.startTime = detailStart.toString();
            break;
        } catch (ex) {
            console.log('Import Statement FAILED', ex);
            dataImportHistoryDetailsStatementMaster = createDetailHistory(
                statementMstName,
                IIMPORT_FAILED,
                TYPE_STATEMENT
            );
            dataImportHistoryDetailsStatementTransaction = createDetailHistory(
                statementTransName,
                IMPORT_FAILED,
                TYPE_STATEMENT
            );
            if (runningTime < MAX_RETRY) {
                console.log('Retrying ...');
                await sleep(10 * 1000);
            } else {
                dataImportHistoryDetailsStatementMaster.startTime = moment(detailStart, 'YYYY/MM/DD');
                dataImportHistoryDetailsStatementTransaction.startTime = moment(detailStart, 'YYYY/MM/DD');
                dataImportHistoryDetailsStatementMaster.log = ex.toString();
                dataImportHistoryDetailsStatementTransaction.log = ex.toString();
                dataImportHistoryDetailsStatementMaster.endTime = moment().toString();
                dataImportHistoryDetailsStatementTransaction.endTime = moment().toString();
            }
        }
    }
}

/**
 * Create detail history
 *
 * @param fileName for file name
 * @param status   with status
 * @return detailHistory
 */
function createDetailHistory(fileName, status, fileType) {
    isImportSuccess = (IMPORT_SUCCESS == status);
    dataImportHistoryDetails = new DataImportHistoryDetailsEntity();
    dataImportHistoryDetails.affectedRecordNumber = 0;
    dataImportHistoryDetails.fileType = fileType;
    if (IMPORT_PENDING == status) {
        dataImportHistoryDetails.log = IMPORT_PENDING_DUE_TO_PREVIOUS_FAIL;
    }
    dataImportHistoryDetails.status = status;
    dataImportHistoryDetails.fileName = fileName;
    fs.writeFileSync('importHisstory.txt', JSON.stringify(dataImportHistoryDetails))
    return dataImportHistoryDetails;

}

/**
 * Checking all fileNames are existed
 *
 * @param fileNames fileNames to check
 * @return true if all are existed
 */
function isAllFileExist(fileNames) {
    for (const s of fileNames) {
        if (isFileExist(s) == false) {
            console.log(`File ${s} does not exist!`);
            return false;
        }
    }
    return true;
}

/**
 * Checking fileNames are existed
 *
 * @param fileNames fileNames to check
 * @return true if existed
 */
function isFileExist2(fileName) {
    if (isFileExist(fileName) == false) {
        console.log(`File ${fileName} does not exist!`);
        return false;
    }
    return true;
}


function isFileExist(fileAbsolutePath) {
    return fs.existsSync(fileAbsolutePath);
}



async function importFile(filePath, fileName) {
    console.log(`Start importing data flow`);
    if (isFileExist(filePath)) {
        console.log(
            `File ${fileName} exists  - continue`
        );
        try {
            return await importToDatabase(filePath, fileName);
        } catch (e) {
            console.log(`IMPORT FAILED - File ${fileName} wrong format ${e}`);
            throw new Error(IMPORT_TO_DB_FAILED_MSG);

        }
    } else {
        console.log(
            `IMPORT FAILED - File ${fileName} not found in ${filePath}`
        );
        throw new Error(FILE_NOT_FOUND_MSG);
    }
}

async function importToDatabase(filePath, fileName) {
    const counted = await readAllFile(filePath);
    const dataImportHistoryDetails = new DataImportHistoryDetailsEntity();
    dataImportHistoryDetails.affectedRecordNumber = '';
    dataImportHistoryDetails.status = IMPORT_SUCCESS;
    dataImportHistoryDetails.fileName = fileName;
    dataImportHistoryDetails.fileType = TYPE_CARD_INFO
    dataImportHistoryDetails.log = dataImportHistoryDetails.affectedRecordNumber + SAVED_TO_DB_SUCCESSFULLY
    dataImportHistoryDetails.endTime = moment().toString();
    return dataImportHistoryDetails;
}