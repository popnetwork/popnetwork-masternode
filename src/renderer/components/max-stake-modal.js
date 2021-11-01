const React = require('react')

const config = require('../../config')

const CustomButton = require('./custom-button')
const { dispatch, dispatcher } = require('../lib/dispatcher')

module.exports = class MaxStakeModal extends React.Component {
  constructor(props) {
    super(props)
  }

  onDeleteTorrent() {
    dispatch('exitModal')
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
        <span className='content-title'>Max Stake</span>
        <div className='gray-title'>User can stake less than 2M POP tokens.</div> 
        <div className='gray-title'>You staked more than 2M POP tokens.</div>
        <div className="button-container" style={{ marginTop: '50px' }}>
          <CustomButton
            label="Ok"
            onClick={dispatcher('exitModal')}
            style={{ background: '#1F202A', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52, marginRight: 25 }}
          />
        </div>
      </div>
    )
  }
}
