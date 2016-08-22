const { Component } = React;
const { connect } = ReactRedux;
const { Provider } = ReactRedux;
const { createStore } = Redux;

// Cell name formatter
const cellName = (x, y) => {
  return x + '-' + y;
};
// Cell
const Cell = (x, y, alive = 0, age = 0) => {
  return { x, y, alive, age };
};
// Setup Board State
const initBoard = (width = 300, height = 300, scale = 100) => {
  const results = { width, height, scale, grid: {} };

  for (let x = 0; x < width / scale; ++x) {
    for (let y = 0; y < height / scale; ++y) {
      results.grid[cellName(x, y)] = (Cell(x, y));
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

const { combineReducers } = Redux;

const rootReducer = combineReducers({
  board: boardReducer,
});

class App extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 2;
    let dy = -2;
    let ballRadius = 10;
    let paddleHeight = 10;
    let paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;
    let rightPressed = false;
    let leftPressed = false;
    let brickRowCount = 3;
    let brickColumnCount = 5;
    let brickWidth = 75;
    let brickHeight = 20;
    let brickPadding = 10;
    let brickOffsetTop = 30;
    let brickOffsetLeft = 30;
    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    let score = 0;

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI*2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }

    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }

    function drawBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
            let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    function collisionDetection() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          let b = bricks[c][r];
          if (b.status === 1) {
            if ( x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              ++score;
              if (score === brickRowCount * brickColumnCount) {
                alert("YOU WIN, CONGRATULATIONS!");
                document.location.reload();
              }
            }
          }
        }
      }
    }

    function drawScore() {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#0095DD";
      ctx.fillText("Score: " + score, 8, 20);
    }
    // Render the elements
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      drawScore();
      collisionDetection();

      x += dx;
      y += dy;

      // collision detection
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }
      if (y + dy < ballRadius) {
        dy = -dy;
      } else if (y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
        }
        else {
          alert("GAME OVER");
          document.location.reload();
        }
      }
      if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
      }
      else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
      }
    }

    // Event Listeners
    function keyDownHandler(e) {
      if (e.keyCode == 39) {
        rightPressed = true;
      }
      else if (e.keyCode == 37) {
        leftPressed = true;
      }
    }

    function keyUpHandler(e) {
      if (e.keyCode == 39) {
        rightPressed = false;
      }
      else if (e.keyCode == 37) {
        leftPressed = false;
      }
    }

    // Add event listeners for 'keydown' and 'keyup'
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    // setInterval(draw, 10);

  }

  render() {
    return (
      <div>
        <canvas id="myCanvas" width="480" height="320">
          Your browser doesn't support this app.
        </canvas>
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={createStore(rootReducer, window.devToolsExtension && window.devToolsExtension())}>
    <App />
  </Provider>,
  document.getElementById('app')
);

