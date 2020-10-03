const {sendResponse, waitProps} = require('electron-custom-dialog')
const cancelBtn = document.getElementById("cancel_btn");
const stakeBtn = document.getElementById("stake_btn");
const stakeAmount = document.getElementById("stake_amount");
waitProps().then((props) => {
    cancelBtn.addEventListener('click', () => {
        sendResponse(-1)
    });
    stakeBtn.addEventListener('click', () => {
        sendResponse(stakeAmount.value)
    });
})
 