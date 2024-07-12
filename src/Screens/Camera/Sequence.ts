export const Sequence = [
  {Led:"", Action:"adjust"},
  {Led:"green", Action:"detect"},
  {Led:"", Action:"wait", Interval: "30 sec"},
  {Led:"blue", Action:"detect"},
  {Led:"", Action:"capture", Interval:"5 sec"},
  {Led:"red", Action:"detect"},
]