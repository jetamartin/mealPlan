import React, { Component } from 'react';
import { addRecipe } from '../actions'


class App extends Component {
  state = {
    calendar: null
  }
  componentDidMount () {
    // Get store from props
    const { store } = this.props
    // Subscribe to any changes that happen in Redux store
    store.subscribe(() => {
      // Whenever store changes we want to update component's state which will
      // Cause a re-render and render breakfast <pre> area
      this.setState(() => ({
        // We want component state to equal what is in store state
        calendar: store.getState()
      }))
    })
  }
  submitFood = () => {
    this.props.store.dispatch(addRecipe({
      day: 'monday',
      meal: 'breakfast',
      recipe: {
        label: this.input.value
      },
    }))

    this.input.value = ''
  }
  render() {
    return (
      <div >
        <input
          type='text'
          ref={(input) => this.input = input}
          placeholder="Monday's Breakfast"
          />
          <button onClick={this.submitFood}>Submit</button>

          <pre>
            Monday's Breakfast: {this.state.calendar && this.state.calendar.monday.breakfast}
          </pre>
      </div>
    );
  }
}

export default App;
