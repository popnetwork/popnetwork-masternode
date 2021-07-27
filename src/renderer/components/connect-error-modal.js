const React = require('react')

const config = require('../../config')

const CustomButton = require('./custom-button')
const TextField = require('material-ui/TextField').default
const { dispatch, dispatcher } = require('../lib/dispatcher')
const { isMagnetLink } = require('../lib/torrent-player')

module.exports = class CreateMagnetModal extends React.Component {
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
        <span className='content-title'>Error</span>
        <div className="gray-title">User closed modal.</div>
        <div className="gray-title">If the problem persist please Contact support</div>
        <div className="button-container" style={{ marginTop: 50 }}>
          <CustomButton
            label="Try again"
            onClick={dispatcher('exitModal')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
