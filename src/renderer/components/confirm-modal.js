const React = require('react')

const config = require('../../config')

const CircularProgress = require('material-ui/CircularProgress').default
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class ConfirmModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className='custom-modal create-magnet-modal' style={{ width: 678 }}>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Shield.png`} />
        </div>
        <span className='content-title' style={{ marginBottom: 20 }}>Please Confirm</span>
        <div className="gray-title">Please confirm the transaction on the wallet app </div>
        <div className="progress-container">
          <CircularProgress color="#cc4673" size={72} />
        </div>
        <div className="gray-title" style={{ marginTop: 20 }}>Waiting...</div>
      </div>
    )
  }
}
