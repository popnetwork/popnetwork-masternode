const React = require('react')
const Popover = require('material-ui/Popover').default
const Menu = require('material-ui/Menu').default
const MenuItem = require('material-ui/MenuItem').default

const config = require('../../config')

module.exports = class CustomSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      anchorEl: null,
    };

    this.handleClick = this.handleClick.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleClick(event) {
    // This prevents ghost click.
    console.log('test')
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleCancel(index) {
    this.props.onChange(index);
    this.setState({
      open: false,
      anchorEl: null,
    });
  }

  render () {
    const { data, selectedData, onChange } = this.props
    return (
      <div className='select-field-container' onClick={this.handleClick}>
        <div className="select-wrapper">
          <span className="sort-text">Sort by{' '} - </span>
          <span className="value-text">{` ${selectedData.text}`}</span>
        </div>
        <img src={`${config.STATIC_PATH}/ArrowDown.png`} className={`${this.state.open ? 'expandIcon' : 'collapseIcon'}`} />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.setState({
            open: false,
          })}
          className="custom-dropdown"
        >
          <Menu>
            {data.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => this.handleCancel(index)}
                className={`menu-item ${item.value === selectedData.value ? 'selected' : null}`}
                style={{ borderRadius: 12, fontSize: 12 }}
              >
                <div className="menu-item-wrapper">
                  <span>{item.text}</span>
                  {item.value === selectedData.value && <img src={`${config.STATIC_PATH}/Checked.png`} />}
                </div>
              </MenuItem>
            ))}
          </Menu>
        </Popover>
      </div> 
    )
  }
}
