const path = require('path')

const colors = require('material-ui/styles/colors')
const electron = require('electron')
const React = require('react')
const PropTypes = require('prop-types')

const remote = electron.remote

const CustomButton = require('../components/custom-button')
const TextField = require('material-ui/TextField').default

// Lets you pick a file or directory.
// Uses the system Open File dialog.
// You can't edit the text field directly.
class PathSelector extends React.Component {
  static propTypes () {
    return {
      className: PropTypes.string,
      dialog: PropTypes.object,
      id: PropTypes.string,
      onChange: PropTypes.func,
      title: PropTypes.string.isRequired,
      value: PropTypes.string
    }
  }

  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    const opts = Object.assign({
      defaultPath: path.dirname(this.props.value || ''),
      properties: ['openFile', 'openDirectory']
    }, this.props.dialog)

    remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      opts,
      (filenames) => {
        if (!Array.isArray(filenames)) return
        this.props.onChange && this.props.onChange(filenames[0])
      }
    )
  }

  render () {
    const id = this.props.title.replace(' ', '-').toLowerCase()
    const wrapperStyle = {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 20,
    }
    const pathStyle = {
      flex: 1,
    }
    const labelStyle = {
      flex: '0 auto',
      marginRight: 10,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: '#9EA1C9',
      fontSize: 10,
    }
    const textareaStyle = {
      color: colors.grey50,
      fontSize: 12,
    }
    const textFieldStyle = {
      width: '100%',
      marginTop: -10,
    }
    const underlineStyle = {
      border: '1px solid #2A2C3A'
    }
    const text = this.props.value || ''
    const buttonStyle = {
      marginLeft: 10
    }

    return (
      <div className={this.props.className} style={wrapperStyle}>
        <div style={pathStyle}>
          <div className='label' style={labelStyle}>
            {this.props.title}:
          </div>
          <TextField
            className='control'
            disabled
            id={id}
            value={text}
            inputStyle={textareaStyle}
            style={textFieldStyle}
            underlineStyle={underlineStyle}
          />
        </div>
        <CustomButton
          label="Change"
          onClick={this.handleClick}
          style={{ background: 'transparent', border: '1px solid #9EA1C9', width: 160, height: 48, color: '#9EA1C9', marginLeft: 50, }}
        />
      </div>
    )
  }
}

module.exports = PathSelector
