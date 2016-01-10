
import React from 'react/addons'  //react with all addons



/**
 * Common abstracted React.js component with PureRenderMixin
 * Each property passed in this Component has to be immutable(such as string, number, immutable object and etc..)
 * @see https://facebook.github.io/immutable-js/docs/
 * @see https://facebook.github.io/react/docs/pure-render-mixin.html
 */
export class ImmutablePropComponent extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = React.addons.PureRenderMixin.shouldComponentUpdate.bind(this);
    console.log("construct componet:", this.constructor.name);
  }
} 

/**
 * Common abstracted cmponent with a common store {@link StoreFactory}
 * store in props is mandatory
 * @example 
 * class MyComponent extends PureRenderComponent{
 *  ...
 * }
 * <MyComponent store={StoreFactory.getAppStore()} />
 */
export class PureRenderComponent extends ImmutablePropComponent{
  constructor(props) {
    super(props);
    this.state = {data : props.store.getData()};
    this._onChange = this._onChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    //this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentDidMount() {
    console.log("component did mount:", this.constructor.name, this.props.store); 
    this.props.store.addEventListener(this._onChange);
  }

  componentWillUnmount() {
    console.log("component will unmount:", this.constructor.name, this.props.store); 
    this.props.store.removeEventListener(this._onChange);
  }
  
  //componentWillReceiveProps(nextProps){
    //this.setState({data:nextProps.store.getData()});
  //}

  _onChange() {
    try{
      console.log("setting state start", this.constructor.name, this.props.store.getData());
      this.setState({data:this.props.store.getData()});
      console.log("setting state finished",  this.constructor.name);
    }catch(e){
      console.error("setState exception", e, e.stack);
    }
  }
}

export class ContentSection extends React.Component{
  
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <section id={this.props.section_id}>
        <h2 className="page-header"><a href={"#" + this.props.section_id}>{this.props.title}</a></h2>
        <p className="lead">
          {this.props.desc} 
        </p>
        {this.props.content}
      </section>
    );
  }
}

export class ContentBox extends React.Component{
  
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <div className="box box-primary">
        <div className="box-header with-border">
          <h3 className="box-title">{this.props.title}</h3>
          <span className="label label-primary pull-right"><i className="fa fa-html5"></i></span>
        </div>
        <div className="box-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}


//TODO: move this class to a seperate file
import {getJson} from '../utils/ajax.js';
import {Button, Input, Label, Fade, Collapse,Badge, Grid, Row, Col, Well} from 'react-bootstrap';

export class UploadFileForm extends React.Component{
  
  constructor(props){
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {status:"success", msg:'Upload your test cases.'}; //init with 'success' status.
  }
  

  handleSubmit(e){
    e.preventDefault();
    this.setState({status: 'warning', msg: "Uploading, don't close your browser."});
    var formData = new FormData(React.findDOMNode(this.refs.uploadForm));
    $.ajax({
      url: this.props.url,  //Server script to process data
      type: 'POST',
      data: formData,
      cache: false,
      contentType: false,
      processData: false
    }).then(
      (data) => { //ajax request successed
        this.setState(data); 
        console.log("finished",data);
        //this.setState({job_id: data.job_id});
      },
      (jqXHR, textStatus, errorThrown) => { //ajax request failed
        this.setState({status:'error', msg:"Error" + errorThrown});
      }
    );
  }
  render() {
    var job_output;
    var main_classes = [];
    if(this.state.data){
      var app_id = this.state.data.app_id
      main_classes = this.state.data.main_classes.map(function(main_class){
        var run_click = function(){
          getJson("/run", {app_id: app_id, main_class_name: main_class}).then(function(data){
            alert(data.msg);
          });
        }
        return (
          <li>
            {main_class}
            <div className="pull-right">
              <Button bsStyle="warning" bsSize='xsmall'  onClick={run_click}>Run</Button>
            </div>
       
          </li>
        );
      });
    }
    return (
      <form encType="multipart/form-data" onSubmit={this.handleSubmit} id="file_upload_form" ref="uploadForm">
        <div className={"form-group has-" + this.state.status}>          
          <label className="control-label" htmlFor="uploadFile">{this.state.msg}</label>
          <input type="file" name="file" id="uploadFile" />
          <p className="help-block">{this.props.desc}</p>
        </div>
        <div>
          <ul className="todo-list ui-sortable">
            {main_classes}
          </ul>
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-upload"></i> Upload
        </button>
               
      </form>
      
    );
  }
}

