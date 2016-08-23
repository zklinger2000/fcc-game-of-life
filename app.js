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
const initBoard = (width = 500, height = 500, scale = 100) => {
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
// Action Types
const TOGGLE_CELL = 'board/grid/TOGGLE_CELL';
const NEXT_GRID = 'board/grid/NEXT_GRID';
// Action Creators
const toggleCell = (cell) => {
  return {
    type: TOGGLE_CELL,
    payload: {
      cell
    }
  };
};
// Update Grid after click toggle
const updateGridAfterToggle = (grid, cellName) => {
  return _.mapObject(grid, (cell) => {
    if (grid[cellName] === cell) {
      return cell.alive
        ? Object.assign({}, cell, { alive: 0, age: 0 })
        : Object.assign({}, cell, { alive: 1, age: 1 });
    }
    return cell;
  });
};
const nextGrid = () => {
  return {
    type: NEXT_GRID
  };
};
// Return the proper index for edge cases
const checkBoundary = (value, size) => {
  if (value === -1) {
    return size - 1;
  } else if (value === size) {
    return 0;
  }
  return value;
};
// Get neighborhood population
const getNeighborhoodPop = (board, cell) => {
  const { width, height, scale } = board;
  const neighborHood = [];

  for (let x = 0; x < 3; ++x) {
    for (let y = 0; y < 3; ++y) {
      neighborHood.push(board.grid[cellName(
        checkBoundary(cell.x + 1 - x, width / scale),
        checkBoundary(cell.y + 1 - y, height / scale)
      )]);
    }
  }

  return neighborHood.reduce((acc, cell) => {
    return acc + cell.alive;
  }, 0);
};
// Update Grid according to next generation
const updateGridNextGen = (board) => {
  console.log('updateGridNextGen');
  const { width, height, grid, scale } = board;
  const newGrid = {};
  let pop = 0;
  let cell = {};
  for (let x = 0; x < width / scale; ++x) {
    for (let y = 0; y < height / scale; ++y) {
      cell = grid[cellName(x, y)];
      pop = getNeighborhoodPop(board, cell);
      // TODO remove after dev
      if (cell.alive && pop < 3) {
        newGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { alive: 0, age: 0 }
        );
      } else if (cell.alive && pop === 3 || pop === 4) {
        newGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { age: cell.age + 1 }
        );
      } else if (cell.alive && pop > 4) {
        newGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { alive: 0, age: 0 }
        );
      } else if (!cell.alive && pop === 3) {
        newGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { alive: 1, age: 1 }
        );
      } else {
        newGrid[cellName(x, y)] = Object.assign(
          {},
          cell
        );
      }
    }
  }
  return newGrid;
};
// Board Reducer
const boardReducer = (state = initialState.board, action) => {
  let grid;
  switch (action.type) {
    case TOGGLE_CELL:
      // grid = updateGridAfterToggle(state.grid, action.payload.cell);
      return Object.assign({}, state, { grid: updateGridAfterToggle(state.grid, action.payload.cell) });
    case NEXT_GRID:
      grid = updateGridNextGen(state);
      return Object.assign({}, state, { grid });
    default:
      return state;
  }
};
// Root Reducer passed to store
const rootReducer = combineReducers({
  board: boardReducer,
});
// Render function for updating the canvas
const renderGrid = (board, canvas, ctx) => {
  const { width, height, scale, grid } = board;
  _.each(grid, (cell) => {
    if (cell.alive) {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(cell.x * scale, cell.y * scale, scale, scale);
    }
  });
};
// Returns the position as a string in the 'x-y' format
const getCursorPosition = (event, canvas, board) => {
  const { scale } = board;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / scale);
  const y = Math.floor((event.clientY - rect.top) / scale);

  return cellName(x, y);
};
// Board Component renders the board's current state and adds click handler for cells
class Board extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      canvas: {},
      ctx: {}
    };
  }

  componentDidMount() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const { board } = this.props;

    this.setState({
      canvas,
      ctx
    });

    renderGrid(board, canvas, ctx);
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const { board } = this.props;
    const { canvas, ctx } = this.state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid(board, canvas, ctx);
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
        onClick={(event) => toggleCell(getCursorPosition(event, canvas, board))}
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
    const { board, toggleCell, nextGrid } = this.props;

    return (
      <div className="game-wrapper">
        <Board board={board} toggleCell={toggleCell} />
        <button type="button" className="btn btn-primary" onClick={nextGrid}>next</button>
      </div>
    );
  }
}

Game.propTypes = {
  board: PropTypes.object.isRequired,
  toggleCell: PropTypes.func.isRequired,
  nextGrid: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    board: state.board
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleCell: (cell) => {
      dispatch(toggleCell(cell));
    },
    nextGrid: () => {
      dispatch(nextGrid());
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
