
import React from 'react';

import ViewType from '../view_type.js';



import {PureRenderComponent, ImmutablePropComponent} from './common_components.jsx';

import JvmsView from './views/jvms_view.jsx';
import SimulationView from './views/simulation_view.jsx';


var view_map = {
  [ViewType.JVMS_VIEW]: JvmsView,
  [ViewType.SIMULATION_VIEW]: SimulationView
  
};

function getView(view_name, params){
  console.log("switching to view:", view_name, params);
  var view =  React.createElement(view_map[view_name], params);
  console.log(view);
  return view;
}

class ContentWrapper extends ImmutablePropComponent{
  constructor(props) {
    super(props);
  }
        
  render(){
    return (
      <div className="content-wrapper">
        {getView(this.props.view_name, this.props.params)}
      </div>
    )
  }
}

export default ContentWrapper
