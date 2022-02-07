const React = require('react')

const config = require('../../config')

const { dispatcher } = require('../lib/dispatcher')

module.exports = class WrongNetworkModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render () {
    return (
      <div className='custom-modal create-magnet-modal' style={{ width: 678 }}>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} draggable={false} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/ShieldFail.png`} draggable={false} />
        </div>
        <span className='content-title' style={{ marginBottom: 20 }}>Wrong Network</span>
        <div className="gray-title">You are on the wrong network. </div>
      </div>
    )
  }
}
