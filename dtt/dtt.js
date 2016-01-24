// Generated by CoffeeScript 1.10.0
var DTTMain, Game, MinMaxSelector, NumberSelector, StartSelector, Tasks, a, button, calculateTargetTime, div, dup, el, form, game, gameInitialState, gameParamValid, gameParams, gameParamsInitialState, generateTask, h1, h2, h3, h4, img, input, label, li, local, make, option, p, ref, render, select, small, span, store, strong, timer, trainerLogic, ul,
  slice = [].slice;

gameParamsInitialState = {
  type: 'random',
  min: 5,
  max: 10,
  minutes: 3,
  seconds: 300,
  error: false
};

gameParamValid = function(prop, val, state) {
  if (!(_.isFinite(val) && +val > 0)) {
    return false;
  }
  if (prop === 'min') {
    return +val <= +state.max;
  } else if (prop === 'max') {
    return +val >= +state.min;
  } else if (prop === 'random') {
    return +state.min <= +state.max;
  } else {
    return true;
  }
};

gameParams = function(state, action) {
  if (state == null) {
    state = gameParamsInitialState;
  }
  switch (action.type) {
    case 'changeType':
      return dup(state, {
        type: action.selected,
        error: !gameParamValid(action.selected, state[action.selected], state)
      });
    case 'changeVal':
      return dup(state, make(action.prop, action.val), {
        error: !gameParamValid(action.prop, action.val, state)
      });
    default:
      return state;
  }
};

calculateTargetTime = function() {
  var params;
  params = store.getState().gameParams;
  switch (params.type) {
    case 'random':
      return _.random(params.min * 60, params.max * 60);
    case 'minutes':
      return +params.minutes * 60;
    case 'seconds':
      return +params.seconds;
  }
};

gameInitialState = {
  started: false,
  tasks: [],
  elapsed: 0
};

game = function(state, action) {
  var elapsed, ref, rest, task;
  if (state == null) {
    state = gameInitialState;
  }
  switch (action.type) {
    case 'startGame':
      return dup(state, {
        started: true,
        target: calculateTargetTime()
      });
    case 'startCountdown':
      return dup(state, {
        countdown: 2
      });
    case 'decreaseCountdown':
      return dup(state, {
        countdown: state.countdown - 1,
        running: state.countdown === 1
      });
    case 'nextTask':
      elapsed = _.reduce(state.tasks, (function(sum, task) {
        return sum + task.elapsed;
      }), 0);
      if (elapsed < state.target) {
        task = generateTask(state.tasks[0], state.target - elapsed);
        return dup(state, {
          tasks: [task].concat(state.tasks),
          elapsed: elapsed
        });
      } else {
        return dup(state, {
          finished: true,
          runnning: false,
          elapsed: elapsed
        });
      }
      break;
    case 'decreaseTask':
      ref = state.tasks, task = ref[0], rest = 2 <= ref.length ? slice.call(ref, 1) : [];
      task = dup(task, {
        time: task.time - 1
      });
      return dup(state, {
        tasks: [task].concat(rest)
      });
    case 'startAnother':
      return gameInitialState;
    default:
      return state;
  }
};

timer = function() {
  game = store.getState().game;
  if (!game.started) {
    return;
  }
  if (game.countdown) {
    return store.dispatch({
      type: 'decreaseCountdown'
    });
  } else if (game.running) {
    if (0 === game.tasks.length || 0 === game.tasks[0].time) {
      return store.dispatch({
        type: 'nextTask'
      });
    } else {
      return store.dispatch({
        type: 'decreaseTask'
      });
    }
  }
};

setInterval(timer, 1000);

NumberSelector = React.createClass({
  label: function() {
    return this.props.label || 'Value';
  },
  unit: function() {
    if (this.props.type === 'seconds') {
      return 's';
    } else {
      return 'min';
    }
  },
  render: function() {
    return div({
      className: "form-group " + (this.props.hasError ? 'has-error' : void 0)
    }, label({}, this.label() + ': '), div({
      className: 'input-group'
    }, input({
      type: 'number',
      className: "form-control",
      value: this.props.value,
      onChange: this.props.onChange,
      step: 'any',
      min: 0
    }), div({
      className: 'input-group-addon'
    }, this.unit())));
  }
});

MinMaxSelector = React.createClass({
  handleChange: function(fld, e) {
    return store.dispatch({
      type: 'changeVal',
      prop: fld,
      val: e.target.value
    });
  },
  render: function() {
    return span({}, el(NumberSelector, {
      label: 'Min',
      value: this.props.min,
      onChange: this.handleChange.bind(this, 'min'),
      hasError: this.props.error
    }), el(NumberSelector, {
      label: 'Max',
      value: this.props.max,
      onChange: this.handleChange.bind(this, 'max'),
      hasError: this.props.error
    }));
  }
});

StartSelector = React.createClass({
  changeType: function(e) {
    return store.dispatch({
      type: 'changeType',
      selected: e.target.value
    });
  },
  handleChange: function(e) {
    return store.dispatch({
      type: 'changeVal',
      prop: this.props.type,
      val: e.target.value
    });
  },
  startGame: function(e) {
    e.preventDefault();
    if (!this.props.error) {
      return store.dispatch({
        type: 'startGame'
      });
    }
  },
  render: function() {
    return div({}, p({
      className: "lead"
    }, 'The game is not started yet. Select training time and press Start.'), form({
      className: "form-inline",
      onSubmit: this.startGame
    }, div({
      className: "form-group"
    }, label({}, 'Time: '), select({
      className: "form-control",
      defaultValue: this.props.type,
      onChange: this.changeType,
      style: {
        width: 'auto'
      }
    }, option({
      value: 'random'
    }, 'Random time'), option({
      value: 'minutes'
    }, 'Minutes'), option({
      value: 'seconds'
    }, 'Seconds'))), 'random' === this.props.type ? el(MinMaxSelector, this.props) : el(NumberSelector, {
      type: this.props.type,
      value: this.props[this.props.type],
      onChange: this.handleChange,
      hasError: this.props.error
    }), button({
      type: "submit",
      className: "btn btn-primary",
      disabled: this.props.error
    }, 'Start')));
  }
});

