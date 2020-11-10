const {sendResponse, waitProps} = require('electron-custom-dialog');
const cancelBtn = document.getElementById("cancel_btn");
const stakeBtn = document.getElementById("stake_btn");
const stakeAmount = document.getElementById("stake_amount");
const stakeAmountAlert = document.getElementById("stake_amount_alert");

waitProps().then((props) => {
    var prevStakeAmount = 50000;
    stakeAmount.addEventListener("input", function(e) {
        var curStakeAmount = e.target.value;
        if (curStakeAmount.toString().length > 18) {
            stakeAmount.value = prevStakeAmount;
            return;
        }
        if (parseInt(curStakeAmount) === parseInt(prevStakeAmount) + 1) {
            curStakeAmount = (Math.floor(curStakeAmount / 50000) + 1) * 50000;
        } else if(parseInt(curStakeAmount) === parseInt(prevStakeAmount) - 1) {
            curStakeAmount = Math.floor(curStakeAmount / 50000) * 50000;
            if (curStakeAmount < 0) curStakeAmount = 0;
        }
        stakeAmount.value = curStakeAmount;
        if (curStakeAmount < 50000) {
            stakeAmountAlert.innerHTML = "Minimum amount is 50000.";
        } else {
            stakeAmountAlert.innerHTML = "";
        }
        prevStakeAmount = curStakeAmount;
    }) 
    stakeAmount.addEventListener("keydown", function(e) {
        var curStakeAmount = e.target.value;
        if (curStakeAmount.toString().length > 18) {
            stakeAmount.value = prevStakeAmount;
            return;
        }
        if (e.code === "ArrowUp") {
            curStakeAmount = (Math.floor((Integer(curStakeAmount) + 1) / 50000) + 1) * 50000;
        } else if(e.code === "ArrowDown") {
            curStakeAmount = Math.floor((Integer(curStakeAmount) - 1) / 50000) * 50000;
            if (curStakeAmount < 0) curStakeAmount = 0;
        }
        stakeAmount.value = curStakeAmount;
        if (curStakeAmount < 50000) {
            stakeAmountAlert.innerHTML = "Minimum amount is 50000.";
        } else {
            stakeAmountAlert.innerHTML = "";
        }
        prevStakeAmount = curStakeAmount;
    });
    cancelBtn.addEventListener('click', () => {
        sendResponse(-1)
    });
    stakeBtn.addEventListener('click', () => {

        if (stakeAmount.value < 50000) {
            stakeAmountAlert.innerHTML = "Minimum amount is 50000.";
            return;
        }
        sendResponse(stakeAmount.value)
    });
})
 