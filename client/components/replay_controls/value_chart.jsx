import React from 'react'

import { Button, Modal, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import {PureRenderComponent, ImmutablePropComponent} from '../common_components.jsx'

import SimulationAction from '../../actions/simulation_action'

//var Chart = require('react-google-charts').Chart;
import {postJson} from '../../utils/ajax'


class ValueChart extends React.Component{
  constructor(props){
    super(props);
    //this.state.showModal = false;
    this.state= {};
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    //this.componentDidMount = this.componentDidMount.bind(this);
    this.drawChart = this.drawChart.bind(this);
  }
  
  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }
  
  drawChart(container){
    if(container){
      // Create the data table.
      postJson('/fields_history_value', this.props).then( (result)=> {
        console.log("drawing chart", data);
        var data = new google.visualization.DataTable();
        result.columns.forEach((c)=>{
          data.addColumn(c[0], c[1]);
       
        });
        // data.addColumn('number', 'value');
        data.addRows(result.rows);

        // Set chart options
        var options = {'title':'Number Value Chart',
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.LineChart(container);
        chart.draw(data, options);
        google.visualization.events.addListener(chart, 'select', (e)=>{
          //console.log(e, chart.getSelection());
          SimulationAction.replayJumpTo(chart.getSelection()[0].row); 
        });
      });
    }

  }
  
  
  render(){
    let popover = <Popover title="popover">very popover. such engagement</Popover>;
    let tooltip = <Tooltip>wow.</Tooltip>;
    console.log("render value chart:", this.state.data);
    //let data = this.state.data;
    //var chart = [
    //  ['column_one_label','column_two_label'], 
    //  [1,2], [2,3] ];
    

    return (
      <div>
        <button className="btn btn-sm btn-danger" onClick={this.open}>Value Chart</button>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Value Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={this.drawChart} style={{width:'100%', height:300}}></div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
      
    );
  }

}

export default ValueChart
