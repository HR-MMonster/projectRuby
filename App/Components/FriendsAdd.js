var api = require('../Utils/api');
var Separator = require('./Helpers/Separator');
var Firebase = require('firebase');
var Friends = require('./Friends');

import React, {
  View,
  Text,
  Image,
  StyleSheet,
  Component,
  ScrollView,
  TouchableHighlight,
  TextInput
} from 'react-native';

class FriendsAdd extends Component{

  constructor(props) {
    super(props);
    this.state = {
      updateAlert: '',
      isLoading: false,
      foundFriend: false,
      matches: []
    };
  }

  captureItemChange(event) {
    this.setState({
      friendEmail: event.nativeEvent.text
    });
  }

  searchUsers(event) {
    var context = this;
    var query = event.nativeEvent.text || '';
    this.setState({
      query: query
    });
    var potentialMatches = [];
    var currentFriends = this.props.friends;
    var friendIds = currentFriends.map((friend) => friend.uid);
    var usersRef = new Firebase(`https://project-ruby.firebaseio.com/UserData`);
    usersRef.on('value', function(snap) {
      var users = snap.val();
      for (var uid in users) {
        var user = users[uid];
        var name = user.name;
        var email = user.email;
        user.uid = uid;
        if (name && (friendIds.indexOf(user.uid) === -1)) {
          name = name.toLowerCase();
          if (name.indexOf(query.toLowerCase()) > -1 || email.indexOf(query.toLowerCase()) > -1) {
            potentialMatches.push(user);
            context.setState({matches: potentialMatches});
          }
        }
        context.setState({matches: potentialMatches, isLoading: false});
      }
    });
  }

  sendFriendRequest(event, match) {
    var userId = this.props.userInfo.uid;
    var matchId = match.uid;
    var that = this;

    api.sendFriendRequest(userId, matchId);

    that.setState({
      updateAlert: 'Friend Request Sent!',
      foundFriend: false,
      matches: []
    });

    setTimeout(function() {
      that.setState({ updateAlert: '' }); // TODO: route to another page
    }, 1500);
  }

  searchForFriend(event) {
    var that = this;
    var friendEmail = that.state.friendEmail;
    var allFriends = that.props.allFriends;
    var foundFriend = false;

    if (allFriends.length > 0) {
      for (var i = 0; i < allFriends.length; i++) {
        if (allFriends[i].email === friendEmail) {
          that.setState({
            updateAlert: 'You are already friends with that person!',
            isLoading: false
          });
          foundFriend = true;
        }
      }
    }

    if (foundFriend === false) {
      api.findUserByEmail(friendEmail)
        .then(function(res) {
          that.setState({
            newFriend: res,
            isLoading: false,
            foundFriend: true
          });
        })
        .catch(function(err) {
          that.setState({
            updateAlert: 'That user was not found.',
            isLoading: false,
            foundFriend: false
          });
        });
    }

    setTimeout(function() {
      that.setState({ updateAlert: ''});
    }, 3000);
  }

  // TODO: attempts to rerender, but errors on line 112
  goToFriendsView(){
    var that = this;
    that.props.navigator.push({
      title: 'Friends',
      component: Friends,
      passProps: {userInfo: that.props.userInfo}
    });
  }

  render(){
    var context = this;
    var friendDisplay = this.state.matches ? this.state.matches.map((match, index) => {

      return (

        <View key={index}>
          <View style={styles.listContainer}>
          <Image
            style={styles.image}
            source={{uri: match.profileImageURL}} />
          <Text style={styles.name}> {match.name} </Text>
          <TouchableHighlight
            style={styles.button}
            onPress={(event)=>context.sendFriendRequest(event, match)}
            underlayColor='white' >
            <Text style={styles.buttonText}> ADD FRIEND </Text>
          </TouchableHighlight>
          </View>
          <Separator />
        </View>
      )
    }) : <View></View>;

    if (this.state.isLoading) {
      var loadingFriend = (
        <View style={styles.isLoadingContainer}>
          <Image style={styles.loadingImage} source={require('../Images/loading.gif')} />
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={styles.alertText}>{this.state.updateAlert}</Text>
        <View style={styles.rowContainer}>
            <Text style={styles.rowTitle}> Search for Friends </Text>
            <TextInput
              autoCapitalize='none'
              style={styles.searchInput}
              onChange={(event)=>this.searchUsers(event)} />
            </View>
        <ScrollView showsVerticalScrollIndicator={true}>
        {loadingFriend}
        {friendDisplay}
        </ScrollView>
      </View>
    )
  }
}

var styles = {
  container: {
    flex: 1,
    marginLeft: 20,
    marginRight: 10,
    marginTop: 100
  },
  listContainer: {
    padding: 20
  },
  isLoadingContainer: {
    flex: 1,
    alignSelf: 'center'
  },
  loadingImage: {
    height: 100,
    width: 100,
    alignSelf: 'center'
  },
  button: {
    height: 25,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 15,
    alignSelf: 'flex-end',
    justifyContent: 'center'
  },
  buttonText: {
    padding: 10,
    fontSize: 10
  },
  alertText: {
    marginTop: 20,
    color: '#feb732'
  },
  rowContainer: {
    padding: 3
  },
  rowTitle: {
    color: '#498183',
    fontSize: 16
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
    position: 'absolute'
  },
  name: {
    paddingLeft: 80,
    marginTop: 15,
    fontSize: 20,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  searchInput: {
    height: 30,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    marginTop: 5,
    padding: 3
  }
};

module.exports = FriendsAdd;

