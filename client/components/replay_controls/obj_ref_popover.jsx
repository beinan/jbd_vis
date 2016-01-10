import React from 'react'

import { Button, Modal, OverlayTrigger, Popover, Tooltip, ListGroup, ListGroupItem, Input } from 'react-bootstrap';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'

import SimulationAction from '../../actions/simulation_action'
import {getJson} from '../../utils/ajax'

import ValueChart from './value_chart.jsx'


class ObjectRefPopover extends React.Component{

  constructor(props){
    super(props);
    this.state = {};
    getJson('/obj_detail', {obj_ref: props.obj_ref, jvm_name:props.jvm_name}).then((data)=>{
      console.log("object detail", data);
      this.setState({data:data})
    });
  }

  render(){
    var fields, chart;
    if(this.state.data){
      fields = this.state.data.fields.map((d) => {
        return (
          <ListGroupItem>
            <Button active={d.active} bsSize="xsmall" onClick={()=>{d.active = !d.active; this.forceUpdate();}}>
              {d.field_name + ":" + d.field_type}
            </Button>
          </ListGroupItem>
        );
      });
      chart = <ValueChart obj_ref={this.props.obj_ref} jvm_name={this.props.jvm_name} fields={this.state.data.fields} />
     
    }
    return (
      <div>
        <ListGroup>
          {fields}
        </ListGroup>
        {chart}
      </div>
       
    )
  }
}

export default ObjectRefPopover;
