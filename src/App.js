import React from 'react';
import Fuse from 'fuse.js';
import faker from 'faker';
import './App.css'

// --------------- API START --------------

function simulateResponseTime({ min, max }) {
  return Math.floor(Math.random() * (max - min) + min)
}
faker.seed(42)

const users = Array.from({ length: 100 }).map(() => {
  return {
    name: faker.name.findName(),
    email: faker.internet.email()
  }
})

const fuse = new Fuse(users, {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["name"]
})

/**
 * Search users by name
 * @param {string} query - The query to search users by
 * @return {Promise<{ name: string; email: string; }[]>} Search result
 */
function searchUsersByName(query) {
  return new Promise(resolve => {
    window.setTimeout(() => {
      resolve(fuse.search(query));
    }, simulateResponseTime({ min: 200, max: 350 }));
  })
}

// ---------------- API END ---------------


class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      numberSuggestion: 0,
      suggestions: [],
      show: false,
      userInput:''
    }

    this.onChange= this.onChange.bind(this)
    this.onClick= this.onClick.bind(this)
    this.onKeyDown= this.onKeyDown.bind(this)
  }

  //Loads suggestions from API as user types and updates the state
  onChange(e){
    const userInput = e.target.value
    searchUsersByName(userInput).then((suggestions) =>{
        console.log(suggestions)

        this.setState({
        numberSuggestion: 0,
        suggestions,
        show:true,
        userInput: userInput
      })
    })

  }

  //Selects suggested name from list, and updates the search bar with it
  onClick(e){
    this.setState({
      numberSuggestion: 0,
      suggestions: [],
      show: false,
      userInput: e.target.innerText
    })
  }

  //Can use up and down keys to scroll through list and select a name with enter
  onKeyDown(e){
    const {numberSuggestion, suggestions} = this.state
    //Enter Key
    if(e.keyCode===13){
      this.setState({
        numberSuggestion: 0,
        show: false,
        userInput: suggestions[numberSuggestion].name
      })
    }

    //Up Arrow
    else if (e.keyCode === 38){
      if (numberSuggestion === 0){
        return;
      }
    }

    //Down Arrow
    else if (e.keyCode === 40){
      if (numberSuggestion -1 === suggestions.length-1){
        return
      }

      this.setState({numberSuggestion: numberSuggestion+1})
    }
  }

  render(){
    const{
      onChange,
      onClick,
      onKeyDown,
      state: {
        numberSuggestion,
        suggestions,
        show,
        userInput
      }
    } = this

    let suggestionList

    //Loads suggestion list if there is userInput and suggestions contains entries
    if(show && userInput){
      console.log(suggestions)
      if(suggestions.length){
        console.log(suggestions.length)
        suggestionList = (
          <ul class="suggestionList">
            {suggestions.map((suggestion, index) => {
              let className
              if(index===numberSuggestion){
                className = "activeSuggestion"
              }
              return(
                <li className={className} key={suggestion} onClick={onClick}>
                  {suggestion.name}
                </li>
              )
            })
            }
          </ul>
        )
      }
      else{
        suggestionList = (
          <div className="noSuggestionList">
            <p>No matching names</p>
          </div>
        )
      }
    }

    return (
      <div>
        <input
          type="text"
          onChange={onChange}
          onClick={onClick}
          onKeyDown={onKeyDown}
          value={userInput}
        />
        {suggestionList}
      </div>
    )
  }
}

export default App;
