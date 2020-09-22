const {sendResponse, waitProps} = require('electron-custom-dialog')
const questionEl = document.getElementById('question')
const yesBtn = document.getElementById('yesBtn')
const noBtn = document.getElementById('noBtn')

waitProps().then((props) => {
  questionEl.textContent = props.question
  yesBtn.addEventListener('click', () => {
    sendResponse(true)
  });
  noBtn.addEventListener('click', () => {
    sendResponse(false)
  });
})
 