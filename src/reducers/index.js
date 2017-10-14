import {
  ADD_RECIPE,
  REMOVE_FROM_CALENDAR
} from '../actions'
import { combineReducers } from 'redux'
/* Since you could have the same food on the calendar on multiple days you don't
  want to store that same food in the calendar store multiple times (don't want
  to duplicate data in the store). Instead we'll store the food items in the food
  part of the store and simply save it's ID in the calendar..and this ID will point
  back to the food information in the food part of the store. 
*/
function food (state = {}, action) {
  switch (action.type) {
    case ADD_RECIPE :
      const { recipe } = action;

      return {
        ...state,
        [recipe.label]: recipe
      }
    default :
      return state;
  }
}

const initialCalendarState = {
  sunday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  monday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  tuesday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  wednesday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  thursday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  friday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
  saturday: {
    breakfast: null,
    lunch: null,
    dinner: null,
  },
}

// Reducer, if state is undefined then set it to initialCalendarState
function calendar (state = initialCalendarState, action) {
  // Actions as defined in actions/index.js file
  const {day, recipe, meal } = action

  // Specify how state will change based off of these actions, the state returned
  // from this function will represent the new state of the store

  switch (action.type) {
    case ADD_RECIPE :
      return {
        //Return same state as we had before using objec spread syntax
        // but you want to modify the meal for the specific day. For example
        // Note: Spread operator is used to copy over prior state values into new state
        // See http://redux.js.org/docs/recipes/UsingObjectSpreadOperator.html for description of spread operator
        ...state, // Same state as before
        [day]: { // Modify specific day
          ...state[day], // State at specific meal will remain the same
          [meal]: recipe.label, // Only meal (name of specific recipe will change for that day will change. Where did recipe.label come from???
        }
      }
    case REMOVE_FROM_CALENDAR :
      return {
        ...state, // All state will remain same except for specific day.
        [day]: {
          ...state[day],  // State for day will remain same except for specific meal
          [meal]: null,
        }
      }
    default:
      return state

  }
}
export default combineReducers ({
  food,
  calendar,
} )
