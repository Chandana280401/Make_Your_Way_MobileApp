import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View ,Button,TouchableOpacity,Image,TextInput,Dimensions,KeyboardAvoidingView,Modal,Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebaseConfig from "./Config/FirebaseConfig.js"
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'firebase';
import Data from './scripts/data';
import Mapping from './scripts/map';

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
const Stack = createNativeStackNavigator();
export default class App  extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
         password:null,
         input:false,
         logoAnimationslide: new Animated.Value(200),
         logoAnimation: new Animated.Value(0),
         contentAnimation: new Animated.Value(0)
    };
  }
  componentDidMount(){
    console.disableYellowBox = true;
    Animated.timing(this.state.logoAnimation,{
      toValue:1,
      duration:1500
    }).start(()=>{
      Animated.timing(this.state.logoAnimationslide,{
        toValue:0,
        duration:1000
      }).start(()=>{
        Animated.timing(this.state.contentAnimation,{
          toValue:1,
          duration:2500
        }).start();
      });
    });
   
  }
  
  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }
HomeScreen({navigation}) {
const  slide={
  transform:[{
    translateY : this.state.logoAnimationslide
  }
    
  ]
}
  const appear={
    opacity:this.state.logoAnimation
  }
  const appear1={
    opacity:this.state.contentAnimation
  }
  return (
     <View style={styles.container}>
    
   
       <Animated.View  style={[appear,slide]}>
 
       <Image
source={require('./assets/logo.png')}
style={{height:200,width:200,marginTop:70,alignSelf:'center'}}
/>
</Animated.View>
<Animated.View  style={[appear1]}>
      <Text style={{fontSize:30,fontWeight:'bold',marginTop:50}}>Accident Prone Area</Text>
      <Text style={{fontSize:30,fontWeight:'bold',alignSelf:'center'}}>Alert System</Text>
      <Text style={{fontStyle: 'italic',margin:2,}}>by clustering geospatial data using DBSCAN</Text>
     
         {this.state.input&&(<View style={styles.button}>
           <TouchableOpacity onPress={() => {
            
            this.setState({input:false})
          
        }}>
          <Image
source={require('./assets/goback.png')}
style={{height:20,width:20,marginRight:5}}
/>
</TouchableOpacity>
           <TextInput
    selectTextOnFocus={true}
    selectionColor='black'
    placeholder="Enter Password"
    value={this.state.password}
    underlineColorAndroid="transparent"
    style={styles.TextInputStyle}
    onChangeText={(text)=>{this.setState({password:text})}}
  />
   
<Button title='submit'/></View>)}
          
      <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('map')}
        >
            <Image
     source={require('./assets/maps.png')}
     style={{height:40,width:40}}
    />
          <Text style={{fontWeight:'bold'}}>  Go to Maps</Text>
        </TouchableOpacity>
 {!this.state.input&&(<TouchableOpacity
        
          onPress={() => {
            
              this.setState({input:true})
            
          }}
        >
           
        <View style={styles.button}><Image
     source={require('./assets/data.png')}
     style={{height:40,width:40}}
    />
          <Text style={{fontWeight:'bold'}}> Upload Data</Text></View>
        </TouchableOpacity>)}
        </Animated.View>
       
        </View>
      
       
  );
}
render=()=>{
  return (
   <NavigationContainer>
   <Stack.Navigator>
   <Stack.Screen name="Home" component={this.HomeScreen.bind(this)} options={{ headerShown: false }}/>
   <Stack.Screen name="map" component={Mapping} options={{ headerShown: false }}/> 
     <Stack.Screen name="data" component={Data} options={{ headerShown: false }}/> 
   </Stack.Navigator>
 </NavigationContainer>    
  );
}
}



const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    //justifyContent: 'center',
    backgroundColor: '#9b9b9b',
   
  },
  button: {
    flexDirection:'row',
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    marginTop:50,
    borderColor:'black',
    borderWidth:1,
    borderRadius:20,
  //  width:150,
    alignSelf:'center'
  },
  TextInputStyle: {
    padding: 10,
    marginTop: 5,
    height: 35,
    width:150,
    borderRadius:20,
    borderWidth: 0.8,
    borderColor: "black",
    marginBottom: 5,
    backgroundColor: "#DDDDDD",
    marginRight:5
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
  
});
