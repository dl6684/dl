gameInitialState =
  started: false
  tasks: []
  elapsed: 0

game = (state = gameInitialState, action) ->
  switch action.type
    when 'startGame'
      dup(state, started: true, target: calculateTargetTime())
    when 'startCountdown'
      dup(state, countdown: 1)
    when 'decreaseCountdown'
      dup(state, countdown: state.countdown - 1, running: state.countdown == 1)
    when 'nextTask'
      elapsed = _.reduce(state.tasks, ((sum, task) -> sum + task.elapsed), 0)
      if elapsed < state.target
        task = generateTask()
        dup(state, tasks: [task].concat(state.tasks), elapsed: elapsed)
      else
        dup(state, finished: true, runnning: false, elapsed: elapsed)
    when 'decreaseTask'
      [task, rest...] = state.tasks
      task = dup(task, time: task.time - 1)
      dup(state, tasks: [task].concat(rest))
    else
      state

timer = ->
  game = store.getState().game
  return unless game.started
  if game.countdown
    store.dispatch(type: 'decreaseCountdown')
  else if game.running
    if 0 == game.tasks.length or 0 == game.tasks[0].time
      store.dispatch(type: 'nextTask')
    else
      store.dispatch(type: 'decreaseTask')

setInterval(timer, 1000)