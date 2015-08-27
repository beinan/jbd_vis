import React from 'react'

import SimulationAction from '../../actions/simulation_action'

const LIFELINE_WIDTH = 8;
class Lifeline extends React.Component{
  constructor(props){
    super(props);
    this.state = {};
  }

  render(){
    //console.log("Lifeline is rendering", this.props, this.state);
    
    var lifeline = this.props.lifeline_data;
    var center_x = lifeline.actor.threads[lifeline.thread_id].center_x;
    var position_x = 0;
    if(lifeline.actor.rendering_data)
      position_x = lifeline.actor.rendering_data.position_x;
    
    var y = lifeline.y?lifeline.y:0;
    var height = lifeline.height?lifeline.height:0;
    return(
      <rect x={center_x + position_x - LIFELINE_WIDTH/2} y={y} width={LIFELINE_WIDTH} height={height} 
      style={{fill:'gray', stroke:'black', strokeWidth:2, opacity:0.5}} rx={LIFELINE_WIDTH/3} ry={LIFELINE_WIDTH/3}/>
    );
  }
}

export default Lifeline;
