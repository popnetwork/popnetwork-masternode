const React = require('react')
const PropTypes = require('prop-types')

const colors = require('material-ui/styles/colors')
const Checkbox = require('material-ui/Checkbox').default
const RaisedButton = require('material-ui/RaisedButton').default
const Heading = require('../components/heading')
const StaticValue = require('../components/static-value')

const { dispatch } = require('../lib/dispatcher')
const config = require('../../config')

class StakePage extends React.Component {
  constructor (props) {
    super(props)

  }


  render () {
    const style = {
      color: colors.grey400,
      marginLeft: 25,
      marginRight: 25
    }
    return (
      <div style={style}>
        <StakeSection>
          <Stake>
            <StaticValue
              staticText='STAKABLE'
              value='1 POP'
            />
          </Stake>
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
