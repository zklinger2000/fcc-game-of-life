const { Component, PropTypes } = React;
const { connect } = ReactRedux;
const { Provider } = ReactRedux;
const { createStore, combineReducers } = Redux;

// Cell name formatter
const cellName = (x, y) => {
  return x + '-' + y;
};

// Cell factory
const initCell = (x, y, alive = 0, age = 0) => {
  return { x, y, alive, age };
};

// Setup Board State
const initBoard = (size, width = 320, height = 544, scale = 32) => {
  const results = { // return object containing the 'board' state
    grid: {},
    counter: 0,
    isPlaying: false,
    speed: '1x'
  };
  switch(size) {
    case 'small':
      Object.assign(results, {
        width: 320,
        height: 512,
        scale: 32,
        size
      });
      break;
    case 'medium':
      Object.assign(results, {
        width: 768,
        height: 512,
        scale: 32,
        size
      });
      break;
    case 'large':
      Object.assign(results, {
        width: 1024,
        height: 576,
        scale: 32,
        size
      });
      break;
    case 'custom':
      Object.assign(results, {
        width,
        height,
        scale,
        size
      });
      break;
    default:
      Object.assign(results, {
        width: 300,
        height: 300,
        scale: 100
      });
  }
  // Add cells to grid
  for (let x = 0; x < results.width / results.scale; ++x) {
    for (let y = 0; y < results.height / results.scale; ++y) {
      results.grid[cellName(x, y)] = (initCell(x, y));
    }
  }
  return results;
};

// Initial State
const initialState = {
  board: initBoard('small'),
};

// Action Types
const TOGGLE_CELL = 'board/grid/TOGGLE_CELL';
const NEXT_GRID = 'board/grid/NEXT_GRID';
const START_PLAY = 'board/START_PLAY';
const STOP_PLAY = 'board/STOP_PLAY';
const CLEAR_GRID = 'board/CLEAR_GRID';
const SET_SPEED = 'board/SET_SPEED';
const SEED_GRID = 'board/grid/SEED_GRID';

// Action creators
const toggleCell = (cell) => {
  return {
    type: TOGGLE_CELL,
    payload: {
      cell
    }
  };
};

const nextGrid = () => {
  return {
    type: NEXT_GRID
  };
};

const startPlay = () => {
  return {
    type: START_PLAY
  };
};

const stopPlay = () => {
  return {
    type: STOP_PLAY
  };
};

const clearGrid = (size) => {
  return {
    type: CLEAR_GRID,
    payload: {
      size
    }
  };
};

const setSpeed = (speed) => {
  return {
    type: SET_SPEED,
    payload: {
      speed
    }
  };
};

const seedGrid = () => {
  return {
    type: SEED_GRID
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

  // Grab the 3x3 grid of cells around cell argument
  for (let x = 0; x < 3; ++x) {
    for (let y = 0; y < 3; ++y) {
      neighborHood.push(board.grid[cellName(
        checkBoundary(cell.x + 1 - x, width / scale),
        checkBoundary(cell.y + 1 - y, height / scale)
      )]);
    }
  }
  // Return number of live cells in 3x3 grid
  return neighborHood.reduce((acc, cell) => {
    return acc + cell.alive;
  }, 0);
};

// Update Grid according to next generation
const updateGridNextGen = (board) => {
  const { width, height, grid, scale } = board;
  const nextGrid = {};
  let pop = 0;
  let cell = {};
  // Loop through cells and update status according to game of life rules
  for (let x = 0; x < width / scale; ++x) {
    for (let y = 0; y < height / scale; ++y) {
      cell = grid[cellName(x, y)];
      pop = getNeighborhoodPop(board, cell);

      if (cell.alive && (pop < 3 || pop > 4)) {
        nextGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { alive: 0, age: 0 }
        );
      } else if (cell.alive && pop === 3 || pop === 4) {
        nextGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { age: cell.age + 1 }
        );
      } else if (!cell.alive && pop === 3) {
        nextGrid[cellName(x, y)] = Object.assign(
          {},
          cell,
          { alive: 1, age: 1 }
        );
      } else {
        nextGrid[cellName(x, y)] = Object.assign(
          {},
          cell
        );
      }
    }
  }
  return nextGrid;
};

// Randomize the cells' alive status
const randomizeGrid = (board) => {
  const { width, height, grid, scale } = board;
  const nextGrid = {};
  let cell = {};
  let alive = 0;
  // Loop through cells and assign random alive status
  for (let x = 0; x < width / scale; ++x) {
    for (let y = 0; y < height / scale; ++y) {
      cell = grid[cellName(x, y)];
      alive = Math.round(Math.random());
      nextGrid[cellName(x, y)] = Object.assign(
        {},
        cell,
        { alive, age: 1 }
      );
    }
  }
  return nextGrid;
};

