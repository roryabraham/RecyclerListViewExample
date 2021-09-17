import React, {Component} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Text,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {DataProvider, LayoutProvider, RecyclerListView} from 'recyclerlistview';
import {fetchPaginatedData} from './fakeServer';

const INITIAL_LOWEST_SEQUENCE_NUMBER = 240;
const LIMIT = 20;

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataProvider: new DataProvider((r1, r2) => {
        return r1 !== r2;
      }),
      data: [],
      lowestSequenceNumber: INITIAL_LOWEST_SEQUENCE_NUMBER,
      highestSequenceNumber: 0,
      loadingOlder: false,
      loadingNewer: false,
    };
  }

  layoutProvider = new LayoutProvider(
    index => index,
    (type, dim) => {
      dim.width = Dimensions.get('window').width;
      dim.height = 50;
    },
  );

  fetchData = async (offset, limit) => {
    const data = await fetchPaginatedData(offset, limit);
    this.setState(prevState => {
      const lowestSequenceNumber =
        offset < prevState.lowestSequenceNumber
          ? offset
          : prevState.lowestSequenceNumber;
      const highestSequenceNumber =
        offset + limit > prevState.highestSequenceNumber
          ? offset + limit
          : prevState.highestSequenceNumber;
      const loadedNewerData =
        highestSequenceNumber !== prevState.highestSequenceNumber;
      const mergedData = loadedNewerData
        ? [...prevState.data, ...data]
        : [...data, ...prevState.data];
      return {
        data: mergedData,
        dataProvider: prevState.dataProvider.cloneWithRows(mergedData),
        loadingNewer: false,
        loadingOlder: false,
        lowestSequenceNumber,
        highestSequenceNumber,
      };
    });
  };

  componentDidMount() {
    this.fetchData(INITIAL_LOWEST_SEQUENCE_NUMBER, LIMIT);
  }

  rowRenderer = (type, item) => <Text style={styles.rowRenderer}>{item}</Text>;

  fetchOlder = async () => {
    if (this.state.lowestSequenceNumber > 0) {
      this.setState({loadingOlder: true});
      await this.fetchData(
        Math.max(this.state.lowestSequenceNumber - LIMIT, 0),
        LIMIT,
      );
    }
  };

  fetchNewer = async () => {
    this.setState({loadingNewer: true});
    await this.fetchData(this.state.highestSequenceNumber, LIMIT);
  };

  render() {
    if (!this.state.dataProvider._data.length) {
      return null;
    }
    return (
      <SafeAreaView style={styles.flex1}>
        <RecyclerListView
          dataProvider={this.state.dataProvider}
          layoutProvider={this.layoutProvider}
          rowRenderer={this.rowRenderer}
          onEndReached={this.fetchNewer}
          onStartReached={this.fetchOlder}
          renderHeader={() => this.state.loadingOlder && <ActivityIndicator />}
          renderFooter={() => this.state.loadingNewer && <ActivityIndicator />}
          canChangeSize
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    minHeight: 1,
    minWidth: 1,
  },
  rowRenderer: {
    textAlign: 'center',
    fontSize: 20,
    padding: 5,
    borderColor: 'blue',
    borderWidth: 1,
    backgroundColor: 'white',
  },
});

export default App;
