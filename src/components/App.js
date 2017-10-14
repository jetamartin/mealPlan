import React, { Component } from 'react';
import { addRecipe, removeFromCalendar} from '../actions'
import { connect } from 'react-redux'
import { capitalize } from '../utils/helpers'
import CalendarIcon from 'react-icons/lib/fa/calendar-plus-o'
import Modal from 'react-modal'
import ArrowRightIcon from 'react-icons/lib/fa/arrow-circle-right'
import Loading from 'react-loading'
import { fetchRecipes } from '../utils/api'
import FoodList from './FoodList'
import ShoppingList from './ShoppingList'

class App extends Component {
  state = {
    foodModalOpen: false,
    meal: null,
    day: null,
    food: null,
    ingredientsModalOpen: false,
  }
  openFoodModal = ({ meal, day }) => {
    this.setState(() => ({
      foodModalOpen: true,
      meal,
      day,
    }))
  }
  closeFoodModal = () => {
    this.setState(() => ({
      foodModalOpen: false,
      meal: null,
      day: null,
      food: null,
    }))
  }

  searchFood = (e) => {
    if (!this.input.value){
      return
    }

  e.preventDefault()

  this.setState(() => ({ loadingFood: true }))
  {/* Call fetchRecipes method in utils/api.js file and save the returned values from then
    search into the food component state..Note. We don't want to store it in store until
    a specific food is selected */}
  fetchRecipes(this.input.value)
    .then((food) => this.setState(() => ({
      food,
      loadingFood: false,
    })))
  }
  openIngredientsModal = () => this.setState(() => ({ingredientsModalOpen: true }))
  closeIngredientsModal = () => this.setState(() => ({ ingredientsModalOpen: false }))
  generateShoppingList = () => {
    {/* This first reduce will look at every meals element in the grid and create a results array just containing
      meals (breakfast,lunch, dinner) that had food items (not those with null value). This results array includes
      the entire record for the food item which is inclusive of many elements beyond just ingredeientsLines
      (e.g., label, calories, etc). So the second reduce is to produce an array that just contains the ingredeientsLines
      of each of the meals.
    */}
    return this.props.calendar.reduce((result, { meals }) => {
      const { breakfast, lunch, dinner } = meals

      breakfast && result.push(breakfast)
      lunch && result.push(lunch)
      dinner && result.push(dinner)

      return result
    }, [])
    .reduce((ings, { ingredientLines }) => ings.concat(ingredientLines), [])
  }
  render() {
    console.log('Props', this.props);
    const { calendar, remove, selectRecipe } = this.props
    const mealOrder = ['breakfast', 'lunch', 'dinner']
    const { foodModalOpen, loadingFood, food, ingredientsModalOpen } = this.state
    return (
      <div className='container'>
        <div className='nav'>
          <h1 className='header'>UdaciMeals</h1>
          <button
            className='shopping-list'
            onClick={this.openIngredientsModal}>
              Shopping list
          </button>
        </div>

        {/* Generate the Breakfast Lunch and Dinner header/column */}
        <ul className='meal-types'>
          {mealOrder.map((mealType) => (
            <li key={mealType} className='subheader'>
              {capitalize(mealType)}
            </li>
          ))}
        </ul>
        {/* Generate the days of the week column */}
        <div className='calendar'>
           <div className='days'>
             {calendar.map(({ day }) => <h3 key={day} className='subheader'>{capitalize(day)}</h3>)}
           </div>
           {/* Now fill in the meals grid with either the meal picture and data or the calendary icon if no meal planned for that meal/day */}
           <div className='icon-grid'>
            {/* For each day generate the meals row for that day using calendar array we produced in mapStateToProps method below */}
             {calendar.map(({ day, meals }) => (
               <ul key={day}>
                 {mealOrder.map((meal) => (
                   <li key={meal} className='meal'>
                   {/* If specific meal on that day then include image and clear button to remove meal */}
                   {/* Else display the CalendarIcon button to open Food modal */}
                   {/* If user  click on one of the CalendarIcon buttons it will  openFoodModal to allow user
                    search for foods that they want to add for the meail and day */}
                     {meals[meal]
                       ? <div className='food-item'>
                           <img src={meals[meal].image} alt={meals[meal].label}/>
                           {/* If the user clicks on Clear button it will dispatch an action to remove the meal from the grid per mapDispatchToProps method b*/}
                           <button onClick={() => remove({meal, day})}>Clear</button>
                         </div>
                       : <button onClick={() => this.openFoodModal({meal, day})} className='icon-btn'>
                           <CalendarIcon size={30}/>
                         </button>}
                   </li>
                 ))}
               </ul>
             ))}
           </div>
         </div>

         {/* FOOD MODAL */}
         {/* Food modal will open when foodModalOpen is true */}
         {/* When we try and close it -- click outside of modal window
             then we will run closeFoodModal which will set foodModalOpen to false
             resulting in modal closing
         */}
         <Modal
            className='modal'
            overlayclassName='overlay'
            isOpen={foodModalOpen}
            onRequestClose={this.closeFoodModal}
            contentLabel='Modal'
          >
          <div>
          {/* if loadingFood is true then show spinner else display search input field*/}
            {loadingFood === true
            ? <Loading delay = {200} type='spin' color='#222' className='loading' />
            : <div className='search-container'>
            {/* Create Modal window titel */}
                <h3 className='subheader'>
                  Find a meal for {capitalize(this.state.day)} {this.state.meal}.
                </h3>
                {/* Create meal search form*/}
                <div className='search'>
                  <input
                    className='food-input'
                    type='text'
                    placeholder='Search Foods'
                    ref={(input) => this.input = input}
                  />
                  {/* When user clicks right arrow button run searchFood method above
                    this method will use api to return results of search
                  */}
                  <button
                    className='icon-btn'
                    onClick={this.searchFood}>
                      <ArrowRightIcon size={30}/>
                  </button>
                </div>
                {/* After searchFood (API call to Entamine's) returns
                    we call the FoodList component to display search results
                    passing in food list via props and also you want to pass
                    in the selectRecipe action creator in on props as well so that
                    when the user selects a recipe they will generate the ADD_RECIPE
                    action..that will ultimately cause the Reducer to add that meal to the
                    Food part of the Redux store. After a selection is made you close the
                    modal window
                    */}
                {food !== null && (
                  <FoodList
                    food={food}
                    onSelect={(recipe) => {
                      selectRecipe({ recipe, day: this.state.day, meal: this.state.meal })
                      this.closeFoodModal()
                    }}
                  />)}
                </div>}
            </div>
          </Modal>

          <Modal
            className='modal'
            overlayClassName='overlay'
            isOpen={ingredientsModalOpen}
            onRequestClose={this.closeIngredientsModal}
            contentLabel='Modal'
          >
            {/* Because generateShoppingList is a fairly expensive operation you only
              want to get the list if the ingredientsModalOpen = true as this would be the
              only circumstance that one could view the ingredient list. */}
            {ingredientsModalOpen && <ShoppingList list={this.generateShoppingList()}/>}
          </Modal>

      </div>
    )
  }
}
// mapStateToProps() allows you to specify which data from the store you want pass to your
// React component, it takes in the store's state, an optional ownprops argument and returns
// an object. Signature mapStateToProps(state, [ownProps])
// If ownProps is specified, the new component will subscribe to Redux store updates.
// This means that any time the store is updated, mapStateToProps will be called. The
// results of mapStateToProps must b a plain object, which will be merged into the components props.
// In other words: the properties of the object returned from mapStateToProps() will be passed to
// the component as props! You can think of mapStateToProps() as just a function that lets connect()
// know how to map specific parts of the store’s state into usable props.
//
// Note: there are two reducers: calendar & food (see reducers folder) so they must be passed in via an object
function mapStateToProps ( { calendar, food } ) {

  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  // Whatever is returned from this component will be passed to component as long as we
  // passed to component as long as we pass mapStateToProps as long as we pass as first
  // argument to connect

  // Instead of getting back calendar as one big object we want to reformat calendar object to make it
  // easier to display data in a grid format. The transformed calendary object will now consist of 7 arrays, one for each day.
  // Within in that array there will be a property for day and one for meals. The meals object will have
  // properties for each of the meals...breakfast, lunch and dinner. .

  return {
    // Using map method on dayOrder array causes tranfored object returned (i.e. calendar)
    //to be an array..which is what we want
    calendar: dayOrder.map((day) => ({
      day, // Set first property of object to day

      // Create a second object meals that includes mealname and valaue
      // (e.g.,meals { breakfast: null, lunch: null, dinner: null}
      // Object.keys returns an array containing just the keys of the canlendar[day]..days of the week.
      // e.g., ["monday", "tuesday", ...]. Now that we have an array with these values we can
      // reduce these array elements into a single object (accumululator is empty object) meals containing all of the days as keys
      // and the values as either null or the meal value (e.g., pizza) from the calendar (calendar[day][mea])
      // Note a ternary "if statement" is used to what meal value to assign for that meal (e.g., null or "pizza").
      // Specifically if calendar[day][meal] is not null then it will assign the meal to meals[meal] else
      // it will assign a value of null.
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal]
        // Info about food is stored in the food store...Since calendar[day][meal] is just the ID of the food item
        // We need to use that ID to get the food info from the food store so that we can save it in the props
        // Hence you have "food[calendar[day][meal]]"
          ? food[calendar[day][meal]]
          : null;
          return meals
      }, {})
    })),

  }
}

// Note when we used mapDispatchToProps dispatch function is no longer available directly
// props but instad the methods selectRecipe and remove are available directly.
// Note for this to work you have to includ mapDispatchToProps as second argument of
// connect(mapStateToProps, mapDispatchToProps)(App);
function mapDispatchToProps (dispatch) {
  return {
    // selectRecipe and remove are methods available on props and when
    // methods are called they will automatically dispatch for us.
    // So when we call this method in the component we can do the following:
    // this.props.selectRecipe({object})
    selectRecipe: (data) => dispatch(addRecipe(data)),
    remove: (data) => dispatch(removeFromCalendar(data)),
  }

}


// Invoke connect which will return new function which we can then pass our components
export default connect(
  mapStateToProps,
  mapDispatchToProps
  )(App);
