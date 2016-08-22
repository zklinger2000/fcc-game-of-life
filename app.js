const { Component, PropTypes } = React;
const { connect } = ReactRedux;
const { Provider } = ReactRedux;
const { createStore, combineReducers } = Redux;

// Cell name formatter
const cellName = (x, y) => {
  return x + '-' + y;
};
// Cell
const initCell = (x, y, alive = 0, age = 0) => {
  return { x, y, alive, age };
};
// Setup Board State
const initBoard = (width = 300, height = 300, scale = 100) => {
  const results = { width, height, scale, grid: {} };

  for (let x = 0; x < width / scale; ++x) {
    for (let y = 0; y < height / scale; ++y) {
      results.grid[cellName(x, y)] = (initCell(x, y));
    }
  }
  return results;
};
// Initial State Shape
const initialState = {
  board: initBoard(),
};

const boardReducer = (state = initialState.board, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  board: boardReducer,
});

class Board extends Component {
  componentDidMount() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
  }

  render() {
    const {width, height} = this.props.board;
    return (
      <canvas
        id="myCanvas"
        width={width}
        height={height}
        style={{backgroundColor: 'black'}}
        onClick={(event) => console.log('hello')}
      >
        Your browser doesn't support this app.
      </canvas>
    );
  }
}

Board.propTypes = {
  board: PropTypes.object.isRequired
};

class Game extends Component {
  render() {
    const { board } = this.props;

    return (
      <Board board={board} />
    );
  }
}

Game.propTypes = {
  board: PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
  return {
    board: state.board
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: (cell) => {
      dispatch({
        type: 'TOGGLE_CELL',
        cell
      });
    }
  };
};

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);

ReactDOM.render(
  <Provider store={createStore(rootReducer, window.devToolsExtension && window.devToolsExtension())}>
    <App />
  </Provider>,
  document.getElementById('app')
);
