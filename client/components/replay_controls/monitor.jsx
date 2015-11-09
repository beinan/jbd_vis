import React from 'react'

import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx';


//const bar_style = {opacity:0.5, fill:"red", stroke: "blud", strokeWidth:1, strokeDasharray: "3,1"};

export default class Monitor extends PureRenderComponent{
  constructor(props){
    super(props);    
  }
  
  render(){
    var fields = [];
    var values = [];
    this.props.store.get('fields').forEach(
      (f)=>{
        var field_name = f.split(',')[0].split('@')[1];
        var class_name = f.split(',')[0].split('@')[0];
        fields.push(<th><span title={class_name}>{field_name}</span></th>);
        values.push(<td>{this.props.store.get('data')[f]}</td>);
      }
      
    );
    
    return (
      <div>
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              {fields}
            </tr>
          </thead>
          <tbody>
            <tr>
              {values}
            </tr>
          </tbody>
        </table>
      </div>
    );

  }
}
