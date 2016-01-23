'use strict';

// Set up Redux Actions.
function increment() {
  return {
    type: 'INCREMENT_COUNTER'
  };
}

function decrement() {
  return {
    type: 'DECREMENT_COUNTER'
  };
}

var CounterActions = {
  increment: increment,
  decrement: decrement
}

// Set up Redux Reducers.
var initialState = 2;
function counter(state, action) {
  if (typeof state === 'undefined') {
    return initialState;
  }
  switch (action.type) {
  case 'INCREMENT_COUNTER':
    return state + 1;
  case 'DECREMENT_COUNTER':
    return state - 1;
  default:
    return state;
  }
}

function rootReducer(state, action) {
  return {
    counter: counter(state.counter, action)
  }
}

// Set up Angular Directive.
function counterTop() {
  return {
    restrict: 'E',
    transclude: true,
    controllerAs: 'counter',
    controller: CounterController,
    template: '<div>' + 
                '<p>Clicked: {{counter.value}} times </p>' +
                '<button ng-click="counter.increment()">+</button>' +
                '<button ng-click="counter.decrement()">-</button>' +
                '<div id="react-counter"></div>' +
              '</div>',
    scope: {},
    replace: true
  };
}

// Set up Angular Controller.
function CounterController($ngRedux, $scope) {

  var unsubscribe = $ngRedux.connect(this.mapStateToThis, CounterActions)(this);
  $scope.$on('$destroy', unsubscribe);

  this.bindReact($ngRedux);
}

// Specify the portion of State which this component will receive.
CounterController.prototype.mapStateToThis = function(state) {
  return {
    value: state.counter
  };
}

CounterController.prototype.bindReact = function($ngRedux) {
  //Use $ngRedux as the store, which has all expected methods in a 
  //standard Redux store.
  var store = $ngRedux;
  var state = store.getState();

  // Create React Component
  var Root = React.createClass({
    render: function() {
      return (
        React.createElement('h1', {className: 'ReactCount'}, 'React Count',
          React.createElement('li', {className: 'ReactCountLi'},
            React.createElement('h2', {className: 'react-count'}, this.props.value)))
      )
    }
  });

  // Use React-Redux to map the component to State and Actions.
  var ConnectedRoot = ReactRedux.connect(this.mapStateToThis)(Root);

  // Render the component into Angular.
  ReactDOM.render(
    React.createElement(ReactRedux.Provider, {store:store},
                        React.createElement(ConnectedRoot)),
                        document.getElementById('react-counter'));
}

// Set up Angular App Module.
angular.module('app', ['ngRedux'])
.config(['$ngReduxProvider', function($ngReduxProvider) {
    $ngReduxProvider.createStoreWith(rootReducer);
  }])
.directive('rxa', counterTop)
