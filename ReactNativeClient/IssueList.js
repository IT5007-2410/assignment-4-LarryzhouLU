import React, {useState} from 'react';
import {Table, Row} from 'react-native-table-component';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
} from 'react-native';

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

//Q4 
async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('http://10.0.2.2:3000/graphql', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({query, variables}),
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}
// Css here
const styles = StyleSheet.create({
  filter_text: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 20,
    textAlign: 'center' 
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center' 
  },
  header: {
    height: 50, 
    backgroundColor: '#537791'
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  row: { 
    height: 80, 
    backgroundColor: '#E7E6E1',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  content: {
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'lightblue',
    borderRadius: 8,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff'},
});

// Q1: Add a new component called IssueFilter that displays a placeholder text.

function IssueFilter() {
  return (
    <View>
      <Text style={styles.filter_text}>
        This is a placeholder for the issue filter.
      </Text>
    </View>
  );
}

function IssueRow(props) {
  const issue = props.issue;
  const rowData = [
    issue.id,
    issue.status,
    issue.owner,
    issue.created.toDateString(),
    issue.effort,
    issue.due ? issue.due.toDateString() : '',
    issue.title,
  ];
  return <Row data={rowData} style={styles.row} textStyle={styles.text} />;
}

function IssueTable(props) {
  const issueRows = props.issues.map(issue => (
    <IssueRow key={issue.id} issue={issue} />
  ));
  const tHeader = [
    'ID',
    'Status',
    'Owner',
    'Created',
    'Effort',
    'Due Date',
    'Title',
  ];

  return (
    <View style={styles.container}>
      <Table>
        <Row
          data={tHeader}
          textStyle={styles.headerText}
          style={styles.header}
        />

        {issueRows}
      </Table>
    </View>
  );
}

class IssueAdd extends React.Component {
  constructor() {
    super();
    this.state = {
      owner: '',
      effort: '',
      title: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange = (newName, newValue) => {
    this.setState({[newName]: newValue});
  };

  handleSubmit() {
    const issue = {
      owner: this.state.owner,
      effort: this.state.effort,
      title: this.state.title,
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    };
    this.props.createIssue(issue);
    this.setState({owner: '', effort: '', title: ''});
  }

  render() {
    return (
      <View>
        <Text style={styles.filter_text}>Add Issue Here:</Text>
        <TextInput
          style={styles.input}
          placeholder="Please Enter Owner Name"
          value={this.state.owner}
          onChangeText={text => this.handleInputChange('owner', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Please Enter Effort In Hours"
          value={this.state.effort}
          onChangeText={text => this.handleInputChange('effort', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Please Enter Title Of Issue"
          value={this.state.title}
          onChangeText={text => this.handleInputChange('title', text)}
        />

        <Button
          title="Submit"
          onPress={this.handleSubmit}
          // style={styles.button}
          // textStyle={styles.buttonText}
        />
      </View>
    );
  }
}

class BlackList extends React.Component {
  constructor() {
    super();
    this.state = {name: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange = (newName, newValue) => {
    this.setState({[newName]: newValue});
  };

  async handleSubmit() {
    await this.props.addToBlacklist(this.state.name);
    this.setState({name: ''});
  }

  render() {
    return (
      <View>
        <Text style={styles.filter_text}>Add to BlackList:</Text>
        <TextInput
          placeholder="Please Enter the Name to Add to BlackList"
          value={this.state.name}
          onChangeText={value => this.handleInputChange('name', value)}
          style={styles.input}
        />
        <Button 
          title="Submit"
          onPress={this.handleSubmit}
          // style={styles.button}
          // textStyle={styles.buttonText}
          />
      </View>
    );
  }
}

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {issues: [], selector: 1};
    this.createIssue = this.createIssue.bind(this);
    this.addToBlacklist = this.addToBlacklist.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
        issueList {
        id title status owner
        created effort due
        }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({issues: data.issueList});
    }
  }

  async createIssue(issue) {
    const query = `mutation issueAdd($issue: IssueInputs!) {
        issueAdd(issue: $issue) {
        id
        }
    }`;

    const data = await graphQLFetch(query, {issue});
    if (data) {
      alert('Successfully added an Issue ');
      this.loadData();
    }
  }

  async addToBlacklist(nameInput) {
    const query = `mutation addToBlacklist($nameInput: String!) {
        addToBlacklist(nameInput: $nameInput) 
    }`;

    const data = await graphQLFetch(query, {nameInput});
    if (data) {
      alert(`Successfully added ${nameInput} into blacklist`);
    }
  }

  setSelector = value => {
    this.setState({selector: value});
  };

  render() {
    return (
      <SafeAreaView>
        <View style={styles.navbar}>
          <View style={styles.button}>
            <Text style={styles.buttonText} onPress={() => this.setSelector(1)}>
              Filter
            </Text>
          </View>
          <View style={styles.button}>
            <Text style={styles.buttonText} onPress={() => this.setSelector(2)}>
              Table
            </Text>
          </View>
          <View style={styles.button}>
            <Text style={styles.buttonText} onPress={() => this.setSelector(3)}>
              Add
            </Text>
          </View>
          <View style={styles.button}>
            <Text style={styles.buttonText} onPress={() => this.setSelector(4)}>
              BlackList
            </Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {this.state.selector === 1 && <IssueFilter />}
          {this.state.selector === 2 && (
            <IssueTable issues={this.state.issues} />
          )}
          {this.state.selector === 3 && (
            <IssueAdd createIssue={this.createIssue} />
          )}
          {this.state.selector === 4 && (
            <BlackList addToBlacklist={this.addToBlacklist} />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}


