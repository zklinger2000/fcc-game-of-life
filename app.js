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
// Update Grid
const updateGrid = (grid, cellName) => {
  return _.mapObject(grid, (cell) => {
    if (grid[cellName] === cell) {
      console.log('match!');
      return cell.alive
        ? Object.assign({}, cell, { alive: 0 })
        : Object.assign({}, cell, { alive: 1 });
    }
    return cell;
  });
};
// Board Reducer
const boardReducer = (state = initialState.board, action) => {
  switch (action.type) {
    case 'TOGGLE_CELL':
      const grid = updateGrid(state.grid, action.cell);
      return Object.assign({}, state, { grid });
    default:
      return state;
  }
};
// Root Reducer passed to store
const rootReducer = combineReducers({
  board: boardReducer,
});
// Board Component renders the board's current state and adds click handler for cells
class Board extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      canvas: {},
      ctx: {}
    };
    this.getCursorPosition = this.getCursorPosition.bind(this);
  }

  getCursorPosition(event, canvas, board) {
    const { scale } = board;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / scale);
    const y = Math.floor((event.clientY - rect.top) / scale);

    return cellName(x, y);
  }

  componentDidMount() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    this.setState({
      canvas: canvas,
      ctx: ctx
    });
  }

  render() {
    const { board, toggleCell } = this.props;
    const { canvas, ctx } = this.state;

    return (
      <canvas
        id="myCanvas"
        width={board.width}
        height={board.height}
        style={{backgroundColor: 'black'}}
        onClick={(event) => toggleCell(this.getCursorPosition(event, canvas, board))}
      >
        Your browser doesn't support this app.
      </canvas>
    );
  }
}

Board.propTypes = {
  board: PropTypes.object.isRequired,
  toggleCell: PropTypes.func.isRequired
};

class Game extends Component {
  render() {
    const { board, toggleCell } = this.props;

    return (
      <Board board={board} toggleCell={toggleCell} />
    );
  }
}

Game.propTypes = {
  board: PropTypes.object.isRequired,
  toggleCell: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    board: state.board
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleCell: (cell) => {
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
