const React = require('react')
const PropTypes = require('prop-types')

const colors = require('material-ui/styles/colors')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')
const StaticValue = require('../components/static-value')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')
const { openDialog } = require('electron-custom-dialog')

class StakePage extends React.Component {
  constructor (props) {
    super(props)

  }

  async stake() {
    openDialog('stakeDlg', {question: 'Are you sure?'}).then((result) => {
      console.log('================', result) 
    })
  }

  unstake() {

  }

  claim() {

  }
  render () {
    const style = {
      marginTop: 20,
      marginLeft: 20,
      marginRight: 20
      
    }
    const buttonStyle = {
      margin: 18
    }
    const infoSectionStyle = {
      marginTop: 50,
      marginBottom: 50
    }
    const actionSectionStyle = {
      clear: 'both',
      maxWidth: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 70,
    }
    return (
      <div style={style}>
        <StakeSection>
          <div style={infoSectionStyle}>
            <StaticValue
              staticText='BALANCE'
              value='2400.15 POP'
              fontSize={18}
            />
            <StaticValue
              staticText='PENDING REWARDS'
              value='0.00 POP'
              fontSize={18}
            />
            <StaticValue
              staticText='STAKED'
              value='12403.12 POP'
              fontSize={18}
            />
          </div>
          <div style={actionSectionStyle}>
            <RaisedButton
              className='control' label='Stake' onClick={this.stake}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Claim' onClick={this.claim}
              style={buttonStyle}
            />
            <RaisedButton
              className='control' label='Unstake' onClick={this.unstake}
              style={buttonStyle}
            />
          </div>
        </StakeSection>
      </div>
    )
  }
}

class StakeSection extends React.Component {
  static get propTypes () {
    return {
      title: PropTypes.string
    }
  }

  render () {
    const style = {
      marginBottom: 25,
      marginTop: 25
    }
    return (
      <div style={style}>
        {this.props.children}
      </div>
    )
  }
}

class Stake extends React.Component {
  render () {
    const style = { marginBottom: 10 }
    return (<div style={style}>{this.props.children}</div>)
  }
}

module.exports = StakePage
