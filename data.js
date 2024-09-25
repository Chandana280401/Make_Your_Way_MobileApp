import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View ,TouchableOpacity,Alert,ToastAndroid,Image} from 'react-native';
import MapView, { Marker ,Callout} from 'react-native-maps';
import * as Location from 'expo-location';
import firebase from 'firebase'
import { Audio } from 'expo-av';
export default class Mapping extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      initialRegion:null,
      mapRegion:null,
      region: {
        latitude: "LATITUDE",
        longitude: "LONGITUDE",
        latitudeDelta: "LATITUDE_DELTA",
        longitudeDelta: "LONGITUDE_DELTA",
       },
       markers: {
         coordinate: {
           latitude: 0,
           longitude: 0,
           },
        
       }
    };
  }
  componentDidMount=async()=>{
    this.getCurrentLocation();
    const sound = new Audio.Sound();
        try {
          ToastAndroid.show("Please select the Accident location to upload data", ToastAndroid.LONG);
          await sound.loadAsync( require('../audio/newaccident.mp3'));
          await sound.playAsync().then(async(playbackStatus)=>{
    setTimeout(()=>{
      sound.unloadAsync();
    },playbackStatus.durationMillis+1000)
          }).catch((error)=>{
            console.log(error)
          })
          
        } catch (error) {
          console.log(error)
        }
        
   }
   onMapPress(e) {
    this.setState({
       markers: 
       {
          coordinate: e.nativeEvent.coordinate,
          
         
       },
    });

 
}
  getCurrentLocation=async()=> {

      let status = Location.requestForegroundPermissionsAsync().then((status)=>{
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
        
        }
        else{
          
          let location =Location.getCurrentPositionAsync({});
       console.log(location.coords.latitude)
        }
      });
     
     
          let location =await Location.getCurrentPositionAsync({});
          let region = {
            latitude: parseFloat(location.coords.latitude),
            longitude: parseFloat(location.coords.longitude),
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
        };
       this.setState({
            initialRegion: region
        });
    }
goToInitialLocation=()=>{
  let initialRegion = Object.assign({}, this.state.initialRegion);
  this.mapView.animateToRegion(initialRegion, 2000);
}
uploaddata=()=>{
  //firebase.database().ref("data/count").get('va')
  if(this.state.markers.coordinate.latitude!=0&&this.state.markers.coordinate.longitude!=0)
  {
    let data=[];
    data.push(this.state.markers.coordinate.latitude)
    data.push(this.state.markers.coordinate.longitude)
    firebase.database().ref("count").once('value').then((snapshot)=>{
      if(snapshot.exists())
      {
        let c=snapshot.val()
        c=c+1;
    firebase.database().ref("data/"+c).set(data)
       .then(() => {
         console.log("data updated")
         
             firebase.database().ref('count').set(c).then(async()=>{
               console.log("count updated")
               Alert.alert(
                "Success✔️",
                "The Accident Location with coordinates ("+this.state.markers.coordinate.latitude+","+this.state.markers.coordinate.longitude+") into our Database.",
                [
                  
                  { text: "OK", onPress: () => console.log("OK Pressed") }
                ]
              );
              this.setState({markers: {
                coordinate: {
                  latitude: 0,
                  longitude: 0,
                  },
               
              }});
              const sound = new Audio.Sound();
              try {
                await sound.loadAsync( require('../audio/data.mp3'));
                await sound.playAsync().then(async(playbackStatus)=>{
          setTimeout(()=>{
            sound.unloadAsync();
          },playbackStatus.durationMillis)
                }).catch((error)=>{
                  console.log(error)
                })
                
              } catch (error) {
                console.log(error)
              }
             })
          
        console.log(data);
      })
     .catch((error) => {
       
       });
      }
    })
    
  }
  else{
    Alert.alert(
      "WARNING⚠️",
      "Please select a LOCATION to upload the coordinates.",
      [
        
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );
    console.log("select a marker")
  }
   
}

render=()=>{
  const {navigation}=this.props
  return (
  <View style={styles.container}>
<MapView style={{ ...StyleSheet.absoluteFillObject}}
region={this.state.mapRegion}
followUserLocation={true}
ref={ref => (this.mapView = ref)}
zoomEnabled={true}
showsMyLocationButton={false}
showsUserLocation={true}
onMapReady={this.goToInitialLocation.bind(this)}
initialRegion={this.state.initialRegion}
onPress={e => this.onMapPress(e)}
> 
<Marker coordinate = {{latitude:this.state.markers.coordinate.latitude,longitude: this.state.markers.coordinate.longitude}}
         pinColor = {"red"} // any color
         title={"Accident Location"}
        description={this.state.markers.coordinate.latitude+","+this.state.markers.coordinate.longitude}
        />
      </MapView>
      <Callout style={{flex:2,flexDirection:'row',alignSelf:'flex-start',top:50,position:'absolute',
  }}>
      <TouchableOpacity
        style={{
          backgroundColor: "transparent",
          padding:5,
          margin: 7,
          borderRadius:20,
          borderWidth:1,
          borderColor:'transparent',
        }}
        onPress={() => navigation.goBack()}
       >
      <Image
     source={require('../assets/back.png')}
     style={{height:40,width:40,}}
    />
      </TouchableOpacity> 
      
      </Callout>
    <Callout style={styles.buttonCallout}>
    <TouchableOpacity
      style={[styles.touchable]}
      onPress={() => this.uploaddata()}>
      <Text style={{fontSize: 16,fontWeight:'bold',color:'white'}}>Upload Coordinates</Text>
    </TouchableOpacity> 
    </Callout>
      </View>
      
  );
}
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCallout: {
    flex: 1,
    flexDirection:'row',
    position:'absolute',
    bottom:20,
    alignSelf: "center",
    justifyContent: "space-between",
    borderWidth: 0.2,
    borderRadius: 20,
   
  },
  touchable: {
    backgroundColor: "#cc0606",
    padding: 9,
    margin: 3,
    borderWidth: 0.2,
    borderRadius: 10,
    borderColor:"#cc0606"
    
  }
});
