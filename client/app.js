var $ = global.$ = global.jQuery = require('jquery');
//var bootstrap = require('bootstrap');


var React = require('react');
import Frame from './components/frame.jsx';
import AppAction from './actions/app_action.js';

AppAction.setAppHeight($(window).height());
$(window).resize(()=> AppAction.setAppHeight($(window).height()));

import ViewType from './view_type';
AppAction.setView(ViewType.JVMS_VIEW);

React.render( <Frame/>, document.getElementById('app_wrapper'));
