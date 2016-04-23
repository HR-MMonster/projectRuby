var api = require('../Utils/api');
var ImagePickerManager = require('NativeModules').ImagePickerManager;

import React, {
  CameraRoll,
  View,
  NativeModules,
  Text,
  Image,
  StyleSheet,
  Component,
  ScrollView,
  TouchableHighlight,
  TextInput
} from 'react-native';


class ImagePicker extends Component {

  state = {
    avatarSource: null
  };



  selectPhotoTapped() {
    const options = {
      title: 'Photo Picker',
      takePhotoButtonTitle: 'Take Photo...',
      chooseFromLibraryButtonTitle: 'Choose from Library...',
      quality: 0.5,
      maxWidth: 300,
      maxHeight: 300,
      storageOptions: {
        skipBackup: true
      },
      allowsEditing: true
    };

    ImagePickerManager.showImagePicker(options, (response) => {
      console.log('Response = ', response.uri);
        var source = {uri: response.uri.replace('file://', ''), isStatic: true};
        var uploadPrefObj = {
          uri: source.uri,
          uploadUrl: 'http://159.203.222.32:4568/photos/',
          // uploadUrl: 'http://localhost:4568/photos/',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };

        React.NativeModules.FileTransfer.upload(uploadPrefObj, (err, res) => {
          if (err) {
            console.error('in the error console :(')
          } else {
            var data = JSON.parse(res.data);
            var photoUrl = 'http://159.203.222.32:4568/photos/' + data.filename;
            // var photoUrl = 'http://localhost:4568/photos/' + data.filename;
            api.updateUserData(this.props.authInfo, 'profileImageURL', photoUrl);
            this.props.updatePhoto(photoUrl);
          }
        });
        this.setState({
          avatarSource: source
        });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight onPress={this.selectPhotoTapped.bind(this)}>
          <View>
          {this.state.avatarSource === null ? <Text style={styles.photoButtonText}>Edit Photo</Text>:<Image style={styles.avatar} source={this.state.avatarSource} />}
          </View>
        </TouchableHighlight>
      </View>

    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#9dc7c9'
  },
    photoButtonText: {
    fontSize: 18,
    color: 'black'
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150
  }
});


module.exports = ImagePicker;
