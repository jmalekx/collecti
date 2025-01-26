import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions} from 'react-native';
import Logo from '../../../assets/images/tmplogo.png';

// import { useNavigate } from 'react-router-dom';
// import { useDescope, SignUpOrInFlow } from '@descope/react-native-sdk'
// const Login = () => {
//     const navigate = useNavigate()
//     return (
//         <div>
//             <SignUpOrInFlow
//                 onSuccess={(e) => console.log('logged in')}
//                 onError={(e) => console.log('error')}
//             />
//         </div>
//     );
// };

const SignIn = () => {
    const {height} = useWindowDimensions();
    
    return (
        <View style={styles.root}>
            <Image source = {Logo} style={[styles.logo, {height: height * 0.45}]} resizeMode='contain'/>
            <Text> Sign in screen </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    root:{
        alignItems: 'center',
        padding: 20,
    },
    logo:{
        width:'75%',
        maxWidth:200,
        height:100,
    },
})

export default SignIn