Game = React.createClass({
  startCountdown: function() {
    return store.dispatch({
      type: 'startCountdown'
    });
  },
  startAnother: function() {
    return store.dispatch({
      type: 'startAnother'
    });
  },
  render: function() {
    return div({}, this.props.finished ? this.renderFinished() : void 0, this.renderTasks(), !(this.props.running || this.props.countdown) ? button({
      type: "submit",
      className: "btn btn-primary btn-lg center-block",
      onClick: this.startCountdown
    }, 'Click here when ready') : void 0);
  },
  countDownText: function() {
    if (this.props.countdown || 0 === this.props.countdown && !this.props.tasks.length) {
      return "Ready in " + (this.props.countdown + 1) + "...";
    } else {
      return 'Get ready...';
    }
  },
  renderTasks: function() {
    var ref, task, tasks;
    ref = this.props.tasks, task = ref[0], tasks = 2 <= ref.length ? slice.call(ref, 1) : [];
    if (task) {
      return div({
        className: 'panel panel-primary'
      }, this.renderHeading('Remaining time: ' + task.time), div({
        className: 'panel-body'
      }, p({
        className: 'lead'
      }, strong({}, task.desc + " (" + task.elapsed + "s)"))), ul({
        className: 'list-group'
      }, _.map(tasks, function(task) {
        return li({
          className: 'list-group-item text-muted'
        }, task.desc + " (" + task.elapsed + "s)");
      })));
    } else {
      return div({
        className: 'panel panel-primary'
      }, this.renderHeading(this.countDownText()));
    }
  },
  renderHeading: function(heading) {
    var rightEl;
    rightEl = $('body').width() < 400 ? small : span;
    return div({
      className: 'panel-heading'
    }, h3({
      className: 'panel-title'
    }, heading, rightEl({
      className: 'pull-right'
    }, "Target: " + this.props.target + ", Elapsed: " + this.props.elapsed)));
  },
  renderFinished: function() {
    return div({}, h2({}, "Congratulations! You completed " + this.props.elapsed + " seconds of training!"), button({
      className: "btn btn-success btn-lg center-block",
      style: {
        marginBottom: 20
      },
      onClick: this.startAnother
    }, 'Start another training'));
  }
});

Tasks = [
  {
    desc: 'lick it with your tongue',
    min: 10,
    max: 30
  }, {
    desc: 'suck it with your mouth',
    min: 10,
    max: 30
  }, {
    desc: 'fuck your open mouth',
    min: 10,
    max: 30
  }, {
    desc: 'stroke it with your hand',
    min: 10,
    max: 30
  }, {
    desc: 'deepthroat on it',
    min: 10,
    max: 30
  }, {
    desc: 'gag on it',
    min: 10,
    max: 30
  }, {
    desc: 'fuck your throat',
    min: 10,
    max: 30
  }, {
    desc: 'keep it in your throat',
    min: 3,
    max: 10
  }, {
    desc: 'go deep on it',
    min: 3,
    max: 10
  }, {
    desc: 'slap your face',
    min: 5,
    max: 15
  }, {
    desc: 'wipe the spit on your face',
    min: 5,
    max: 15
  }, {
    desc: 'moan like a whore',
    min: 5,
    max: 15
  }
];

generateTask = function(lastTask, maxTime) {
  var max, task, time;
  while (!(task && task.desc !== (lastTask != null ? lastTask.desc : void 0))) {
    task = _.sample(Tasks);
  }
  max = local ? task.min : task.max;
  time = _.min([_.random(task.min, max), maxTime]);
  return dup(task, {
    time: time,
    elapsed: time
  });
};

ref = React.DOM, a = ref.a, button = ref.button, div = ref.div, form = ref.form, img = ref.img, h1 = ref.h1, h2 = ref.h2, h3 = ref.h3, h4 = ref.h4, input = ref.input, label = ref.label, li = ref.li, option = ref.option, p = ref.p, select = ref.select, small = ref.small, span = ref.span, strong = ref.strong, ul = ref.ul;

el = React.createElement;

local = !top.location.hostname;

make = function(prop, val) {
  var obj;
  obj = {};
  obj[prop] = val;
  return obj;
};

dup = function() {
  var objs, state;
  state = arguments[0], objs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  return _.assign.apply(_, [{}, state].concat(slice.call(objs)));
};

trainerLogic = Redux.combineReducers({
  gameParams: gameParams,
  game: game
});

store = Redux.createStore(trainerLogic);

DTTMain = React.createClass({
  render: function() {
    return div({
      className: "container"
    }, h1({}, 'Deepthroat Trainer'), this.props.game.started ? el(Game, this.props.game) : el(StartSelector, this.props.gameParams));
  }
});

render = function() {
  return ReactDOM.render(el(DTTMain, store.getState()), document.getElementById('content'));
};

store.subscribe(render);

render();

if (local) {
  store.subscribe(function() {
    return console.log('current state', JSON.stringify(store.getState()));
  });
}