// Board Reducer
const boardReducer = (state = initialState.board, action) => {
  switch (action.type) {
    case TOGGLE_CELL:
      return Object.assign({}, state, {
        grid: updateGridAfterToggle(state.grid, action.payload.cell)
      });
    case NEXT_GRID:
      return Object.assign({}, state, {
        counter: state.counter + 1,
        grid: updateGridNextGen(state)
      });
    case START_PLAY:
      return Object.assign({}, state, {
        isPlaying: true
      });
    case STOP_PLAY:
      return Object.assign({}, state, {
        isPlaying: false
      });
    case CLEAR_GRID:
      return initBoard(action.payload.size);
    case SET_SPEED:
      return Object.assign({}, state, {
        speed: action.payload.speed
      });
    case SEED_GRID:
      return Object.assign({}, state, {
        grid: randomizeGrid(state)
      });
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
  const { scale, grid } = board;
  _.each(grid, (cell) => {
    if (cell.alive) {
      ctx.fillStyle = cell.age === 1 ? '#FF8888' : '#FF0000';
      ctx.fillRect(cell.x * scale, cell.y * scale, scale, scale);
    }
    ctx.strokeStyle = '#424242';
    ctx.strokeRect(cell.x * scale, cell.y * scale, scale, scale);
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

  componentDidUpdate() {
    const { board } = this.props;
    const { canvas, ctx } = this.state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid(board, canvas, ctx);
  }

  render() {
    const { board, toggleCell } = this.props;
    const { canvas } = this.state;

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

const screenSizeHelper = () => {
  if (window.innerWidth < 768) {
    return 'small';
  } else if (window.innerWidth < 1024) {
    return 'medium';
  }
  return 'large';
};

class Game extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      isPlaying: props.board.isPlaying,
      speed: props.board.speed
    };

    this.setPlayRates = this.setPlayRates.bind(this);
  }

  componentDidMount() {
    const { clearGrid, seedGrid, startPlay } = this.props;

    this.setPlayRates();
    clearGrid(screenSizeHelper());
    seedGrid();
    startPlay();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isPlaying: nextProps.board.isPlaying,
      speed: nextProps.board.speed
    });
  }

  setPlayRates() {
    const { nextGrid } = this.props;

    setInterval(() => {
      if (this.state.isPlaying && this.state.speed === '1x') {
        nextGrid();
      }
    }, 100);

    setInterval(() => {
      if (this.state.isPlaying && this.state.speed === '2x') {
        nextGrid();
      }
    }, 50);

    setInterval(() => {
      if (this.state.isPlaying && this.state.speed === '0.5x') {
        nextGrid();
      }
    }, 300);
  }

  render() {
    const {
      board,
      toggleCell,
      nextGrid,
      startPlay,
      stopPlay,
      clearGrid,
      setSpeed
    } = this.props;

    return (
      <div className="game-wrapper">
        <Board board={board} toggleCell={toggleCell} />
        <button type="button" className="btn btn-primary" onClick={startPlay}>Start</button>
        <button type="button" className="btn btn-primary" onClick={stopPlay}>Pause</button>
        <button type="button" className="btn btn-primary" onClick={nextGrid}>Next</button>
        <button type="button" className="btn btn-primary" onClick={() => clearGrid(board.size)}>Clear</button>
        <div className="counter">{board.counter}</div>
        <button type="button" className="btn btn-primary" onClick={() => clearGrid('small')}>Small</button>
        <button type="button" className="btn btn-primary" onClick={() => clearGrid('medium')}>Medium</button>
        <button type="button" className="btn btn-primary" onClick={() => clearGrid('large')}>Large</button>
        <button type="button" className="btn btn-primary" onClick={() => setSpeed('0.5x')}>0.5x</button>
        <button type="button" className="btn btn-primary" onClick={() => setSpeed('1x')}>1x</button>
        <button type="button" className="btn btn-primary" onClick={() => setSpeed('2x')}>2x</button>
      </div>
    );
  }
}

Game.propTypes = {
  board: PropTypes.object.isRequired,
  toggleCell: PropTypes.func.isRequired,
  nextGrid: PropTypes.func.isRequired,
  startPlay: PropTypes.func.isRequired,
  stopPlay: PropTypes.func.isRequired,
  clearGrid: PropTypes.func.isRequired,
  setSpeed: PropTypes.func.isRequired,
  seedGrid: PropTypes.func.isRequired
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
    },
    startPlay: () => {
      dispatch(startPlay());
    },
    stopPlay: () => {
      dispatch(stopPlay());
    },
    clearGrid: (size) => {
      dispatch(clearGrid(size));
    },
    setSpeed: (speed) => {
      dispatch(setSpeed(speed));
    },
    seedGrid: () => {
      dispatch(seedGrid());
    }
  };
};

const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(Game);

ReactDOM.render(
  <Provider store={createStore(
    rootReducer,
    window.devToolsExtension && window.devToolsExtension()
  )}>
    <App />
  </Provider>,
  document.getElementById('app')
);

// TODO: Make buttons visible based on screen size
// TODO: Kill setIntervals? on unmount?
