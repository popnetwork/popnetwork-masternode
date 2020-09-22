const { dispatch } = require('../lib/dispatcher')

module.exports = class StakeController {
  constructor (state) {
    this.state = state
  }

  show () {
    this.state.location.go({
      url: 'stake', 
      setup: (cb) => {
        // this.state.window.title = 'Stake/Unstake POP'
        cb(null)
      }
    })
  }
}
