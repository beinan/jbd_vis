
import React from 'react'
import AppStore from '../stores/app_store'

import ViewType from '../view_type.js'


import JvmsView from './views/jvms_view.jsx'
import SimulationView from './views/simulation_view.jsx'

var view_map = {
  [ViewType.JVMS_VIEW]: <JvmsView/>,
  [ViewType.SIMULATION_VIEW]: <SimulationView/>
  
};

class ContentWrapper extends React.Component{
  constructor(props) {
    super(props);
    
    this.state = {view_name: AppStore.getData().view_name};
    this._onChange = this._onChange.bind(this);
  }
    
  

  componentDidMount() {
    AppStore.addEventListener(AppStore.VIEW_CHANGE_EVENT, this._onChange);
  }

  componentWillUnmount() {
    AppStore.removeEventListener(AppStore.VIEW_CHANGE_EVENT , this._onChange);
  }

 
  _onChange() {
    this.setState( {view_name: AppStore.getData().view_name});
  }
  
  render(){
    return (
      <div className="content-wrapper">
        {view_map[this.state.view_name]}
      </div>
    )
  }
}

export default ContentWrapper
