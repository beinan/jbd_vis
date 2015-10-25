import React from 'react'

import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx';


const bar_style = {opacity:0.5, fill:"red", stroke: "blud", strokeWidth:1, strokeDasharray: "3,1"};

export default class SimulationBar extends PureRenderComponent{
  constructor(props){
    super(props);
 
    
  }
  
  render(){
    var current_signal = this.props.store.getCurrentSignal();
    var seq = current_signal?current_signal.seq:0;
    var y = this.props.seq_diag_store.getYPosBySeq(seq);
    return (
      <rect ref="bar" width={this.props.max_width} height={4} y={y} x={5}
            style={bar_style} />
    );

  }
}
