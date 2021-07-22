const React = require('react')

const config = require('../../config')

const CustomButton = require('./custom-button')
const { dispatch, dispatcher } = require('../lib/dispatcher')
const shell = require('../../main/shell')

module.exports = class CreateTransactionModal extends React.Component {
  constructor(props) {
    super(props)

    this.onOk = this.onOk.bind(this)
    this.onTransaction = this.onTransaction.bind(this)
  }

  onOk() {
    dispatch('exitModal')
  }

  onTransaction(url) {
    shell.openExternal(url)
  }

  render () {
    const state = this.props.state
    const { detail } = state.modal

    return (
      <div className='custom-modal create-magnet-modal' style={{ width: 678 }}>
        <div className="close-btn" onClick={dispatcher('exitModal')}>
          <img src={`${config.STATIC_PATH}/Close.png`} />
        </div>
        <div className="icon-wrapper">
          <img src={`${config.STATIC_PATH}/Dollar.png`} />
        </div>
        <span className='content-title'>Transaction created successfully</span>
        <div className='gray-title' style={{ cursor: 'pointer', textOverflow: 'ellipsis', overflow: 'hidden', width: 400 }} onClick={() => this.onTransaction(detail)}>{detail}</div>  
        <div className="button-container" style={{ marginTop: '50px' }}>
          <CustomButton
            label="Okay"
            onClick={this.onOk}
            style={{ background: '#B169F6', boxShadow: '0px 50px 94px #0A0D11', width: 170, height: 52 }}
          />
        </div>
      </div>
    )
  }
}
