import React from "react"
import {ImmutablePropComponent, PureRenderComponent} from '../common_components.jsx';


const LIFELINE_WIDTH = 8;

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
    return(
      <rect x={center_x - LIFELINE_WIDTH/2} y={y} width={LIFELINE_WIDTH} height={height} 
      style={{fill:'gray', stroke:'black', strokeWidth:2, opacity:0.5}} rx={LIFELINE_WIDTH/3} ry={LIFELINE_WIDTH/3}/>
    );
  }
};


