import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View,Alert,TouchableOpacity,ToastAndroid ,Dimensions,Image,Modal,Picker,Switch} from 'react-native';
import MapView, { Marker ,Callout} from 'react-native-maps';
import * as Location from 'expo-location';
import firebase from 'firebase';
import MapViewDirections from 'react-native-maps-directions'
import { Audio } from 'expo-av';
export default class Mapping extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      onelevelhierarchy:false,
      twolevelhierarchy:false,
      radius:null,
      processinglist:null,
      circleone:null,
      circletwo:null,
      color:'white',
      arrivedbtn:false,
      centroids:'notall',
      showspeed:true,
      voiceAlerts:true,
      location:null,
      settings:false,
      speed:null,
      destbutton:false,
      arrived:false,
      destinationring:null,
      source:null,
      initialRegion:null,
      mapRegion:null,
     clusterdata:null,
     modalVisible: false,
     destination:{
      latitude: 0,
      longitude: 0,
      },
    };
  }
  
  componentDidMount(){
    console.disableYellowBox = true;
    this.getCurrentLocation(true);
    ToastAndroid.show("Please select your destinaton from the Map!", ToastAndroid.LONG);
   let watchID = Location.watchPositionAsync(
      { accuracy: 6, timeInterval: 1000, distanceInterval: 0 },
      async(position) => {
        let s=Math.floor(position.coords.speed*18/5);
        let color
        if(s>70)
        {
              color='red'
        }
        if(s>40&&s<=70)
        {
          color='orange'
        }
        if(s<=40)
        {
          color='white'
        }
        await this.setState({speed:s,
          color:color,
          location:{latitude:parseFloat(position.coords.latitude),longitude:parseFloat(position.coords.longitude)}})
        }

    );
   }
   setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }
  multiplehierarchytwo=async()=>{
    let circletwo=[]
    this.state.destinationring.forEach(element => {
      let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
      if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=10000)
      { 
        
        circletwo.push(element)
      }
    });
    await this.setState({circletwo:circletwo});
  }
  multiplehierarchyone=async()=>{
    let circleone=[]
    this.state.circletwo.forEach(element => {
      let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
      if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=3000)
      { 
        
        circleone.push(element)
      }
    });
    await this.setState({processinglist:circleone});
  }
  singlehierarchy=async()=>{
    let circleone=[]
        radius=Math.floor(this.state.radius/3)
        this.state.destinationring.forEach(element => {
          let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
          if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=radius)
          { 
            
            circleone.push(element)
          }
        });
        await this.setState({processinglist:circleone});
  }
   getnearestclusterpoints=async()=>{
     let diameter=this.distance(this.state.source.latitude,this.state.destination.latitude,this.state.source.longitude,this.state.destination.longitude);
     let radius=diameter/2;
     let latmid=(this.state.source.latitude+this.state.destination.latitude)/2;
     let longmid=(this.state.source.longitude+this.state.destination.longitude)/2;
     let nearcentroids=[]
     this.state.clusterdata.forEach(element => {
       let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
       if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=radius)
       { 
         
         nearcentroids.push({...element,token:-1})
       }
     });
     if(nearcentroids.length<=100)
     {
      await this.setState({processinglist:nearcentroids});
     }
    else{
      if(nearcentroids.length<=500)
      {
        let circleone=[]
        radius=Math.floor(radius/3)
        nearcentroids.forEach(element => {
          let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
          if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=radius)
          { 
            
            circleone.push(element)
          }
        });
        await this.setState({processinglist:circleone,destinationring:nearcentroids,onelevelhierarchy:true});
      }
      else{
        let circleone=[]
        let circletwo=[]
        nearcentroids.forEach(element => {
          let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
          if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=10000)
          { 
            
            circletwo.push(element)
          }
        });
        await this.setState({circletwo:circletwo,destinationring:nearcentroids,twolevelhierarchy:true}).then(async()=>{
          circletwo.forEach(element => {
            let d=this.distance(latmid,element.centroid[0],longmid,element.centroid[1]);
            if(this.distance(latmid,element.centroid[0],longmid,element.centroid[1])<=3000)
            { 
              
              circleone.push(element)
            }
          });
          await this.setState({processinglist:circleone})
        });
          
      }
    }
    await this.setState({radius:radius})
     if(this.state.centroids=='notall')
     {
       this.mapMarkers();
     }
   
   }
