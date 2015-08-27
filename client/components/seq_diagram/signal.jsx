import React from 'react'

import SimulationAction from '../../actions/simulation_action'

const default_bar_style = {opacity:0};
const mouseover_bar_style = {opacity:0.2, fill:"blue", stroke: "red", strokeWidth:4, strokeDasharray: "3,1"};

class Signal extends React.Component{
  constructor(props){
    super(props);
    this.state = {bar_style: default_bar_style};
    this.barOnMouseLeave = this.barOnMouseLeave.bind(this);
    this.barOnMouseEnter = this.barOnMouseEnter.bind(this);
    this.barOnClick = this.barOnClick.bind(this);
    this._onReplayChange = this._onReplayChange.bind(this);
  }
  
  barOnClick(){
    SimulationAction.replayJumpTo(this.props.signal_data);
  }

  barOnMouseLeave(){
    this.setState({bar_style:default_bar_style});
  }
  barOnMouseEnter(){
    this.setState({bar_style:mouseover_bar_style});
  }

  componentDidMount() {
    this.props.signal_data.on("REPLAY_UPDATE", this._onReplayChange);
  }

  componentWillUnmount() {
    this.props.signal_data.removeListener("REPLAY_UPDATE", this._onReplayChange);
  }

  _onReplayChange() {
    console.log("signal replay change");
    this.setState({is_replay_on:this.props.signal_data.is_replay_on});
  }

  render(){
    //console.log("Signal is rendering", this.props, this.state);
    
    var signal_data = this.props.signal_data;
    var path_d;
    var y = 12;
    var lifeline_x = (lifeline)=>{
      var center_x = lifeline.actor.threads[lifeline.thread_id].center_x;
      var position_x = 0;
      if(lifeline.actor.rendering_data)
        position_x = lifeline.actor.rendering_data.position_x;
      return center_x + position_x;
    }
    var from_x = lifeline_x(signal_data.from_lifeline);
    var to_x = lifeline_x(signal_data.to_lifeline);
    var is_self = signal_data.from_lifeline.actor == signal_data.to_lifeline.actor;
    if(is_self){
      path_d = ` M${from_x} ${y} L${to_x + 40} ${y} L${to_x + 40} ${y + 20} L${to_x } ${y + 20}`
    }else{
      path_d = `M${from_x} ${y} L${to_x} ${y}`
    }
    var text_x = (from_x + to_x)/2 - 20;
    var bar_style;
    if(this.state.is_replay_on){
      bar_style = {opacity:0.5, fill:"blue", stroke: "red", strokeWidth:6, strokeDasharray: "3,1"};
    }else{
      bar_style = this.state.bar_style;
    }
    return(
      <g ref="signal_g" transform={"translate(0," + signal_data.y +")"}>
        <text x={text_x} y={0}>{signal_data.to_lifeline.method_name}</text>
        <path d={path_d} stroke="olivedrab" strokeWidth={2} style={{fill:'none'}} markerEnd="url(#end)" />
        <rect ref="bar" width={this.props.max_width} height={is_self?40:20} y={y-10} x={5} rx={4} ry={4}
              style={bar_style} onClick={this.barOnClick} 
              onMouseEnter={this.barOnMouseEnter} onMouseLeave={this.barOnMouseLeave}/>
      </g>
    );
  }
}

export default Signal;
