import React from "react"
import {ImmutablePropComponent, PureRenderComponent} from '../common_components.jsx';
import SimulationAction from '../../actions/simulation_action'


const LIFELINE_WIDTH = 8;

const OUT_SIGNAL_COLOR = {
  'field_setter':'red',
  'field_getter':'green',
  'method_invoke': 'blue',
  'array_setter':'orange',
  'array_getter': 'black'
};
export default class Lifeline extends PureRenderComponent{
  constructor(props){
    super(props);
  }

  render(){
    //console.log("Lifeline is rendering", this.props, this.state);
    
    var lifeline = this.state.data;
    var center_x = lifeline.get("center_x", 0);
    
    var y = lifeline.get('y', 0);
    var height = lifeline.get('height', 0);
    var fill_color = lifeline.get('active')? 'red':'gray';
    var out_signals = lifeline.get('out_signals').toArray().map(s=>{
      var onclick = ()=>{
        //console.log(s);
        SimulationAction.replayJumpTo(s.seq);
      }
      var signal_color = OUT_SIGNAL_COLOR[s.signal_type];
      return (        
        <rect x={center_x - LIFELINE_WIDTH/2 + 1} y={s.y} width={LIFELINE_WIDTH - 2} height={4} 
              style={{fill:signal_color, stroke:signal_color , strokeWidth:0, opacity:0.7}} onClick={onclick}/>
      );
    });
    //console.log("out signal", lifeline.get('out_signals'), out_signals);
    return(
      <g>
        <rect x={center_x - LIFELINE_WIDTH/2} y={y} width={LIFELINE_WIDTH} height={height} 
              style={{fill:fill_color, stroke:'black', strokeWidth:2, opacity:0.5}} rx={LIFELINE_WIDTH/3} ry={LIFELINE_WIDTH/3}/>
        {out_signals}
      </g>
    );
  }
};


