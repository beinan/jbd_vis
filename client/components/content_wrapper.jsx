
import React from 'react'
import AppStore from '../stores/app_store'

import ViewType from '../view_type.js'



import {PureRenderCommponent, ImmutablePropComponent} from './common_components.jsx'

import JvmsView from './views/jvms_view.jsx'
import SimulationView from './views/simulation_view.jsx'


var view_map = {
  [ViewType.JVMS_VIEW]: <JvmsView/>,
  [ViewType.SIMULATION_VIEW]: <SimulationView/>
  
};

class ContentWrapper extends ImmutablePropComponent{
  constructor(props) {
    super(props);
  }
        
  render(){
    return (
      <div className="content-wrapper">
        {view_map[this.props.view_name]}
      </div>
    )
  }
}

export default ContentWrapper
