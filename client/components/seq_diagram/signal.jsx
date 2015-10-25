import React from 'react'

import SimulationAction from '../../actions/simulation_action'
import {ImmutablePropComponent, PureRenderComponent} from '../common_components.jsx';

const default_bar_style = {opacity:0};
const mouseover_bar_style = {opacity:0.2, fill:"blue", stroke: "red", strokeWidth:4, strokeDasharray: "3,1"};

class Signal extends PureRenderComponent{
  constructor(props){
    super(props);
    this.state.bar_style = default_bar_style;
    this.barOnMouseLeave = this.barOnMouseLeave.bind(this);
    this.barOnMouseEnter = this.barOnMouseEnter.bind(this);
    this.barOnClick = this.barOnClick.bind(this);

  }
  
  barOnClick(){
    //console.log("signal clicked", this.state.data.get('seq'));
    //SimulationAction.replayJumpTo(this.props.signal_data);
  }

  barOnMouseLeave(){
    this.setState({bar_style:default_bar_style});
  }
  barOnMouseEnter(){
    this.setState({bar_style:mouseover_bar_style});
  }

 
  render(){
    //console.log("Signal is rendering", this.props, this.state);
    
    var signal_data = this.state.data;
    var path_d;
    var y = 12;
    
    var from_lifeline = signal_data.get("from_lifeline");
    var to_lifeline = signal_data.get("to_lifeline");
    var from_x = signal_data.get('from_x', 10);
    var to_x = signal_data.get('to_x', 100);
    //console.log("drawing signal", from_x, to_x);
    var is_self = from_lifeline && to_lifeline && from_lifeline.get("actor") == to_lifeline.get("actor");
    if(is_self){
      path_d = ` M${from_x} ${y} L${to_x + 40} ${y} L${to_x + 40} ${y + 20} L${to_x } ${y + 20}`
    }else{
      path_d = `M${from_x} ${y} L${to_x} ${y}`
    }
    var text_x = (from_x + to_x)/2 - 20;
    var bar_style;
    if(signal_data.get("active")){
      bar_style = {opacity:0.2, fill:"blue"};
    }else{
      bar_style = this.state.bar_style;
    }
    return(
      <g ref="signal_g" transform={"translate(0," + signal_data.get("y") +")"}>
        <text x={text_x} y={0}>{this.props.store.getTitle()}</text>
        <path d={path_d} stroke="olivedrab" strokeWidth={2} style={{fill:'none'}} markerEnd="url(#end)" />
        <rect ref="bar" width={this.props.max_width} height={is_self?40:20} y={y-10} x={5} rx={4} ry={4}
              style={bar_style} onClick={this.barOnClick} 
              onMouseEnter={this.barOnMouseEnter} onMouseLeave={this.barOnMouseLeave}/>
      </g>
    );
  }
}

export default Signal;
