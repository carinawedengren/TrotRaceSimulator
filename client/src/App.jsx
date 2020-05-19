import React from 'react';
import socketIOClient from 'socket.io-client';
import _ from 'underscore';
import Cookies from 'js-cookie';
import './style.scss';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      startResponse: false,
      finishResponse: false,
      endpoint: 'http://127.0.0.1:4001',
      update: '',
    };
  }

  componentWillMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on('StartHorses', dataA => this.setState({ startResponse: dataA, update: 'start' }));
    socket.on('FinishHorses', dataB => this.setState({ finishResponse: dataB, update: 'finish' }));
  }

  renderTableData(type) {
    const { startResponse } = this.state;

    if (type === 'start') {
      return this.getTableData(startResponse);
    }
    else if (type === 'finish') {
      const jsonData = Cookies.get('results');
      const horses = JSON.parse(jsonData);
      const finishHorse = this.state.finishResponse;

      let filtered = _.filter(horses, function(item) {
        return item.horse.name !== finishHorse.horse.name;
      });

      filtered.push(finishHorse);
      return this.getTableData(filtered);
    }
    return;
  }

  getTableData(data){
    return Object.keys(data.sort(this.compare)).map(function(key) {
      let time = data[key].time;

      if (time < 99999) { time = ((time % 60000) / 1000).toFixed(1) + 's'; }
      else { time = '';}

      const jsonData = JSON.stringify(data);
      Cookies.set('results', jsonData);
      return (
        <tr key={key}>
            <td>{data[key].horse.id}</td>
            <td>{data[key].horse.name}</td>
            <td>{time}</td>
        </tr>
      )
    });
  }

  compare(a, b) {
    const timeA = a.time;
    const timeB = b.time;

    let comparison = 0;
    if (timeA > timeB) {
      comparison = 1;
    } else if (timeA < timeB) {
      comparison = -1;
    }
    return comparison;
  }

  render() {
    return (
        <div>
          <table id='results'>
            <tbody>
              <tr>
                <th>No</th>
                <th>Horse</th>
                <th>Time</th>
              </tr>
                {this.state.update &&
                  this.renderTableData(this.state.update)
                }
            </tbody>
          </table>
        </div>
    );
  }
}
export default App;
