Tasks = [
  {desc: 'alick it with your tongue',   min: 10, max: 30, diff: 0},
  {desc: 'amoan like a whore',          min: 5,  max: 15, diff: 0},
  {desc: 'astroke it with your hand',   min: 10, max: 30, diff: 0},
  {desc: 'suck it with your mouth',    min: 10, max: 30, diff: 1},
  {desc: 'wipe the spit on your face', min: 5,  max: 15, diff: 1},
  {desc: 'fuck your open mouth',       min: 10, max: 30, diff: 2},
  {desc: 'deepthroat on it',           min: 10, max: 30, diff: 2},
  {desc: 'go deep on it',              min: 3,  max: 10, diff: 2},
  {desc: 'slap your face',             min: 5,  max: 15, diff: 2},
  {desc: 'gag on it',                  min: 10, max: 20, diff: 3},
  {desc: 'fuck your throat',           min: 10, max: 30, diff: 3},
  {desc: 'keep it in your throat',     min: 3,  max: 10, diff: 3},
]

generateTask = (lastTask, target, elapsed) ->
  prefDiff = Math.floor(5 * elapsed / target)
  i = 0
  loop
    task = _.sample(Tasks)
    continue if Math.abs(task.diff - prefDiff) > i++
    break if task.desc != lastTask?.desc
  max = if local then task.min else task.max
  time = _.min([_.random(task.min, max), target - elapsed])
  dup(task, time: time, elapsed: time)
