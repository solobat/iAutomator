import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Options } from './Options';

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<Options />, document.getElementById('options'));
});