distance(lat1,lat2,lon1,lon2)
{


lon1 =  lon1 * Math.PI / 180;
lon2 = lon2 * Math.PI / 180;
lat1 = lat1 * Math.PI / 180;
lat2 = lat2 * Math.PI / 180;


let dlon = lon2 - lon1;
let dlat = lat2 - lat1;
let a = Math.pow(Math.sin(dlat / 2), 2)
+ Math.cos(lat1) * Math.cos(lat2)
* Math.pow(Math.sin(dlon / 2),2);

let c = 2 * Math.asin(Math.sqrt(a));

let r = 6371;

return(c * r)*1000;
}
collectingcentroids=async()=>{
  
    
  if(!this.state.arrived)
  {
    console.log('start')
    var points=this.state.processinglist
   let eight=[]
   let five=[]
   let three=[]
   let latitude=this.state.location.latitude
    let longitude= this.state.location.longitude
   let destinationdistance=this.distance(this.state.destination.latitude,latitude,this.state.destination.longitude,longitude)
   if(destinationdistance<500)
   {
     this.setState({arrivedbtn:true,destbutton:false})
   }
   for(let i=0;i<points.length;i=i+1)
   {
    
    
     let dist=this.distance(points[i].centroid[0],latitude,points[i].centroid[1],longitude)
     let point={
       latitude:points[i].centroid[0],
        longitude:points[i].centroid[1],
        token:points[i].token,
        type:points[i].type,
        distance:Math.floor(dist)
     }
     if(dist<300)
     { 
      let dup = [...this.state.processinglist];
      dup[i] = {...dup[i], token: 1};
      this.setState({processinglist:dup });
       point.token=1
       three.push(point);
     }
     else{
       if(dist<500)
       {
         if(point.token==1)
         {
          let dup = [...this.state.processinglist];
          const index = dup.findIndex(element => {
            if (element.id === points[i].id) {
              return true;
            }
          
            return false;
          });
          dup.splice(index,0)
          this.setState({processinglist:dup });
         }
         if((point.type=='orange'||point.type=='red')&&point.token!=1)
         {
          let dup = [...this.state.processinglist];
      dup[i] = {...dup[i], token: 2};
      this.setState({processinglist:dup });
          five.push(point);
         }
       
       }
       else{
         if(dist<800)
         {
           if(point.token==1||point.token==2)
           {
            let dup = [...this.state.processinglist];
            const index = dup.findIndex(element => {
              if (element.id === points[i].id) {
                return true;
              }
            
              return false;
            });
            dup.splice(index,0)
            this.setState({processinglist:dup });
           }
           if(point.type=='red'&&point.token==-1)
           {
            let dup = [...this.state.processinglist];
            dup[i] = {...dup[i], token: 3};
            this.setState({processinglist:dup });
             eight.push(point)
           }
         
         }
       }
     }
   }
   this.goToInitialLocation(true)
   if(three.length!=0)
   {
     if(this.state.voiceAlerts)
     {
      const sound = new Audio.Sound();
      var audio
      try {
        if(three[0].distance>200)
        {
          audio=require('../audio/three.mp3')
        }
        if(three[0].distance>100&&three[0].distance<=200)
        {
          audio= require('../audio/two.mp3')
        }
        if(three[0].distance<=100)
        {
          audio=require('../audio/one.mp3')
        }
        await sound.loadAsync(audio);
        await sound.playAsync().then(async(playbackStatus)=>{
  setTimeout(()=>{
    sound.unloadAsync();
  },playbackStatus.durationMillis)
        }).catch((error)=>{
          console.log(error)
        })
        
      } catch (error) {
        // An error occurred!
        console.log(error)
      }
     }
   
    ToastAndroid.show("You are at "+three[0].distance+" m to a Accident zone!", ToastAndroid.LONG);
     console.log('your are near by accident zone at 300mts')
     
    
   }
   else{
     if(five.length!=0)
     {
      if(this.state.voiceAlerts)
     { 
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync( require('../audio/five.mp3'));
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
    }
      ToastAndroid.show("You are at "+five[0].distance+" m to a Accident zone!", ToastAndroid.LONG);
      console.log('your are near by accident zone at 500mts')
     }
     else{
     
      if(eight.length!=0)
      {if(this.state.voiceAlerts)
        {
        const sound = new Audio.Sound();
        try {
          await sound.loadAsync( require('../audio/eight.mp3'));
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
      }
        ToastAndroid.show("You are at "+eight[0].distance+" m to a Accident zone!", ToastAndroid.LONG);
       console.log('your are near by accident zone at 800mts')
      }
    }
   }
  }
}

algo=()=>{
    this.getnearestclusterpoints();
    this.goToInitialLocation(true);
    let counter1=0,counter2=0,counter3=0
    var interval=setInterval(async()=>{
      if(this.state.arrived)
      {
        
        clearInterval(interval);
        console.log('kill')
        this.setState({arrived:false})
        ToastAndroid.show("Please select your destinaton from the Map!", ToastAndroid.LONG);
        await this.getCurrentLocation();
      }
      counter1=counter1+1
      counter1=counter1%3
      counter2=counter2+1
      counter2=counter2%2
      counter3=counter3+1
      counter3=counter3%8
      if(counter1==0&&this.onelevelhierarchy==true)
      {
          this.singlehierarchy();
      }
      if(counter2==0&&this.twolevelhierarchy==true)
      {
          this.multiplehierarchyone();
      }
      if(counter3==0&&this.twolevelhierarchy==true)
      {
          this.multiplehierarchytwo();
      }
      this.collectingcentroids();
     }, 15000);
    
  
}
onMapPress=async(coord)=>{
  await this.setState({ 
        destination: coord,
        source:{latitude:this.state.initialRegion.latitude,longitude:this.state.initialRegion.longitude},
        destbutton:true
  });
  this.algo();
}
selectdestination=(e)=>{
  if(this.state.destination.latitude==0&&this.state.destination.longitude==0)
  {
  let coord=e.nativeEvent.coordinate
  Alert.alert(
    "Alert⚠️",
    "Do you want to confirm the destination?",
    [
      { text: "Reselect", onPress: () => console.log("Reselect Pressed") },
      { text: "Confirm", onPress: () => this.onMapPress(coord) }
    ]
  );
  }
}
  getClusters=()=>{
      firebase.database().ref("clusters").once("value").then((snap)=>{
        var data=[]
        var i=0
        snap.forEach((item)=>{
            let point={
              id:i,
              centroid:item.val().centroid,
              type:item.val().type,
              alertdistance:item.val().alertdistance,
              nop:item.val().noofpoints
            }
            data.push(point)
            i=i+1
        });
        this.setState({clusterdata:data});
      })
  }
  getCurrentLocation=async(flag)=> {

      let status = Location.requestForegroundPermissionsAsync().then(async(status)=>{
        if (status.status !== 'granted') {
          console.log('Permission to access location was denied');
          Alert.alert(
            "Warning⚠️",
            "Please allow Location access to the app!",
            [
              { text: "OK", onPress: () =>  console.log("OK Pressed")}
            ]
          );
        }
        else{  
          let location =await Location.getCurrentPositionAsync({});
          let region = {
            latitude: parseFloat(location.coords.latitude),
            longitude: parseFloat(location.coords.longitude),
            latitudeDelta: 1.5,
            longitudeDelta: 1.5
        };
       this.setState({
            initialRegion: region
        });
        if(flag)
        {
          this.getClusters();
  
        }else{
          this.goToInitialLocation()
        }
        }
      });
     
      
        
          
       
    }
goToInitialLocation=async(flag)=>{
  if(flag){
    await this.setState({
      initialRegion: {
        latitude: this.state.location.latitude,
       longitude:this.state.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
    }
    
  });
  
  let initialRegion = Object.assign({}, this.state.initialRegion);
  this.mapView.animateToRegion(initialRegion, 2000);
 // ToastAndroid.show("Please click Arrived Destination after you reach your point !", ToastAndroid.LONG);
  }
  else{

    let initialRegion = Object.assign({}, this.state.initialRegion);
    this.mapView.animateToRegion(initialRegion, 2000);
    
  }
}
mapMarkers = () => {
  if(this.state.centroids=='all')
  {
    return this.state.clusterdata.map((point) =>
    <Marker
      key={point.id}
      coordinate={{ latitude: point.centroid[0], longitude: point.centroid[1] }}
      pinColor = {point.type}
      title={"Accident Prone Area: "+point.type+" Zone"}
      description={"More than "+point.nop+" accidents happened here!"}
    >
    </Marker >
  
  )
  }
  if(this.state.centroids=='notall'&&this.state.processinglist!=null)
  {
    return this.state.processinglist.map((point) =>
    
    <Marker
      key={point.id}
      coordinate={{ latitude: point.centroid[0], longitude: point.centroid[1] }}
      pinColor = {point.type}
      title={"Accident Prone Area: "+point.type+" Zone"}
      description={"More than "+point.nop+" accidents happened here!"}
    >
    </Marker >
  
  )
  }
}
render=()=>{
  const {navigation}=this.props
  return (
    <View style={styles.container}>
<MapView style={{ ...StyleSheet.absoluteFillObject}}
 userInterfaceStyle={'dark'}
region={this.state.mapRegion}
followUserLocation={true}
ref={ref => (this.mapView = ref)}
zoomEnabled={true}
showsMyLocationButton={false}
showsUserLocation={true}
onMapReady={this.goToInitialLocation.bind(this)}
initialRegion={this.state.initialRegion}
onPress={e => this.selectdestination(e)}
> 
{this.state.clusterdata!=null&&this.state.destination.latitude!=0&&this.state.destination.longitude!=0&&(this.mapMarkers())}
{this.state.destination.latitude!=0&&this.state.destination.longitude!=0&&(<Marker coordinate = {{latitude:this.state.destination.latitude,longitude: this.state.destination.longitude}}
         pinColor = {"aqua"} // any color
         title={"Destination"}
        description={this.state.destination.latitude+","+this.state.destination.longitude}
/>)}{/*<MapViewDirections
          origin={16.429940 , 80.972062}
          destination={16.425479, 81.001121}
          apikey={"AIzaSyCXiMwM-iMgucUN5U5YS274kCyMRDr2VZE"} // insert your API Key here
          strokeWidth={4}
          strokeColor="#111111"
/>*/}
      </MapView>
      <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}
        >
          <View style={styles.centeredView}>
      
            <View style={styles.modalView}>
            <View style={{flexDirection:'row',

              width:350}}>
              <TouchableOpacity
        style={{
          backgroundColor: "white",
      
          marginRight:50,
          borderRadius:15,
          borderWidth:2,
          borderColor:'white',
          marginBottom:10,
          alignSelf:'flex-start'
        }}
        onPress={() =>  this.setModalVisible(!this.state.modalVisible)}
       >
       <Image
     source={require('../assets/goback.jpg')}
     style={{height:30,width:30,}}
    />
      </TouchableOpacity> 
      <Text style={{fontSize:20,fontWeight:'700',alignSelf:'center',
      alignItems:'center',justifyContent:'center'}}>Settings🔧</Text>
      </View>
           
         
            
              <View style={{flexDirection:'row',
              alignItems:'center',justifyContent:'center',width:350}}>
              <Text style={{fontWeight:'bold'}}>Show Speed</Text>
            <Switch
            style={{flex:2,alignSelf:'flex-end'}}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={ this.state.showspeed ?"blue":"white"}
        ios_backgroundColor="#3e3e3e"
        onChange={()=>{let value=this.state.showspeed;
          this.setState({showspeed:!value});
          console.log(this.state.showspeed);
        }}
        value={this.state.showspeed}
      />
      </View>
      <View style={{flexDirection:'row',
              alignItems:'center',justifyContent:'center',width:350}}>
              <Text style={{fontWeight:'bold'}}>Voice Alerts</Text>
            <Switch
            style={{flex:2,alignSelf:'flex-end'}}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={ this.state.voiceAlerts ?"blue":"white"}
        ios_backgroundColor="#3e3e3e"
        onChange={()=>{let value=this.state.voiceAlerts;
          this.setState({voiceAlerts:!value});
          console.log(this.state.voiceAlerts);
        }}
        value={this.state.voiceAlerts}
      />
      </View>
      <View style={{flexDirection:'row',
              alignItems:'center',justifyContent:'center',width:350}}>
              <Text style={{marginRight:70,fontWeight:'bold'}}>Accident Zones</Text>
              <Picker
        selectedValue={this.state.centroids}
        style={{flex:2,alignSelf:'flex-end',}}
        onValueChange={async(itemValue, itemIndex) =>{await this.setState({centroids:itemValue})
        this.mapMarkers();
      }}
      >
        <Picker.Item label="All zones" value="all" />
        <Picker.Item label="Only in my path" value="notall" />
      </Picker>

      </View>
            </View>
          </View>
      </Modal>
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
      <Callout style={{flex:2,flexDirection:'row',alignSelf:'flex-end',top:50,position:'absolute',
  }}>
      <TouchableOpacity
        style={{
          backgroundColor: "transparent",
          padding: 5,
          margin: 7,
          borderRadius:15,
          borderWidth:2,
          borderColor:'transparent',
        }}
        onPress={() => this.setModalVisible(true)}
       >
       <Image
     source={require('../assets/set.png')}
     style={{height:40,width:40,}}
    />
      </TouchableOpacity> 
      
      </Callout>
      {this.state.destination.latitude!=0&&this.state.destination.longitude!=0&&(<Callout style={styles.buttonCallout}>
        <TouchableOpacity
        style={{ backgroundColor: "white",
        padding: 5,
        margin: 3,
        borderRadius:27,
        borderWidth:2,
        borderColor:"#4a4a4a",
        }}
        onPress={async() => {
         this.goToInitialLocation(true)
    
      }}>
         <Image
     source={require('../assets/recenter.png')}
     style={{height:40,width:40,borderRadius:20}}
    />
       
      </TouchableOpacity> 
        {this.state.destbutton&&(<TouchableOpacity
        style={{...styles.selecttouchable,marginLeft:10}}
        onPress={async() => {
          await this.setState({arrived:true,destination:{
          latitude: 0,
          longitude: 0,
          },
          onelevelhierarchy:false,
          twolevelhierarchy:false,
          destbutton:false
      })
      ToastAndroid.show("Please select your destinaton from the Map!", ToastAndroid.LONG);
     
      }}>
        <Text style={{fontSize: 16,fontWeight:'bold',color:'white'}}>Reselect Destination</Text>
      </TouchableOpacity> )}
     
      
      {this.state.arrivedbtn&&(<TouchableOpacity
        style={{...styles.arrivedtouchable,marginRight:10
        }}
        onPress={async() => {
          await this.setState({arrived:true,destination:{
          latitude: 0,
          longitude: 0,
          },
          onelevelhierarchy:false,
          twolevelhierarchy:false,
          arrivedbtn:false
      })
      ToastAndroid.show("Destination Arrived!", ToastAndroid.LONG);
      if(this.state.voiceAlerts)
     {
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync( require('../audio/destinationarrived.mp3'));
        await sound.playAsync().then(async(playbackStatus)=>{
  setTimeout(()=>{
    sound.unloadAsync();
    console.log(playbackStatus.durationMillis)
  },playbackStatus.durationMillis)
        }).catch((error)=>{
          console.log(error)
        })
        
      } catch (error) {
        console.log(error)
      }
    }
      }}>
        <Text style={{fontSize: 16,fontWeight:'bold',color:'white'}}>Arrived Destination</Text>
      </TouchableOpacity> )}
      {this.state.showspeed&&(<View style={{width:60,height:60,backgroundColor:'#4a4a4a',borderWidth:1,borderColor:'black',borderRadius:30,justifyContent:'center',alignItems:'center'}}>

<Text style={{color:`${this.state.color}`,fontSize:22,}}>{this.state.speed}</Text>
<Text style={{color:`${this.state.color}`,fontSize:14}}>Kmph</Text>
    </View>)}
      </Callout>)}
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
    flex: 0.5,
    flexDirection:'row',
    position:'absolute',
    bottom:20,
    width:Dimensions.get('window').width,
    height:50,
    alignItems:'center',
    justifyContent:'space-evenly'
  },
  selecttouchable: {
    backgroundColor: "#fc9349",
    padding: 7,
    margin: 3,
    borderRadius:15,
    borderWidth:2,
    borderColor:"#fc9349",
  },
  arrivedtouchable:{
    backgroundColor: "#3cbd3e",
    padding: 7,
    margin: 3,
    borderRadius:15,
    borderWidth:2,
    borderColor:"#3cbd3e",
  },
  modalView: {
    margin: 20,
    marginTop:100,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
  
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});
